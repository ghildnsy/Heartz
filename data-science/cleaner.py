"""
============================================================
Heartz Project — STEP 3: Audio Cleaner
============================================================
Membersihkan, menormalisasi, dan menstandardisasi audio
dari dataset/raw/ → dataset/clean/.

Proses:
  1. Noise Reduction (noisereduce)
  2. High-pass filter (hapus rumble <80Hz)
  3. Low-pass filter (hapus hiss >7500Hz)
  4. Volume normalization (target -20 dBFS)
  5. Standarisasi durasi (pad/trim ke target)
  6. Validasi kualitas

Cara Pakai:
-----------
  python cleaner.py                    # Bersihkan semua kelas
  python cleaner.py --classes Ba Ma    # Bersihkan kelas tertentu

Atau dari notebook:
  from cleaner import clean_single, clean_class, clean_all
============================================================
"""

import numpy as np
import librosa
from pathlib import Path
from tqdm import tqdm
import argparse

from config import (
    RAW_DIR, CLEAN_DIR, SAMPLE_RATE, ALL_CLASSES,
    NOISE_REDUCE_PROP,
    NORMALIZE_TARGET_DBFS, HIGH_PASS_FREQ, LOW_PASS_FREQ,
    CLIP_DURATION_TARGET, CLIP_DURATION_MIN,
    ensure_dirs,
)
from utils import load_audio, save_audio, pad_or_trim, count_dataset, print_dataset_summary


def reduce_noise(y, sr=SAMPLE_RATE):
    """
    Kurangi background noise menggunakan spectral gating berbasis scipy.
    Menggunakan STFT untuk mendeteksi dan mengurangi komponen noise.
    """
    # Hitung STFT
    n_fft = 2048
    hop_length = 512
    S = librosa.stft(y, n_fft=n_fft, hop_length=hop_length)
    magnitude = np.abs(S)
    phase = np.angle(S)

    # Estimasi noise dari frame paling pelan (asumsi: 10% frame terpelан = noise)
    n_noise_frames = max(1, int(magnitude.shape[1] * 0.1))
    frame_energy = np.mean(magnitude, axis=0)
    noise_frame_indices = np.argsort(frame_energy)[:n_noise_frames]
    noise_profile = np.mean(magnitude[:, noise_frame_indices], axis=1, keepdims=True)

    # Spectral gating: kurangi komponen yang di bawah threshold noise
    prop = NOISE_REDUCE_PROP
    mask = np.maximum(magnitude - noise_profile * prop, 0) / (magnitude + 1e-10)
    mask = np.clip(mask, 0, 1)

    # Terapkan mask dan rekonstruksi
    S_clean = magnitude * mask * np.exp(1j * phase)
    y_denoised = librosa.istft(S_clean, hop_length=hop_length, length=len(y))

    return y_denoised


def apply_bandpass_filter(y, sr=SAMPLE_RATE, low_freq=None, high_freq=None):
    """
    Terapkan bandpass filter (high-pass + low-pass).
    Menghapus frekuensi di luar range suara bicara.
    """
    if low_freq is None:
        low_freq = HIGH_PASS_FREQ
    if high_freq is None:
        high_freq = LOW_PASS_FREQ

    from scipy.signal import butter, sosfilt

    # High-pass filter
    sos_high = butter(5, low_freq, btype='highpass', fs=sr, output='sos')
    y = sosfilt(sos_high, y)

    # Low-pass filter
    sos_low = butter(5, high_freq, btype='lowpass', fs=sr, output='sos')
    y = sosfilt(sos_low, y)

    return y


def normalize_volume(y, target_dbfs=None):
    """
    Normalisasi volume audio ke target dBFS.
    """
    if target_dbfs is None:
        target_dbfs = NORMALIZE_TARGET_DBFS

    # Hitung current RMS
    rms = np.sqrt(np.mean(y ** 2))
    if rms == 0:
        return y

    # Hitung target RMS dari target dBFS
    target_rms = 10 ** (target_dbfs / 20)

    # Normalisasi
    gain = target_rms / rms
    y_normalized = y * gain

    # Clipping prevention
    peak = np.max(np.abs(y_normalized))
    if peak > 0.99:
        y_normalized = y_normalized * (0.99 / peak)

    return y_normalized


def trim_silence(y, sr=SAMPLE_RATE, top_db=25):
    """
    Potong silence di awal dan akhir audio.
    """
    y_trimmed, _ = librosa.effects.trim(y, top_db=top_db)
    return y_trimmed


def validate_quality(y, sr=SAMPLE_RATE):
    """
    Validasi kualitas audio clip.

    Returns:
        tuple: (is_valid, reason)
    """
    duration = len(y) / sr

    # Cek durasi minimum
    if duration < CLIP_DURATION_MIN:
        return False, f"terlalu pendek ({duration:.2f}s)"

    # Cek apakah terlalu pelan (mungkin silence)
    rms = np.sqrt(np.mean(y ** 2))
    if rms < 0.003:
        return False, f"terlalu pelan (RMS={rms:.4f})"

    # Cek apakah clipping
    peak = np.max(np.abs(y))
    if peak > 0.999:
        return False, f"clipping (peak={peak:.4f})"

    # Cek apakah ada NaN atau Inf
    if np.any(np.isnan(y)) or np.any(np.isinf(y)):
        return False, "mengandung NaN/Inf"

    return True, "OK"


def clean_single(input_path, output_path, target_duration=None):
    """
    Pipeline cleaning lengkap untuk satu file audio.

    Pipeline:
      1. Load & resample
      2. Trim silence
      3. Noise reduction
      4. Bandpass filter
      5. Volume normalization
      6. Pad/trim ke target durasi
      7. Validasi kualitas

    Args:
        input_path: Path ke file audio mentah
        output_path: Path output
        target_duration: Durasi target (detik). None = tidak pad/trim.

    Returns:
        tuple: (success: bool, message: str)
    """
    if target_duration is None:
        target_duration = CLIP_DURATION_TARGET

    try:
        # 1. Load
        y, sr = load_audio(input_path, SAMPLE_RATE)

        # 2. Trim silence di awal/akhir
        y = trim_silence(y, sr, top_db=25)

        # 3. Noise reduction
        y = reduce_noise(y, sr)

        # 4. Bandpass filter
        y = apply_bandpass_filter(y, sr)

        # 5. Normalize volume
        y = normalize_volume(y)

        # 6. Pad/trim ke target durasi
        if target_duration:
            y = pad_or_trim(y, target_duration, sr)

        # 7. Validasi kualitas
        is_valid, reason = validate_quality(y, sr)
        if not is_valid:
            return False, f"Gagal validasi: {reason}"

        # Simpan
        save_audio(y, output_path, sr)
        return True, "OK"

    except Exception as e:
        return False, f"Error: {str(e)}"


def clean_class(label, raw_dir=None, clean_dir=None, target_duration=None):
    """
    Bersihkan semua file audio untuk satu kelas.

    Args:
        label: Nama kelas (misal: "Ba")
        raw_dir: Direktori raw
        clean_dir: Direktori clean output
        target_duration: Durasi target (detik)

    Returns:
        dict: {"success": int, "failed": int, "skipped": int, "errors": []}
    """
    if raw_dir is None:
        raw_dir = RAW_DIR
    if clean_dir is None:
        clean_dir = CLEAN_DIR

    raw_class_dir = Path(raw_dir) / label
    clean_class_dir = Path(clean_dir) / label
    clean_class_dir.mkdir(parents=True, exist_ok=True)

    if not raw_class_dir.exists():
        print(f"⚠️  Folder raw/{label} tidak ditemukan")
        return {"success": 0, "failed": 0, "skipped": 0, "errors": []}

    wav_files = sorted(raw_class_dir.glob("*.wav"))
    if not wav_files:
        print(f"⚠️  Tidak ada file .wav di raw/{label}")
        return {"success": 0, "failed": 0, "skipped": 0, "errors": []}

    results = {"success": 0, "failed": 0, "skipped": 0, "errors": []}

    for wav_file in wav_files:
        output_path = clean_class_dir / wav_file.name

        # Skip jika sudah ada
        if output_path.exists():
            results["skipped"] += 1
            continue

        success, msg = clean_single(wav_file, output_path, target_duration)

        if success:
            results["success"] += 1
        else:
            results["failed"] += 1
            results["errors"].append(f"{wav_file.name}: {msg}")

    status = "✅" if results["failed"] == 0 else "⚠️"
    print(f"  {status} {label}: {results['success']} berhasil, "
          f"{results['failed']} gagal, {results['skipped']} di-skip")

    return results


def clean_all(classes=None, raw_dir=None, clean_dir=None, target_duration=None):
    """
    Bersihkan semua kelas atau kelas tertentu.

    Args:
        classes: List kelas yang akan dibersihkan (None = auto-detect semua folder di raw_dir)
        raw_dir: Direktori raw
        clean_dir: Direktori clean
        target_duration: Durasi target

    Returns:
        dict: Ringkasan per kelas
    """
    if raw_dir is None:
        raw_dir = RAW_DIR
    if clean_dir is None:
        clean_dir = CLEAN_DIR
    
    # Jika classes=None, scan folder apa yang ada di raw_dir
    # Ini memastikan Be2, Be3, dll. juga diproses
    if classes is None:
        raw_path = Path(raw_dir)
        classes = []
        if raw_path.exists():
            for folder in sorted(raw_path.glob("*/")):
                if folder.is_dir():
                    classes.append(folder.name)
        
        if not classes:
            print(f"⚠️  Tidak ada folder di {raw_dir}")
            return {}
        
        print(f"📋 Auto-detect mode: Menemukan {len(classes)} folder")
        print(f"   Kelas: {', '.join(classes)}")

    print(f"\n{'='*50}")
    print(f"🧹 Audio Cleaning Pipeline")
    print(f"   Kelas    : {len(classes)}")
    print(f"   Raw Dir  : {raw_dir}")
    print(f"   Clean Dir: {clean_dir}")
    print(f"{'='*50}\n")

    all_results = {}
    total_success = 0
    total_failed = 0

    for label in tqdm(classes, desc="Cleaning"):
        result = clean_class(label, raw_dir, clean_dir, target_duration)
        all_results[label] = result
        total_success += result["success"]
        total_failed += result["failed"]

    print(f"\n{'='*50}")
    print(f"📊 Ringkasan Cleaning")
    print(f"   ✅ Total berhasil : {total_success}")
    print(f"   ❌ Total gagal    : {total_failed}")
    print(f"{'='*50}")

    # Tampilkan errors jika ada
    all_errors = []
    for label, result in all_results.items():
        for err in result["errors"]:
            all_errors.append(f"  [{label}] {err}")

    if all_errors:
        print(f"\n⚠️  Detail Error ({len(all_errors)} file):")
        for err in all_errors[:20]:  # Tampilkan max 20
            print(err)
        if len(all_errors) > 20:
            print(f"  ... dan {len(all_errors) - 20} error lainnya")

    return all_results


# ============================================
# MAIN
# ============================================
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Heartz Audio Cleaner")
    parser.add_argument("--classes", nargs="+", default=None,
                        help="Kelas yang akan dibersihkan (misal: Ba Ma A)")
    parser.add_argument("--duration", type=float, default=None,
                        help="Target durasi clip dalam detik (default: 1.0)")
    args = parser.parse_args()

    ensure_dirs()

    # Tampilkan status raw
    print_dataset_summary(RAW_DIR, "Dataset RAW (Input)")

    # Jalankan cleaning
    clean_all(
        classes=args.classes,
        target_duration=args.duration,
    )

    # Tampilkan status clean
    print_dataset_summary(CLEAN_DIR, "Dataset CLEAN (Output)")
