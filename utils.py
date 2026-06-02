"""
============================================================
Heartz Project — Utility Functions
============================================================
Fungsi-fungsi bantu yang digunakan di seluruh pipeline.
============================================================
"""

import numpy as np
import librosa
import soundfile as sf
from pathlib import Path
from datetime import datetime
import csv

from config import SAMPLE_RATE, CHANNELS


def load_audio(filepath, sr=SAMPLE_RATE):
    """
    Load file audio dan konversi ke mono + target sample rate.

    Args:
        filepath: Path ke file audio
        sr: Target sample rate

    Returns:
        tuple: (audio_array, sample_rate)
    """
    filepath = Path(filepath)
    if not filepath.exists():
        raise FileNotFoundError(f"File tidak ditemukan: {filepath}")

    y, sr_orig = librosa.load(str(filepath), sr=sr, mono=True)
    return y, sr


def save_audio(audio_array, filepath, sr=SAMPLE_RATE):
    """
    Simpan audio array ke file .wav.

    Args:
        audio_array: NumPy array audio
        filepath: Path output
        sr: Sample rate
    """
    filepath = Path(filepath)
    filepath.parent.mkdir(parents=True, exist_ok=True)
    sf.write(str(filepath), audio_array, sr)


def get_audio_info(filepath, sr=SAMPLE_RATE):
    """
    Dapatkan informasi detail sebuah file audio.

    Returns:
        dict: Informasi audio (duration, sr, rms, dll)
    """
    filepath = Path(filepath)
    y, sr_loaded = load_audio(filepath, sr)

    return {
        "filename": filepath.name,
        "path": str(filepath),
        "duration_sec": round(len(y) / sr_loaded, 3),
        "sample_rate": sr_loaded,
        "samples": len(y),
        "rms_energy": round(float(np.sqrt(np.mean(y ** 2))), 6),
        "peak_amplitude": round(float(np.max(np.abs(y))), 6),
        "is_silent": bool(np.max(np.abs(y)) < 0.01),
    }


def pad_or_trim(audio_array, target_duration, sr=SAMPLE_RATE):
    """
    Pad audio dengan silence jika terlalu pendek,
    atau trim jika terlalu panjang.

    Args:
        audio_array: NumPy array audio
        target_duration: Durasi target dalam detik
        sr: Sample rate

    Returns:
        np.ndarray: Audio yang sudah di-pad/trim
    """
    target_samples = int(target_duration * sr)
    current_samples = len(audio_array)

    if current_samples >= target_samples:
        # Trim: ambil bagian tengah
        start = (current_samples - target_samples) // 2
        return audio_array[start:start + target_samples]
    else:
        # Pad: tambah silence di kedua sisi secara simetris
        pad_total = target_samples - current_samples
        pad_left = pad_total // 2
        pad_right = pad_total - pad_left
        return np.pad(audio_array, (pad_left, pad_right), mode='constant')


def count_dataset(dataset_dir):
    """
    Hitung jumlah file .wav per kelas di sebuah direktori dataset.

    Returns:
        dict: {class_name: count}
    """
    dataset_dir = Path(dataset_dir)
    counts = {}

    if not dataset_dir.exists():
        return counts

    for class_dir in sorted(dataset_dir.iterdir()):
        if class_dir.is_dir():
            wav_files = list(class_dir.glob("*.wav"))
            counts[class_dir.name] = len(wav_files)

    return counts


def print_dataset_summary(dataset_dir, title="Dataset Summary"):
    """
    Print ringkasan dataset dalam format tabel.
    """
    counts = count_dataset(dataset_dir)

    if not counts:
        print(f"⚠️  {title}: Direktori kosong atau tidak ada data.")
        return counts

    total = sum(counts.values())
    min_count = min(counts.values())
    max_count = max(counts.values())
    avg_count = total / len(counts) if counts else 0

    print(f"\n{'='*50}")
    print(f"📊 {title}")
    print(f"{'='*50}")
    print(f"{'Kelas':<10} {'Jumlah':>8}")
    print(f"{'-'*18}")

    for cls, count in counts.items():
        status = "✅" if count >= 150 else "⚠️" if count >= 100 else "❌"
        print(f"{cls:<10} {count:>8}  {status}")

    print(f"{'-'*18}")
    print(f"{'TOTAL':<10} {total:>8}")
    print(f"{'Min':<10} {min_count:>8}")
    print(f"{'Max':<10} {max_count:>8}")
    print(f"{'Rata-rata':<10} {avg_count:>8.1f}")
    print(f"{'='*50}")

    return counts


def create_metadata_csv(dataset_dir, output_path):
    """
    Buat file metadata CSV dari seluruh file audio di dataset.

    Kolom: filename, label, duration_sec, sample_rate, rms_energy, path
    """
    dataset_dir = Path(dataset_dir)
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    rows = []
    for class_dir in sorted(dataset_dir.iterdir()):
        if not class_dir.is_dir():
            continue
        label = class_dir.name
        for wav_file in sorted(class_dir.glob("*.wav")):
            try:
                info = get_audio_info(wav_file)
                rows.append({
                    "filename": info["filename"],
                    "label": label,
                    "duration_sec": info["duration_sec"],
                    "sample_rate": info["sample_rate"],
                    "rms_energy": info["rms_energy"],
                    "peak_amplitude": info["peak_amplitude"],
                    "path": info["path"],
                })
            except Exception as e:
                print(f"⚠️  Gagal proses {wav_file.name}: {e}")

    # Tulis CSV
    if rows:
        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=rows[0].keys())
            writer.writeheader()
            writer.writerows(rows)
        print(f"✅ Metadata disimpan: {output_path} ({len(rows)} entries)")
    else:
        print("⚠️  Tidak ada data untuk ditulis ke metadata.")

    return rows


def generate_next_filename(class_dir, label, extension=".wav"):
    """
    Generate nama file berikutnya secara otomatis.
    Contoh: Ba_0001.wav, Ba_0002.wav, ...
    """
    class_dir = Path(class_dir)
    existing = list(class_dir.glob(f"{label}_*{extension}"))

    if not existing:
        return f"{label}_0001{extension}"

    # Cari nomor tertinggi
    max_num = 0
    for f in existing:
        try:
            num = int(f.stem.split("_")[-1])
            max_num = max(max_num, num)
        except ValueError:
            continue

    return f"{label}_{max_num + 1:04d}{extension}"
