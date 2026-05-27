"""Standalone FastAPI inference server for Heartz MVP.

Run from the machine-learning folder:
    uvicorn api.main:app --reload

Expected exported files from notebook:
    outputs/heartz_model.keras
    outputs/class_names.json
"""

from __future__ import annotations

import json
import os
from functools import lru_cache
from pathlib import Path
from typing import Any

import numpy as np
import tensorflow as tf
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from api.audio import NUM_SAMPLES, SAMPLE_RATE, load_wav_bytes_to_waveform
from api.model import MelSpectrogramLayer

ROOT_DIR = Path(__file__).resolve().parents[1]
MODEL_PATH = Path(os.getenv("MODEL_PATH", ROOT_DIR / "outputs" / "heartz_model.keras"))
CLASS_NAMES_PATH = Path(os.getenv("CLASS_NAMES_PATH", ROOT_DIR / "outputs" / "class_names.json"))


class PredictionResponse(BaseModel):
    predicted_class: str
    confidence: float
    top_k: list[dict[str, float | str]]
    motivational_text: str


app = FastAPI(title="Heartz AI Inference API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@lru_cache(maxsize=1)
def get_model_and_labels():
    if not MODEL_PATH.exists():
        raise RuntimeError(
            f"Model not found: {MODEL_PATH}. Train/export dulu dari notebook."
        )
    if not CLASS_NAMES_PATH.exists():
        raise RuntimeError(
            f"Class names not found: {CLASS_NAMES_PATH}. Export dulu dari notebook."
        )

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
        return f"Bagus banget. Pelafalan {predicted_class} kamu sudah kuat, lanjutkan dengan ritme yang sama."
    if confidence >= 0.60:
        return f"Sudah cukup dekat ke {predicted_class}. Coba ulangi dengan tempo lebih stabil dan buka artikulasi mulut lebih jelas."
    return f"Belum terlalu yakin terbaca sebagai {predicted_class}. Tidak apa-apa, coba ulangi perlahan satu suku kata dulu."


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
            "Nada harus ramah, tidak menghakimi, dan maksimal 25 kata."
        )
        response = model.generate_content(prompt)
        text = getattr(response, "text", "").strip()
        return text or local_motivation(predicted_class, confidence)
    except Exception:
        return local_motivation(predicted_class, confidence)


@app.get("/health")
def health():
    return {"status": "ok", "model_path": str(MODEL_PATH), "labels_path": str(CLASS_NAMES_PATH)}


@app.post("/predict", response_model=PredictionResponse)
async def predict(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".wav"):
        raise HTTPException(status_code=400, detail="Only .wav files are supported.")

    content = await file.read()
    try:
        waveform = load_wav_bytes_to_waveform(content)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid WAV file: {exc}") from exc
    batch = np.expand_dims(waveform, axis=0)

    model, class_names = get_model_and_labels()
    probs = model.predict(batch, verbose=0)[0]

    top_indices = np.argsort(probs)[::-1][:3]
    top_k = [
        {"class_name": class_names[int(i)], "confidence": float(probs[int(i)])}
        for i in top_indices
    ]

    pred_idx = int(top_indices[0])
    predicted_class = class_names[pred_idx]
    confidence = float(probs[pred_idx])

    return PredictionResponse(
        predicted_class=predicted_class,
        confidence=confidence,
        top_k=top_k,
        motivational_text=gemini_motivation(predicted_class, confidence),
    )
