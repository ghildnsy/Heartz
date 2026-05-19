# 🎵 YouTube Audio Scraper & Data Augmentation Pipeline

Pipeline lengkap untuk scraping audio dari YouTube, pemrosesan audio, transkripsi dengan WhisperX, ekstraksi fitur suku kata Bahasa Indonesia, dan augmentasi data untuk dataset machine learning.

**Status**: ✅ Fully Functional (2-Stage Consolidation + Augmentation Pipeline)

---

## 📋 Daftar Isi

1. [Persyaratan Sistem](#-persyaratan-sistem)
2. [Instalasi Lengkap](#-instalasi-lengkap)
3. [Workflow Overview](#-workflow-overview) ← **START HERE**
4. [Panduan Langkah demi Langkah](#-panduan-langkah-demi-langkah)
5. [Struktur Project](#-struktur-project)
6. [Troubleshooting](#-troubleshooting)

---

## 🔧 Persyaratan Sistem

### Software yang HARUS Diinstall:

| Requirement | Version | Tujuan | Platform |
|---|---|---|---|
| **Python** | 3.8+ | Runtime environment | Windows/Mac/Linux |
| **FFmpeg** | 4.0+ | Audio encoding/decoding | Windows/Mac/Linux |
| **Node.js** | 14+ | Untuk beberapa tools | Windows/Mac/Linux |
| **Pip** | Latest | Python package manager | Included with Python |
| **Jupyter** | Latest | Notebook environment | Via pip |

### Hardware Minimum:
- **RAM**: 8 GB minimum (16+ GB recommended)
- **Storage**: 10 GB free (untuk temp files dan augmented data)
- **CPU**: Multi-core processor (untuk faster processing)
- **Internet**: High-speed connection (untuk YouTube streaming)

---

## 📦 Instalasi Lengkap

### Step 1: Install Python dan pip

**Windows:**
```bash
# Download dari https://www.python.org/downloads/
# Pilih Python 3.10 atau lebih baru
# PENTING: Checklist "Add Python to PATH" saat install

# Verifikasi instalasi:
python --version
pip --version
```

**Mac:**
```bash
# Gunakan Homebrew (https://brew.sh/)
brew install python3

# Verifikasi
python3 --version
pip3 --version
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install python3 python3-pip python3-venv

# Verifikasi
python3 --version
pip3 --version
```

### Step 2: Install FFmpeg

**Windows:**
```bash
# Method 1: Menggunakan Chocolatey (https://chocolatey.org/)
choco install ffmpeg

# Method 2: Manual download dari https://ffmpeg.org/download.html
# Extract dan tambahkan ke PATH

# Verifikasi
ffmpeg -version
```

**Mac:**
```bash
brew install ffmpeg

# Verifikasi
ffmpeg -version
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install ffmpeg

# Verifikasi
ffmpeg -version
```

### Step 3: Setup Python Virtual Environment

```bash
# Navigate ke project directory
cd "/Heartz/data-science2/scraping"

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate

# Mac/Linux:
source venv/bin/activate
```

### Step 4: Install Python Dependencies

```bash
# Update pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt
```

### Step 5: Verifikasi Instalasi

```bash
# Test libraries
python -c "import numpy, pandas, librosa, soundfile; print('✅ All OK')"

# Test FFmpeg
ffmpeg -version | head -1

# Test Jupyter
jupyter --version
```

---

## 🔄 Workflow Overview

Pipeline terdiri dari **2 NOTEBOOK UTAMA** dengan **3 STAGE PROCESSING**:

### COMPLETE WORKFLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                  SCRAPING.IPYNB - STAGE 1                   │
│          YouTube Scraping & Audio Syllable Extraction       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ Cell 1-5: Setup, Imports, FFmpeg Check                │
│               (Jalankan TERLEBIH DAHULU)                   │
│                                                             │
│  ✅ Cell 6-15: Main Processing                            │
│               • Select scraper run [N]                     │
│               • Load temp_audio_[N]/ dan dataset           │
│               • Extract & enhance syllables                │
│               • Save ke extracted_syllables_[N]/           │
│               Output: extracted_syllables_1/, [2], [N]... │
│                                                             │
│  ✅ Cell 16-18: Verification                              │
│               • Review extracted files                      │
│               • Check file counts per label                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
                   (Data siap untuk augmentation)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              AUGMENTATION.IPYNB - STAGE 2 & 3               │
│     Consolidation + Data Augmentation (2-Stage Pipeline)    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ Cell 1-5: Setup, Imports, Check Input                 │
│               • Auto-detect extracted_syllables_[X]        │
│               (Pastikan ada dari Stage 1)                  │
│                                                             │
│  ✅ Cell 6-7: Configuration Review                        │
│               • Review augmentation parameters             │
│               • Optional: Customize settings               │
│                                                             │
│  ✅ Cell 8-11: STAGE 1️⃣  - CONSOLIDATION                 │
│               • Merge SEMUA extracted_syllables_[X]       │
│               • Output: extracted_syllables_consolidated/  │
│                        ↓                                    │
│               STAGE 2️⃣  - AUGMENTATION                    │
│               • Pitch shift, time stretch, normalize       │
│               • Augment ke 200+ per label                  │
│               • Output: augmented_1/ (sequential)          │
│                                                             │
│  ✅ Cell 12-13: Results Analysis                          │
│               • View consolidation report                  │
│               • View augmentation report                   │
│               • Before/After comparison                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
                  (Data siap untuk training ML)
```

### 🎯 Complete Execution Checklist

#### FIRST TIME SETUP:
- [ ] Install Python 3.8+
- [ ] Install FFmpeg
- [ ] Create virtual environment
- [ ] Install dependencies via `pip install -r requirements.txt`
- [ ] Activate venv dan launch Jupyter

#### STAGE 1 - YouTube Scraping (scraping.ipynb):
- [ ] Run Cell 1-5 (Setup & system check)
- [ ] Verify FFmpeg status OK
- [ ] Run Cell 6-15 (Extract syllables)
- [ ] Input YouTube URL / Select scraper run
- [ ] Wait for completion (5-15 min)
- [ ] Run Cell 16-18 (Verify results)
- [ ] ✅ Check output: `extracted_syllables_1/`, `extracted_syllables_2/`, dll
- [ ] Optional: Repeat untuk multiple videos/runs

#### STAGE 2-3 - Augmentation (augmentation.ipynb):
- [ ] ⚠️ PASTIKAN scraping.ipynb sudah dijalankan terlebih dahulu!
- [ ] Run Cell 1-5 (Setup & check input data)
- [ ] Verify found extracted_syllables folders
- [ ] Run Cell 6-7 (Review configuration)
- [ ] Run Cell 8-11 (Execute 2-Stage pipeline)
- [ ] Wait for completion (15-40 min)
- [ ] Run Cell 12-13 (View results)
- [ ] ✅ Check output: `augmented_1/`, `augmented_2/`, dll

### 📊 Data Flow Visualization

```
YouTube URLs
     ↓
┌────────────────────────┐
│  SCRAPING.IPYNB        │  Cell 6-15: Extract Audio Syllables
│  STAGE 1               │  • Download & clean audio
├────────────────────────┤  • Transcribe with WhisperX
│  temp_audio_[N]/       │  • Segment per syllable
│  syllable_dataset_[N]  │  • Extract features
│  extracted_syllables_[N]   
└────────────────────────┘
           ↓↓↓ (Multiple runs if needed)
           │
    ┌──────┴──────┬─────────┐
    ↓             ↓         ↓
  [1]/          [2]/      [N]/
   a/            a/        a/
   ba/           ba/       ba/
   ...           ...       ...
           ↓
┌────────────────────────────────┐
│  AUGMENTATION.IPYNB            │  Cell 8-11: 2-Stage Pipeline
│  STAGE 1: CONSOLIDATION        │
├────────────────────────────────┤
│  Merge [1], [2], [N]           │
│  → extracted_syllables_consolidated/
│        a/, ba/, be/, ...       │
└────────────────────────────────┘
           ↓
┌────────────────────────────────┐
│  AUGMENTATION.IPYNB            │  Cell 8-11 (lanjutan)
│  STAGE 2: AUGMENTATION         │
├────────────────────────────────┤
│  • Pitch shift                 │
│  • Time stretch                │
│  • Duration normalization      │
│  • Volume normalization        │
│  → 200+ files per label        │
│  → augmented_[Y]/              │
└────────────────────────────────┘
           ↓
   ML Training Ready Data
   (augmented_1/ with 200+ per label)
```

---

## 📍 Panduan Langkah demi Langkah

### Persiapan Awal (Setup Environment)

**Terminal Commands** (Run sekali di awal):

```bash
# 1. Navigate ke Heartz project root
cd "C:\Users\ASUS\Documents\Coding Camp Powered by DBS Foundation (Data Scientist)\Capstone Project\Heartz"

# 2. Activate virtual environment
data-science2\venv\Scripts\activate  # Windows
source data-science2/venv/bin/activate  # Mac/Linux

# 3. Verify libraries terinstall
pip list | grep -E "librosa|whisperx|pandas|numpy"

# 4. Navigate ke data-science2 folder
cd data-science2

# 5. Start Jupyter Notebook
jupyter notebook
```

**Jupyter Browser** (setelah Jupyter terbuka):
```
1. Klik file scraping.ipynb atau augmentation.ipynb
2. Notebook akan terbuka di tab baru
3. Select Kernel: Python [default] atau yang terdeteksi
4. Siap untuk run cells
```

### Cara Menjalankan Cells

**Persiapan Awal PERTAMA KALI:**
```
1. Buka scraping.ipynb
2. Run Cell 1-5 (Setup, imports, FFmpeg check)
3. Review messages dan pastikan semua OK
4. Run Cell 6-15 (Extract syllables) - JANGAN LUPA input YouTube URL atau select run
5. Wait untuk completion (5-15 menit)
6. Run Cell 16-18 (Verification)
```

**Untuk Augmentation (setelah scraping)**:
```
1. Buka augmentation.ipynb
2. Run Cell 1-5 (Setup, check available extracted_syllables)
3. Verify ada extracted_syllables folders (jika tidak ada: kembali ke scraping)
4. Run Cell 6-7 (Review configuration)
5. Run Cell 8-11 (Main 2-Stage pipeline) - akan run AUTOMATIC
6. Run Cell 12-13 (View results & analysis)
```

**Catatan:**
- ⏸️ **Untuk memberhentikan cell**: Tekan **Ctrl + C** di terminal atau click "⏹" button di Jupyter
- 🔄 **Untuk re-run cell**: Click cell > Press **Ctrl + Enter**
- 📝 **Untuk edit code**: Double-click cell > edit > Ctrl + Enter
- 💾 **Save notebook**: Ctrl + S atau File → Save

### Workflow Step 1: YouTube Scraping (scraping.ipynb)

**Notebook**: `scraping.ipynb`

**Langkah-langkah di Notebook**:

1. **Cell 1-2** (📖 Markdown): Header & Project overview
   - Baca section ini untuk memahami pipeline

2. **Cell 3** (✅ Setup & Imports):
   ```python
   # Jalankan cell ini untuk import SEMUA libraries
   # Output yang ditampilkan:
   # ✓ Semua module berhasil diimport dari libs/
   # ✓ Base directory: scraped
   # ✓ Config: SAMPLE_RATE=16000, WHISPER_MODEL=small
   # ✓ Total runs sebelumnya: 0
   # ✓ Next run akan menggunakan index: 1
   ```

3. **Cell 4-5** (🔧 System Requirements Check):
   ```python
   # Jalankan untuk verifikasi FFmpeg sudah terinstall
   # Jika belum: install FFmpeg sesuai instruksi
   # Output: Status FFmpeg version
   ```

4. **Cell 6-15** (🔊 Extract & Enhance Audio Syllables):
   - **Configuration**: Review/edit TARGET_SYLLABLES dan enhancement settings
   - **Select Run**: Pilih mana scraper run yang akan diproses (atau 'latest')
   - **Execute Extraction**: Main cell yang melakukan:
     1. Load audio dari temp_audio_[N]/ 
     2. Load dataset dari syllable_dataset_[N].csv
     3. Segment audio per suku kata
     4. Extract features (MFCC, RMS, ZCR, F0, dll)
     5. Save ke extracted_syllables_[N]/ (1:1 mapping dengan scraper run)

5. **Cell 16-18** (✨ Verification):
   ```python
   # Verify hasil extraction
   # Tampilkan sample dari extracted files per label
   # Review file counts per label
   ```

**Input Data (dari scraper run sebelumnya)**:
- YouTube download di: `temp_audio_[N]/`
- Dataset CSV di: `syllable_dataset_[N].csv`

**Output**:
```
scraped/
├── extracted_syllables_1/      # Run #1 extracted audio
│   ├── a/                      # Audio files untuk syllable 'a'
│   ├── ba/                     # Audio files untuk syllable 'ba'
│   ├── be/
│   ├── bi/
│   └── ...
├── extracted_syllables_2/      # Run #2 extracted audio (jika ada)
└── extracted_syllables_N/      # Run #N extracted audio
```

**Expected Duration**: 5-15 menit per run (tergantung jumlah video & audio length)

### Workflow Step 2: Data Consolidation & Augmentation (augmentation.ipynb)

**Notebook**: `augmentation.ipynb`

**⚠️ PENTING**: Jalankan `scraping.ipynb` TERLEBIH DAHULU untuk generate `extracted_syllables_[X]/` folders!

**Langkah-langkah di Notebook**:

1. **Cell 1-2** (📖 Markdown): Header & 2-Stage overview
   - Baca section ini untuk memahami 2-Stage Consolidation pipeline

2. **Cell 3** (✅ Setup & Imports):
   ```python
   # Jalankan cell ini untuk import SEMUA augmentation libraries
   # Output: ✓ Semua module berhasil diimport
   ```

3. **Cell 4-5** (🔍 Check Available extracted_syllables):
   ```python
   # Jalankan untuk melihat SEMUA extracted_syllables_[X] yang tersedia
   # Output:
   # 📥 Found 2 extracted_syllables folder(s)
   #    Indices: [1, 2]
   #    Source folders akan dikonsolidasikan
   ```
   - Jika tidak ada folder: Jalankan `scraping.ipynb` terlebih dahulu

4. **Cell 6-7** (⚙️ Configuration Display):
   ```python
   # Review augmentation configuration
   # - TARGET_SAMPLES_PER_LABEL: 200 files per label target
   # - PITCH_SHIFT_MIN/MAX: -4 to +4 semitone
   # - TIME_STRETCH_MIN/MAX: 0.9x to 1.1x tempo
   # - Lainnya: duration normalization, RMS normalization
   ```

5. **Cell 8-11** (🚀 MAIN PIPELINE - 2-Stage Execution):

   **STAGE 1️⃣ - CONSOLIDATION**:
   ```
   INPUT: extracted_syllables_1/, extracted_syllables_2/, ...
          (Semua extracted_syllables folders)
   
   PROCESS:
   - Scan & detect ALL extracted_syllables_[X] folders
   - Merge SEMUA audio files ke satu folder
   - Organize by label: a/, ba/, be/, ma/, dll
   
   OUTPUT: extracted_syllables_consolidated/
   (Temporary folder untuk Stage 2)
   ```

   **STAGE 2️⃣ - AUGMENTATION**:
   ```
   INPUT: extracted_syllables_consolidated/ (hasil merge dari Stage 1)
   
   PROCESS:
   - Read semua audio files per label
   - Apply augmentation techniques:
     * Pitch Shift: -4 to +4 semitone
     * Time Stretch: 0.9x to 1.1x tempo
     * Duration Normalization: pad/truncate ke target duration
     * RMS Normalization: consistency volume
   - Augment ke TARGET_SAMPLES_PER_LABEL (200+ per label)
   
   OUTPUT: augmented_1/ (atau augmented_2/, augmented_3/, dll)
   (Sequential index independent dari input)
   ```

6. **Cell 12-13** (📊 Results Analysis):
   ```python
   # Jalankan untuk melihat hasil consolidation & augmentation
   # Output:
   # ✅ CONSOLIDATION REPORT:
   #    - Source folders: [1, 2]
   #    - Files per label
   #    - Total files consolidated
   # ✅ AUGMENTATION REPORT:
   #    - Input files vs Output files (augmentation ratio)
   #    - Before/After comparison per label
   #    - Percentage increase
   ```

**Input Data**:
```
scraped/
├── extracted_syllables_1/     # Source 1
├── extracted_syllables_2/     # Source 2
└── extracted_syllables_N/     # Source N
```

**Output**:
```
scraped/
├── extracted_syllables_consolidated/   # Temporary (Stage 1 output)
├── augmented_1/                        # Final augmented data
│   ├── a/                              # Augmented audio untuk syllable 'a'
│   ├── ba/                             # Augmented audio untuk syllable 'ba'
│   └── ...
├── augmentation_report_1.txt           # Report file
└── augmented_2/, augmented_3/, ...     # Jika dijalankan lagi
```

**Expected Duration**: 
- Consolidation: 2-5 menit
- Augmentation: 10-30 menit (tergantung jumlah files & augmentation intensity)
- **Total**: 15-40 menit

---

## 📁 Struktur Project

```
data-science2/
├── libs/
│   ├── __init__.py                     # Package initialization & exports
│   ├── config.py                       # Scraper configuration
│   ├── audio_processor.py              # Audio processing utilities
│   ├── scraper.py                      # YouTube scraping pipeline
│   ├── path_manager.py                 # Indexed path management
│   ├── augmentation_config.py          # Augmentation configuration
│   ├── audio_augmenter.py              # Audio augmentation utilities
│   └── augmentation_pipeline.py        # Main augmentation pipeline
├── scraping.ipynb                      # Jupyter notebook - YouTube scraping
├── augmentation.ipynb                  # Jupyter notebook - Data augmentation
├── README.md                           # Documentation (file ini)
├── AUGMENTATION.md                     # Augmentation documentation
├── STRUCTURE.md                        # Project structure details
├── INDEXED_PATHS.md                    # Indexed paths system documentation
└── REFACTORING_NOTES.md               # Refactoring & clean code notes
```

## 📦 Module Descriptions

### Scraping Modules

#### 1. **config.py**
Berisi semua konfigurasi global untuk scraping:
- Audio processing parameters (sample rate, filter range, normalization)
- WhisperX model configuration
- Feature extraction settings
- Output paths dan filenames
- Base directory configuration

**Penting**: Edit file ini jika perlu mengubah parameter scraping.

#### 2. **audio_processor.py**
Modul utility dengan semua fungsi untuk pemrosesan audio:

##### Audio Processing Functions:
- `butter_bandpass()` - Desain Butterworth bandpass filter
- `apply_bandpass()` - Terapkan bandpass filter (80-3000 Hz untuk suara manusia)
- `denoise_audio()` - Denoising menggunakan spectral gating
- `normalize_rms()` - Normalisasi volume berdasarkan RMS

##### Audio Cleaning:
- `clean_audio_file()` - Pipeline lengkap: denoise + filter + normalize

##### Download & Transcription:
- `download_audio()` - Download audio dari YouTube dan konversi ke WAV
- `transcribe_words()` - Transkripsi dengan WhisperX + alignment

##### Syllable Processing:
- `syllabify()` - Pecah kata menjadi suku kata
- `split_word_into_syllables_audio()` - Segmentasi audio per suku kata

##### Feature Extraction:
- `extract_features_from_audio_chunk()` - Ekstraksi 18 fitur audio

##### Validation:
- `validate_youtube_url()` - Validasi format YouTube URL

#### 3. **scraper.py**
Main pipeline yang mengintegrasikan semua proses scraping:

##### Main Functions:
- `process_youtube_video_indexed()` - Process satu video dengan indexed paths [RECOMMENDED]
- `process_youtube_video()` - Process satu video (legacy)
- `process_multiple_videos()` - Process multiple videos dan gabung hasilnya

#### 4. **path_manager.py**
Sistem manajemen indexed paths untuk auto-incrementing folders:

##### Key Functions:
- `get_next_index(base_dir, prefix)` - Scan folder, return next index
- `setup_run_directories(base_dir, run_index)` - Create all run directories
- `get_indexed_path(base_dir, prefix)` - Generate indexed path
- `get_run_info(base_dir)` - Get info tentang semua runs

### Augmentation Modules

#### 5. **augmentation_config.py**
Konfigurasi untuk augmentation pipeline:
- Target samples per label
- Pitch shift range
- Time stretch range
- Duration normalization settings
- Target labels
- RMS normalization target

#### 6. **audio_augmenter.py**
Utility functions untuk audio augmentation:

##### Augmentation Techniques:
- `pitch_shift_audio()` - Shift pitch tanpa ubah durasi
- `time_stretch_audio()` - Stretch tempo tanpa ubah pitch
- `normalize_rms()` - Normalisasi volume berdasarkan RMS
- `pad_or_truncate_audio()` - Seragamkan durasi audio

##### Label Processing:
- `augment_label_to_target()` - Augmentasi ke target count per label
- `normalize_duration_in_label()` - Seragamkan durasi semua file di label

##### Analysis:
- `get_label_statistics()` - Get statistik per label
- `print_augmentation_report()` - Generate report

#### 7. **augmentation_pipeline.py**
Main pipeline untuk augmentation dengan indexed paths:

##### Key Functions:
- `run_augmentation_pipeline()` - Full augmentation pipeline [MAIN]
- `setup_augmentation_run()` - Setup indexed directories
- `get_source_data()` - Get source directory
- `copy_source_to_target()` - Copy files dari source ke target

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
pip install noisereduce scipy soundfile whisperx yt-dlp pydub librosa

# Or using requirements file (if exists)
pip install -r requirements.txt
```

### Workflow 1: YouTube Scraping

Run `scraping.ipynb` untuk scraping audio dari YouTube:

```python
from libs import scraper, path_manager

# Cell 1-3: Setup & imports
# Cell 4: Main pipeline dengan indexed paths
result = scraper.process_youtube_video_indexed("https://www.youtube.com/watch?v=...")

# Output:
# - temp_audio_1/ folder dengan downloaded audio
# - syllable_dataset_1.csv dengan features
# - extracted_syllables_1/ folder dengan audio files per syllable
```

**Output dari scraping:**
- Indexed temp folders: `temp_audio_1`, `temp_audio_2`, etc.
- Indexed datasets: `syllable_dataset_1.csv`, `syllable_dataset_2.csv`, etc.
- Indexed extracted syllables: `extracted_syllables_1/`, `extracted_syllables_2/`, etc.

### Workflow 2: Data Augmentation

Run `augmentation.ipynb` untuk augmentasi dataset yang sudah di-scrape:

```python
from libs import augmentation_pipeline

# Cell 1-3: Setup & configuration
# Cell 4: Main augmentation pipeline
result = augmentation_pipeline.run_augmentation_pipeline(source_run_index=1)

# Output:
# - augmented_1/ folder dengan augmented audio
# - augmentation_report_1.txt dengan statistik
```

**Output dari augmentation:**
- Indexed augmented datasets: `augmented_1/`, `augmented_2/`, etc.
- Indexed reports: `augmentation_report_1.txt`, `augmentation_report_2.txt`, etc.

### Indexed Paths System

Sistem auto-incrementing mencegah overwrite dan mendukung multiple runs:

```
scraped/
├── temp_audio_1/                    # Run 1 downloads
├── temp_audio_2/                    # Run 2 downloads
├── syllable_dataset_1.csv           # Run 1 dataset
├── syllable_dataset_2.csv           # Run 2 dataset
├── extracted_syllables_1/           # Run 1 extracted audio
├── extracted_syllables_2/           # Run 2 extracted audio
├── augmented_1/                     # Augmentation 1
├── augmented_2/                     # Augmentation 2
├── augmentation_report_1.txt
└── augmentation_report_2.txt
```

### Usage in Jupyter Notebook

#### Scraping:
```python
from libs import scraper, path_manager, config

# Check existing runs
run_info = path_manager.get_run_info(config.BASE_SCRAPED_DIR)
print(f"Existing runs: {run_info['runs']}")

# Process video dengan indexed paths
df_result, run_info = scraper.process_youtube_video_indexed(youtube_url)
print(f"Run #{run_info['run_index']}: {run_info['dataset_filename']}")
```

#### Augmentation:
```python
from libs import augmentation_pipeline, path_manager

# Get latest run
run_info = path_manager.get_run_info("scraped")
latest_run = max(run_info['runs'])

# Run augmentation
result = augmentation_pipeline.run_augmentation_pipeline(source_run_index=latest_run)
print(f"Augmentation #{result['aug_index']} done!")
```

## 📊 Output Dataset

Output CSV berisi kolom-kolom berikut:

| Column | Type | Description |
|--------|------|-------------|
| `original_word` | str | Kata asli dari transkripsi |
| `syllable` | str | Suku kata |
| `syllable_start_sec` | float | Start time dalam detik |
| `syllable_end_sec` | float | End time dalam detik |
| `duration_sec` | float | Durasi suku kata |
| `zcr` | float | Zero Crossing Rate |
| `rms` | float | RMS Energy |
| `spectral_centroid` | float | Spektral centroid |
| `f0_mean` | float | Fundamental frequency |
| `mfcc_1_mean` to `mfcc_13_mean` | float | MFCC mean coefficients |
| `mfcc_1_std` to `mfcc_13_std` | float | MFCC std coefficients |

## ⚙️ Configuration

### Scraping Configuration (libs/config.py)

```python
# Audio Processing
SAMPLE_RATE = 16000                    # Hz
BANDPASS_LOWCUT = 80                   # Hz
BANDPASS_HIGHCUT = 3000                # Hz
TARGET_RMS = 0.1                       # Normalisasi target

# WhisperX
WHISPER_MODEL = "small"                # Model size
WHISPER_BATCH_SIZE = 16                # Batch size

# Output & Indexed Paths
BASE_SCRAPED_DIR = "scraped"           # Base directory
USE_INDEXED_PATHS = True               # Enable auto-incrementing
```

### Augmentation Configuration (libs/augmentation_config.py)

```python
# Augmentation Techniques
TARGET_SAMPLES_PER_LABEL = 200         # Target per label
PITCH_SHIFT_MIN = -4                   # Semitone
PITCH_SHIFT_MAX = 4                    # Semitone
TIME_STRETCH_MIN = 0.9                 # Rate
TIME_STRETCH_MAX = 1.1                 # Rate
TARGET_DURATION_SEC = 1.0              # Seconds
TARGET_RMS = 0.1                       # Normalisasi

# Enable/Disable
ENABLE_PITCH_SHIFT = True
ENABLE_TIME_STRETCH = True
ENABLE_DURATION_NORMALIZATION = True
ENABLE_RMS_NORMALIZATION = True
```

**Edit config files sesuai kebutuhan experiment anda.**

## ✨ Features

### Scraping Pipeline
- ✅ YouTube video download dengan yt-dlp
- ✅ Audio preprocessing (denoise, bandpass filter, normalization)
- ✅ Indonesian speech-to-text dengan WhisperX
- ✅ Syllable segmentation dan audio splitting
- ✅ 18-feature extraction (MFCC, RMS, ZCR, F0, spectral centroid)
- ✅ Automatic syllable CSV generation
- ✅ Indexed paths (auto-incrementing folder names)

### Augmentation Pipeline
- ✅ Pitch shifting (-4 to +4 semitone)
- ✅ Time stretching (0.9x to 1.1x)
- ✅ Duration normalization (pad/truncate)
- ✅ RMS normalization untuk volume consistency
- ✅ Automatic target count augmentation (200 per label)
- ✅ Batch augmentation untuk multiple runs
- ✅ Augmentation reporting dan statistics
- ✅ Indexed augmentation runs

### Code Quality
- ✅ Modular architecture (split ke libs/)
- ✅ Clean code principles (single responsibility, DRY)
- ✅ Type hints & docstrings
- ✅ Comprehensive error handling
- ✅ Configurable via config files
- ✅ Reusable functions & pipelines

## 🔄 Processing Pipeline Detail

Setiap video YouTube melalui tahapan berikut:

### 1. **Download** (1-2 menit)
```
YouTube URL → Download audio → WAV file
```

### 2. **Audio Cleaning** (30 detik - 1 menit)
```
Original WAV → Denoise → Bandpass Filter (80-3000 Hz) → Normalize → Cleaned WAV
```

### 3. **Transcription** (5-10 menit)
```
Cleaned WAV → WhisperX small model → Words + timestamps
```

### 4. **Syllabification** (< 1 detik)
```
Words → Syllabify logic → Syllables
```

### 5. **Audio Segmentation** (1-2 detik)
```
Cleaned WAV + timestamps → Split into syllable segments → Audio chunks
```

### 6. **Feature Extraction** (1-5 menit)
```
Audio chunks → Extract features (MFCC, RMS, ZCR, F0, Centroid) → Feature vectors
```

### 7. **Save Dataset** (< 1 detik)
```
Feature vectors → Create DataFrame → Save to CSV
```

## 🎯 Audio Features Explained

### Basic Energy Features:
- **ZCR (Zero Crossing Rate)**: Jumlah sign changes per frame, indikasi fricative consonants
- **RMS**: Root Mean Square energy, indikasi volume

### Frequency Features:
- **Spectral Centroid**: Center of mass dari spektrum, indikasi brightness
- **F0 (Fundamental Frequency)**: Pitch dari suara, important untuk vowels

### Perceptual Features:
- **MFCC (Mel-Frequency Cepstral Coefficients)**: 13 koefisien, mirip dengan perception manusia
  - Mean: Rata-rata fitur
  - Std: Variasi fitur

## 💡 Tips & Tricks

### Penggunaan GPU
- Jika GPU tersedia, WhisperX otomatis menggunakan CUDA
- Check: `torch.cuda.is_available()`

### Masalah Download
- Jika YouTube URL tidak bisa diunduh:
  1. Cek koneksi internet
  2. URL harus format standar (youtube.com/watch?v=...)
  3. Video harus punya audio

### Masalah Transkripsi
- Jika tidak ada kata yang terdeteksi:
  1. Video harus berbahasa Indonesia
  2. Volume audio harus cukup keras
  3. Durasi audio minimal 0.5 detik

### Dataset Terlalu Besar
- Gunakan `pandas` untuk filtering:
  ```python
  df = pd.read_csv('syllable_dataset.csv')
  df_filtered = df[df['duration_sec'] > 0.05]  # Filter suku kata > 50ms
  ```

## 🔧 Troubleshooting

### Error: "Module not found"
```
Pastikan file config.py, audio_processor.py, scraper.py di folder yang sama dengan notebook
```

### Error: "CUDA out of memory"
```
Set compute_type = "int8" di config.py untuk menghemat memory
Atau gunakan model "tiny" atau "base" daripada "small"
```

### Error: "No audio found"
```
Pastikan:
1. YouTube URL valid dan audio bisa diunduh
2. FFmpeg installed di system
3. Koneksi internet stabil
```

### Proses sangat lambat
```
Ini normal. WhisperX membutuhkan waktu karena:
1. Download video (tergantung internet)
2. Audio cleaning (DSP processing)
3. Model transcription (neural network inference)
Gunakan GPU untuk percepatan 5-10x
```

## 📝 Example Usage

### Single Video Processing
```python
import scraper
import config

url = "https://www.youtube.com/watch?v=xxxxxxxxxxx"
df = scraper.process_youtube_video(url)

print(f"Total syllables: {len(df)}")
print(df.groupby('original_word')['syllable'].apply(list))
```

### Batch Processing
```python
urls = [
    "https://www.youtube.com/watch?v=url1",
    "https://www.youtube.com/watch?v=url2",
]
df_combined = scraper.process_multiple_videos(urls)
```

### Data Analysis
```python
import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv(config.OUTPUT_DATASET_FILENAME)

# Statistik per kata
print(df.groupby('original_word').size())

# Distribusi duration
df['duration_sec'].hist(bins=50)
plt.xlabel('Duration (seconds)')
plt.ylabel('Count')
plt.show()
```

## 📚 Dependencies

- **librosa**: Audio processing
- **scipy**: Signal processing (bandpass filter)
- **soundfile**: WAV I/O
- **noisereduce**: Audio denoising
- **whisperx**: Speech-to-text transcription
- **torch**: Deep learning backend
- **yt-dlp**: YouTube downloader
- **pydub**: Audio manipulation
- **pandas**: Data manipulation
- **numpy**: Numerical computing

---

**Last Updated**: May 19, 2026
