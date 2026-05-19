"""
Konfigurasi untuk Audio Data Augmentation
"""

# ===== INPUT/OUTPUT CONFIG =====
# Base directory akan use indexed paths sama seperti scraper
BASE_SCRAPED_DIR = "scraped"           # Source dari scraper output
BASE_AUGMENTED_DIR = "scraped"         # Output akan di scraped/augmented_N

# ===== AUGMENTATION PARAMETERS =====
TARGET_SAMPLES_PER_LABEL = 200         # Target jumlah file per label

# Pitch shifting (perubahan frekuensi dalam semitone)
PITCH_SHIFT_MIN = -4                   # Minimum pitch shift (semitone)
PITCH_SHIFT_MAX = 4                    # Maximum pitch shift (semitone)

# Time stretching (perubahan tempo)
TIME_STRETCH_MIN = 0.9                 # Minimum stretch rate
TIME_STRETCH_MAX = 1.1                 # Maximum stretch rate
TIME_STRETCH_PROBABILITY = 0.5         # Probability of applying time stretch

# Audio duration uniformity
TARGET_DURATION_SEC = 1.0              # Target duration (seconds)
SAMPLE_RATE = 16000                    # Hz

# ===== AUGMENTATION TECHNIQUES =====
ENABLE_PITCH_SHIFT = True              # Gunakan pitch shifting
ENABLE_TIME_STRETCH = True             # Gunakan time stretching
ENABLE_DURATION_NORMALIZATION = True   # Seragamkan durasi
ENABLE_RMS_NORMALIZATION = True        # Normalisasi volume

# Target RMS untuk normalisasi
TARGET_RMS = 0.1

# ===== TARGET LABELS =====
TARGET_LABELS = [
    'a', 'i', 'u', 'e', 'o',
    'ma', 'mi', 'mu', 'me', 'mo',
    'ba', 'bi', 'bu', 'be', 'bo',
    'pa', 'pi', 'pu', 'pe', 'po'
]

# ===== LOGGING & OUTPUT =====
VERBOSE = True                         # Detailed output
GENERATE_REPORT = True                 # Generate augmentation report
