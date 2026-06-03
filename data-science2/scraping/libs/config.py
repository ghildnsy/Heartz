"""
Konfigurasi untuk YouTube Audio Scraper
"""

# ===== AUDIO PROCESSING CONFIG =====
SAMPLE_RATE = 16000  # Hz, standar untuk speech recognition
AUDIO_FORMAT = "wav"

# Bandpass filter configuration untuk suara manusia
BANDPASS_LOWCUT = 80  # Hz
BANDPASS_HIGHCUT = 3000  # Hz
BANDPASS_ORDER = 4

# Noise reduction config
DENOISE_PROP_DECREASE = 0.8
DENOISE_STATIONARY = True

# Normalisasi RMS
TARGET_RMS = 0.1

# ===== WHISPER X CONFIG =====
WHISPER_MODEL = "small"
WHISPER_BATCH_SIZE = 16
WHISPER_LANGUAGE = "id"  # Bahasa Indonesia - explicit language untuk transcription
ALIGN_MODEL_NAME = "indonesian-nlp/wav2vec2-large-xlsr-indonesian"
ALIGN_LANGUAGE_CODE = "id"

# ===== FEATURE EXTRACTION CONFIG =====
MFCC_N_COEFFICIENTS = 13
F0_MIN_FREQUENCY = 50  # Hz
F0_MAX_FREQUENCY = 300  # Hz

# ===== OUTPUT CONFIG (INDEXED) =====
# Base directory untuk semua scraping results
BASE_SCRAPED_DIR = "scraped"

# Default (akan di-override oleh scraper dengan indexed paths)
TEMP_AUDIO_DIR = "temp_audio"
OUTPUT_DATASET_FILENAME = "syllable_dataset.csv"
EXTRACTED_DIR = "extracted_syllables"

# ===== PROCESSING CONFIG =====
MAX_DOWNLOAD_ATTEMPTS = 3
MIN_AUDIO_LENGTH_SEC = 0.5  # Audio minimum length untuk denoising
USE_INDEXED_PATHS = True  # Enable auto-indexing untuk paths

# ===== YOUTUBE DL OPTIONS =====
YOUTUBE_DL_FORMAT = "bestaudio/best"
YOUTUBE_DL_AUDIO_CODEC = "wav"
YOUTUBE_DL_AUDIO_QUALITY = "16000"
