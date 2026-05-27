# 🎵 Heartz - Data Science Phase
## AI-Powered Speech Therapy Platform for Deaf Community

---

## 📖 TABLE OF CONTENTS

- [Quick Start](#-quick-start)
- [Project Overview](#-project-overview)
- [Project Structure](#-project-structure)
- [Key Documents](#-key-documents)
- [Submodules](#-submodules)

---

## 🚀 QUICK START

### For First-Time Users: Start Here 👇

1. **Understand the Project**
   - Read: [TECHNICAL_REPORT.md](#-technical-report-comprehensive-analysis)
   
2. **Learn About Features**
   - Read: [DATA_DICTIONARY.md](#-data-dictionary-feature-documentation)
   
3. **See the Dashboard**
   - Go to: [`eda/app.py`](#eda-module---exploratory-data-analysis) (Streamlit app)

---

## 📊 PROJECT OVERVIEW

### What is Heartz?

**Heartz** adalah platform terapi wicara berbasis AI yang dirancang khusus untuk membantu penyandang disabilitas rungu (Tuli) dalam melatih artikulasi lisan secara:
- ✅ Konsisten
- ✅ Terjangkau
- ✅ Fleksibel (dari rumah)

### Data Science Phase Goal

**Objective**: Mengumpulkan, menganalisis, dan menyiapkan dataset akustik suku kata Bahasa Indonesia untuk machine learning model yang dapat mengevaluasi kualitas artikulasi lisan secara real-time.

### Key Achievements

| Metric | Value | Status |
|--------|-------|--------|
| **Samples Collected** | 3,500+ | ✅ Complete |
| **Syllables Covered** | 20 (5V + 15C) | ✅ Complete |
| **Features Engineered** | 38 acoustic | ✅ Complete |
| **Missing Values** | 0% | ✅ Excellent |
| **EDA Cells** | 34 | ✅ Comprehensive |
| **Dashboard Pages** | 9 | ✅ Production-Ready |
| **A/B Tests** | 2 | ✅ Significant Results |

---

## 📁 PROJECT STRUCTURE

```
data-science2/
│
├── 📄 README.md                          ← YOU ARE HERE
├── 📄 TECHNICAL_REPORT.md                ← Main deliverable (800 lines)
├── 📄 DATA_DICTIONARY.md                 ← Feature documentation (500 lines)
├── 📄 ab_testing.ipynb                   ← A/B testing implementation
│
├── 📁 eda/                               ← EDA MODULE (Primary)
│   ├── main.ipynb                        ← Main notebook (34 cells)
│   ├── app.py                            ← Dashboard (9 pages, Streamlit)
│   ├── requirements.txt                  ← Dependencies
│   └── dataset/
│       ├── syllable_features.csv         ← ML-ready dataset
│       └── figs/                         ← Visualization outputs
│
├── 📁 preprocessing/                     ← AUDIO PREPROCESSING MODULE
│   ├── audio_preprocessing.ipynb         ← Audio cleaning pipeline
│   └── venv/                             ← Virtual environment
│
├── 📁 scraping/                          ← DATA GATHERING MODULE
│   ├── scraping.ipynb                    ← YouTube scraper
│   ├── augmentation.ipynb                ← Data augmentation
│   ├── requirements.txt                  ← Dependencies
│   ├── libs/                             ← Audio processing library
│   │   ├── scraper.py
│   │   ├── audio_processor.py
│   │   ├── audio_augmenter.py
│   │   └── ...
│   └── scraped/                          ← Output data
│
├── 📁 .streamlit/                        ← DEPLOYMENT CONFIG
│   └── config.toml                       ← Streamlit production config
│
└── .gitignore
```

---

## 📄 KEY DOCUMENTS

### 🌟 TECHNICAL_REPORT.md (Comprehensive Analysis)

**Purpose**: Main technical report for capstone submission

**Contains**:
- ✅ Executive Summary
- ✅ Problem Statement & Methodology
- ✅ Data Wrangling Process (3 stages: Gathering, Assessing, Cleaning)
- ✅ EDA Findings with Statistical Analysis
- ✅ Feature Engineering Details (38 features breakdown)
- ✅ Business Questions & Hypothesis Testing
- ✅ A/B Testing Results with p-values
- ✅ Recommendations & Next Steps
- ✅ Deployment Guide

**Where to Read**: [TECHNICAL_REPORT.md](TECHNICAL_REPORT.md)

---

### 📖 DATA_DICTIONARY.md (Feature Documentation)

**Purpose**: Complete documentation for all 38 features in dataset

**Contains**:
- ✅ Feature descriptions & data types
- ✅ Value ranges & units
- ✅ Statistical summaries
- ✅ Feature importance ranking
- ✅ Data quality metrics
- ✅ Usage guidelines for ML

**Features Documented**:
- 5 Basic acoustic features (Duration, ZCR, RMS, Spectral Centroid, F0)
- 26 MFCC features (13 coefficients × mean + std)
- 2 Derived features (syllable_type, consonant_type)

**Where to Read**: [DATA_DICTIONARY.md](DATA_DICTIONARY.md)

---

## 📂 SUBMODULES

### 🔬 EDA Module - Exploratory Data Analysis

**Location**: [`eda/`](eda/)

**What's Inside**:
- **main.ipynb**: 34-cell comprehensive EDA notebook
  - Feature extraction & analysis
  - Statistical testing (t-tests, correlations)
  - Business question analysis
  - Visualization generation
  
- **app.py**: 9-page interactive Streamlit dashboard
  - 📊 Dashboard Utama (Overview)
  - 📈 Analisis Fitur Utama (Feature distributions)
  - 🎼 MFCC Analysis (13 coefficients)
  - 🔗 Korelasi Fitur (Correlation matrix)
  - 📉 Stabilitas Fitur (Robustness analysis)
  - 🔤 Konsonan vs Vokal (Statistical comparison)
  - 🗣️ Analisis Tipe Konsonan (Consonant types)
  - ⏱️ Analisis Durasi (Duration patterns)
  - 📊 Data Insights (Key findings)

- **dataset/syllable_features.csv**: ML-ready dataset (3,500+ samples)
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

### 🔊 Preprocessing Module - Audio Cleaning (Standalone)

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

### 📥 Scraping Module - Data Collection

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
- Total Samples: 3,500+
- Syllables: 20 (5 vowels + 15 consonants)
- Augmentation Ratio: 2.3x (1,500 → 3,500+)
- Data Quality: SNR 28±8 dB

**How to Use**:
1. Review notebooks to understand data gathering process
2. Check libs/ for reusable functions
3. Explore scraped/ folder for raw data

---

## 🔗 QUICK NAVIGATION

### Documentation
| Document | Purpose | Read Time |
|----------|---------|-----------|
| [TECHNICAL_REPORT.md](TECHNICAL_REPORT.md) | Main analysis report |
| [DATA_DICTIONARY.md](DATA_DICTIONARY.md) | Feature documentation |


### Code & Data
| Module | Location | Purpose |
|--------|----------|---------|
| Main EDA | [eda/main.ipynb](eda/main.ipynb) | 34-cell analysis notebook |
| Dashboard | [eda/app.py](eda/app.py) | 9-page Streamlit app |
| Dataset | [eda/dataset/syllable_features.csv](eda/dataset/syllable_features.csv) | ML-ready data (3,500+ samples) |
| A/B Tests | [ab_testing.ipynb](ab_testing.ipynb) | Statistical A/B testing |
| Preprocessing | [preprocessing/audio_preprocessing.ipynb](preprocessing/audio_preprocessing.ipynb) | Audio cleaning pipeline (Standalone) |
| Data Gathering | [scraping/scraping.ipynb](scraping/scraping.ipynb) | YouTube scraper |

---

**Last Updated**: May 2026  
