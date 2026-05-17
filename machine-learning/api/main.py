"""Standalone FastAPI inference server for Heartz MVP.

Run from the machine-learning folder:
    uvicorn api.main:app --reload

Expected exported files from notebook:
    outputs/heartz_model.keras
    outputs/class_names.json
"""

from __future__ import annotations

import io
import json
import os
from functools import lru_cache
from math import gcd
from pathlib import Path
from typing import Any

import numpy as np
import soundfile as sf
import tensorflow as tf
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from scipy.signal import resample_poly

SAMPLE_RATE = 16_000
NUM_SAMPLES = 16_000
ROOT_DIR = Path(__file__).resolve().parents[1]
MODEL_PATH = Path(os.getenv("MODEL_PATH", ROOT_DIR / "outputs" / "heartz_model.keras"))
CLASS_NAMES_PATH = Path(os.getenv("CLASS_NAMES_PATH", ROOT_DIR / "outputs" / "class_names.json"))


@tf.keras.utils.register_keras_serializable(package="Heartz")
class MelSpectrogramLayer(tf.keras.layers.Layer):
    """Custom layer needed when loading the exported .keras model."""

    def __init__(
        self,
        sample_rate: int = 16_000,
        frame_length: int = 400,
        frame_step: int = 160,
        fft_length: int = 512,
        num_mel_bins: int = 64,
        lower_edge_hertz: float = 80.0,
        upper_edge_hertz: float = 7_600.0,
        eps: float = 1e-6,
        **kwargs: Any,
    ) -> None:
        super().__init__(**kwargs)
        self.sample_rate = int(sample_rate)
        self.frame_length = int(frame_length)
        self.frame_step = int(frame_step)
        self.fft_length = int(fft_length)
        self.num_mel_bins = int(num_mel_bins)
        self.lower_edge_hertz = float(lower_edge_hertz)
        self.upper_edge_hertz = float(upper_edge_hertz)
        self.eps = float(eps)
        self._mel_weight_matrix = None

    def build(self, input_shape):
        num_spectrogram_bins = self.fft_length // 2 + 1
        mel_weight_matrix = tf.signal.linear_to_mel_weight_matrix(
            num_mel_bins=self.num_mel_bins,
            num_spectrogram_bins=num_spectrogram_bins,
            sample_rate=self.sample_rate,
            lower_edge_hertz=self.lower_edge_hertz,
            upper_edge_hertz=self.upper_edge_hertz,
        )
        self._mel_weight_matrix = tf.constant(mel_weight_matrix, dtype=tf.float32)
        super().build(input_shape)

    def call(self, inputs, training=None):
        waveform = tf.cast(inputs, tf.float32)
        if waveform.shape.rank == 3 and waveform.shape[-1] == 1:
            waveform = tf.squeeze(waveform, axis=-1)

        stft = tf.signal.stft(
            waveform,
            frame_length=self.frame_length,
            frame_step=self.frame_step,
            fft_length=self.fft_length,
            window_fn=tf.signal.hann_window,
            pad_end=True,
        )
        magnitude = tf.abs(stft)
        power_spectrogram = tf.square(magnitude)
        mel_spectrogram = tf.tensordot(power_spectrogram, self._mel_weight_matrix, axes=1)
        mel_spectrogram.set_shape(power_spectrogram.shape[:-1].concatenate([self.num_mel_bins]))
        log_mel = tf.math.log(mel_spectrogram + self.eps)
        mean = tf.reduce_mean(log_mel, axis=[1, 2], keepdims=True)
        std = tf.math.reduce_std(log_mel, axis=[1, 2], keepdims=True)
        log_mel = (log_mel - mean) / (std + self.eps)
        return tf.expand_dims(log_mel, axis=-1)

    def get_config(self) -> dict[str, Any]:
        config = super().get_config()
        config.update(
            {
                "sample_rate": self.sample_rate,
                "frame_length": self.frame_length,
                "frame_step": self.frame_step,
                "fft_length": self.fft_length,
                "num_mel_bins": self.num_mel_bins,
                "lower_edge_hertz": self.lower_edge_hertz,
                "upper_edge_hertz": self.upper_edge_hertz,
                "eps": self.eps,
            }
        )
        return config


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


def load_wav_bytes_to_waveform(content: bytes) -> np.ndarray:
    try:
        audio, sr = sf.read(io.BytesIO(content), dtype="float32", always_2d=False)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid WAV file: {exc}") from exc

    if audio.ndim == 2:
        audio = np.mean(audio, axis=1)

    if sr != SAMPLE_RATE:
        divisor = gcd(int(sr), SAMPLE_RATE)
        up = SAMPLE_RATE // divisor
        down = int(sr) // divisor
        audio = resample_poly(audio, up, down).astype(np.float32)

    if len(audio) < NUM_SAMPLES:
        audio = np.pad(audio, (0, NUM_SAMPLES - len(audio)))
    else:
        audio = audio[:NUM_SAMPLES]

    return audio.astype(np.float32)


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
    waveform = load_wav_bytes_to_waveform(content)
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
