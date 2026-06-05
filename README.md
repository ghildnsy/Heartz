# Heartz

Heartz adalah platform terapi wicara mandiri berbasis kecerdasan buatan yang dirancang untuk membantu pengguna, khususnya penyandang disabilitas rungu/Tuli, dalam melatih artikulasi lisan secara konsisten, fleksibel, dan terjangkau dari rumah.

Aplikasi ini menyediakan alur latihan mulai dari memilih target bunyi atau suku kata, merekam suara melalui browser, mengirim audio ke sistem prediksi, menerima feedback hasil latihan, hingga melihat riwayat dan progres pengguna.

## Fitur Utama

- Autentikasi pengguna, meliputi registrasi, login, logout, dan refresh session.
- Dashboard pengguna setelah login.
- Pemilihan target latihan vokal dan suku kata.
- Perekaman audio langsung dari browser.
- Konversi audio ke format WAV sebelum dikirim ke backend.
- Prediksi pelafalan berbasis Machine Learning.
- Feedback hasil latihan berupa prediksi, skor akurasi, status benar/salah, dan afirmasi.
- Riwayat latihan dan ringkasan progres pengguna.
- Profil pengguna.
- Dashboard data untuk kebutuhan monitoring dan eksplorasi hasil.

## Struktur Proyek

```text
Heartz/
  front-end/          Aplikasi web React/Vite
  back-end/           RESTful API Express.js
  machine-learning/   Dokumentasi/komponen model Machine Learning
  data-science/       Dokumentasi/komponen dashboard dan analisis data
  README.md           Dokumentasi utama proyek
```

## Tech Stack

| Bagian | Teknologi |
| --- | --- |
| Front-End | React, Vite, Tailwind CSS, Axios, React Router |
| Back-End | Node.js, Express.js, Prisma, JWT, Multer |
| Database | PostgreSQL on AWS RDS |
| File Storage | AWS S3 |
| Machine Learning | Deployed inference API |
| Dashboard | Streamlit |
| Deployment Front-End | Vercel |
| Deployment Back-End | Render |

## Arsitektur Singkat

```text
User
  |
  v
Front-End (Vercel)
  |
  v
Back-End API (Render)
  |--------> Machine Learning API
  |--------> PostgreSQL (AWS RDS)
  |--------> AWS S3
```

Penjelasan:

- Front-end menangani UI, routing, autentikasi di sisi client, perekaman audio, dan tampilan feedback.
- Back-end menangani API, validasi autentikasi, upload audio, integrasi ML, dan penyimpanan hasil latihan.
- PostgreSQL on AWS RDS digunakan untuk menyimpan data terstruktur seperti user, auth session, sesi latihan, histori, dan hasil prediksi.
- AWS S3 digunakan sebagai object storage untuk menyimpan file audio rekaman pengguna.
- Machine Learning API digunakan untuk memproses audio dan mengembalikan hasil evaluasi pelafalan.

## Tautan Deployment Produk

| Komponen | Tautan |
| --- | --- |
| Front-End (Vercel) | https://heartz-speech.vercel.app/ |
| Back-End Server (Render) | https://heartz-server.onrender.com/ |
| Database (AWS RDS - PostgreSQL) | `heartz-db-instance.cv0o8eki61h3.ap-southeast-3.rds.amazonaws.com` |
| Storage (AWS S3) | https://heartz-audio-bucket.s3.ap-southeast-3.amazonaws.com/audio-practices/ |
| Dashboard (Streamlit) | https://heartz-dashboard.streamlit.app/ |
| Mockup UI/UX | https://www.figma.com/make/oDz05507VB5IRgjYUW4kFr/High-Fidelity-Mockup-for-Heartz?code-node-id=0-9&p=f&t=EuGCjMLZFnDuuiuc-0&fullscreen=1 |
| Model / ML API Health Check | https://30gz15d4bh.execute-api.ap-southeast-2.amazonaws.com/prod/health |

## Tautan Model Machine Learning

Model Machine Learning pada proyek ini digunakan melalui deployed inference API. Tautan berikut dapat digunakan untuk memeriksa status service model:

```text
https://30gz15d4bh.execute-api.ap-southeast-2.amazonaws.com/prod/health
```

Pada integrasi aplikasi, front-end mengirim audio pengguna ke back-end. Back-end kemudian meneruskan audio ke service Machine Learning untuk mendapatkan hasil evaluasi pelafalan.

## Panduan Setup Environment

Pastikan perangkat sudah memiliki:

- Node.js
- npm
- Git
- Akses internet untuk install dependency dan mengakses service cloud
- Environment variable yang dibutuhkan untuk front-end dan back-end

Clone repository:

```bash
git clone <repository-url>
cd Heartz
```

### Setup Front-End

Masuk ke folder front-end:

```bash
cd front-end
```

Install dependency:

```bash
npm install
```

Buat file `.env.local` berdasarkan `.env.example`:

```env
VITE_API_BASE_URL=https://your-backend-api-url
VITE_USE_API_PROXY=false
```

Keterangan:

- `VITE_API_BASE_URL` adalah URL backend API yang digunakan front-end, misalnya URL backend lokal atau URL deployment backend.
- `VITE_USE_API_PROXY=false` digunakan ketika front-end langsung mengakses backend deployment.

### Setup Back-End

Masuk ke folder back-end:

```bash
cd back-end
```

Install dependency:

```bash
npm install
```

Buat file `.env` pada folder `back-end` dan sesuaikan nilainya:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://username:password@host:5432/database
CORS_ORIGIN=http://localhost:5173,https://heartz-speech.vercel.app
JWT_SECRET=your-access-token-secret
JWT_REFRESH_SECRET=your-refresh-token-secret
ML_API_URL=https://your-ml-service-url
AWS_REGION=ap-southeast-3
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=your-s3-bucket-name
GEMINI_API_KEY=your-gemini-api-key
```

Keterangan penting:

- Jangan commit file `.env` atau secret asli ke repository.
- PostgreSQL digunakan melalui AWS RDS.
- AWS S3 digunakan untuk menyimpan file audio, bukan sebagai database.
- `CORS_ORIGIN` harus berisi origin front-end yang diizinkan.

Generate Prisma client jika diperlukan:

```bash
npx prisma generate
```

Jalankan seed database jika diperlukan:

```bash
npm run seed
```

## Panduan Menjalankan Aplikasi

### Menjalankan Front-End Development

```bash
cd front-end
npm run dev
```

Secara default, Vite akan menjalankan aplikasi pada local development server. Buka URL yang muncul di terminal, biasanya:

```text
http://127.0.0.1:5173
```

### Menjalankan Back-End Development

```bash
cd back-end
npm run dev
```

Back-end akan berjalan sesuai port yang dikonfigurasi pada `.env`, misalnya:

```text
http://localhost:5000
```

Endpoint health check:

```text
GET /
```

### Build Front-End Production

```bash
cd front-end
npm run build
```

Preview hasil build:

```bash
npm run preview
```

### Menjalankan Back-End Production

```bash
cd back-end
npm start
```

Untuk deployment production di Render, konfigurasi yang digunakan:

| Pengaturan | Nilai |
| --- | --- |
| Root Directory | `back-end` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Environment | Node.js |

Pastikan semua environment variable production sudah dikonfigurasi di dashboard Render.

## Dokumentasi Tambahan

Dokumentasi teknis lebih detail tersedia pada file berikut:

- `DOKUMENTASI_FRONTEND.md`
- `DOKUMENTASI_BACKEND.md`
- `front-end/README.md`
- `back-end/README.md`

## Catatan Integrasi

- Front-end production di Vercel menggunakan `VITE_API_BASE_URL` untuk mengarah ke backend Render.
- Back-end Render harus mengizinkan origin front-end melalui konfigurasi CORS.
- Karena autentikasi menggunakan cookie refresh token, backend harus mengaktifkan credentials pada CORS.
- Untuk production lintas domain, cookie refresh token perlu menggunakan konfigurasi `HttpOnly`, `Secure`, dan `SameSite=None`.
- Database PostgreSQL berada di AWS RDS.
- File audio rekaman pengguna disimpan pada AWS S3.
- Model Machine Learning diakses melalui API inference yang sudah di-deploy.
