# 🫀 Heartz - Data Science Pipeline

Pipeline otomatis persiapan dataset audio untuk CNN 2D klasifikasi **20 suku kata** .

Disini kita hanya berfokus ke **`main.ipynb`** karena file lainnya adalah modul.

---

## Pipeline Workflow

```
manual_downloads/ → downloads/ → raw/ → clean/ → augmented/
   (video/mp3)     (WAV mono)  (split) (cleaned) (training)
```

### 20 Kelas Target:

| Vokal         | Ba-set             | Pa-set             | Ma-set             |
| ------------- | ------------------ | ------------------ | ------------------ |
| A, I, U, E, O | Ba, Bi, Bu, Be, Bo | Pa, Pi, Pu, Pe, Po | Ma, Mi, Mu, Me, Mo |

---

## ⚙️ STEP 0 - Setup Environment

- Install dependencies dari `requirements.txt`
- Inisialisasi folder dataset dan import semua modul
- Buat struktur folder yang dibutuhkan

---

## 📥 STEP 1 - Preparation

**Input:** File media manual (video/audio) yang sudah diunduh
**Output:** Audio WAV standar (16kHz, mono)

Letakkan file di folder **`dataset/manual_downloads/`** Lalu jalankan cell untuk konversi ke format `.wav`, ini otomatis tersimpan ke **`dataset/downloads/`**

---

## ✂️ STEP 2 - Splitting (Potong Audio per Suku Kata)

**Input:** Audio file dari `dataset/downloads/`
**Output:** Potongan audio per suku kata di `dataset/raw/`

Sistem split menggunakan **automatic labeling** berdasarkan nama file:

- Beri nama file sesuai suku kata yang ada di dalamnya (contoh: `Ba.wav`, `Me2.wav`, `O3.wav`)
- Fungsi akan otomatis mendeteksi jumlah region dan memberi label sesuai nama file
- Setiap region dipotong dan disimpan di folder classnya sendiri

**Proses:**

1. Preview semua region yang terdeteksi di setiap file
2. Auto-generate mapping label untuk semua region
3. Jalankan split untuk semua file sekaligus
4. Validasi hasil split terhadap file di downloads

---

## 🧹 STEP 3 - Cleaning

**Input:** Audio kasar dari `dataset/raw/`
**Output:** Audio bersih di `dataset/clean/`

### Tahapan Proses Cleaning

Setiap audio file diproses melalui 5 tahap otomatis:

#### 1. **Noise Reduction** (Kurangi Kebisingan)

- Menghilangkan background noise (suara AC, kipas angin, dll)
- Teknik: Spectral Gating - menganalisis frekuensi mana yang adalah noise, lalu kurangi intensitasnya
- Hasil: Audio lebih bersih, hanya terdengar suara bicara

#### 2. **High-Pass Filter** (Buang Frekuensi Rendah)

- Menghapus frekuensi di bawah **80 Hz** (rumble, bass, dengungan)
- Alasan: Frekuensi rendah tidak penting untuk pembedaan suku kata
- Hasil: Audio lebih ringan

#### 3. **Low-Pass Filter** (Buang Frekuensi Tinggi)

- Menghapus frekuensi di atas **7500 Hz** (hiss, kicauan)
- Alasan: Frekuensi tinggi sering kali noise digital atau distorsi
- Hasil: Audio lebih halus

#### 4. **Normalisasi Volume dengan RMS**

- **RMS = Root Mean Square** - mengukur power/energi audio secara keseluruhan
- Target: **-20 dBFS** (satuan volume standar industri)
- Cara kerja:
  - Hitung RMS saat ini dari audio file
  - Bandingkan dengan RMS target
  - Terapkan gain (penguat) agar sesuai target
  - Jika terlalu keras, akan dipotong (clipping prevention) agar tidak distorsi
- Manfaat: Semua file mempunyai volume konsisten, memudahkan model AI belajar

#### 5. **Trim Silence** (Potong Kesunyian)

- Menghapus kesunyian di awal dan akhir setiap file
- Hasil: File audio dimulai dan diakhiri dengan suara bicara murni

#### 6. **Standarisasi Durasi** (Seragamkan Panjang)

- Target durasi: **1 detik** per clip
- Jika terlalu panjang: dipotong (trim)
- Jika terlalu pendek: ditambah silence (pad)
- Manfaat: Semua file mempunyai durasi sama, memudahkan model AI

### 📊 Visualisasi Perubahan

- **Waveform** (gelombang) - terlihat lebih rapi dan smooth
- **Spectrogram** (frekuensi) - frekuensi aneh sudah hilang

---

## STEP 4 - Perbanyak Data (Data Augmentation)

- Karena ada beberapa data yang masih tidak cukup (Bi), maka dengan menggandakan setiap file original menjadi **4 variasi**, masing-masing menggunakan teknik berbeda:

| Teknik                    | Penjelasan                                     | Manfaat                                             |
| ------------------------- | ---------------------------------------------- | --------------------------------------------------- |
| **White Noise + Volume**  | Tambahkan noise putih + ubah volume            | Latih model tahan terhadap noise dan variasi volume |
| **Pitch Shift + Noise**   | Ubah pitch (tinggi rendah nada) + noise ringan | Model belajar recognisi meski nada berbeda          |
| **Time Stretch + Volume** | Ubah kecepatan bicara + volume                 | Simulasi orang yang bicara cepat/lambat             |
| **Kombinasi Ringan**      | Mix pitch + pink noise + volume                | Realistic augmentation, mirip kondisi real          |

Hasilnya pun data telah tercukupi dan tersimpan di folder **`dataset/augmented/`**

---

## STEP 5 - Analisis Data (EDA - Exploratory Data Analysis)

### 📊 Output EDA yang Ditampilkan

#### 1. **Bar Chart - Distribusi Per Kelas**

```
📊 Grafik jumlah file per suku kata
   - Garis Orange (--) = Target minimum (150 file)
   - Garis Hijau (--) = Target ideal (200 file)
```

**Yang harus diperhatikan:**

- ✅ Semua kelas di atas garis orange = DATA CUKUP
- ⚠️ Ada kelas di bawah garis hijau = Kurang optimal, tapi masih OK
- ❌ Ada kelas jauh di bawah orange = TIDAK CUKUP, harus tambah data
- Jika semua ✅ → **Lanjut ke STEP 6**
- Jika ada ⚠️ atau ❌ → **Kembali ke STEP 2** dan record ulang untuk suku kata yang kurang

#### 2. **Waveform (Gelombang Audio)**

```
🎵 Grafik bentuk gelombang audio
   - X-axis = Waktu (detik)
   - Y-axis = Amplitudo (tinggi rendah suara)
```

**Yang harus diperhatikan:**

- ✅ Gelombang rapi, tidak ada spike aneh = BAGUS (sudah dibersihkan)
- ⚠️ Ada spike/noise = Kurang bagus, pertimbangkan re-record atau re-clean

#### 3. **Spectrogram (Analisis Frekuensi)**

```
🎼 Heatmap frekuensi vs waktu (seperti pita musik)
   - Warna terang = Frekuensi kuat (suara bicara)
   - Warna gelap = Frekuensi lemah (silence/noise)
```

**Yang harus diperhatikan:**

- ✅ Pola jelas, terlihat peak suara bicara = BAGUS
- ❌ Banyak noise random = Belum optimal

#### 4. **Histogram Durasi**

```
📈 Grafik distribusi durasi file
   - Semua file harus seragam (sekitar 1.5 detik)
```

**Yang harus diperhatikan:**

- ✅ Semua file sama panjang, 1 garis tegak = SEMPURNA
- ⚠️ Ada variasi durasi = Berarti ada file yang belum di-pad/trim

#### 5. **Contoh Sampel Per Kelas**

```
🎤 Menampilkan 2-3 contoh file per kelas
```

**Yang harus diperhatikan:**

- ✅ Semua file jelas terdengar bicara = BAGUS
- ❌ Ada file yang aneh/tidak terdengar jelas = Ada masalah

### 📋 Perbandingan Clean vs Augmented

Di bagian bawah STEP 5, ada cell yang membandingkan:

- **Kolom kiri** = Dataset CLEAN (asli, tidak di-augmentasi)
- **Kolom kanan** = Dataset AUGMENTED (sudah 4x lipat)

**Yang harus diperhatikan:**

- Kolom kanan harus lebih tinggi semua bar-nya (minimal 4x dari kiri)
- Jika tidak, berarti augmentasi belum jalan sempurna

### ✅ Checklist STEP 5

Sebelum lanjut ke STEP 6:

- [ ] Semua kelas ada di atas garis orange di bar chart
- [ ] Tidak ada kelas ❌ (merah)
- [ ] Spectrogram semua kelas terlihat rapi (tidak ada noise random)
- [ ] Dataset Augmented 4x lebih besar dari Clean
- [ ] Semua file terdengar jelas saat di-play

Jika ada yang ❌ → **Kembali ke STEP 2/3** dan perbaiki data sebelum lanjut.

---

## STEP 6 - Export & Serah Terima ke Tim AI

### 📦 Output yang Dihasilkan

#### 1. **`dataset/augmented/` — Dataset untuk Training**

```
dataset/augmented/
├── A/          (300+ file setelah augmentasi)
├── Ba/
├── Bi/
├── Bu/
├── ... (28 folder total, termasuk Be2, Be3, dll.)
```

**Ini adalah file yang akan dipakai Tim AI** untuk training model.

#### 2. **`dataset/metadata/` — File Ringkasan**

```
dataset/metadata/
├── metadata_clean.csv        (Info file asli)
└── metadata_augmented.csv    (Info file hasil augmentasi)
```

#### **Kolom-Kolom di File CSV**

File `metadata_augmented.csv` berisi kolom-kolom berikut:

| Kolom               | Isi                     | Contoh                                     | Guna                         |
| ------------------- | ----------------------- | ------------------------------------------ | ---------------------------- |
| `file_name`         | Nama file audio         | `A_001.wav`                                | Identifikasi file unik       |
| `label`             | Label suku kata         | `A`, `Ba`, `Bi`                            | Ground truth untuk training  |
| `duration`          | Panjang file (detik)    | `1.5`                                      | Validasi standarisasi durasi |
| `sample_rate`       | Kecepatan sampling (Hz) | `16000`                                    | Validasi kualitas audio      |
| `rms_energy`        | Energi power audio      | `0.045`                                    | Validasi normalisasi volume  |
| `peak_amplitude`    | Amplitudo puncak        | `0.98`                                     | Deteksi clipping             |
| `augmentation_type` | Tipe augmentasi         | `original`, `aug1`, `aug2`, `aug3`, `aug4` | Tracking asal file           |

### 🎯 Guna Metadata untuk Tim AI

#### **1. Training Model**

```python
# Tim AI bisa langsung baca CSV untuk training
import pandas as pd

metadata = pd.read_csv('metadata_augmented.csv')

# Validasi data
print(f"Total file: {len(metadata)}")
print(f"Kelas unik: {metadata['label'].unique()}")
print(f"Durasi min: {metadata['duration'].min()}s")
print(f"Durasi max: {metadata['duration'].max()}s")
```

#### **2. Split Train/Val/Test**

```python
# Tim AI gunakan metadata untuk split data secara random tapi balanced
from sklearn.model_selection import train_test_split

train, test = train_test_split(
    metadata,
    test_size=0.2,
    stratify=metadata['label']  # Pastikan setiap kelas terwakili
)

# Train: 80% | Test: 20%
```

#### **3. Quality Control/Validasi**

```python
# Cek apakah ada anomali
print(metadata[metadata['duration'] != 1.0])  # File yang durasi gak 1.0s
print(metadata[metadata['rms_energy'] > 0.1])  # File yang terlalu keras
print(metadata[metadata['peak_amplitude'] > 0.99])  # File yang clipping
```

#### **4. Reproducibility & Dokumentasi**

```
Saat model sudah trained, Tim AI bisa:
- Dokumentasi: "Model dilatih dengan 2500 file dari metadata_augmented.csv"
- Verifikasi: "Setiap file training bisa ditelusuri via file_path"
- Audit: "Lihat augmentation_type untuk tahu file mana yang original"
```

#### **5. Re-training atau Fine-tuning**

Kalau di masa depan ada data baru, metadata lama bisa dibandingkan dengan yang baru untuk memastikan konsistensi.

### 📊 Perbedaan metadata_clean.csv vs metadata_augmented.csv

| Aspek                 | Clean              | Augmented                       |
| --------------------- | ------------------ | ------------------------------- |
| **Jumlah file**       | ~300-600 per kelas | ~1200-2400 per kelas (4x lipat) |
| **Guna**              | Validasi data asli | **Ini yang untuk training**     |
| **Augmentation Type** | Semua `original`   | Mix `original` + `aug1/2/3/4`   |
| **Digunakan Tim AI**  | Hanya referensi    | **UTAMA untuk training model**  |

**➡️ Tim AI akan fokus menggunakan `metadata_augmented.csv` karena memiliki lebih banyak data.**

---

### 📤 Serah Terima ke Tim AI Engineering

Setelah STEP 6 selesai, **siapkan 2 hal untuk diserahkan**:

1. **Folder `dataset/augmented/`**
   - Salinan ke media penyimpanan (USB/Cloud)
   - Untuk digunakan training model AI

2. **Folder `dataset/metadata/`**
   - Berisi `metadata_augmented.csv` (yang utama)
   - Dan `metadata_clean.csv` (untuk referensi)
   - Untuk dokumentasi dan validasi dataset

---

### 🗒️ Catatan: Ketika semua cell pada main.ipynb dijalankan ulang

#### ⚠️ Perilaku Pipeline Saat Re-run

| Tahap                                           | Perilaku                                             | Hasil                  |
| ----------------------------------------------- | ---------------------------------------------------- | ---------------------- |
| **STEP 1: Preparation** (convert_manual_to_wav) | ✅ **SKIP** jika file sudah ada di `downloads/`      | Tidak ada perubahan    |
| **STEP 2: Splitting** (split_audio_selective)   | ⚠️ **MENAMBAH** file baru (generate nama nomor urut) | File akan **DUPLIKAT** |
| **STEP 3: Cleaning** (clean_all)                | ✅ **SKIP** jika file sudah ada di `clean/`          | Tidak ada perubahan    |
| **STEP 4: Augmentasi** (augment_all)            | ✅ **SKIP** jika file sudah ada di `augmented/`      | Tidak ada perubahan    |

#### 💡 Penjelasan Detail:

**✅ STEP 1 (Preparation):**

- Fungsi `convert_manual_to_wav()` mengecek apakah file sudah ada di `dataset/downloads/`
- Jika sudah ada → **SKIP**, tidak di-convert ulang
- Jika belum ada → Convert baru

**⚠️ STEP 2 (Splitting) - PERLU HATI-HATI:**

- Fungsi `split_audio_selective()` menggunakan `generate_next_filename()` untuk generate nama file otomatis
- Cara kerja: Cari file tertinggi di folder (misal: `Ba_0005.wav`), lalu buat file baru nomor +1 (misal: `Ba_0006.wav`)
- **Akibat:** Setiap kali re-run splitting, akan membuat file BARU dengan nomor urut yang lebih tinggi
- **Hasil:** File akan DUPLIKAT dan total file berlipat ganda

**✅ STEP 3 (Cleaning):**

- Fungsi `clean_all()` cek apakah file sudah ada di `dataset/clean/{label}/`
- Jika sudah ada → **SKIP**, tidak di-clean ulang
- Jika belum ada → Clean baru

**✅ STEP 4 (Augmentasi):**

- Fungsi `augment_all()` cek apakah file sudah ada di `dataset/augmented/{label}/`
- Jika sudah ada → **SKIP**, tidak di-augmentasi ulang
- Jika belum ada → Augmentasi baru

#### 🎯 Rekomendasi:

1. **Jalankan pipeline hanya SEKALI end-to-end** (dari STEP 1 sampai STEP 6)
2. **Jika perlu re-run pipeline:**
   - **Hindari re-run STEP 2 (Splitting)** kecuali Anda sudah backup atau hapus folder `dataset/raw/`
   - STEP 3, 4, 5, 6 aman di-re-run (otomatis skip file yang sudah ada)
3. **Jika terpaksa re-run splitting:**
   ```bash
   # Backup atau hapus folder raw lama terlebih dahulu
   rm -r dataset/raw/
   # Kemudian jalankan splitting cell ulang
   ```

#### ❌ Kesalahan:

| Kesalahan                                  | Akibat                                                           | Solusi                                        |
| ------------------------------------------ | ---------------------------------------------------------------- | --------------------------------------------- |
| Re-run splitting berkali-kali tanpa backup | File di `dataset/raw/` berlipat ganda, total menjadi ribuan file | Hapus `dataset/raw/` sebelum re-run splitting |
| Re-run cleaning berkali-kali               | Tidak ada masalah, file di-skip otomatis                         | Aman, tidak perlu backup                      |
| Re-run augmentasi berkali-kali             | Tidak ada masalah, file di-skip otomatis                         | Aman, tidak perlu backup                      |
