# 🎵 EDA Analysis - Syllable Audio Features

Panduan lengkap untuk menjalankan analisis Exploratory Data Analysis (EDA) pada dataset audio suku kata Indonesia.

---

## 📋 Daftar Isi
1. [Persyaratan Sistem](#persyaratan-sistem)
2. [Struktur Folder](#struktur-folder)
3. [Instalasi & Setup](#instalasi--setup)
4. [Menjalankan Notebook](#menjalankan-notebook)
5. [Deskripsi Notebook](#deskripsi-notebook)
6. [Troubleshooting](#troubleshooting)
7. [Output & Hasil](#output--hasil)

---

## 💻 Persyaratan Sistem

### Software
- **Python**: 3.8 atau lebih baru
- **Jupyter Notebook** atau **VS Code dengan Jupyter Extension**
- **FFmpeg**: Diperlukan untuk pemrosesan audio (optional tapi recommended)

### Hardware (Minimum)
- RAM: 8 GB (recommended 16 GB)
- Storage: 5 GB untuk dataset
- Prosesor: Intel i5 atau setara

---

## 📁 Struktur Folder

File ini harus berada dalam struktur folder berikut:

```
data-science2/
├── eda/
│   ├── main.ipynb                          ← NOTEBOOK UTAMA
│   ├── EDA_Analysis.ipynb                  ← ALTERNATIF
│   ├── README.md                           ← FILE INI
│   ├── requirements.txt                    ← DEPENDENCIES
│   ├── venv/                               ← VIRTUAL ENVIRONMENT
│   │   ├── Scripts/
│   │   ├── Lib/
│   │   └── ...
│   └── dataset/
│       ├── extracted_syllables_consolidated/
│       │   ├── a/
│       │   ├── ba/
│       │   ├── be/
│       │   ├── bi/
│       │   ├── ...
│       │   └── u/
│       ├── syllable_features.csv           ← OUTPUT (Generated)
│       └── figs/                           ← OUTPUT (Generated)
│           ├── 01_key_features_distribution.png
│           ├── 02_mfcc_coefficients.png
│           └── ...
```

**⚠️ PENTING**: Folder `dataset/extracted_syllables_consolidated/` harus sudah ada dengan file `.wav` di dalamnya sebelum menjalankan notebook!

---

## 🔧 Instalasi & Setup

### Step 1: Buka Terminal di Folder `eda`

```powershell
# Windows PowerShell (Sesuaikan direktori path  perangkat masing-masing)
cd "c:\Users\ASUS\Documents\CC x DBS 2026 (DS)\Capstone Project\Heartz\data-science2\eda"
```

### Step 2: Buat Virtual Environment (Jika Belum Ada)

```powershell
# Windows
python -m venv venv

# Atau jika menggunakan Python 3.x secara eksplisit
python3 -m venv venv
```

### Step 3: Aktivasi Virtual Environment

**Windows PowerShell:**
```powershell
.\venv\Scripts\Activate.ps1
```

**Jika Ada Error Execution Policy:**
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
.\venv\Scripts\Activate.ps1
```

**Windows Command Prompt (cmd):**
```cmd
venv\Scripts\activate.bat
```

**macOS / Linux:**
```bash
source venv/bin/activate
```

### Step 4: Install Dependencies

```powershell
# Update pip
python -m pip install --upgrade pip

# Install dari requirements.txt
pip install -r requirements.txt
```

**Jika file requirements.txt tidak ada, install secara manual:**
```powershell
pip install numpy pandas matplotlib seaborn scipy scikit-learn librosa soundfile jupyter notebook pydub
```

### Step 5: Install FFmpeg (Optional tapi Recommended)

**Windows (menggunakan Chocolatey):**
```powershell
choco install ffmpeg
```

**Atau download manual dari:** https://ffmpeg.org/download.html

---

## 🚀 Menjalankan Notebook

### Metode 1: Menggunakan Jupyter Notebook (Recommended untuk Pemula)

```powershell
# Pastikan virtual environment sudah aktif
jupyter notebook main.ipynb
```

Atau buka Jupyter dan navigasi ke folder `eda`, lalu buka `main.ipynb`.

### Metode 2: Menggunakan VS Code (Recommended untuk Developer)

1. **Buka VS Code** di folder `eda`
   ```powershell
   code .
   ```

2. **Buka file** `main.ipynb`

3. **Pilih Kernel Python**
   - Klik "Select Kernel" di atas
   - Pilih environment dari `./venv` (atau `Python Interpreters > ./venv/Scripts/python.exe`)

4. **Jalankan cell demi cell** dengan menekan:
   - `Shift + Enter` = Jalankan cell saat ini
   - `Ctrl + Shift + Enter` = Jalankan semua cell
   - Atau klik tombol ▶️ di sebelah kiri cell

### Metode 3: Command Line (Untuk Automation)

```powershell
# Jalankan notebook dan simpan hasilnya
jupyter nbconvert --to notebook --execute main.ipynb --output main_executed.ipynb
```

---

## 📖 Deskripsi Notebook

Notebook `main.ipynb` terdiri dari beberapa tahap utama:

### **Tahap 1: Feature Extraction** (Cell 1-5)
- Membaca semua file `.wav` dari folder `dataset/extracted_syllables_consolidated/`
- Mengekstrak 34 fitur audio dari setiap file:
  - **Waktu**: Duration
  - **Energi**: RMS, Zero Crossing Rate
  - **Spektral**: Spectral Centroid, MFCC (13 koefisien)
  - **Pitch**: Fundamental Frequency (F0)
- Menyimpan hasil ke `dataset/syllable_features.csv`
- ⏱️ **Waktu**: 5-15 menit (tergantung jumlah file)

### **Tahap 2: EDA Setup** (Cell 6-9)
- Import library yang diperlukan
- Load data dari CSV
- Menampilkan overview dataset (jumlah sample, fitur, missing values)
- Statistik dasar fitur-fitur

### **Tahap 3: Analisis Fitur Utama** (Cell 10-11)
- Visualisasi distribusi fitur utama per suku kata
- Box plot dan violin plot untuk setiap fitur
- Simpan gambar ke `dataset/figs/`

### **Tahap 4: Analisis MFCC** (Cell 12-13)
- Analisis Mel-Frequency Cepstral Coefficients
- Visualisasi 4 koefisien MFCC yang dipilih
- Statistik MFCC per suku kata

### **Tahap 5: Korelasi Fitur** (Cell 14-15)
- Heatmap korelasi antar fitur
- Identifikasi fitur yang highly correlated
- Membantu feature selection untuk model

### **Tahap 6: Analisis Variabilitas** (Cell 16)
- Hitung Coefficient of Variation (CV) per fitur
- Identifikasi fitur stabil vs tidak stabil
- Visualisasi CV di setiap suku kata

### **Tahap 7-10: Business Questions** (Cell 17-34)
1. **Consonant vs Vowel Separation**: Perbedaan akustik antara konsonan dan vokal
2. **Feature Stability**: Konsistensi fitur dalam setiap suku kata
3. **Consonant Type Analysis**: Perbedaan akustik antar jenis konsonan
4. **Duration Analysis**: Analisis durasi audio antar suku kata

### **Tahap 11: Summary & Recommendations** (Cell 35)
- Ringkasan insights utama
- Rekomendasi untuk next steps (ML pipeline)

---

## ⚙️ Troubleshooting

### ❌ Error: "ModuleNotFoundError: No module named 'librosa'"

**Solusi:**
```powershell
# Pastikan virtual environment aktif
pip install librosa
```

### ❌ Error: "Dataset directory tidak ditemukan"

**Penyebab:** Folder `dataset/extracted_syllables_consolidated/` tidak ada atau jalur salah

**Solusi:**
1. Verifikasi struktur folder (lihat [Struktur Folder](#struktur-folder))
2. Pastikan Anda menjalankan notebook dari folder `eda` yang benar
3. Check path di cell pertama - harus menunjuk ke folder yang tepat

**Debug:**
```python
import os
print(f"Current directory: {os.getcwd()}")
print(f"Dataset path: {os.path.join(os.getcwd(), 'dataset', 'extracted_syllables_consolidated')}")
print(f"Path exists: {os.path.exists(os.path.join(os.getcwd(), 'dataset', 'extracted_syllables_consolidated'))}")
```

### ❌ Error: "No such file or directory: 'dataset/syllable_features.csv'"

**Penyebab:** Feature extraction belum dijalankan atau gagal

**Solusi:**
1. Pastikan cell feature extraction (cell 1-5) dijalankan tanpa error
2. Cek output di cell tersebut untuk melihat apakah ada error saat ekstraksi
3. Verifikasi file `.wav` ada di folder `dataset/extracted_syllables_consolidated/`

### ❌ Error: "FFmpeg not found" atau Audio Processing Error

**Penyebab:** FFmpeg tidak terinstall atau tidak di PATH

**Solusi:**
1. Install FFmpeg dari https://ffmpeg.org/download.html
2. Atau gunakan Chocolatey: `choco install ffmpeg`
3. Restart notebook setelah install
4. Cek instalasi:
   ```powershell
   ffmpeg -version
   ```

### ❌ Memory Error atau Notebook Hang (Tidak Responsif)

**Penyebab:** Terlalu banyak file audio atau kurangnya RAM

**Solusi:**
1. Kurangi jumlah file audio untuk testing
2. Jalankan feature extraction terlebih dahulu (simpan ke CSV), kemudian bisa load ulang tanpa ekstraksi
3. Close aplikasi lain untuk membebaskan RAM
4. Gunakan `del` variable untuk mengosongkan memory:
   ```python
   del df_large_variable
   import gc
   gc.collect()
   ```

### ❌ Kernel Crash atau Stopped

**Penyebab:** Memory insufficient atau infinite loop

**Solusi:**
1. Restart kernel: `Ctrl + Shift + F5` (VS Code) atau klik "Restart" (Jupyter)
2. Jalankan cell dari awal
3. Jika masalah persisten, kurangi data atau upgrade RAM

### ⚠️ Warning: "PySoundFile Error" atau Audio File Error

**Penyebab:** File audio rusak atau format tidak didukung

**Solusi:**
1. Verifikasi file `.wav` tidak corrupt
2. Pastikan format adalah PCM WAV (bukan compressed)
3. Skip file yang error - code sudah handle exception
4. Check hasil ekstraksi untuk melihat berapa file yang berhasil

---

## 📊 Output & Hasil

### CSV Output
- **Lokasi**: `dataset/syllable_features.csv`
- **Ukuran**: ~5 MB (untuk ~5000 file audio)
- **Kolom**: 34 features (filename, syllable_label, 7 acoustic features, 26 MFCC features)

### Visualisasi (PNG)
Disimpan di `dataset/figs/`:

| File | Deskripsi |
|------|-----------|
| `01_key_features_distribution.png` | Distribusi fitur utama per suku kata |
| `02_mfcc_coefficients.png` | MFCC coefficients per suku kata |
| `03_correlation_matrix.png` | Korelasi antar fitur |
| `04_coefficient_variation.png` | Stabilitas fitur |
| `05_consonant_vs_vowel.png` | Perbandingan konsonan vs vokal |
| `06_feature_stability.png` | Stabilitas fitur dalam syllables |
| `07_consonant_types.png` | Analisis jenis konsonan |
| `08_duration_analysis.png` | Analisis durasi |

### Console Output
Notebook akan menampilkan:
- ✅ Progress ekstraksi fitur
- 📊 Statistik dataset
- 📈 Hasil analisis dan insights
- 💡 Rekomendasi untuk next steps

---

## ✅ Checklist Sebelum Menjalankan

Pastikan semua ini sudah selesai:

- [ ] Python 3.8+ terinstall
- [ ] Virtual environment dibuat dan diaktifkan
- [ ] Semua dependencies terinstall (`pip install -r requirements.txt`)
- [ ] Folder `dataset/extracted_syllables_consolidated/` ada dengan file `.wav` di dalamnya
- [ ] Berada di folder `eda` saat menjalankan notebook
- [ ] FFmpeg terinstall (optional tapi recommended)
- [ ] RAM tersedia minimal 8 GB
- [ ] Folder `dataset/figs/` bisa dibuat otomatis

---

## 🚨 Emergency: Notebook Tidak Bisa Dijalankan

Jika masih ada masalah setelah mengikuti semua langkah di atas:

### Reset Environment
```powershell
# Hapus virtual environment lama
rmdir venv -Recurse -Force

# Buat baru
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install fresh
pip install --upgrade pip
pip install -r requirements.txt
```

### Check Python Version
```powershell
python --version
```

Harus 3.8 atau lebih tinggi.

### Verify Installation
```python
# Jalankan di terminal
python -c "import librosa, pandas, numpy, matplotlib; print('All imports successful!')"
```

---

## 📞 Bantuan Lebih Lanjut

Jika masih mengalami masalah:

1. **Cek file di folder**:
   - Pastikan `main.ipynb` ada di folder saat ini
   - Pastikan `dataset/` folder dan subfoldernya ada

2. **Baca error message dengan teliti**:
   - Error biasanya menunjuk ke cell mana dan line berapa
   - Copy error message dan search di Google atau Stack Overflow

3. **Cek log di Jupyter**:
   - Di terminal, akan ada debug info saat error
   - Perhatikan line mana yang error

4. **Test simple code**:
   ```python
   import os
   import pandas as pd
   import numpy as np
   print("Basic imports OK")
   ```

---

## 📝 Notes

- Feature extraction bisa memakan waktu lama (5-15 menit) tergantung jumlah file
- Setelah feature extraction pertama kali, result di-simpan ke CSV
- Next time bisa langsung load dari CSV tanpa ekstraksi ulang (lebih cepat)
- Semua visualisasi akan ditampilkan inline di notebook

---

**Created**: May 19, 2026  
**Last Updated**: May 19, 2026  
**Notebook Version**: main.ipynb v1.0
