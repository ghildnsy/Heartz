"""Evaluate Heartz model on a folder dataset and enforce thresholds.

Default dataset layout:
    data/clean_wav/<class_name>/*.wav

Metrics:
- Accuracy: top-1 classification accuracy.
- MAE: mean absolute error between one-hot y_true and probability y_pred.
  (This is included to satisfy the jobdesk rubric requirement.)

Run from machine-learning/:
    python evaluate.py

Optional:
    python evaluate.py --data-dir data/clean_wav --fail-on-thresholds
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import random

import numpy as np
import tensorflow as tf

from api.audio import load_wav_file_to_waveform
from api.model import MelSpectrogramLayer

ROOT_DIR = Path(__file__).resolve().parent
DEFAULT_DATA_DIR = ROOT_DIR / "data" / "clean_wav"
DEFAULT_MODEL_PATH = ROOT_DIR / "outputs" / "heartz_model.keras"
DEFAULT_CLASS_NAMES_PATH = ROOT_DIR / "outputs" / "class_names.json"
DEFAULT_METRICS_PATH = ROOT_DIR / "outputs" / "metrics.json"


def load_model(model_path: Path) -> tf.keras.Model:
    return tf.keras.models.load_model(
        model_path,
        custom_objects={
            "MelSpectrogramLayer": MelSpectrogramLayer,
            "Heartz>MelSpectrogramLayer": MelSpectrogramLayer,
        },
    )


def iter_dataset_files(data_dir: Path, class_names: list[str]) -> tuple[list[Path], list[int]]:
    paths: list[Path] = []
    labels: list[int] = []

    for class_index, class_name in enumerate(class_names):
        class_dir = data_dir / class_name
        if not class_dir.exists():
            continue
        for wav_path in sorted(class_dir.glob("*.wav")):
            paths.append(wav_path)
            labels.append(class_index)

    return paths, labels


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--data-dir",
        type=str,
        default=str(DEFAULT_DATA_DIR),
        help="Folder with class subfolders containing .wav files",
    )
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
    parser.add_argument(
        "--output-json",
        type=str,
        default=str(DEFAULT_METRICS_PATH),
        help="Write metrics JSON to this path (set empty string to disable)",
    )
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument(
        "--max-samples",
        type=int,
        default=0,
        help="If >0, evaluate at most this many samples (useful for quick checks)",
    )
    parser.add_argument(
        "--shuffle",
        action="store_true",
        help="Shuffle files before evaluation (recommended with --max-samples)",
    )
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument(
        "--progress-every",
        type=int,
        default=25,
        help="Print progress every N batches (0 disables)",
    )
    parser.add_argument("--accuracy-threshold", type=float, default=0.85)
    parser.add_argument("--mae-threshold", type=float, default=0.02)
    parser.add_argument(
        "--fail-on-thresholds",
        action="store_true",
        help="Exit with non-zero code if thresholds are not met",
    )
    args = parser.parse_args()

    data_dir = Path(args.data_dir)
    model_path = Path(args.model_path)
    class_names_path = Path(args.class_names_path)

    if not data_dir.exists():
        raise SystemExit(f"Data dir not found: {data_dir}")
    if not model_path.exists():
        raise SystemExit(f"Model not found: {model_path}")
    if not class_names_path.exists():
        raise SystemExit(f"Class names not found: {class_names_path}")

    class_names = json.loads(class_names_path.read_text(encoding="utf-8"))
    wav_paths, label_indices = iter_dataset_files(data_dir, class_names)

    if not wav_paths:
        raise SystemExit(f"No WAV files found under: {data_dir}")

    if args.shuffle:
        rng = random.Random(int(args.seed))
        combined = list(zip(wav_paths, label_indices))
        rng.shuffle(combined)
        wav_paths, label_indices = zip(*combined)
        wav_paths = list(wav_paths)
        label_indices = list(label_indices)

    if int(args.max_samples) > 0:
        wav_paths = wav_paths[: int(args.max_samples)]
        label_indices = label_indices[: int(args.max_samples)]

    model = load_model(model_path)

    correct = 0
    total = 0
    mae_sum = 0.0

    batch_size = max(1, int(args.batch_size))
    num_classes = len(class_names)

    for start in range(0, len(wav_paths), batch_size):
        batch_paths = wav_paths[start : start + batch_size]
        batch_labels = label_indices[start : start + batch_size]

        x = np.stack([load_wav_file_to_waveform(p) for p in batch_paths], axis=0)
        y_true_idx = np.array(batch_labels, dtype=np.int64)
        y_true = np.eye(num_classes, dtype=np.float32)[y_true_idx]

        x_tensor = tf.convert_to_tensor(x, dtype=tf.float32)
        y_pred = model(x_tensor, training=False).numpy()
        pred_idx = np.argmax(y_pred, axis=1)

        correct += int(np.sum(pred_idx == y_true_idx))
        total += int(len(batch_paths))

        batch_mae = float(np.mean(np.abs(y_true - y_pred)))
        mae_sum += batch_mae * len(batch_paths)

        if int(args.progress_every) > 0:
            batch_index = start // batch_size
            if batch_index % int(args.progress_every) == 0:
                print(f"Progress: {min(start + len(batch_paths), len(wav_paths))}/{len(wav_paths)}")

    accuracy = correct / max(1, total)
    mae = mae_sum / max(1, total)

    meets_acc = accuracy >= float(args.accuracy_threshold)
    meets_mae = mae <= float(args.mae_threshold)

    payload = {
        "num_samples": total,
        "accuracy": accuracy,
        "mae": mae,
        "thresholds": {
            "accuracy": float(args.accuracy_threshold),
            "mae": float(args.mae_threshold),
        },
        "meets_thresholds": bool(meets_acc and meets_mae),
        "paths": {
            "data_dir": str(data_dir),
            "model_path": str(model_path),
            "class_names_path": str(class_names_path),
        },
    }
    print(json.dumps(payload, indent=2))

    output_json = str(args.output_json).strip()
    if output_json:
        out_path = Path(output_json)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    if args.fail_on_thresholds and (not meets_acc or not meets_mae):
        raise SystemExit(
            f"Thresholds not met: accuracy={accuracy:.4f} (>= {args.accuracy_threshold}), "
            f"mae={mae:.4f} (<= {args.mae_threshold})"
        )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
