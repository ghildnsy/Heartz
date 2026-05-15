"""
============================================================
Heartz Project — STEP 4: Data Augmentation
============================================================
Input  : dataset/clean/{kelas}/*.wav
Output : dataset/augmented/{kelas}/*.wav

Cara Pakai:
  python augmentor.py
  python augmentor.py --classes Ba Ma
  python augmentor.py --factor 3
============================================================
"""

import numpy as np
import librosa
from pathlib import Path
from tqdm import tqdm
import shutil
import argparse

from config import (
    CLEAN_DIR, AUGMENTED_DIR, SAMPLE_RATE, ALL_CLASSES,
    AUGMENTATION_FACTOR, PITCH_SHIFT_RANGE, TIME_STRETCH_RANGE,
    NOISE_AMPLITUDE, VOLUME_SHIFT_DB, CLIP_DURATION_TARGET,
    ensure_dirs,
)
from utils import load_audio, save_audio, pad_or_trim, print_dataset_summary


def add_noise(y, amplitude=None, noise_type="white"):
    if amplitude is None:
        amplitude = NOISE_AMPLITUDE
    if noise_type == "white":
        noise = np.random.randn(len(y)) * amplitude
    elif noise_type == "pink":
        from scipy.signal import butter, sosfilt
        white = np.random.randn(len(y))
        sos = butter(2, 1000, btype='lowpass', fs=SAMPLE_RATE, output='sos')
        noise = sosfilt(sos, white) * amplitude * 3
    else:
        noise = np.random.randn(len(y)) * amplitude
    return y + noise


def shift_pitch(y, sr=SAMPLE_RATE, n_steps=None):
    if n_steps is None:
        low, high = PITCH_SHIFT_RANGE
        n_steps = np.random.uniform(low, high)
    return librosa.effects.pitch_shift(y=y, sr=sr, n_steps=n_steps)


def stretch_time(y, rate=None):
    if rate is None:
        low, high = TIME_STRETCH_RANGE
        rate = np.random.uniform(low, high)
    return librosa.effects.time_stretch(y=y, rate=rate)


def perturb_volume(y, db_shift=None):
    if db_shift is None:
        low, high = VOLUME_SHIFT_DB
        db_shift = np.random.uniform(low, high)
    factor = 10 ** (db_shift / 20)
    y_shifted = y * factor
    peak = np.max(np.abs(y_shifted))
    if peak > 0.99:
        y_shifted = y_shifted * (0.99 / peak)
    return y_shifted


def augment_single(y, sr=SAMPLE_RATE, augmentation_id=0):
    """Terapkan satu set augmentasi random berdasarkan ID."""
    y_aug = y.copy()
    if augmentation_id % 4 == 0:
        y_aug = add_noise(y_aug, noise_type="white")
        y_aug = perturb_volume(y_aug)
    elif augmentation_id % 4 == 1:
        y_aug = shift_pitch(y_aug, sr)
        y_aug = add_noise(y_aug, amplitude=NOISE_AMPLITUDE * 0.5)
    elif augmentation_id % 4 == 2:
        y_aug = stretch_time(y_aug)
        y_aug = perturb_volume(y_aug)
        y_aug = pad_or_trim(y_aug, CLIP_DURATION_TARGET, sr)
    elif augmentation_id % 4 == 3:
        y_aug = shift_pitch(y_aug, sr, n_steps=np.random.uniform(-1, 1))
        y_aug = add_noise(y_aug, amplitude=NOISE_AMPLITUDE * 0.3, noise_type="pink")
        y_aug = perturb_volume(y_aug, db_shift=np.random.uniform(-2, 2))
    return y_aug


def augment_class(label, clean_dir=None, augmented_dir=None, factor=None):
    """Augmentasi semua file untuk satu kelas. File asli juga di-copy."""
    if clean_dir is None:
        clean_dir = CLEAN_DIR
    if augmented_dir is None:
        augmented_dir = AUGMENTED_DIR
    if factor is None:
        factor = AUGMENTATION_FACTOR

    clean_class_dir = Path(clean_dir) / label
    aug_class_dir = Path(augmented_dir) / label
    aug_class_dir.mkdir(parents=True, exist_ok=True)

    wav_files = sorted(clean_class_dir.glob("*.wav")) if clean_class_dir.exists() else []
    if not wav_files:
        print(f"  ⚠️  Tidak ada file di clean/{label}")
        return {"original": 0, "augmented": 0, "total": 0, "errors": []}

    results = {"original": 0, "augmented": 0, "total": 0, "errors": []}

    for wav_file in wav_files:
        try:
            orig_dest = aug_class_dir / wav_file.name
            if not orig_dest.exists():
                shutil.copy2(wav_file, orig_dest)
            results["original"] += 1

            y, sr = load_audio(wav_file, SAMPLE_RATE)
            for aug_id in range(factor):
                aug_filename = f"{wav_file.stem}_aug{aug_id+1:02d}.wav"
                aug_path = aug_class_dir / aug_filename
                if aug_path.exists():
                    results["augmented"] += 1
                    continue
                y_aug = augment_single(y, sr, augmentation_id=aug_id)
                save_audio(y_aug, aug_path, sr)
                results["augmented"] += 1
        except Exception as e:
            results["errors"].append(f"{wav_file.name}: {str(e)}")

    results["total"] = results["original"] + results["augmented"]
    print(f"  📈 {label}: {results['original']} asli + "
          f"{results['augmented']} augmented = {results['total']} total")
    return results


def augment_all(classes=None, clean_dir=None, augmented_dir=None, factor=None):
    """
    Augmentasi semua kelas atau kelas tertentu.
    
    Args:
        classes: List kelas yang akan di-augmentasi (None = auto-detect semua folder di clean_dir)
        clean_dir: Direktori clean
        augmented_dir: Direktori augmented
        factor: Faktor augmentasi per file
    """
    if clean_dir is None:
        clean_dir = CLEAN_DIR
    if augmented_dir is None:
        augmented_dir = AUGMENTED_DIR
    if factor is None:
        factor = AUGMENTATION_FACTOR
    
    # Jika classes=None, scan folder apa yang ada di clean_dir
    # Ini memastikan Be2, Be3, dll. juga di-augmentasi
    if classes is None:
        clean_path = Path(clean_dir)
        classes = []
        if clean_path.exists():
            for folder in sorted(clean_path.glob("*/")):
                if folder.is_dir():
                    classes.append(folder.name)
        
        if not classes:
            print(f"⚠️  Tidak ada folder di {clean_dir}")
            return {}
        
        print(f"📋 Auto-detect mode: Menemukan {len(classes)} folder")
        print(f"   Kelas: {', '.join(classes)}")

    print(f"\n{'='*50}")
    print(f"📈 Data Augmentation Pipeline")
    print(f"   Kelas: {len(classes)} | Faktor: {factor}x per file")
    print(f"{'='*50}\n")

    all_results = {}
    total_orig = 0
    total_aug = 0

    for label in tqdm(classes, desc="Augmenting"):
        result = augment_class(label, clean_dir, augmented_dir, factor)
        all_results[label] = result
        total_orig += result["original"]
        total_aug += result["augmented"]

    grand_total = total_orig + total_aug
    print(f"\n{'='*50}")
    print(f"📊 Ringkasan Augmentasi")
    print(f"   🔹 Asli: {total_orig} | 🔸 Augmented: {total_aug} | 📦 Total: {grand_total}")
    print(f"   📈 Rasio: {grand_total/max(total_orig,1):.1f}x dari asli")
    print(f"{'='*50}")
    return all_results


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Heartz Data Augmentation")
    parser.add_argument("--classes", nargs="+", default=None)
    parser.add_argument("--factor", type=int, default=None)
    args = parser.parse_args()

    ensure_dirs()
    print_dataset_summary(CLEAN_DIR, "Dataset CLEAN (Input)")
    augment_all(classes=args.classes, factor=args.factor)
    print_dataset_summary(AUGMENTED_DIR, "Dataset AUGMENTED (Output)")
