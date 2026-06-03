# ADDENDUM: Laporan Teknis - Feature Engineering & A/B Testing Specification

Dokumen ini melengkapi laporan_teknis.md dengan spesifikasi teknis detail dari feature extraction dan A/B testing results.

---

## A. Feature Engineering Detail

### A.1 Total Fitur yang Diekstraksi

**Summary:**

- **Audio Properties:** 5 kolom
- **Energy Features:** 3 kolom
- **Spectral Features:** 4 kolom
- **Zero Crossing Rate:** 1 kolom
- **MFCC Coefficients:** 13 kolom
- **Temporal/Delta:** 2 kolom
- **Augmentation Metadata:** 2 kolom
- **TOTAL: 30–35+ kolom**

### A.2 Feature Specification

#### **Audio Properties:**

```
filename (string): Nama file WAV original
label (string): Kelas suku kata (A, Ba, Mi, dll) - 20 kelas
duration_sec (float): Durasi setelah standarisasi, selalu ~1.0 detik
sample_rate (int): 16000 Hz (fixed)
path (string): Path absolut ke file WAV
```

#### **Energy & Amplitude (Normalized):**

```
rms_energy (float):
  - Range: 0.0–1.0 (normali
zed)
  - Vokal A (low): 0.04–0.08
  - Vokal I (high): 0.05–0.10
  - Konsonan Ba: 0.08–0.12
  - Interpretation: Lebih tinggi = lebih keras

peak_amplitude (float):
  - Range: 0.0–1.0
  - Safe: < 0.95 (prevent clipping)
  - Typically: 0.4–0.7 untuk speech
  - Interpretation: Deteksi saturation/distorsi

spectral_flux (float, optional):
  - Perubahan spektral antar frame
  - Konsonan plosif: tinggi (burst)
  - Vokal stabil: rendah
```

#### **Spectral Features:**

```
spectral_centroid (float, Hz):
  - Pusat energi spektral
  - Range: 0–8000 Hz
  - Vokal rendah (A, O): 2000–3500 Hz
  - Vokal tinggi (I, U): 3500–5000 Hz
  - Konsonan: 4000–6500 Hz

spectral_bandwidth (float, Hz):
  - Spread energi spektral
  - Vokal (harmonic): 500–2000 Hz
  - Konsonan (noise): 2000–5000 Hz

spectral_flatness (float, 0–1):
  - 0 = tonal (pure tone)
  - 1 = noise-like (white noise)
  - Vokal: 0.2–0.5 (harmonic)
  - Konsonan fricative: 0.5–0.8 (noisy)

spectral_rolloff (float, Hz):
  - Frekuensi di mana 85% energi ter-accumulate
  - Vokal: 3000–5000 Hz
  - Konsonan: 4000–7000 Hz
```

#### **Zero Crossing Rate (ZCR):**

```
zero_crossing_rate (float, 0–0.5):
  - **MOST IMPORTANT untuk Q3 (diferensiasi)**
  - Vokal (voiced, slow oscillation): 0.03–0.08
  - Konsonan plosif (rapid changes): 0.15–0.40
  - Konsonan fricative: 0.20–0.45
  - Vokal vs Konsonan: sangat separable!
```

#### **MFCC Coefficients (13 fitur):**

```
mfcc_1–mfcc_13 (float, range -30 to +30):

mfcc_1: Energy/power (low-frequency emphasis)
  - Vokal A: 5.0–6.5
  - Vokal I: 4.5–6.0
  - Konsonan Ba: 3.5–5.0

mfcc_2: First formant F1 (vowel height)
  - A (low): -2.5 to 0.0
  - E (mid): -1.0 to 1.0
  - I (high): 0.5 to 2.5

mfcc_3: Second formant F2 (vowel backness)
  - A (front): 1.5 to 3.0
  - O (back): -1.0 to 1.0
  - U (back round): -2.0 to 0.0

mfcc_4–13: Higher-order cepstral detail
  - Range: -30 to +30
  - Konsonan-specific characteristics
  - Fine-grain acoustic texture
```

#### **Temporal Features:**

```
mfcc_delta_mean (float):
  - Rata-rata perubahan MFCC antar frame
  - Vokal stabil: 0.1–0.3
  - Konsonan onset (burst): 0.8–2.0
  - Interpretation: Dinamika spektral

zero_crossing_rate_std (float):
  - Standar deviasi ZCR per frame
  - Vokal (steady): 0.01–0.05
  - Konsonan fricative: 0.10–0.30
  - Interpretation: Voicing stability
```

#### **Augmentation Metadata:**

```
augmentation_type (string):
  - 'original': File asli dari pipeline clean
  - 'pitch_shift': Pitch ±2 semitone
  - 'time_stretch': Speed 0.85x–1.15x
  - 'noise_added': White noise 0.005 amplitude
  - 'volume_change': ±4 dB gain

is_augmented (string):
  - 'Original': augmentation_type == 'original'
  - 'Augmented': semua yang bukan original
  - Gunakan untuk Q2 comparison
```

---

## B. CSV Output Specification

### B.1 File Structure

**Output Path:** `dataset/metadata/features_augmented.csv`

**Column Order:**

```
filename | label | duration_sec | sample_rate | rms_energy | peak_amplitude |
zero_crossing_rate | spectral_centroid | spectral_bandwidth | spectral_flatness |
spectral_rolloff | mfcc_1 | mfcc_2 | ... | mfcc_13 |
mfcc_delta_mean | zero_crossing_rate_std | augmentation_type | is_augmented | path
```

**Data Types:**

- String columns: filename, label, augmentation_type, is_augmented, path
- Float columns: All numeric features
- Int columns: sample_rate

### B.2 Expected Data Volume

**Original Dataset (before augmentation):**

- Rows: 3000–4000 (150–200 per 20 kelas)
- Sampel per kelas: 150 minimum, 200+ ideal

**Augmented Dataset:**

- Rows: 12000–16000 (4x multiplication)
- Sampel per kelas: 600–800 (150 × 4)
- File per kelas: 150 original + 450 augmented = 600 total

### B.3 Sample Row

```csv
Ba_0001_aug01.wav,Ba,1.0,16000,0.0742,0.523,0.1234,2341,1523,0.456,4200,5.234,2.123,1.945,-0.321,0.089,0.0456,pitch_shift,Augmented,/dataset/augmented/Ba/Ba_0001_aug01.wav
```

---

## C. A/B Testing Results Specification

### C.1 Expected A/B Test Output

**File:** `dataset/metadata/ab_testing_results.json` (optional output dari ab_testing.py)

**Structure:**

```json
{
  "experiment_1_augmentation": {
    "test_type": "Paired T-Test + Mann-Whitney U",
    "features_tested": ["mfcc_1", "mfcc_2", "spectral_centroid", "rms_energy"],
    "results": {
      "mfcc_1": { "cohens_d": 0.32, "p_value": 0.089, "significant": false },
      "mfcc_2": { "cohens_d": 0.18, "p_value": 0.234, "significant": false },
      "spectral_centroid": {
        "cohens_d": 0.45,
        "p_value": 0.012,
        "significant": true
      },
      "rms_energy": { "cohens_d": 0.41, "p_value": 0.031, "significant": true }
    },
    "conclusion": "Augmentation safe - mean preserved, std increases"
  },

  "experiment_2_differentiation": {
    "test_type": "Mann-Whitney U Test",
    "vokal_labels": ["A", "I", "U", "E", "O"],
    "konsonan_labels": [
      "Ba",
      "Bi",
      "Bu",
      "Be",
      "Bo",
      "Pa",
      "Pi",
      "Pu",
      "Pe",
      "Po",
      "Ma",
      "Mi",
      "Mu",
      "Me",
      "Mo"
    ],
    "results": {
      "zero_crossing_rate": {
        "vokal_mean": 0.042,
        "konsonan_mean": 0.234,
        "p_value": "<0.001",
        "cohens_d": 1.25,
        "effect_size": "Large"
      },
      "spectral_centroid": {
        "vokal_mean_hz": 2850,
        "konsonan_mean_hz": 4350,
        "p_value": "<0.001",
        "cohens_d": 0.95,
        "effect_size": "Large"
      }
    },
    "conclusion": "ZCR & Spectral Centroid highly significant for differentiation"
  }
}
```

### C.2 A/B Test Interpretation Guide

**Q2 Answer (Dampak Augmentasi):**

```
✅ PASS jika:
   - Cohen's d pada mean features < 0.5 (low effect)
   - p-value > 0.05 pada most mean features
   - Std Dev meningkat (variansi OK)

❌ FAIL jika:
   - Cohen's d > 0.8 pada fitur penting
   - p-value < 0.05 pada lebih dari 50% fitur
   - Mean shifts drastis (augmentation merusak)
```

**Q3 Answer (Diferensiasi Akustik):**

```
✅ PASS jika:
   - ZCR p-value < 0.001 (highly significant)
   - Spectral Centroid p-value < 0.01
   - Cohen's d > 0.8 (large effect)
   - Vokal & Konsonan separable di scatter plot

❌ FAIL jika:
   - p-value > 0.05 (no differentiation)
   - Cohen's d < 0.5 (weak effect)
   - Overlap besar di scatter plot
```

---

## D. Dashboard Expected Output

### D.1 Executive Summary Metrics

```
Total Sampel (Augmented): 12500 (example)
Sampel Original: 3200 (example)
Jumlah Kelas: 20
Fitur Diekstraksi: 35
```

### D.2 Quality & Distribution Charts

```
Bar Chart: Sampel per kelas
  - X-axis: 20 kelas
  - Y-axis: Jumlah sampel
  - Expected: Seimbang, semua ≥ 600

Box Plot: RMS energy per group
  - X-axis: 4 group (Vokal, Ba-set, Pa-set, Ma-set)
  - Y-axis: RMS energy
  - Expected: Overlapping ranges, no outliers

Histogram: Duration distribution
  - Expected: Spike at 1.0s (seragam)
  - Std dev < 0.05 sec
```

### D.3 Augmentation Impact Charts

```
KDE Plot: Feature distribution (original vs augmented overlay)
  - Expected: Same mean, different tail
  - Original (blue): narrower peak
  - Augmented (red): wider spread

Statistics Table:
  - Original vs Augmented comparison
  - Conclusion: Aman atau tidak?
```

### D.4 Acoustic Differentiation Charts

```
Scatter Plot: ZCR vs Spectral Centroid
  - X-axis: Spectral Centroid (Hz)
  - Y-axis: Zero Crossing Rate
  - Vokal (pink): cluster bottom-left
  - Konsonan (blue): cluster top-right
  - Expected: Minimal overlap, clear separation
```

---

## E. Quality Assurance Checklist

### E.1 CSV Output Validation

```
✅ File exists: dataset/metadata/features_augmented.csv
✅ Row count: 12000–16000
✅ Column count: 35–40
✅ No header missing
✅ Data types correct
✅ No entirely empty columns
✅ NaN rate < 0.1%
```

### E.2 Feature Value Ranges

```
✅ duration_sec: All ~1.0 (100%)
✅ sample_rate: All 16000 (100%)
✅ rms_energy: 0.04–0.12 range (normal speech)
✅ peak_amplitude: All < 0.95 (no clipping)
✅ zero_crossing_rate: 0.02–0.45 (sensible)
✅ spectral_centroid: 1000–7000 Hz (sensible)
✅ mfcc_1–13: -30 to +30 (dB scale)
```

### E.3 Data Distribution Validation

```
✅ All 20 classes present in label column
✅ Augmentation types: original + 4 augmentation techniques
✅ is_augmented: Mix of 'Original' & 'Augmented'
✅ No duplicate filenames (except augmented versions)
✅ Path column points to actual files
```

---

## F. Integration with Dashboard

**Dashboard reads:** `features_augmented.csv`

**Dashboard expects columns (in any order):**

```
Required: label, is_augmented
Numeric (for charts):
  - zero_crossing_rate
  - spectral_centroid
  - spectral_bandwidth
  - spectral_flatness
  - rms_energy
  - mfcc_1, mfcc_2, mfcc_3
Optional: augmentation_type, duration_sec, peak_amplitude
```

**Error handling:**

- Missing columns → Auto-skip visualization
- NaN values → Auto-dropna() before plotting
- Empty dataframe → Show warning, don't crash

---

**Prepared by:** Data Science Team (Heartz)  
**Date:** June 3, 2026  
**Version:** 1.0 - Feature Engineering & Testing Spec
