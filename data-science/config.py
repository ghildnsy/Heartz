"""
============================================================
Heartz Project — Konfigurasi Global
============================================================
File ini berisi semua konstanta dan path yang digunakan
di seluruh pipeline data preparation.

20 Kelas Target:
  - 5 Vokal   : A, I, U, E, O
  - 15 Bilabial: Ba, Bi, Bu, Be, Bo, Pa, Pi, Pu, Pe, Po,
                 Ma, Mi, Mu, Me, Mo
============================================================
"""

import sys
import io
from pathlib import Path

# Paksa stdout & stderr ke UTF-8 agar emoji tidak error di terminal Windows (cp1252)
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
if sys.stderr.encoding and sys.stderr.encoding.lower() != 'utf-8':
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# ========================
# PATH CONFIGURATION
# ========================
BASE_DIR = Path(__file__).resolve().parent
DATASET_DIR = BASE_DIR / "dataset"
RAW_DIR = DATASET_DIR / "raw"
CLEAN_DIR = DATASET_DIR / "clean"
AUGMENTED_DIR = DATASET_DIR / "augmented"
MANUAL_DIR = DATASET_DIR / "manual_downloads" # Tempat menaruh file video/audio manual (mp4, mp3, dll)
DOWNLOADS_DIR = DATASET_DIR / "downloads"  # Audio WAV hasil konversi dari manual_downloads
METADATA_DIR = DATASET_DIR / "metadata"

# ========================
# 20 KELAS SUKU KATA
# ========================
VOWELS = ["A", "I", "U", "E", "O"]
BA_SET = ["Ba", "Bi", "Bu", "Be", "Bo"]
PA_SET = ["Pa", "Pi", "Pu", "Pe", "Po"]
MA_SET = ["Ma", "Mi", "Mu", "Me", "Mo"]

ALL_CLASSES = VOWELS + BA_SET + PA_SET + MA_SET  # Total: 20

# ========================
# AUDIO PARAMETERS
# ========================
SAMPLE_RATE = 16000       # 16 kHz — standar speech recognition
CHANNELS = 1              # Mono
CLIP_DURATION_MIN = 0.4   # Durasi minimum clip (detik)
CLIP_DURATION_MAX = 2.0   # Durasi maksimum clip (detik)
CLIP_DURATION_TARGET = 1.0  # Durasi target untuk padding (detik)

# ========================
# SPLITTER PARAMETERS
# ========================
SILENCE_THRESH_DB = -40     # Threshold dBFS untuk mendeteksi silence
MIN_SILENCE_LEN_MS = 250    # Durasi minimum silence (ms) untuk split
KEEP_SILENCE_MS = 80        # Berapa ms silence yang dipertahankan di ujung clip

# ========================
# CLEANER PARAMETERS
# ========================
NOISE_REDUCE_PROP = 0.9          # Proporsi noise reduction (0.0 - 1.0)
NOISE_REDUCE_STATIONARY = True   # Gunakan stationary noise reduction
NORMALIZE_TARGET_DBFS = -20.0    # Target loudness normalization (dBFS)
HIGH_PASS_FREQ = 80              # High-pass filter cutoff (Hz) — hapus rumble
LOW_PASS_FREQ = 7500             # Low-pass filter cutoff (Hz) — hapus hiss

# ========================
# AUGMENTATION PARAMETERS
# ========================
AUGMENTATION_FACTOR = 4  # Tiap file asli menghasilkan N file augmented
PITCH_SHIFT_RANGE = (-2, 2)       # Semitone range
TIME_STRETCH_RANGE = (0.85, 1.15) # Speed factor range
NOISE_AMPLITUDE = 0.005           # Amplitude white noise injection
VOLUME_SHIFT_DB = (-4, 4)         # Volume perturbation range (dB)

# ========================
# TARGET DATA
# ========================
TARGET_PER_CLASS_MIN = 150    # Minimum sampel asli per kelas
TARGET_PER_CLASS_IDEAL = 200  # Target ideal per kelas


def ensure_dirs():
    """Buat seluruh direktori yang dibutuhkan jika belum ada."""
    for d in [RAW_DIR, CLEAN_DIR, AUGMENTED_DIR, MANUAL_DIR, DOWNLOADS_DIR, METADATA_DIR]:
        d.mkdir(parents=True, exist_ok=True)

    for cls in ALL_CLASSES:
        (RAW_DIR / cls).mkdir(exist_ok=True)
        (CLEAN_DIR / cls).mkdir(exist_ok=True)
        (AUGMENTED_DIR / cls).mkdir(exist_ok=True)

    print(f"✅ Semua direktori siap ({len(ALL_CLASSES)} kelas)")


if __name__ == "__main__":
    ensure_dirs()
    print(f"\n📁 Base Directory  : {BASE_DIR}")
    print(f"📁 Dataset Directory: {DATASET_DIR}")
    print(f"🏷️  Total Kelas     : {len(ALL_CLASSES)}")
    print(f"🏷️  Kelas           : {ALL_CLASSES}")
    print(f"🎵 Sample Rate     : {SAMPLE_RATE} Hz")
    print(f"⏱️  Durasi Clip     : {CLIP_DURATION_MIN}-{CLIP_DURATION_MAX}s")
