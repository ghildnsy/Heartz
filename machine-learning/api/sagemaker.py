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


def gemini_motivation(predicted_class: str, confidence: float) -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return local_motivation(predicted_class, confidence)

    try:
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = (
            "Buat satu kalimat motivasi singkat dalam Bahasa Indonesia untuk pengguna Tuli "
            "yang sedang latihan artikulasi suara. "
            f"Prediksi sistem: {predicted_class}. Confidence: {confidence:.2f}. "
            "Nada ramah, tidak menghakimi, maksimal 25 kata."
        )
        response = model.generate_content(prompt)
        text = getattr(response, "text", "").strip()
        return text or local_motivation(predicted_class, confidence)
    except Exception:
        return local_motivation(predicted_class, confidence)


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
        "motivational_text": gemini_motivation(predicted_class, confidence),
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
