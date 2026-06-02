# Laporan Teknis: Heartz — Speech Therapy Data Pipeline
**Proyek Akhir Data Science**

## 1. Problem Discovery
Penyandang disabilitas rungu (Tuli) sering kali menghadapi tantangan besar dalam melatih artikulasi lisan (terapi wicara) karena kurangnya akses ke fasilitas terapi yang terjangkau, konsisten, dan fleksibel. 
**Tujuan Proyek:** Membangun fondasi (data pipeline) untuk aplikasi **Heartz**, platform terapi wicara mandiri berbasis kecerdasan buatan. Proyek ini berfokus pada pengumpulan, pembersihan, dan analisis dataset audio suku kata bahasa Indonesia.

### 1.1 Pertanyaan Bisnis
1. Apakah distribusi sampel audio antara kelas vokal dan konsonan seimbang untuk memastikan model tidak bias?
2. Sejauh mana teknik augmentasi data mengubah distribusi fitur MFCC utama secara statistik dibandingkan dengan sampel audio asli?
3. Fitur akustik manakah yang paling signifikan membedakan antara pelafalan kelas vokal dasar dengan kelas konsonan bilabial/nasal?
4. Apakah pipeline cleaning secara konsisten mereduksi RMS amplitude background noise tanpa mengorbankan kualitas sinyal vokal utama?

## 2. Pengumpulan dan Pemrosesan Data (Data Preparation)
Dataset berfokus pada 20 kelas suku kata bahasa Indonesia: 5 Vokal dasar (A, I, U, E, O) dan 15 Bilabial/Nasal (Ba, Bi, Bu, Be, Bo, Pa, Pi, Pu, Pe, Po, Ma, Mi, Mu, Me, Mo).

### 2.1 Pipeline Preparation
- **Splitting:** Pemotongan klip berdasarkan deteksi *silence* (ambang batas -40 dBFS). 
  - *Evidence/Alasan:* Silence removal esensial untuk menghilangkan segmen non-informatif yang dapat menurunkan konvergensi loss pada saat pelatihan Convolutional Neural Networks (CNN) [1].

### 2.2 Data Cleaning
1. **Noise Reduction:** Menggunakan *spectral gating*.
   - *Evidence/Alasan:* Spectral gating menganalisis profil noise dalam domain frekuensi dan menguranginya secara non-linear tanpa merusak formants vokal utama. Terbukti meningkatkan Signal-to-Noise Ratio (SNR) pada dataset bicara di kondisi nyata [2].
2. **Bandpass Filter:** High-pass (80 Hz) dan Low-pass (7500 Hz).
   - *Evidence/Alasan:* Frekuensi fundamental bicara manusia berada di antara 85 Hz hingga 255 Hz, sedangkan mayoritas energi wicara informatif (<7.5kHz). Filter ini menghapus "rumble" AC dan "hiss" yang berada di luar rentang tersebut [3].
3. **Standarisasi Durasi:** Padding atau trimming seragam menjadi 1.0 detik.
   - *Evidence/Alasan:* Arsitektur deep learning 2D CNN membutuhkan input fitur (*spectrogram*/*MFCC image*) dengan dimensi array yang tetap dan persis sama [1].

### 2.3 Data Augmentation
Setiap sampel asli direplikasi sebanyak 4 kali dengan variasi:
- *White noise injection*, *Pitch shifting*, *Time stretching*.
- *Evidence/Alasan:* Augmentasi domain waktu dan frekuensi terbukti secara empiris meningkatkan ketahanan (robustness) sistem Automatic Speech Recognition (ASR) terhadap variasi speaker (nada, kecepatan) dan degradasi sinyal rekaman di dunia nyata [4].

## 3. Feature Engineering
Guna melatih model klasifikasi, ekstraksi fitur spektral dilakukan menggunakan library **Librosa**:
- **MFCC (Mel-Frequency Cepstral Coefficients):** 
  - *Evidence/Alasan:* Standar industri untuk pengenalan wicara karena pemetaan skala Mel mensimulasikan persepsi pendengaran manusia. Mengambil *envelope* spektral dari pita suara [5].
- **Zero Crossing Rate (ZCR) & Spectral Centroid:** 
  - *Evidence/Alasan:* Fitur terbaik untuk mendeteksi *voiced vs unvoiced speech* serta membedakan konsonan impulsif (seperti bilabial plosif /p/ dan /b/) dari vokal periodik murni [5].

Seluruh ekstraksi menghasilkan lebih dari 30 dimensi fitur per observasi yang disimpan ke CSV (didokumentasikan dalam Data Dictionary).

## 4. A/B Testing & Explanatory Analysis
Modul `ab_testing.py` memvalidasi kualitas data.

**Hasil Analisis Bisnis Utama:**
1. **Dampak Augmentasi (Menjawab Q2):** Uji statistik (Paired T-Test) antara distribusi MFCC data original dan augmented menunjukkan *Cohen's d* rendah hingga medium (< 0.5).
   - *Kesimpulan:* Augmentasi sukses menambah keragaman sampel tanpa menghancurkan pusat representasi kelas, sehingga aman untuk melatih generalisasi AI.
2. **Diferensiasi Kelas (Menjawab Q3):** Uji Mann-Whitney antara kelas vokal dan konsonan mengungkap bahwa ZCR dan Spectral Centroid memiliki perbedaan yang sangat signifikan (p < 0.05).
   - *Kesimpulan:* Konsonan memiliki frekuensi *burst* (ZCR tinggi), sementara vokal terpusat pada *formants* frekuensi rendah. Kedua fitur ini vital dimasukkan sebagai variabel klasifikasi.

## 5. Deployment Dashboard (Streamlit)
Analisis eksploratif (EDA) ini disajikan via **Dashboard Interaktif Streamlit**. Dashboard memberikan insight yang jelas untuk menjawab semua pertanyaan bisnis menggunakan grafik interaktif (Seaborn & Matplotlib). 
Aplikasi siap untuk di-*deploy* di **Streamlit Community Cloud**.

## 6. Referensi
[1] Purwins, H., et al. (2019). "Deep Learning for Audio Signal Processing." *IEEE Journal of Selected Topics in Signal Processing*.
[2] Sainath, T. N., et al. (2015). "Convolutional, Long Short-Term Memory, fully connected Deep Neural Networks." *ICASSP*.
[3] Rabiner, L. R., & Schafer, R. W. (2007). *Introduction to Digital Speech Processing*. Foundations and Trends in Signal Processing.
[4] Ko, T., et al. (2015). "Audio Augmentation for Speech Recognition." *Interspeech*.
[5] Muda, L., Begam, M., & Elamvazuthi, I. (2010). "Voice Recognition Algorithms using Mel Frequency Cepstral Coefficient (MFCC) and Dynamic Time Warping (DTW)." *Journal of Computing*.