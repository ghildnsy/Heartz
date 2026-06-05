# Heartz - Data Science Phase
## AI-Powered Speech Therapy Platform for Deaf Community

---

## TABLE OF CONTENTS

- [Quick Start](#-quick-start)
- [Project Overview](#-project-overview)
- [Project Structure](#-project-structure)
- [Key Documents](#-key-documents)
- [Submodules](#-submodules)

---

## QUICK START

### For First-Time Users: Start Here

1. **Read the Main Report**
   - [**Laporan Teknis Komprehensif.pdf**](#-laporan-teknis-komprehensif-main-report) - Laporan lengkap dengan analisis mendalam
   
2. **Explore Interactive Dashboard**
   - [Streamlit App](eda/app.py) - Visualisasi data interaktif
   
3. **Dive into Details**
   - [DATA_DICTIONARY.md](#-data-dictionarymd-feature-documentation) - Dokumentasi fitur lengkap
   - [Main Notebook](eda/main.ipynb) - Analisis detail dengan 34 cells

---

## PROJECT OVERVIEW

### What is Heartz?

**Heartz** adalah platform terapi wicara berbasis AI yang dirancang khusus untuk membantu penyandang disabilitas rungu (Tuli) dalam melatih artikulasi lisan secara:
- Konsisten
- Terjangkau
- Fleksibel (dari rumah)

### Data Science Phase Goal

**Objective**: Mengumpulkan, menganalisis, dan menyiapkan dataset akustik suku kata Bahasa Indonesia untuk machine learning model yang dapat mengevaluasi kualitas artikulasi lisan secara real-time.

### Key Achievements

| Metric | Value | Status |
|--------|-------|--------|
| **Samples Collected** | 4.000+ | Complete |
| **Syllables Covered** | 20 (5V + 15C) | Complete |
| **Features Engineered** | 38 acoustic | Complete |
| **Missing Values** | 0% | Excellent |
| **EDA Cells** | 34 | Comprehensive |
| **Dashboard Pages** | 9 | Production-Ready |
| **A/B Tests** | 2 | Significant Results |

---

## PROJECT STRUCTURE

```
data-science2/
│
├── README.md                          ← YOU ARE HERE
├── Laporan Teknis Komprehensif.pdf    ← Main Report (Comprehensive)
├── TECHNICAL_REPORT.md                ← Supporting documentation
├── DATA_DICTIONARY.md                 ← Feature documentation
├── ab_testing.ipynb                   ← A/B testing implementation
│
├── eda/                               ← EDA MODULE (Primary)
│   ├── main.ipynb                     ← Main notebook (34 cells)
│   ├── app.py                         ← Dashboard (9 pages, Streamlit)
│   ├── requirements.txt               ← Dependencies
│   └── dataset/
│       ├── syllable_features.csv      ← ML-ready dataset
│       └── figs/                      ← Visualization outputs
│
├── preprocessing/                     ← AUDIO PREPROCESSING MODULE
│   ├── audio_preprocessing.ipynb      ← Audio cleaning (standalone)
│   └── venv/                          ← Virtual environment
│
├── scraping/                          ← DATA GATHERING MODULE
│   ├── scraping.ipynb                 ← YouTube scraper
│   ├── augmentation.ipynb             ← Data augmentation
│   ├── requirements.txt               ← Dependencies
│   ├── libs/                          ← Audio processing library
│   │   ├── scraper.py
│   │   ├── audio_processor.py
│   │   ├── audio_augmenter.py
│   │   └── ...
│   └── scraped/                       ← Output data
│
├── .streamlit/                        ← DEPLOYMENT CONFIG
│   └── config.toml                    ← Streamlit production config
│
└── .gitignore
```

---

## KEY DOCUMENTS

### Laporan Teknis Komprehensif (Main Report)

**File**: [`Laporan Teknis Komprehensif.pdf`](Laporan%20Teknis%20Komprehensif.pdf)

**Purpose**: Laporan teknis komprehensif untuk capstone submission

**Berisi**:
- Problem Discovery
- Ideation & Research
- Perancangan & Spesifikasi Teknis
- Pelaksanaan & Pengembangan
- Hasil Akhir & Implementasi

---

### DATA_DICTIONARY.md (Feature Reference)

**File**: [`DATA_DICTIONARY.md`](DATA_DICTIONARY.md)

**Purpose**: Dokumentasi referensi cepat untuk semua 38 fitur

**Berisi**:
- Deskripsi fitur & tipe data
- Range nilai & unit
- Statistik ringkas
- Feature importance ranking
- Metrik kualitas data
- Guidelines untuk ML

---

### TECHNICAL_REPORT.md (Technical Details)

**File**: [`TECHNICAL_REPORT.md`](TECHNICAL_REPORT.md)

**Purpose**: Dokumentasi teknis mendalam untuk developer

**Kegunaan**: Referensi detail untuk understanding implementasi

**Gunakan untuk**: Deep dive ke metodologi & hasil analisis

---

## SUBMODULES

### EDA Module - Exploratory Data Analysis

**Location**: [`eda/`](eda/)

**What's Inside**:
- **main.ipynb**: 34-cell comprehensive EDA notebook
  - Feature extraction & analysis
  - Statistical testing (t-tests, correlations)
  - Business question analysis
  - Visualization generation
  
- **app.py**: 9-page interactive Streamlit dashboard
  - Dashboard Utama (Overview)
  - Analisis Fitur Utama (Feature distributions)
  - MFCC Analysis (13 coefficients)
  - Korelasi Fitur (Correlation matrix)
  - Stabilitas Fitur (Robustness analysis)
  - Konsonan vs Vokal (Statistical comparison)
  - Analisis Tipe Konsonan (Consonant types)
  - Analisis Durasi (Duration patterns)
  - Data Insights (Key findings)

- **dataset/syllable_features.csv**: ML-ready dataset (4.000+ samples)
- **dataset/figs/**: Generated visualizations

**Run Dashboard Locally**:
```bash
cd eda
streamlit run app.py
```

**How to Use**:
1. Open the notebook to see detailed analysis
2. Run `app.py` to explore data interactively
3. Use dataset for ML model training

---

### Preprocessing Module - Audio Cleaning (Standalone)

**Location**: [`preprocessing/`](preprocessing/)

**What's Inside**:
- **audio_preprocessing.ipynb**: Complete audio preprocessing pipeline
  - Load audio from files
  - Apply bandpass filtering (80-3000 Hz)
  - Noise reduction with noisereduce library
  - RMS normalization
  - Save processed audio

**Pipeline Steps**:
```
Raw Audio → Bandpass Filter → Denoise → Normalize → Processed Audio
```

**Key Specifications**:
- Sample Rate: 16 kHz
- Filter Range: 80-3000 Hz (speech frequencies)
- Target RMS: 0.1
- Result: SNR improvement +40%

**How to Use**:
1. Open the notebook to understand preprocessing
2. Apply pipeline to raw audio files
3. Use output for feature extraction

---

### Scraping Module - Data Collection

**Location**: [`scraping/`](scraping/)

**What's Inside**:
- **scraping.ipynb**: YouTube audio scraper
  - Download videos from YouTube
  - Extract audio (mp3/wav)
  - Transcribe with WhisperX
  - Synchronize timestamps

- **augmentation.ipynb**: Data augmentation pipeline
  - Time stretching (0.8x - 1.2x)
  - Pitch shifting (±50 cents)
  - Time shifting (±10%)
  - Noise injection

- **libs/**: Audio processing library
  - `scraper.py` - YouTube extraction
  - `audio_processor.py` - Audio loading & processing
  - `audio_augmenter.py` - Data augmentation
  - `config.py` - Configuration management
  - `path_manager.py` - Path handling

- **scraped/**: Output data folders
  - `syllable_dataset_1.csv` - Collected metadata
  - `augmented_1/` - Augmented audio files
  - `extracted_syllables_1/` - Extracted syllables

**Data Collection Statistics**:
- Total Samples: 4.000+
- Syllables: 20 (5 vowels + 15 consonants)
- Data Quality: SNR 28±8 dB

**How to Use**:
1. Review notebooks to understand data gathering process
2. Check libs/ for reusable functions
3. Explore scraped/ folder for raw data

---

## QUICK NAVIGATION

### Primary Documents
| Document | Purpose |
|----------|---------|
| [Laporan Teknis Komprehensif.pdf](Laporan%20Teknis%20Komprehensif.pdf) | **START HERE** - Complete technical report |
| [DATA_DICTIONARY.md](DATA_DICTIONARY.md) | Feature reference & specifications |

### Code & Tools
| Module | Location | Purpose |
|--------|----------|---------|
| Dashboard | [eda/app.py](eda/app.py) | 9-page Streamlit interactive app |
| Main Analysis | [eda/main.ipynb](eda/main.ipynb) | 34-cell EDA notebook |
| Dataset | [eda/dataset/syllable_features.csv](eda/dataset/syllable_features.csv) | ML-ready (4.000+ samples) |
| A/B Testing | [ab_testing.ipynb](ab_testing.ipynb) | Statistical hypothesis tests |

---

**Last Updated**: June 2026  
