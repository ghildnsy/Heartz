# 📖 Data Dictionary - Heartz Project

## 1. Overview

Proyek **Heartz** mengumpulkan dan mengolah dataset audio suku kata bahasa Indonesia untuk melatih model klasifikasi CNN 2D. Dataset terdiri dari rekaman audio suku kata yang diproses melalui pipeline: **Preparation → Splitting → Cleaning → Augmentation → Feature Engineering**.

---

## 2. Target Classes (20 Kelas)

| Kelompok   | Kelas              | Jumlah Kelas | Deskripsi                             |
| ---------- | ------------------ | ------------ | ------------------------------------- |
| **Vokal**  | A, I, U, E, O      | 5            | Huruf vokal dasar                     |
| **Ba-set** | Ba, Bi, Bu, Be, Bo | 5            | Suku kata konsonan bilabial "B"       |
| **Pa-set** | Pa, Pi, Pu, Pe, Po | 5            | Suku kata konsonan bilabial "P"       |
| **Ma-set** | Ma, Mi, Mu, Me, Mo | 5            | Suku kata konsonan bilabial nasal "M" |

---

## 3. Dataset Files

### 3.1. Raw Audio (`dataset/raw/{kelas}/*.wav`)

| Atribut     | Nilai                                       |
| ----------- | ------------------------------------------- |
| Format      | WAV (PCM 16-bit)                            |
| Sample Rate | 16,000 Hz                                   |
| Channels    | 1 (Mono)                                    |
| Durasi      | 0.4s – 2.0s (bervariasi)                    |
| Penamaan    | `{Kelas}_{NNNN}.wav` (misal: `Ba_0001.wav`) |

### 3.2. Clean Audio (`dataset/clean/{kelas}/*.wav`)

| Atribut     | Nilai                                                                            |
| ----------- | -------------------------------------------------------------------------------- |
| Format      | WAV (PCM 16-bit)                                                                 |
| Sample Rate | 16,000 Hz                                                                        |
| Channels    | 1 (Mono)                                                                         |
| Durasi      | 1.0 detik (seragam, pad/trim)                                                    |
| Proses      | Noise reduction, bandpass filter, volume normalization, duration standardization |

### 3.3. Augmented Audio (`dataset/augmented/{kelas}/*.wav`)

| Atribut            | Nilai                                                       |
| ------------------ | ----------------------------------------------------------- |
| Format             | WAV (PCM 16-bit)                                            |
| Sample Rate        | 16,000 Hz                                                   |
| Channels           | 1 (Mono)                                                    |
| Durasi             | 1.0 detik                                                   |
| Faktor Augmentasi  | 4x per file asli                                            |
| Teknik             | White noise, pitch shift, time stretch, volume perturbation |
| Penamaan Asli      | `{Kelas}_{NNNN}.wav`                                        |
| Penamaan Augmented | `{Kelas}_{NNNN}_aug{NN}.wav`                                |

---

## 4. Metadata CSV

### 4.1. `metadata_clean.csv`

Metadata dari dataset clean (original, sebelum augmentasi).

| Kolom            | Tipe Data | Deskripsi                  | Contoh                      |
| ---------------- | --------- | -------------------------- | --------------------------- |
| `filename`       | string    | Nama file audio            | `A_0001.wav`                |
| `label`          | string    | Label kelas suku kata      | `A`, `Ba`, `Mi`             |
| `duration_sec`   | float     | Durasi audio dalam detik   | `1.0`                       |
| `sample_rate`    | int       | Frekuensi sampling (Hz)    | `16000`                     |
| `rms_energy`     | float     | Root Mean Square energy    | `0.061968`                  |
| `peak_amplitude` | float     | Amplitudo puncak (0.0–1.0) | `0.474518`                  |
| `path`           | string    | Path absolut ke file audio | `D:\...\clean\A\A_0001.wav` |

### 4.2. `metadata_augmented.csv`

Metadata dari dataset augmented (termasuk file asli + augmented).

| Kolom            | Tipe Data | Deskripsi                  | Contoh                                |
| ---------------- | --------- | -------------------------- | ------------------------------------- |
| `filename`       | string    | Nama file audio            | `A_0001_aug01.wav`                    |
| `label`          | string    | Label kelas suku kata      | `A`                                   |
| `duration_sec`   | float     | Durasi audio dalam detik   | `1.0`                                 |
| `sample_rate`    | int       | Frekuensi sampling (Hz)    | `16000`                               |
| `rms_energy`     | float     | Root Mean Square energy    | `0.082539`                            |
| `peak_amplitude` | float     | Amplitudo puncak (0.0–1.0) | `0.640564`                            |
| `path`           | string    | Path absolut ke file audio | `D:\...\augmented\A\A_0001_aug01.wav` |

### 4.3. `features.csv` (Feature Engineering Output)

Hasil ekstraksi fitur dari setiap file audio.

| Kolom                | Tipe Data | Deskripsi                    | Range    |
| -------------------- | --------- | ---------------------------- | -------- |
| `filename`           | string    | Nama file audio              | —        |
| `label`              | string    | Label kelas suku kata        | 20 kelas |
| `label_encoded`      | int       | Label yang di-encode (0–19)  | 0–19     |
| `duration_sec`       | float     | Durasi audio                 | ~1.0     |
| `rms_energy`         | float     | RMS energy keseluruhan       | 0.0–1.0  |
| `peak_amplitude`     | float     | Amplitudo puncak             | 0.0–1.0  |
| `zero_crossing_rate` | float     | Rata-rata zero crossing rate | 0.0–0.5  |

### 4.3. `features_augmented.csv` (Feature Engineering Output)

Hasil ekstraksi fitur dari setiap file audio yang di-augmentasi.

#### **Fitur Akustik Utama:**

| Kolom          | Tipe   | Deskripsi                         | Range    | Satuan |
| -------------- | ------ | --------------------------------- | -------- | ------ |
| `filename`     | string | Nama file audio                   | —        | —      |
| `label`        | string | Label kelas (A, Ba, Me, dll)      | 20 nilai | —      |
| `duration_sec` | float  | Durasi audio setelah standarisasi | ~1.0     | detik  |
| `sample_rate`  | int    | Frekuensi sampling                | 16000    | Hz     |

#### **Energy & Amplitude Features:**

| Kolom            | Deskripsi                         | Teknik                    | Range   | Kegunaan                      |
| ---------------- | --------------------------------- | ------------------------- | ------- | ----------------------------- | ------- | ------------------------- |
| `rms_energy`     | Root Mean Square energy           | Hitung RMS dari amplitudo | 0.0–1.0 | Indikator volume suara        |
| `peak_amplitude` | Amplitudo puncak (max abs value)  | Max(                      | audio   | )                             | 0.0–1.0 | Deteksi clipping/distorsi |
| `spectral_flux`  | Perubahan spektral frame-to-frame | Sum(diff(spectrogram))    | 0.0–∞   | Deteksi perubahan suara cepat |

#### **Spectral Features:**

| Kolom                | Deskripsi                        | Teknik                         | Range     | Kegunaan                       |
| -------------------- | -------------------------------- | ------------------------------ | --------- | ------------------------------ |
| `spectral_centroid`  | Pusat energi spektral            | Weighted avg frekuensi         | 0–8000 Hz | Karakteristik timbre           |
| `spectral_bandwidth` | Lebar distribusi energi spektral | Std dev spektral               | 0–∞       | Kompleksitas spektral          |
| `spectral_flatness`  | Degree keflatan spektrum         | Power mean / arithmetic mean   | 0.0–1.0   | Vokal=harmonis, Konsonan=noisy |
| `spectral_rolloff`   | Frekuensi di mana 85% energi     | Frequency at 85% cumsum energy | 0–8000 Hz | Karakteristik frekuensi        |

#### **Zero Crossing Rate (ZCR):**

| Kolom                | Deskripsi               | Teknik                            | Range   | Kegunaan                          |
| -------------------- | ----------------------- | --------------------------------- | ------- | --------------------------------- |
| `zero_crossing_rate` | Rata-rata ZCR per frame | Count sign changes / sample count | 0.0–0.5 | **Diferensiasi Vokal ↔ Konsonan** |

#### **Mel-Frequency Cepstral Coefficients (MFCC):**

| Kolom                 | Deskripsi                          | Band Mel           | Kegunaan                        |
| --------------------- | ---------------------------------- | ------------------ | ------------------------------- |
| `mfcc_1`              | Energy coefficient (Delta E)       | 0–256              | Energi spektral keseluruhan     |
| `mfcc_2`              | Formant pertama (F1)               | Vokal ~0–700 Hz    | Membedakan tinggi/rendah vokal  |
| `mfcc_3`              | Formant kedua (F2)                 | Vokal ~700–2500 Hz | Membedakan depan/belakang vokal |
| `mfcc_4` to `mfcc_13` | Higher-order cepstral coefficients | —                  | Fitur detail akustik            |

**Range MFCC:** -30 hingga +30 (normalized, dB scale)

#### **Temporal Features:**

| Kolom                    | Deskripsi                        | Kegunaan           |
| ------------------------ | -------------------------------- | ------------------ |
| `zero_crossing_rate_std` | Std deviasi ZCR per frame        | Stabilitas voicing |
| `mfcc_delta_mean`        | Rata-rata delta (perubahan) MFCC | Dinamika spektral  |

#### **Augmentation Metadata:**

| Kolom               | Nilai                       | Deskripsi                        |
| ------------------- | --------------------------- | -------------------------------- |
| `augmentation_type` | `original` atau Teknik      | Teknik augmentasi yang digunakan |
| `is_augmented`      | `Original` atau `Augmented` | Flag untuk comparison            |

---

## 5. Feature Extraction Summary

### Kolom Output dari `main.ipynb` STEP 5:

**Expected output CSV columns (~35+ fitur):**

```
filename, label, duration_sec, sample_rate, rms_energy, peak_amplitude,
zero_crossing_rate, spectral_centroid, spectral_bandwidth, spectral_flatness,
spectral_rolloff, mfcc_1, mfcc_2, mfcc_3, ..., mfcc_13,
mfcc_delta_mean, zero_crossing_rate_std, path,
augmentation_type, is_augmented
```

### Contoh Data Row:

```
Ba_0001.wav, Ba, 1.0, 16000, 0.0742, 0.523, 0.1234, 2341, 1523, 0.456,
4200, 5.234, 2.123, 1.945, ..., -0.321, 0.0456, /dataset/augmented/Ba/Ba_0001.wav,
original, Original
```

---

## 6. Data Quality Metrics

### Target Statistics (Post-Pipeline):

| Metrik               | Target           | Deskripsi                                 |
| -------------------- | ---------------- | ----------------------------------------- |
| **Sampel per Kelas** | ≥150 (Original)  | Minimal untuk menghindari class imbalance |
| **Sampel Augmented** | ≥600 per kelas   | 4x augmentation = 4 × original            |
| **Durasi Standar**   | 1.0 ± 0.05 detik | Setelah padding/trimming                  |
| **RMS Energy**       | 0.04 – 0.12      | Normalized range (dBFS ≈ -20)             |
| **Peak Amplitude**   | < 0.95           | Mencegah clipping distorsi                |

---

## 7. CSV Loading Example

### Python (Pandas):

```python
import pandas as pd

# Load features
df = pd.read_csv('dataset/metadata/features_augmented.csv')

# Summary
print(df.info())
print(df.describe())

# Group by kelas
print(df.groupby('label').size())

# Filter original hanya
df_original = df[df['augmentation_type'] == 'original']
```

### Streamlit (Dashboard):

Dashboard otomatis membaca CSV ini dari `dataset/metadata/` untuk visualisasi:

- Distribution charts
- Statistical comparison
- Feature scatter plots
- A/B test results

---

## 8. Dependencies untuk Features:

- **librosa** – Ekstraksi MFCC, ZCR, spectral features
- **scipy.signal** – Windowing, filtering
- **numpy/pandas** – Komputasi dan data manipulation
- **soundfile** – Reading audio files

---

## 9. Known Issues & Handling:

| Issue                              | Cause                             | Solution                                   |
| ---------------------------------- | --------------------------------- | ------------------------------------------ |
| Missing `augmentation_type` column | Old CSV format                    | App auto-creates dengan default='original' |
| NaN values dalam fitur             | Silent regions / division by zero | Fillna(0) atau skip invalid rows           |
| Different feature count            | Version mismatch librosa          | Use librosa 0.10.0+                        |

---

**Last Updated:** June 3, 2026  
**Compatible with:** main.ipynb STEP 5 & Streamlit app.py
| `spectral_bandwidth` | float | Rata-rata spectral bandwidth (Hz) | 0–8000 |
| `spectral_rolloff` | float | Rata-rata spectral rolloff (Hz) | 0–8000 |
| `spectral_flatness` | float | Rata-rata spectral flatness | 0.0–1.0 |
| `mfcc_1` ... `mfcc_13` | float | 13 koefisien MFCC (rata-rata) | Bervariasi |
| `mfcc_1_std` ... `mfcc_13_std` | float | 13 MFCC standar deviasi | ≥ 0 |
| `delta_mfcc_1` ... `delta_mfcc_13` | float | 13 Delta-MFCC (rata-rata) | Bervariasi |
| `chroma_1` ... `chroma_12` | float | 12 fitur chroma (rata-rata) | 0.0–1.0 |
| `augmentation_type` | string | Tipe augmentasi | `original`, `aug01`, ... |

---

## 5. Audio Processing Parameters

| Parameter               | Nilai      | Keterangan                        |
| ----------------------- | ---------- | --------------------------------- |
| `SAMPLE_RATE`           | 16,000 Hz  | Standar speech recognition        |
| `CHANNELS`              | 1 (Mono)   | Single channel                    |
| `CLIP_DURATION_TARGET`  | 1.0 detik  | Durasi standar per clip           |
| `CLIP_DURATION_MIN`     | 0.4 detik  | Minimum durasi valid              |
| `CLIP_DURATION_MAX`     | 2.0 detik  | Maksimum durasi sebelum sub-split |
| `SILENCE_THRESH_DB`     | -40 dBFS   | Threshold deteksi silence         |
| `NOISE_REDUCE_PROP`     | 0.9        | Proporsi noise reduction          |
| `NORMALIZE_TARGET_DBFS` | -20.0 dBFS | Target loudness                   |
| `HIGH_PASS_FREQ`        | 80 Hz      | Cutoff high-pass filter           |
| `LOW_PASS_FREQ`         | 7,500 Hz   | Cutoff low-pass filter            |
| `AUGMENTATION_FACTOR`   | 4          | Jumlah variasi per file           |

---

## 6. Augmentation Techniques

| ID    | Teknik                              | Parameter                                 |
| ----- | ----------------------------------- | ----------------------------------------- |
| aug01 | White Noise + Volume Shift          | noise_amplitude=0.005, volume ±4 dB       |
| aug02 | Pitch Shift + Light Noise           | pitch ±2 semitones, noise 50% amplitude   |
| aug03 | Time Stretch + Volume Shift         | speed 0.85x–1.15x, volume ±4 dB           |
| aug04 | Combo (Pitch + Pink Noise + Volume) | pitch ±1 st, pink noise 30%, volume ±2 dB |

---

## 7. Feature Engineering Description

| Fitur                  | Fungsi                                          | Relevansi                                |
| ---------------------- | ----------------------------------------------- | ---------------------------------------- |
| **MFCC (1-13)**        | Mel-Frequency Cepstral Coefficients             | Representasi spektral utama untuk speech |
| **Delta MFCC**         | Turunan pertama MFCC                            | Menangkap perubahan temporal spektral    |
| **Spectral Centroid**  | "Pusat massa" frekuensi                         | Membedakan suara terang vs gelap         |
| **Spectral Bandwidth** | Lebar sebaran frekuensi                         | Membedakan suara sempit vs lebar         |
| **Spectral Rolloff**   | Frekuensi di mana 85% energi berada di bawahnya | Deteksi konten frekuensi tinggi          |
| **Spectral Flatness**  | Seberapa "flat" spektrum                        | Membedakan tonal vs noisy                |
| **Zero Crossing Rate** | Seberapa sering sinyal melewati nol             | Membedakan voiced vs unvoiced            |
| **Chroma (1-12)**      | Energi per pitch class                          | Menangkap konten harmonik                |
| **RMS Energy**         | Energi keseluruhan sinyal                       | Indikator volume dan intensitas          |
