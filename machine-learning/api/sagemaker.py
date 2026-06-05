"""AWS SageMaker-compatible inference app.

SageMaker real-time endpoints typically expect:
- GET /ping for health checks
- POST /invocations for inference

This app accepts raw WAV bytes as the request body.
Recommended invoke Content-Type: audio/wav
"""

from __future__ import annotations

import json
import os
import re
import threading
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, TimeoutError
from functools import lru_cache
from pathlib import Path

import numpy as np
import tensorflow as tf
from fastapi import FastAPI, HTTPException, Request

from api.audio import load_wav_bytes_to_waveform
from api.model import MelSpectrogramLayer

ROOT_DIR = Path(__file__).resolve().parents[1]
MODEL_PATH = Path(os.getenv("MODEL_PATH", ROOT_DIR / "outputs" / "heartz_model.keras"))
CLASS_NAMES_PATH = Path(os.getenv("CLASS_NAMES_PATH", ROOT_DIR / "outputs" / "class_names.json"))
TARGET_SCORE_THRESHOLD = float(os.getenv("TARGET_SCORE_THRESHOLD", "0.60"))

app = FastAPI(title="Heartz SageMaker Inference", version="0.1.0")


_GEMINI_EXECUTOR = ThreadPoolExecutor(max_workers=1)
_GEMINI_STATE_LOCK = threading.Lock()
_GEMINI_IN_FLIGHT = False


def _env_truthy(name: str, default: bool = False) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "y", "on"}


def _reset_gemini_executor() -> None:
    global _GEMINI_EXECUTOR, _GEMINI_IN_FLIGHT

    with _GEMINI_STATE_LOCK:
        old = _GEMINI_EXECUTOR
        _GEMINI_EXECUTOR = ThreadPoolExecutor(max_workers=1)
        _GEMINI_IN_FLIGHT = False

    try:
        old.shutdown(wait=False, cancel_futures=True)
    except TypeError:
        old.shutdown(wait=False)


def _extract_json_object(text: str) -> dict[str, object] | None:
    if not text:
        return None
    match = re.search(r"\{.*\}", text, flags=re.DOTALL)
    if not match:
        return None
    try:
        obj = json.loads(match.group(0))
    except Exception:
        return None
    if isinstance(obj, dict):
        return obj
    return None


_PRAISE_MARKERS = [
    "mantap",
    "bagus",
    "keren",
    "hebat",
    "luar biasa",
    "good job",
    "great job",
    "excellent",
    "sip",
    "oke banget",
]


def _looks_like_praise(text: str) -> bool:
    lower = (text or "").lower()
    return any(marker in lower for marker in _PRAISE_MARKERS)


def _redact_secrets(text: str) -> str:
    if not text:
        return text
    # Avoid leaking Gemini API keys in logs/errors (e.g. query string key=...)
    return re.sub(r"key=([^&\s]+)", "key=REDACTED", text)


@lru_cache(maxsize=1)
def get_model_and_labels():
    if not MODEL_PATH.exists():
        raise RuntimeError(f"Model not found: {MODEL_PATH}")
    if not CLASS_NAMES_PATH.exists():
        raise RuntimeError(f"Class names not found: {CLASS_NAMES_PATH}")

    model = tf.keras.models.load_model(
        MODEL_PATH,
        custom_objects={
            "MelSpectrogramLayer": MelSpectrogramLayer,
            "Heartz>MelSpectrogramLayer": MelSpectrogramLayer,
        },
    )
    class_names = json.loads(CLASS_NAMES_PATH.read_text(encoding="utf-8"))
    return model, class_names


def local_motivation(predicted_class: str, confidence: float) -> str:
    if confidence >= 0.85:
        return (
            f"Bagus banget. Pelafalan {predicted_class} kamu sudah kuat, "
            "lanjutkan dengan ritme yang sama."
        )
    if confidence >= 0.60:
        return (
            f"Sudah cukup dekat ke {predicted_class}. "
            "Coba ulangi dengan tempo lebih stabil dan artikulasi lebih jelas."
        )
    return (
        f"Belum terlalu yakin terbaca sebagai {predicted_class}. "
        "Tidak apa-apa, coba ulangi perlahan satu suku kata dulu."
    )


def local_verification_motivation(
    *,
    predicted_class: str,
    confidence: float,
    target: str,
    match: bool,
    pass_soft: bool,
    pass_strict: bool,
) -> str:
    if pass_strict:
        return (
            f"Mantap. Target {target} kamu cocok dan skornya sudah lewat ambang. "
            "Pertahankan tempo dan artikulasi seperti ini."
        )
    if pass_soft and not match:
        return (
            f"Skor untuk target {target} sudah lumayan, tapi sistem masih membaca sebagai {predicted_class}. "
            "Coba perjelas posisi lidah/bibir untuk targetnya dan ulangi perlahan."
        )
    if match and not pass_soft:
        return (
            f"Udah kebaca sebagai {target}, tapi skornya masih di bawah ambang. "
            "Coba stabilkan suara 1 detik penuh dan ulangi 2–3 kali."
        )
    return (
        f"Belum cocok ke target {target}. Sistem lebih yakin ke {predicted_class}. "
        "Coba ulangi targetnya pelan-pelan, fokus artikulasi, lalu rekam lagi."
    )


def gemini_motivation(
    *,
    predicted_class: str,
    confidence: float,
    target: str | None,
    match: bool | None,
    pass_soft: bool | None,
    pass_strict: bool | None,
    threshold: float | None,
    target_confidence: float | None,
) -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    required = _env_truthy("GEMINI_REQUIRED", default=False) or bool(api_key)
    if not api_key:
        if required:
            raise HTTPException(
                status_code=500,
                detail="Gemini is required but GEMINI_API_KEY is not configured.",
            )
        return local_motivation(predicted_class, confidence)

    # Keep Gemini best-effort and bounded: API Gateway has a hard timeout (~29s).
    # If Gemini is slow/unreachable, fall back quickly to local motivation.
    try:
        timeout_s = float(os.getenv("GEMINI_TIMEOUT_SECONDS", "8"))
    except ValueError:
        timeout_s = 8.0
    model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

    disallow_praise = bool(target) and not bool(pass_strict)

    request_id = f"{time.time_ns()}"

    def _call_gemini_rest(prompt: str) -> str:
        model_id = model_name
        if not model_id.startswith("models/"):
            model_id = f"models/{model_id}"

        configured_version = (os.getenv("GEMINI_API_VERSION") or "v1").strip().lower()
        version_candidates = [configured_version, "v1", "v1beta"]
        versions: list[str] = []
        for v in version_candidates:
            if v and v not in versions:
                versions.append(v)

        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": prompt}],
                }
            ]
        }
        data = json.dumps(payload).encode("utf-8")

        deadline = time.monotonic() + float(timeout_s)
        body = None
        last_http_error: RuntimeError | None = None
        not_found_details: list[tuple[str, str]] = []

        def _list_models(remaining_timeout: float) -> str | None:
            # Best-effort diagnostic helper. Never returns the API key.
            for version in versions:
                if remaining_timeout <= 0.0:
                    return None
                url = f"https://generativelanguage.googleapis.com/{version}/models?key={api_key}"
                req = urllib.request.Request(url, method="GET")
                try:
                    with urllib.request.urlopen(req, timeout=max(0.25, remaining_timeout)) as resp:
                        return resp.read().decode("utf-8", errors="replace")
                except urllib.error.HTTPError as exc:
                    if exc.code == 404:
                        continue
                    # If listModels itself errors (401/403/etc), don't mask the original error.
                    return None
                except Exception:
                    return None
            return None

        for version in versions:
            remaining = deadline - time.monotonic()
            if remaining <= 0.0:
                break
            url = (
                f"https://generativelanguage.googleapis.com/{version}/"
                f"{model_id}:generateContent?key={api_key}"
            )
            req = urllib.request.Request(
                url,
                data=data,
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            try:
                with urllib.request.urlopen(req, timeout=max(0.25, remaining)) as resp:
                    body = resp.read().decode("utf-8", errors="replace")
                last_http_error = None
                break
            except urllib.error.HTTPError as exc:
                detail = exc.read().decode("utf-8", errors="replace")
                last_http_error = RuntimeError(
                    f"Gemini HTTPError {exc.code} ({version}): {detail}"
                )
                if exc.code == 404:
                    not_found_details.append((version, detail))
                    continue
                raise last_http_error from exc
            except Exception as exc:
                raise RuntimeError(f"Gemini REST request failed: {exc}") from exc

        if body is None:
            if last_http_error is not None:
                # If all attempts were 404, try listing models to suggest a valid GEMINI_MODEL.
                if not_found_details and "HTTPError 404" in str(last_http_error):
                    remaining = deadline - time.monotonic()
                    models_body = _list_models(remaining)
                    if models_body:
                        try:
                            models_obj = json.loads(models_body)
                        except Exception:
                            snippet = models_body.replace("\n", " ").strip()
                            if len(snippet) > 300:
                                snippet = snippet[:300] + "..."
                            raise RuntimeError(
                                f"Gemini model not found: {model_id}. ListModels returned non-JSON: {snippet}"
                            )

                        models = models_obj.get("models") or []
                        examples: list[str] = []
                        for m in models[:20]:
                            name = (m or {}).get("name")
                            methods = (m or {}).get("supportedGenerationMethods") or []
                            if name:
                                if methods:
                                    examples.append(f"{name} ({','.join(methods)})")
                                else:
                                    examples.append(str(name))
                        if examples:
                            raise RuntimeError(
                                f"Gemini model not found: {model_id}. Available models (sample): {', '.join(examples)}"
                            )
                        err_obj = (models_obj or {}).get("error") if isinstance(models_obj, dict) else None
                        if err_obj:
                            raise RuntimeError(
                                f"Gemini model not found: {model_id}. ListModels error: {json.dumps(err_obj, ensure_ascii=False)}"
                            )
                        snippet = models_body.replace("\n", " ").strip()
                        if len(snippet) > 300:
                            snippet = snippet[:300] + "..."
                        raise RuntimeError(
                            f"Gemini model not found: {model_id}. ListModels returned unexpected payload: {snippet}"
                        )
                raise last_http_error
            raise RuntimeError("Gemini REST request failed: no response")

        try:
            obj = json.loads(body)
            candidates = obj.get("candidates") or []
            content = (candidates[0] or {}).get("content") if candidates else None
            parts = (content or {}).get("parts") or []
            text = (parts[0] or {}).get("text") if parts else None
        except Exception as exc:
            raise RuntimeError(f"Gemini REST response parse failed: {exc}") from exc

        return (text or "").strip()

    def _call_gemini() -> str:
        transport = (os.getenv("GEMINI_TRANSPORT") or "rest").strip().lower()
        if target is None:
            prompt = (
                "Tugas: buat 1 kalimat motivasi singkat dalam Bahasa Indonesia untuk pengguna Tuli yang sedang latihan artikulasi suara.\n"
                f"Prediksi sistem: {predicted_class}. Confidence: {confidence:.2f}.\n"
                "Syarat: ramah, tidak menghakimi, maksimal 25 kata.\n"
                "Format output: JSON saja, contoh: {\"text\": \"...\"}."
            )
        else:
            prompt = (
                "Tugas: buat 1 kalimat feedback singkat dalam Bahasa Indonesia untuk pengguna Tuli yang sedang latihan artikulasi target.\n"
                f"Target: {target}. Prediksi sistem: {predicted_class}. Predicted confidence: {confidence:.2f}.\n"
                f"Target confidence: {(target_confidence if target_confidence is not None else float('nan')):.2f}. "
                f"Threshold: {(threshold if threshold is not None else float('nan')):.2f}.\n"
                f"Match: {bool(match)}. PassSoft: {bool(pass_soft)}. PassStrict: {bool(pass_strict)}.\n"
                "Syarat: maksimal 25 kata, ramah, tidak menghakimi.\n"
                "PENTING: Jika PassStrict = false, JANGAN memuji (hindari kata seperti: mantap, bagus, keren, hebat, luar biasa, good job). Fokus saran perbaikan.\n"
                "Format output: JSON saja, contoh: {\"text\": \"...\"}."
            )

        if transport == "sdk":
            import importlib

            genai = importlib.import_module("google.generativeai")
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel(model_name)
            try:
                response = model.generate_content(prompt, request_options={"timeout": timeout_s})
            except TypeError:
                response = model.generate_content(prompt)
            return getattr(response, "text", "").strip()

        return _call_gemini_rest(prompt)

    def _clear_in_flight(_: object) -> None:
        global _GEMINI_IN_FLIGHT
        with _GEMINI_STATE_LOCK:
            _GEMINI_IN_FLIGHT = False

    global _GEMINI_IN_FLIGHT
    with _GEMINI_STATE_LOCK:
        # If a previous Gemini call is still stuck/hanging, don't queue more work.
        if _GEMINI_IN_FLIGHT:
            if required:
                raise HTTPException(status_code=503, detail="Gemini is busy; please retry.")
            return local_motivation(predicted_class, confidence)
        _GEMINI_IN_FLIGHT = True

    future = _GEMINI_EXECUTOR.submit(_call_gemini)
    future.add_done_callback(_clear_in_flight)

    try:
        text = future.result(timeout=timeout_s)
    except TimeoutError:
        _clear_in_flight(object())
        _reset_gemini_executor()
        if required:
            raise HTTPException(status_code=503, detail="Gemini request timed out.")
        return local_motivation(predicted_class, confidence)
    except Exception as exc:
        _clear_in_flight(object())
        _reset_gemini_executor()
        err = _redact_secrets(str(exc)).replace("\n", " ").strip()
        if len(err) > 400:
            err = err[:400] + "..."
        print(f"[gemini:{request_id}] error: {type(exc).__name__}: {err}", flush=True)
        if required:
            raise HTTPException(
                status_code=503,
                detail=(err or "Gemini request failed."),
            )
        return local_motivation(predicted_class, confidence)

    obj = _extract_json_object(text)
    if obj and "text" in obj:
        gemini_text = str(obj.get("text", "")).strip()
    else:
        gemini_text = (text or "").strip()
    if not gemini_text:
        if required:
            raise HTTPException(status_code=503, detail="Gemini returned empty text.")
        return local_motivation(predicted_class, confidence)

    if disallow_praise and _looks_like_praise(gemini_text):
        raise HTTPException(
            status_code=503,
            detail="Gemini returned praising text for a non-pass case; retry.",
        )

    return gemini_text


def motivation_text(
    *,
    predicted_class: str,
    confidence: float,
    target: str | None,
    match: bool | None,
    pass_soft: bool | None,
    pass_strict: bool | None,
    threshold: float | None,
    target_confidence: float | None,
) -> str:
    return gemini_motivation(
        predicted_class=predicted_class,
        confidence=confidence,
        target=target,
        match=match,
        pass_soft=pass_soft,
        pass_strict=pass_strict,
        threshold=threshold,
        target_confidence=target_confidence,
    )


def parse_target_from_custom_attributes(value: str | None) -> str | None:
    if not value:
        return None
    raw = value.strip()
    if not raw:
        return None

    lower = raw.lower()
    if "target=" in lower:
        start = lower.index("target=") + len("target=")
        tail = raw[start:]
        for sep in [";", ","]:
            if sep in tail:
                tail = tail.split(sep, 1)[0]
        target = tail.strip()
        return target or None

    # Allow sending the label directly as CustomAttributes, e.g. "Ba"
    return raw


@app.get("/ping")
def ping():
    return {"status": "ok"}


@app.post("/invocations")
async def invocations(request: Request):
    content_type = (request.headers.get("content-type") or "").lower()
    if content_type and not (
        "audio/wav" in content_type
        or "audio/x-wav" in content_type
        or "application/octet-stream" in content_type
    ):
        raise HTTPException(
            status_code=415,
            detail="Unsupported Content-Type. Use audio/wav or application/octet-stream.",
        )

    body = await request.body()
    if not body:
        raise HTTPException(status_code=400, detail="Empty request body")

    try:
        waveform = load_wav_bytes_to_waveform(body)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid WAV file: {exc}") from exc

    batch = np.expand_dims(waveform, axis=0)
    model, class_names = get_model_and_labels()

    probs = model(batch, training=False).numpy()[0]
    top_indices = np.argsort(probs)[::-1][:3]
    top_k = [
        {"class_name": class_names[int(i)], "confidence": float(probs[int(i)])}
        for i in top_indices
    ]

    pred_idx = int(top_indices[0])
    predicted_class = class_names[pred_idx]
    confidence = float(probs[pred_idx])

    # Optional verification mode: pass target via SageMaker CustomAttributes.
    # With AWS SDK/CLI, this becomes header: X-Amzn-SageMaker-Custom-Attributes
    custom_attrs = request.headers.get("x-amzn-sagemaker-custom-attributes")
    target = parse_target_from_custom_attributes(custom_attrs)

    match = None
    score = None
    target_confidence = None
    margin = None
    target_rank = None
    threshold = None
    pass_soft = None
    pass_strict = None

    if target is not None:
        if target not in class_names:
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "Invalid target label.",
                    "target": target,
                    "allowed": class_names,
                },
            )

        target_index = int(class_names.index(target))
        target_confidence = float(probs[target_index])
        score = target_confidence
        margin = float(confidence - target_confidence)
        match = bool(predicted_class == target)

        threshold = float(TARGET_SCORE_THRESHOLD)
        pass_soft = bool(target_confidence >= threshold)
        pass_strict = bool(match and target_confidence >= threshold)

        ranked = np.argsort(probs)[::-1]
        target_rank = int(np.where(ranked == target_index)[0][0]) + 1

    response: dict[str, object] = {
        "predicted_class": predicted_class,
        "confidence": confidence,
        "top_k": top_k,
        "motivational_text": motivation_text(
            predicted_class=predicted_class,
            confidence=confidence,
            target=target,
            match=match,
            pass_soft=pass_soft,
            pass_strict=pass_strict,
            threshold=threshold,
            target_confidence=target_confidence,
        ),
    }
    if target is not None:
        response.update(
            {
                "target": target,
                "match": match,
                "score": score,
                "target_confidence": target_confidence,
                "margin": margin,
                "target_rank": target_rank,
                "threshold": threshold,
                "pass_soft": pass_soft,
                "pass_strict": pass_strict,
            }
        )

    return response
