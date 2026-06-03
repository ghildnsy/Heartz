# Heartz Front-End

Heartz adalah aplikasi web terapi wicara mandiri berbasis AI untuk membantu pengguna berlatih artikulasi bunyi bahasa Indonesia. Aplikasi ini berfokus pada latihan vokal dan suku kata sederhana melalui panduan bentuk mulut, perekaman audio, analisis AI, umpan balik hasil latihan, serta riwayat progres pengguna.

Dokumentasi ini menjelaskan bagian front-end Heartz yang dibangun dengan React, Vite, Tailwind CSS, dan Axios. Front-end ini terhubung ke RESTful API cloud untuk autentikasi, profil, riwayat latihan, dan prediksi AI.

## Status Proyek

Front-end sudah memenuhi kebutuhan utama aplikasi web:

- Menggunakan networking calls untuk berinteraksi dengan API.
- Menggunakan module bundler Vite.
- Menggunakan React sebagai library UI.
- Menggunakan Tailwind CSS untuk styling dan layout responsif.
- Menggunakan Axios sebagai HTTP client.
- Mengintegrasikan fitur AI/ML sebagai fitur utama melalui endpoint prediksi.
- Memiliki mockup/desain UI sebagai representasi antarmuka aplikasi.
- Memiliki layout responsif untuk desktop dan mobile.
- Build production berhasil dijalankan.
- Front-end di-deploy ke Vercel.

Mockup high fidelity dapat dilihat di Figma: [High Fidelity Mockup for Heartz](https://www.figma.com/make/oDz05507VB5IRgjYUW4kFr/High-Fidelity-Mockup-for-Heartz?code-node-id=0-9&p=f&t=A3bwrrIxaQXObjVo-0&fullscreen=1).

Catatan: folder backend lokal dan machine-learning lokal tidak menjadi runtime utama front-end production. Front-end ini membaca base URL API dari environment variable `VITE_API_BASE_URL`, bukan dari URL backend yang ditulis langsung di source code.

## Fitur Utama

- Autentikasi pengguna: register, login, logout, refresh session, dan protected route.
- Halaman landing untuk pengenalan aplikasi.
- Dashboard/home setelah login.
- Pemilihan target latihan vokal dan suku kata.
- Sesi latihan dengan panduan bentuk mulut.
- Perekaman audio dari browser menggunakan Web Media API.
- Konversi audio ke format WAV 16 kHz sebelum dikirim ke API.
- Prediksi pelafalan melalui endpoint AI.
- Halaman feedback berisi hasil prediksi, skor akurasi, status benar/salah, dan afirmasi.
- Riwayat latihan dan ringkasan progres.
- Profil pengguna dan update data profil.
- Tema light/dark.
- Responsive navigation untuk desktop dan mobile.
- Error boundary global untuk mencegah tampilan kosong saat terjadi error UI.

## Tech Stack

### Front-End

- React
- Vite
- React Router
- Tailwind CSS
- Axios
- Lucide React
- WaveFile
- Joi
- ESLint

### Integrasi API

Front-end berkomunikasi dengan RESTful API menggunakan Axios di:

```text
src/services/api.js
```

Endpoint yang digunakan oleh front-end:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `GET /api/profile`
- `PUT /api/profile`
- `POST /api/predict`
- `GET /api/predict/warmup`
- `GET /api/history`
- `GET /api/history/summary`
- `GET /api/history/:sessionId`

Catatan runtime:

- `GET /api/predict/warmup` dipanggil hanya pada halaman sesi latihan `/practice/:syllable`.
- Saat user idle di halaman sesi latihan dan tab masih aktif, front-end melakukan warmup berkala untuk membantu menjaga service prediksi tetap siap.
- Halaman pemilihan card `/practice` tidak memanggil endpoint warmup.

### AI/ML Integration

Fitur AI/ML berada pada alur latihan utama:

1. Pengguna memilih target bunyi.
2. Pengguna merekam suara lewat browser.
3. Audio dikonversi menjadi WAV.
4. File audio dikirim ke endpoint `POST /api/predict`.
5. API mengembalikan prediksi, confidence/accuracy score, status benar/salah, dan teks afirmasi.
6. Front-end menampilkan feedback dan menyimpan hasil terakhir ke state aplikasi.

Dengan alur ini, AI/ML bukan fitur tambahan, melainkan inti dari pengalaman latihan Heartz.

## Struktur Folder Penting

```text
front-end/
  public/
    heartz-logo.png
    favicon.svg
    icons.svg
  src/
    assets/
      phonetic/
    components/
    contexts/
    data/
    hooks/
    pages/
    services/
    styles/
    utils/
  index.html
  package.json
  tailwind.config.js
  vite.config.js
```

Penjelasan singkat:

- `src/pages`: halaman utama aplikasi seperti landing, login, register, practice, feedback, progress, dan profile.
- `src/components`: komponen UI reusable seperti navbar, footer, sound card, dan ilustrasi Heartz.
- `src/services/api.js`: konfigurasi Axios, token handling, refresh session, dan API wrapper.
- `src/hooks`: custom hook untuk prediksi, perekaman audio, filter, dan app context.
- `src/utils/audioConverter.js`: konversi rekaman browser menjadi WAV.
- `src/data/syllables.js`: daftar target latihan vokal dan suku kata.
- `src/styles`: styling global dan token tema.

## Routing Aplikasi

Public routes:

- `/` - Landing page
- `/login` - Login
- `/register` - Register
- `/manual` - Manual pengguna dan panduan penggunaan aplikasi
- `*` - Halaman 404 Not Found jika route tidak tersedia

Protected routes:

- `/home` - Dashboard pengguna
- `/practice` - Pilih target latihan
- `/practice/:syllable` - Sesi latihan target tertentu
- `/practice/:syllable/processing` - Status pemrosesan
- `/practice/:syllable/feedback` - Feedback hasil latihan
- `/progress` - Riwayat dan progres latihan
- `/profile` - Profil pengguna

Route yang dilindungi hanya dapat diakses setelah pengguna login. Jika session tidak valid, pengguna diarahkan kembali ke halaman login.

## Environment Variable

Buat file `.env.local` di folder `front-end` dari template `.env.example`:

```env
VITE_API_BASE_URL=https://your-backend-api-url.example.com
VITE_USE_API_PROXY=false
```

Keterangan:

- `VITE_API_BASE_URL`: base URL API untuk environment yang sedang dipakai, misalnya backend lokal saat development atau backend production saat deploy.
- `VITE_USE_API_PROXY`: gunakan `true` hanya jika ingin memakai proxy Vite saat development lokal.
- `.env`, `.env.local`, dan file env nyata lain tidak boleh di-commit. Commit hanya `.env.example` sebagai template.
- Untuk deployment HTTPS seperti Vercel, `VITE_API_BASE_URL` juga harus memakai backend HTTPS. Browser akan memblokir request dari front-end HTTPS ke backend HTTP sebagai mixed content.

Untuk deployment Vercel, environment variable utama yang wajib diisi adalah:

```env
VITE_API_BASE_URL=https://your-backend-api-url.example.com
VITE_USE_API_PROXY=false
```

## Cara Menjalankan Lokal

Install dependencies:

```bash
npm install
```

Jalankan development server:

```bash
npm run dev
```

Build production:

```bash
npm run build
```

Preview hasil build:

```bash
npm run preview
```

Lint:

```bash
npm run lint
```

## Deployment ke Vercel

Front-end ini dapat di-deploy ke Vercel karena output Vite adalah static assets di folder `dist`.

Konfigurasi Vercel yang disarankan:

- Framework Preset: `Vite`
- Root Directory: `front-end`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`

Tambahkan environment variable di dashboard Vercel:

```env
VITE_API_BASE_URL=https://your-backend-api-url.example.com
VITE_USE_API_PROXY=false
```

Untuk environment dropdown di Vercel, gunakan `Production and Preview` agar build production dan preview memakai konfigurasi API yang sama.

Karena aplikasi menggunakan React Router, deployment SPA perlu rewrite semua route ke `index.html`. Jika belum ada, tambahkan file `vercel.json` di folder `front-end`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Setelah deploy berhasil, URL Vercel dapat dicantumkan di bagian ini:

```text
Production URL: https://heartz-speech.vercel.app
```

## Kebutuhan Backend Production

Front-end production berjalan di Vercel dan memanggil backend cloud melalui `VITE_API_BASE_URL`. Backend production harus memenuhi beberapa hal berikut:

- Backend API harus tersedia lewat HTTPS.
- Backend harus mengizinkan CORS dari origin front-end production: `https://heartz-speech.vercel.app`.
- Karena front-end menggunakan `withCredentials: true`, backend tidak boleh memakai CORS origin `*`. Gunakan exact origin dan aktifkan credentials.
- Preflight `OPTIONS` harus mengembalikan header CORS yang sesuai.
- Jika backend menggunakan refresh token via cookie, cookie production harus kompatibel dengan cross-site request:

```text
HttpOnly
Secure
SameSite=None
Path=/ atau path yang mencakup /api/auth/refresh dan /api/auth/logout
```

Endpoint yang bergantung pada refresh token cookie, terutama `POST /api/auth/refresh` dan `POST /api/auth/logout`, harus menerima cookie tersebut dari origin Vercel.

## Troubleshooting Deploy

- `Mixed Content`: `VITE_API_BASE_URL` masih memakai `http://`. Ganti ke backend `https://` lalu redeploy Vercel.
- `No Access-Control-Allow-Origin`: backend CORS belum mengizinkan `https://heartz-speech.vercel.app`.
- `REFRESH_TOKEN_REQUIRED` saat logout atau refresh session gagal: refresh token cookie tidak terkirim atau tidak terbaca backend. Cek `Set-Cookie`, `SameSite=None`, `Secure`, `Path`, dan parser cookie backend.
- `net::ERR_TIMED_OUT`: backend HTTPS tidak dapat dijangkau atau service backend sedang tidak aktif.

## Checklist Pemenuhan Kriteria

| Kriteria | Status | Implementasi |
| --- | --- | --- |
| Networking calls ke API | Terpenuhi | Axios di `src/services/api.js` |
| Module bundler | Terpenuhi | Vite |
| RESTful API untuk front-end | Terpenuhi | Front-end terhubung ke endpoint `/api/...` |
| URL mengikuti konvensi RESTful | Terpenuhi | `/api/auth`, `/api/profile`, `/api/history`, `/api/predict` |
| Penyimpanan data API ke database | Terpenuhi pada backend API | Data user, session, token, dan history dikelola oleh API |
| Express sebagai framework backend | Terpenuhi pada backend API | Front-end mengonsumsi backend Express/API cloud |
| AI/ML sebagai fitur utama | Terpenuhi | Analisis audio melalui `POST /api/predict` |
| Fitur utama tidak crash | Terpenuhi | Build production, lint, 404 page, dan error boundary global |
| Mockup aplikasi | Terpenuhi | [High Fidelity Mockup for Heartz](https://www.figma.com/make/oDz05507VB5IRgjYUW4kFr/High-Fidelity-Mockup-for-Heartz?code-node-id=0-9&p=f&t=A3bwrrIxaQXObjVo-0&fullscreen=1) |
| Layout responsif | Terpenuhi | Tailwind breakpoint `sm`, `md`, `lg`, `xl` |
| Tailwind CSS | Terpenuhi | Styling utama aplikasi |
| Axios | Terpenuhi | HTTP client utama |
| Deployment web | Terpenuhi | Front-end di-deploy ke Vercel |

## Catatan Reviewer

- Aplikasi ini adalah front-end production-ready untuk Heartz.
- Backend lokal dan folder machine-learning lokal tidak perlu dijalankan untuk menilai front-end ini.
- Fitur utama dapat dipahami dari alur: pilih target latihan, rekam audio, kirim ke API prediksi, tampilkan feedback, lalu lihat progres.
- Jika ingin menguji penuh sampai prediksi AI, pastikan `VITE_API_BASE_URL` mengarah ke API HTTPS yang aktif dan mendukung CORS dari domain Vercel.
- Jika hanya ingin memeriksa UI dan build, jalankan `npm install`, `npm run build`, dan `npm run preview`.
