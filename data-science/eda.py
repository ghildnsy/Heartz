"""
============================================================
Heartz Project — STEP 5: Exploratory Data Analysis (EDA)
============================================================
Visualisasi dan analisis dataset audio.

Cara Pakai:
  python eda.py
  
Atau dari notebook:
  from eda import (plot_class_distribution, plot_waveform,
                   plot_mel_spectrogram, plot_duration_hist,
                   full_eda_report)
============================================================
"""

import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import librosa
import librosa.display
from pathlib import Path
from tqdm import tqdm

from config import (
    RAW_DIR, CLEAN_DIR, AUGMENTED_DIR,
    SAMPLE_RATE, ALL_CLASSES, ensure_dirs,
)
from utils import load_audio, count_dataset, get_audio_info

# Konfigurasi style
sns.set_theme(style="darkgrid", palette="husl")
plt.rcParams['figure.figsize'] = (14, 6)
plt.rcParams['figure.dpi'] = 100


def plot_class_distribution(dataset_dir, title="Distribusi Data Per Kelas", ax=None):
    """Bar chart jumlah sampel per kelas."""
    counts = count_dataset(dataset_dir)
    if not counts:
        print("⚠️ Tidak ada data untuk divisualisasikan.")
        return

    classes = list(counts.keys())
    values = list(counts.values())

    # Warnai berdasarkan kelompok
    colors = []
    for cls in classes:
        if len(cls) == 1:
            colors.append('#FF6B6B')  # Vokal = merah
        elif cls.startswith('B'):
            colors.append('#4ECDC4')  # Ba-set = teal
        elif cls.startswith('P'):
            colors.append('#45B7D1')  # Pa-set = biru
        elif cls.startswith('M'):
            colors.append('#96CEB4')  # Ma-set = hijau
        else:
            colors.append('#CCCCCC')

    if ax is None:
        fig, ax = plt.subplots(figsize=(14, 6))

    bars = ax.bar(classes, values, color=colors, edgecolor='white', linewidth=0.5)

    # Tambahkan label angka di atas bar
    for bar, val in zip(bars, values):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1,
                str(val), ha='center', va='bottom', fontsize=9, fontweight='bold')

    # Garis target
    ax.axhline(y=150, color='orange', linestyle='--', alpha=0.7, label='Target Min (150)')
    ax.axhline(y=200, color='green', linestyle='--', alpha=0.7, label='Target Ideal (200)')

    ax.set_xlabel('Kelas Suku Kata', fontsize=12)
    ax.set_ylabel('Jumlah Sampel', fontsize=12)
    ax.set_title(title, fontsize=14, fontweight='bold')
    ax.legend()
    plt.tight_layout()
    return ax


def plot_waveform(filepath, title=None, ax=None):
    """Tampilkan waveform sebuah file audio."""
    y, sr = load_audio(filepath)
    if title is None:
        title = Path(filepath).name

    if ax is None:
        fig, ax = plt.subplots(figsize=(12, 3))

    librosa.display.waveshow(y, sr=sr, ax=ax, alpha=0.7)
    ax.set_title(f'Waveform: {title}', fontsize=12, fontweight='bold')
    ax.set_xlabel('Waktu (detik)')
    ax.set_ylabel('Amplitudo')
    plt.tight_layout()
    return ax


def plot_mel_spectrogram(filepath, title=None, ax=None):
    """Tampilkan Mel-spectrogram sebuah file audio."""
    y, sr = load_audio(filepath)
    if title is None:
        title = Path(filepath).name

    S = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128, fmax=8000)
    S_dB = librosa.power_to_db(S, ref=np.max)

    if ax is None:
        fig, ax = plt.subplots(figsize=(12, 4))

    img = librosa.display.specshow(S_dB, sr=sr, x_axis='time', y_axis='mel',
                                    ax=ax, cmap='magma')
    ax.set_title(f'Mel-Spectrogram: {title}', fontsize=12, fontweight='bold')
    plt.colorbar(img, ax=ax, format='%+2.0f dB')
    plt.tight_layout()
    return ax


def plot_waveform_and_spectrogram(filepath, title=None):
    """Tampilkan waveform DAN mel-spectrogram side-by-side."""
    fig, axes = plt.subplots(2, 1, figsize=(14, 7))
    if title is None:
        title = Path(filepath).name
    plot_waveform(filepath, title=title, ax=axes[0])
    plot_mel_spectrogram(filepath, title=title, ax=axes[1])
    plt.tight_layout()
    return fig


def plot_class_samples(dataset_dir, label, n_samples=4):
    """Tampilkan waveform dan spectrogram untuk N sampel dari satu kelas."""
    class_dir = Path(dataset_dir) / label
    wav_files = sorted(class_dir.glob("*.wav"))[:n_samples]

    if not wav_files:
        print(f"⚠️ Tidak ada file di {class_dir}")
        return

    fig, axes = plt.subplots(n_samples, 2, figsize=(14, 3 * n_samples))
    if n_samples == 1:
        axes = axes.reshape(1, -1)

    fig.suptitle(f'Sampel Kelas "{label}"', fontsize=14, fontweight='bold', y=1.02)

    for i, wav_file in enumerate(wav_files):
        plot_waveform(wav_file, title=wav_file.name, ax=axes[i, 0])
        plot_mel_spectrogram(wav_file, title=wav_file.name, ax=axes[i, 1])

    plt.tight_layout()
    return fig


def plot_duration_histogram(dataset_dir, title="Distribusi Durasi Audio"):
    """Histogram durasi semua file audio di dataset."""
    dataset_dir = Path(dataset_dir)
    durations = []
    labels = []

    for class_dir in sorted(dataset_dir.iterdir()):
        if not class_dir.is_dir():
            continue
        for wav_file in class_dir.glob("*.wav"):
            try:
                info = get_audio_info(wav_file)
                durations.append(info["duration_sec"])
                labels.append(class_dir.name)
            except Exception:
                continue

    if not durations:
        print("⚠️ Tidak ada data untuk histogram.")
        return

    fig, ax = plt.subplots(figsize=(12, 5))
    ax.hist(durations, bins=50, color='#4ECDC4', edgecolor='white', alpha=0.8)
    ax.axvline(np.mean(durations), color='red', linestyle='--',
               label=f'Mean: {np.mean(durations):.2f}s')
    ax.axvline(np.median(durations), color='orange', linestyle='--',
               label=f'Median: {np.median(durations):.2f}s')
    ax.set_xlabel('Durasi (detik)', fontsize=12)
    ax.set_ylabel('Frekuensi', fontsize=12)
    ax.set_title(title, fontsize=14, fontweight='bold')
    ax.legend()
    plt.tight_layout()
    return fig


def plot_rms_distribution(dataset_dir, title="Distribusi RMS Energy Per Kelas"):
    """Box plot RMS energy per kelas."""
    dataset_dir = Path(dataset_dir)
    data = {"class": [], "rms": []}

    for class_dir in sorted(dataset_dir.iterdir()):
        if not class_dir.is_dir():
            continue
        for wav_file in list(class_dir.glob("*.wav"))[:50]:  # Limit 50 per kelas
            try:
                info = get_audio_info(wav_file)
                data["class"].append(class_dir.name)
                data["rms"].append(info["rms_energy"])
            except Exception:
                continue

    if not data["class"]:
        print("⚠️ Tidak ada data untuk RMS plot.")
        return

    fig, ax = plt.subplots(figsize=(14, 6))
    import pandas as pd
    df = pd.DataFrame(data)
    sns.boxplot(data=df, x="class", y="rms", palette="husl", ax=ax)
    ax.set_xlabel('Kelas Suku Kata', fontsize=12)
    ax.set_ylabel('RMS Energy', fontsize=12)
    ax.set_title(title, fontsize=14, fontweight='bold')
    plt.xticks(rotation=45)
    plt.tight_layout()
    return fig


def full_eda_report(dataset_dir, dataset_name="Dataset"):
    """
    Generate laporan EDA lengkap:
    1. Distribusi jumlah data per kelas
    2. Histogram durasi
    3. Distribusi RMS energy
    4. Contoh waveform & spectrogram per kelompok
    """
    dataset_dir = Path(dataset_dir)

    print(f"\n{'='*50}")
    print(f"📊 EDA Report: {dataset_name}")
    print(f"   Path: {dataset_dir}")
    print(f"{'='*50}\n")

    # 1. Distribusi kelas
    print("1️⃣  Distribusi Jumlah Data Per Kelas")
    fig1 = plt.figure(figsize=(14, 6))
    ax1 = fig1.add_subplot(111)
    plot_class_distribution(dataset_dir, f"Distribusi Data — {dataset_name}", ax=ax1)
    plt.show()

    # 2. Histogram durasi
    print("\n2️⃣  Distribusi Durasi Audio")
    plot_duration_histogram(dataset_dir, f"Distribusi Durasi — {dataset_name}")
    plt.show()

    # 3. RMS distribution
    print("\n3️⃣  Distribusi RMS Energy Per Kelas")
    plot_rms_distribution(dataset_dir, f"RMS Energy — {dataset_name}")
    plt.show()

    # 4. Contoh per kelompok (1 sampel per kelompok)
    groups = {"Vokal": "A", "Ba-set": "Ba", "Pa-set": "Pa", "Ma-set": "Ma"}
    print("\n4️⃣  Contoh Waveform & Mel-Spectrogram")
    for group_name, sample_class in groups.items():
        class_dir = dataset_dir / sample_class
        wav_files = sorted(class_dir.glob("*.wav"))
        if wav_files:
            print(f"\n   📌 {group_name} (contoh: {sample_class})")
            plot_waveform_and_spectrogram(wav_files[0], title=f"{sample_class} — {wav_files[0].name}")
            plt.show()

    print(f"\n✅ EDA Report selesai!")


if __name__ == "__main__":
    ensure_dirs()
    # Coba jalankan EDA pada dataset yang tersedia
    for dir_path, name in [
        (CLEAN_DIR, "Dataset Clean"),
        (RAW_DIR, "Dataset Raw"),
        (AUGMENTED_DIR, "Dataset Augmented"),
    ]:
        counts = count_dataset(dir_path)
        if any(v > 0 for v in counts.values()):
            full_eda_report(dir_path, name)
            break
    else:
        print("⚠️ Belum ada data di dataset. Jalankan scraper.py dan splitter.py terlebih dahulu.")
