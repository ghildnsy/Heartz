"""
===================
Feature Engineering
===================
Ekstraksi fitur audio dari dataset untuk keperluan model ML.

Fitur yang diekstrak:
  - MFCC (13 koefisien) + Delta MFCC
  - Spectral features (centroid, bandwidth, rolloff, flatness)
  - Zero Crossing Rate
  - Chroma features (12 pitch classes)
  - RMS Energy & Peak Amplitude

Output: dataset/metadata/features.csv

Cara Pakai:
  python feature_engineering.py
  python feature_engineering.py --source clean
  python feature_engineering.py --source augmented

Atau dari notebook:
  from feature_engineering import extract_features_single, extract_all_features
"""

import numpy as np
import pandas as pd
import librosa
from pathlib import Path
from tqdm import tqdm

from config import (
    CLEAN_DIR, AUGMENTED_DIR, METADATA_DIR,
    SAMPLE_RATE, ALL_CLASSES, ensure_dirs,
)
from utils import load_audio


def extract_features_single(filepath, sr=SAMPLE_RATE):
    """
    Ekstrak fitur audio dari satu file.

    Args:
        filepath: Path ke file audio
        sr: Sample rate

    Returns:
        dict: Dictionary berisi semua fitur yang diekstrak
    """
    filepath = Path(filepath)
    y, sr = load_audio(filepath, sr)

    features = {}

    # --- Basic Info ---
    features["filename"] = filepath.name
    features["duration_sec"] = round(len(y) / sr, 3)

    # --- RMS Energy ---
    rms = np.sqrt(np.mean(y ** 2))
    features["rms_energy"] = round(float(rms), 6)

    # --- Peak Amplitude ---
    features["peak_amplitude"] = round(float(np.max(np.abs(y))), 6)

    # --- Zero Crossing Rate ---
    zcr = librosa.feature.zero_crossing_rate(y)[0]
    features["zero_crossing_rate"] = round(float(np.mean(zcr)), 6)

    # --- Spectral Centroid ---
    spec_cent = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
    features["spectral_centroid"] = round(float(np.mean(spec_cent)), 4)

    # --- Spectral Bandwidth ---
    spec_bw = librosa.feature.spectral_bandwidth(y=y, sr=sr)[0]
    features["spectral_bandwidth"] = round(float(np.mean(spec_bw)), 4)

    # --- Spectral Rolloff ---
    spec_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
    features["spectral_rolloff"] = round(float(np.mean(spec_rolloff)), 4)

    # --- Spectral Flatness ---
    spec_flat = librosa.feature.spectral_flatness(y=y)[0]
    features["spectral_flatness"] = round(float(np.mean(spec_flat)), 6)

    # --- MFCC (13 koefisien) ---
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    for i in range(13):
        features[f"mfcc_{i+1}"] = round(float(np.mean(mfccs[i])), 6)
        features[f"mfcc_{i+1}_std"] = round(float(np.std(mfccs[i])), 6)

    # --- Delta MFCC ---
    delta_mfccs = librosa.feature.delta(mfccs)
    for i in range(13):
        features[f"delta_mfcc_{i+1}"] = round(float(np.mean(delta_mfccs[i])), 6)

    # --- Chroma (12 pitch classes) ---
    chroma = librosa.feature.chroma_stft(y=y, sr=sr)
    for i in range(12):
        features[f"chroma_{i+1}"] = round(float(np.mean(chroma[i])), 6)

    return features


def extract_all_features(dataset_dir=None, output_path=None, source="augmented"):
    """
    Ekstrak fitur dari seluruh dataset dan simpan ke CSV.

    Args:
        dataset_dir: Path ke dataset (default: AUGMENTED_DIR atau CLEAN_DIR)
        output_path: Path output CSV (default: METADATA_DIR/features.csv)
        source: 'augmented' atau 'clean'

    Returns:
        pd.DataFrame: DataFrame berisi semua fitur
    """
    if dataset_dir is None:
        dataset_dir = AUGMENTED_DIR if source == "augmented" else CLEAN_DIR
    if output_path is None:
        output_path = METADATA_DIR / f"features_{source}.csv"

    dataset_dir = Path(dataset_dir)
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    print(f"\n{'='*50}")
    print(f"🔬 Feature Engineering Pipeline")
    print(f"   Source  : {dataset_dir}")
    print(f"   Output  : {output_path}")
    print(f"{'='*50}\n")

    all_features = []
    errors = []

    # Kumpulkan semua file
    all_files = []
    for class_dir in sorted(dataset_dir.iterdir()):
        if not class_dir.is_dir():
            continue
        label = class_dir.name
        for wav_file in sorted(class_dir.glob("*.wav")):
            all_files.append((wav_file, label))

    print(f"📊 Total file yang akan diproses: {len(all_files)}")

    for wav_file, label in tqdm(all_files, desc="Extracting features"):
        try:
            feats = extract_features_single(wav_file)
            feats["label"] = label

            # Tentukan augmentation_type dari nama file
            if "_aug" in wav_file.stem:
                aug_part = wav_file.stem.split("_aug")[-1]
                feats["augmentation_type"] = f"aug{aug_part}"
            else:
                feats["augmentation_type"] = "original"

            all_features.append(feats)
        except Exception as e:
            errors.append(f"{wav_file.name}: {str(e)}")

    if not all_features:
        print("⚠️  Tidak ada fitur yang berhasil diekstrak.")
        return pd.DataFrame()

    # Buat DataFrame
    df = pd.DataFrame(all_features)

    # Label encoding
    label_map = {cls: idx for idx, cls in enumerate(sorted(df["label"].unique()))}
    df["label_encoded"] = df["label"].map(label_map)

    # Susun ulang kolom
    id_cols = ["filename", "label", "label_encoded", "augmentation_type"]
    basic_cols = ["duration_sec", "rms_energy", "peak_amplitude", "zero_crossing_rate"]
    spectral_cols = ["spectral_centroid", "spectral_bandwidth", "spectral_rolloff", "spectral_flatness"]
    mfcc_cols = [f"mfcc_{i}" for i in range(1, 14)]
    mfcc_std_cols = [f"mfcc_{i}_std" for i in range(1, 14)]
    delta_cols = [f"delta_mfcc_{i}" for i in range(1, 14)]
    chroma_cols = [f"chroma_{i}" for i in range(1, 13)]

    col_order = id_cols + basic_cols + spectral_cols + mfcc_cols + mfcc_std_cols + delta_cols + chroma_cols
    col_order = [c for c in col_order if c in df.columns]
    df = df[col_order]

    # Simpan ke CSV
    df.to_csv(output_path, index=False, encoding="utf-8")

    print(f"\n{'='*50}")
    print(f"✅ Feature extraction selesai!")
    print(f"   Total sampel  : {len(df)}")
    print(f"   Total fitur   : {len(df.columns) - len(id_cols)}")
    print(f"   Total kelas   : {df['label'].nunique()}")
    print(f"   Output        : {output_path}")
    if errors:
        print(f"   ⚠️  Error     : {len(errors)} file gagal")
    print(f"{'='*50}")

    # Print label mapping
    print(f"\n📋 Label Encoding:")
    for cls, idx in label_map.items():
        count = len(df[df["label"] == cls])
        print(f"   {idx:2d} → {cls:<5s} ({count} sampel)")

    return df


def get_feature_summary(features_csv_path=None):
    """
    Tampilkan ringkasan statistik dari fitur yang diekstrak.

    Args:
        features_csv_path: Path ke CSV fitur
    """
    if features_csv_path is None:
        features_csv_path = METADATA_DIR / "features_augmented.csv"

    df = pd.read_csv(features_csv_path)

    print(f"\n{'='*50}")
    print(f"📊 Feature Summary")
    print(f"{'='*50}")
    print(f"Total sampel : {len(df)}")
    print(f"Total fitur  : {len(df.columns)}")
    print(f"Total kelas  : {df['label'].nunique()}")
    print()

    # Statistik per kelas
    print("📋 Distribusi per Kelas:")
    class_counts = df["label"].value_counts().sort_index()
    for cls, count in class_counts.items():
        print(f"   {cls:<5s}: {count:>6d} sampel")

    print(f"\n📈 Statistik Fitur Numerik:")
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    print(df[numeric_cols].describe().round(4).to_string())

    return df


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Heartz Feature Engineering")
    parser.add_argument("--source", choices=["clean", "augmented"], default="augmented",
                        help="Dataset source: 'clean' atau 'augmented'")
    args = parser.parse_args()

    ensure_dirs()
    df = extract_all_features(source=args.source)
    if not df.empty:
        get_feature_summary(METADATA_DIR / f"features_{args.source}.csv")
