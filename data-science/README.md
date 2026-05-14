# 🫀 Heartz — Panduan Kerja Data Scientist

Satu-satunya file yang kamu buka dan jalankan adalah **`main.ipynb`**.
Jalankan setiap step dari atas ke bawah secara berurutan.

---

## STEP 0 — Setup

**Jalankan semua cell di STEP 0.**
Dilakukan sekali saja. Hasilnya: semua folder dataset terbuat otomatis dan library terinstall.

---

## STEP 1 — Masukkan Video

1. Download video YouTube yang berisi pengucapan suku kata (contoh: "belajar Ba Bi Bu Be Bo")
2. Taruh file video tersebut ke folder **`dataset/manual_downloads/`**
3. **Jalankan semua cell di STEP 1.**
   Hasilnya: video diubah menjadi file audio `.wav` di folder `dataset/downloads/`

---

## STEP 2 — Potong Audio per Suku Kata

**Jalankan semua cell di STEP 2.**

Ini bagian yang paling banyak melibatkan kamu secara manual. Yang terjadi:

- Kamu mendengarkan setiap potongan audio satu per satu
- Kamu mengetik label suku katanya (contoh: `Ba`, `A`, `Ma`)
- Potongan yang bukan suku kata target (intro, instruksi, dll) cukup tekan Enter untuk dilewati

Ulangi proses ini untuk setiap video yang kamu punya.

Setelah selesai, jalankan cell **"Cek Status Dataset"** di bagian bawah STEP 2 untuk melihat jumlah data per suku kata:

- ✅ = sudah cukup (≥150 file)
- ⚠️ = hampir cukup (100–149 file)
- ❌ = masih kurang, download video lagi untuk suku kata ini lalu ulangi STEP 1–2

**Jangan lanjut ke STEP 3 sebelum semua 20 suku kata minimal ⚠️**

---

## STEP 3 — Bersihkan Audio

**Jalankan semua cell di STEP 3.**
Berjalan otomatis, tidak ada yang perlu kamu lakukan. Hasilnya: audio bersih tersimpan di folder `dataset/clean/`

### 🔧 Penjelasan Proses Cleaning

Setiap audio file di folder `dataset/raw/` diproses melalui 6 tahap:

#### 1. **Noise Reduction** (Kurangi Kebisingan)

- Menghilangkan background noise (suara AC, kipas angin, dll)
- Teknik: Spectral Gating — menganalisis frekuensi mana yang adalah noise, lalu kurangi intensitasnya
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

- **RMS = Root Mean Square** — mengukur power/energi audio secara keseluruhan
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

Di bagian bawah STEP 3, ada cell untuk membandingkan audio SEBELUM dan SESUDAH cleaning:

- **Waveform** (gelombang) — terlihat lebih rapi dan smooth
- **Spectrogram** (frekuensi)— frekuensi aneh sudah hilang

Jalankan cell tersebut untuk melihat perbedaannya!

---

## STEP 4 — Perbanyak Data (Data Augmentation)

**Jalankan semua cell di STEP 4.**
Berjalan otomatis, tidak ada yang perlu kamu lakukan.

### 🎯 Apa Itu Augmentasi?

Augmentasi adalah teknik untuk **menggandakan jumlah data training** dengan membuat variasi dari setiap file asli, tanpa menambah effort recording. Contohnya:

- File asli: "A.wav"
- Hasil augmentasi: "A_aug1.wav", "A_aug2.wav", "A_aug3.wav", "A_aug4.wav"

Setiap augmentasi berbeda, jadi model AI akan belajar dari lebih banyak contoh.

### 📊 Teknik Augmentasi yang Digunakan

Setiap file original diaugmentasi menjadi **4 variasi**, masing-masing menggunakan teknik berbeda:

| Teknik                    | Penjelasan                                     | Manfaat                                             |
| ------------------------- | ---------------------------------------------- | --------------------------------------------------- |
| **White Noise + Volume**  | Tambahkan noise putih + ubah volume            | Latih model tahan terhadap noise dan variasi volume |
| **Pitch Shift + Noise**   | Ubah pitch (tinggi rendah nada) + noise ringan | Model belajar recognisi meski nada berbeda          |
| **Time Stretch + Volume** | Ubah kecepatan bicara + volume                 | Simulasi orang yang bicara cepat/lambat             |
| **Kombinasi Ringan**      | Mix pitch + pink noise + volume                | Realistic augmentation, mirip kondisi real          |

### 📈 Hasil

Jika awalnya ada **500 file**, setelah augmentasi menjadi:

- File asli: 500
- Augmented: 500 × 4 = 2000
- **Total: 2500 file** untuk training

Hasil tersimpan di folder **`dataset/augmented/`**

---

## STEP 5 — Analisis Data (EDA - Exploratory Data Analysis)

**Jalankan semua cell di STEP 5.**
Berjalan otomatis. Menampilkan visualisasi dan analisis dataset untuk memastikan kualitas data.

### 📊 Output EDA yang Ditampilkan

#### 1. **Bar Chart — Distribusi Per Kelas**

```
📊 Grafik jumlah file per suku kata
   - Garis Orange (--) = Target minimum (150 file)
   - Garis Hijau (--) = Target ideal (200 file)
```

**Yang harus Anda lihat:**

- ✅ Semua kelas di atas garis orange = DATA CUKUP
- ⚠️ Ada kelas di bawah garis hijau = Kurang optimal, tapi masih OK
- ❌ Ada kelas jauh di bawah orange = TIDAK CUKUP, harus tambah data!

**Apa yang harus dilakukan:**

- Jika semua ✅ → **Lanjut ke STEP 6**
- Jika ada ⚠️ atau ❌ → **Kembali ke STEP 2** dan record ulang untuk suku kata yang kurang

#### 2. **Waveform (Gelombang Audio)**

```
🎵 Grafik bentuk gelombang audio
   - X-axis = Waktu (detik)
   - Y-axis = Amplitudo (tinggi rendah suara)
```

**Yang harus Anda lihat:**

- ✅ Gelombang rapi, tidak ada spike aneh = BAGUS (sudah dibersihkan)
- ⚠️ Ada spike/noise = Kurang bagus, pertimbangkan re-record atau re-clean

#### 3. **Spectrogram (Analisis Frekuensi)**

```
🎼 Heatmap frekuensi vs waktu (seperti pita musik)
   - Warna terang = Frekuensi kuat (suara bicara)
   - Warna gelap = Frekuensi lemah (silence/noise)
```

**Yang harus Anda lihat:**

- ✅ Pola jelas, terlihat peak suara bicara = BAGUS
- ❌ Banyak noise random = Belum optimal

#### 4. **Histogram Durasi**

```
📈 Grafik distribusi durasi file
   - Semua file harus seragam (sekitar 1.5 detik)
```

**Yang harus Anda lihat:**

- ✅ Semua file sama panjang, 1 garis tegak = SEMPURNA
- ⚠️ Ada variasi durasi = Berarti ada file yang belum di-pad/trim

#### 5. **Contoh Sampel Per Kelas**

```
🎤 Menampilkan 2-3 contoh file per kelas
```

**Yang harus Anda lihat:**

- ✅ Semua file jelas terdengar bicara = BAGUS
- ❌ Ada file yang aneh/tidak terdengar jelas = Ada masalah

### 📋 Perbandingan Clean vs Augmented

Di bagian bawah STEP 5, ada cell yang membandingkan:

- **Kolom kiri** = Dataset CLEAN (asli, tidak di-augmentasi)
- **Kolom kanan** = Dataset AUGMENTED (sudah 4x lipat)

**Yang harus Anda perhatikan:**

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

## STEP 6 — Export & Serah Terima ke Tim AI

**Jalankan semua cell di STEP 6.**
Berjalan otomatis. Hasilnya: dua file penting terbuat:

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

**Ini adalah file yang akan dipakai Tim AI** untuk training model deep learning.

#### 2. **`dataset/metadata/` — File Ringkasan**

```
dataset/metadata/
├── metadata_clean.csv        (Info file asli)
└── metadata_augmented.csv    (Info file hasil augmentasi)
```

Setiap CSV berisi:

- Nama file
- Label (A, Ba, Bi, etc.)
- Durasi
- Sample rate
- Path lengkap

### 📤 Serah Terima ke Tim AI Engineering

Setelah STEP 6 selesai, **siapkan 2 hal untuk diserahkan**:

1. **Folder `dataset/augmented/`**
   - Salinan ke media penyimpanan (USB/Cloud)
   - Untuk digunakan training model AI

2. **Folder `dataset/metadata/`**
   - Berisi `metadata_augmented.csv`
   - Untuk dokumentasi dataset

### 📋 Checklist Serah Terima

- [ ] `dataset/augmented/` sudah di-backup/di-copy ke storage
- [ ] `dataset/metadata/metadata_augmented.csv` sudah ada
- [ ] File `.csv` sudah dibuka dan isinya ter-lihat (untuk validasi)
- [ ] Sudah koordinasi dengan Tim AI untuk penerimaan data
- [ ] Dokumentasi proses (berapa file asli, berapa setelah augmentasi) sudah dicatat

---

## Checklist Akhir

- [ ] Semua 20 suku kata tidak ada yang ❌
- [ ] STEP 6 sudah dijalankan dan file metadata sudah ada
- [ ] Folder `augmented/` sudah dikirim ke Tim AI
