"""Simple CLI inference for Heartz `.keras` model.

Run from machine-learning/:
    python infer.py path/to/audio.wav

This is intentionally separate from the REST API to satisfy the jobdesk
requirement of a simple inference code path.
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

import numpy as np
import tensorflow as tf

from api.audio import load_wav_file_to_waveform
from api.model import MelSpectrogramLayer

ROOT_DIR = Path(__file__).resolve().parent
DEFAULT_MODEL_PATH = ROOT_DIR / "outputs" / "heartz_model.keras"
DEFAULT_CLASS_NAMES_PATH = ROOT_DIR / "outputs" / "class_names.json"


def load_model(model_path: Path) -> tf.keras.Model:
    return tf.keras.models.load_model(
        model_path,
        custom_objects={
            "MelSpectrogramLayer": MelSpectrogramLayer,
            "Heartz>MelSpectrogramLayer": MelSpectrogramLayer,
        },
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("wav", type=str, help="Path to a .wav file")
    parser.add_argument("--top-k", type=int, default=3)
    parser.add_argument(
        "--model-path",
        type=str,
        default=os.getenv("MODEL_PATH", str(DEFAULT_MODEL_PATH)),
    )
    parser.add_argument(
        "--class-names-path",
        type=str,
        default=os.getenv("CLASS_NAMES_PATH", str(DEFAULT_CLASS_NAMES_PATH)),
    )
    args = parser.parse_args()

    model_path = Path(args.model_path)
    class_names_path = Path(args.class_names_path)

    if not model_path.exists():
        raise SystemExit(f"Model not found: {model_path}")
    if not class_names_path.exists():
        raise SystemExit(f"Class names not found: {class_names_path}")

    class_names = json.loads(class_names_path.read_text(encoding="utf-8"))
    waveform = load_wav_file_to_waveform(args.wav)
    batch = np.expand_dims(waveform, axis=0)

    model = load_model(model_path)
    probs = model.predict(batch, verbose=0)[0]

    top_indices = np.argsort(probs)[::-1][: max(1, int(args.top_k))]
    for rank, i in enumerate(top_indices, start=1):
        print(f"{rank}. {class_names[int(i)]}: {float(probs[int(i)]):.4f}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
