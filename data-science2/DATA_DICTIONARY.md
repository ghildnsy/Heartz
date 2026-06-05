# 📖 Data Dictionary - Syllable Audio Features Dataset

## Dataset Overview
- **Total Samples**: ~3,500+ (after augmentation)
- **Syllables**: 20 unique syllables (5 vowels + 15 consonants with 3 types)
- **Total Features**: 38 features per sample
- **Format**: CSV (syllable_features.csv)

---

## 📋 Column Descriptions

### Identifiers
| Column | Data Type | Description | Example |
|--------|-----------|-------------|---------|
| `filename` | String | Source audio file name | `a_001.wav` |
| `syllable_label` | String | Syllable category | `a`, `ba`, `ma`, `pa` |

---

### Acoustic Features (Basic)
| Column | Data Type | Range | Description | Unit |
|--------|-----------|-------|-------------|------|
| `duration_sec` | Float | 0.1 - 1.5 | Audio duration | Seconds |
| `zcr` | Float | 0.0 - 0.5 | Zero Crossing Rate - measures signal oscillation | Hz |
| `rms` | Float | 0.001 - 0.5 | RMS Energy - overall loudness | Amplitude |
| `spectral_centroid` | Float | 1000 - 8000 | Frequency center of mass | Hz |
| `f0_mean` | Float | 50 - 300 | Mean Fundamental Frequency (pitch) | Hz |

---

### MFCC Features (Mel-Frequency Cepstral Coefficients)
**Purpose**: Represent the short-term power spectrum of sound in Mel scale (human hearing perception)

**13 MFCC Coefficients** - Each with Mean & Std:

| Coefficient | Description | Relevance |
|-------------|-------------|-----------|
| `mfcc_1_mean/std` | 1st cepstral coefficient | Overall spectral envelope |
| `mfcc_2_mean/std` | 2nd cepstral coefficient | Formant frequencies |
| `mfcc_3_mean/std` | 3rd cepstral coefficient | Voice quality |
| ... | ... | ... |
| `mfcc_13_mean/std` | 13th cepstral coefficient | Fine spectral details |

**Total MFCC columns**: 26 (13 mean + 13 std)

---

### Derived Features
| Column | Data Type | Description |
|--------|-----------|-------------|
| `syllable_type` | String | "Vowel" atau "Consonant" (derived from syllable_label) |
| `consonant_type` | String | "Bilabial (M)", "Bilabial (B)", "Alveolar (P)", atau "Other" |

---

## 🎯 Feature Engineering Notes

### Source Data
- **Input**: Raw audio files (`.wav`) dari YouTube dan augmentation
- **Sample Rate**: 16 kHz (standardized)
- **Frame Length**: 2048 samples
- **Hop Length**: 512 samples

### Preprocessing Steps
1. **Normalization**: RMS energy normalized to 0.1
2. **Filtering**: Bandpass filter (80 - 3000 Hz) untuk speech frequencies
3. **Denoising**: Noise reduction untuk menghilangkan background noise
4. **Augmentation**: Time stretching, pitch shifting (untuk balancing dataset)

### Feature Extraction Parameters
```python
SAMPLE_RATE = 16000          # Hz
MFCC_N_COEFFICIENTS = 13     # MFCC coefficients
F0_MIN_FREQUENCY = 50        # Hz (F0 range)
F0_MAX_FREQUENCY = 300       # Hz
```

---

## 📊 Data Quality

| Aspect | Status | Notes |
|--------|--------|-------|
| **Missing Values** | ✅ None | All 3,500+ samples complete |
| **Duplicates** | ✅ Minimal | Only from augmentation (intentional) |
| **Outliers** | ✅ Checked | IQR method used, no extreme values |
| **Class Balance** | ✅ Balanced | ~150-200 samples per syllable |
| **Feature Scale** | ✅ Mixed | MFCC: [−1000, 1000], Duration: [0.1, 1.5] |

---

## 🎼 Syllable Categories

### Vowels (5 total)
- `a`, `e`, `i`, `o`, `u`

### Consonants (15 total)
**Bilabial (Lip sounds)**:
- `ba`, `be`, `bi`, `bo`, `bu` (Voiced B)
- `ma`, `me`, `mi`, `mo`, `mu` (Nasal M)
- `pa`, `pe`, `pi`, `po`, `pu` (Unvoiced P)

**Alveolar** (Tongue-ridge sounds):
- Represented through `pa` family in current dataset

---

## 📈 Statistical Summary

| Feature | Mean | Std Dev | Min | Max |
|---------|------|---------|-----|-----|
| `duration_sec` | 0.45 | 0.18 | 0.10 | 1.50 |
| `zcr` | 0.15 | 0.08 | 0.01 | 0.45 |
| `rms` | 0.18 | 0.06 | 0.05 | 0.45 |
| `spectral_centroid` | 3200 | 1100 | 1000 | 8000 |
| `f0_mean` | 140 | 45 | 60 | 250 |

---

## 🔄 Data Usage Flow

```
Raw Audio Files (YouTube/Scraping)
    ↓
Audio Preprocessing (noise reduction, filtering)
    ↓
Feature Extraction (librosa)
    ↓
syllable_features.csv ← [You are here]
    ↓
Dashboard Analysis (Streamlit)
    ↓
Model Training (Future: ML/DL models)
```

---

## 📝 Notes untuk Data Scientists

1. **MFCC Normalization**: MFCC values sudah dalam log-mel scale. Pertimbangkan standardization (z-score) sebelum model training.

2. **Feature Selection**: Correlation analysis menunjukkan F0_mean, Duration, dan MFCC 1-3 adalah fitur paling discriminative.

3. **Class Distribution**: Balanced across all 20 syllables (~3,500/20 = 175 samples per class).

4. **Augmentation Strategy**: 
   - Original: ~1,500 samples
   - After augmentation: ~3,500 samples (2.3x)
   - Augmentation techniques: time stretching, pitch shifting

5. **Audio Length**: Consonant-vowel sounds bervariasi (0.1-1.5s). Consider padding/truncation untuk consistency pada model.

---

## 🔗 Related Files
- Feature extraction code: `data-science2/eda/main.ipynb` (Cell 1-2)
- Audio preprocessing: `data-science2/preprocessing/audio_preprocessing.ipynb`
- EDA dashboard: `data-science2/eda/app.py`
- Dataset location: `data-science2/eda/dataset/syllable_features.csv`

---

**Last Updated**: May 2026
