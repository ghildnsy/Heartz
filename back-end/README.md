# Dokumentasi Back-End Heartz

Back-end Heartz adalah RESTful API berbasis Express.js yang menangani autentikasi, profil pengguna, riwayat latihan, penyimpanan audio, integrasi Machine Learning, dan integrasi Google Gemini untuk feedback atau afirmasi latihan.

## Ringkasan Teknologi

| Kebutuhan | Implementasi |
| --- | --- |
| Runtime | Node.js |
| Framework API | Express.js |
| Deployment platform | Render |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT, refresh token, cookie HTTP-only |
| Password hashing | bcrypt |
| Upload audio | multer |
| Cloud storage | AWS S3 |
| ML integration | Axios ke service inference ML |
| Generative AI | Google Gemini |
| CORS | cors middleware |

## Lokasi Kode

```text
back-end/
  prisma/
    schema.prisma
    seed.js
    migrations/
  postman/
  src/
    config/
    controllers/
    middlewares/
    routes/
    services/
    utils/
    app.js
  package.json
```

Penjelasan folder utama:

| Folder/File | Fungsi |
| --- | --- |
| `src/app.js` | Konfigurasi Express app, middleware global, root endpoint, dan route utama. |
| `src/routes` | Definisi route untuk auth, profile, predict, dan history. |
| `src/controllers` | Logic request/response untuk setiap fitur. |
| `src/middlewares` | Middleware autentikasi dan upload audio. |
| `src/config/prisma.js` | Koneksi Prisma ke PostgreSQL menggunakan adapter `pg`. |
| `src/config/cors.js` | Konfigurasi CORS berbasis environment variable. |
| `src/services/s3Service.js` | Upload audio ke AWS S3. |
| `src/utils/geminiService.js` | Integrasi Google Gemini. |
| `prisma/schema.prisma` | Skema database. |
| `postman` | Koleksi Postman untuk dokumentasi dan pengujian API. |

## Fitur Utama

- RESTful API untuk kebutuhan front-end.
- Registrasi dan login pengguna.
- Access token JWT dan refresh token.
- Refresh token disimpan dalam cookie HTTP-only.
- Protected route menggunakan middleware auth.
- Profil pengguna.
- Prediksi pelafalan berbasis audio.
- Upload audio ke AWS S3.
- Penyimpanan hasil latihan ke PostgreSQL.
- Riwayat latihan dan ringkasan progres.
- Integrasi service Machine Learning eksternal.
- Integrasi Gemini untuk teks afirmasi atau laporan.
- Konfigurasi CORS untuk akses dari front-end.

## Struktur Route

Base route di `src/app.js`:

| Prefix | File Route | Fungsi |
| --- | --- | --- |
| `/api/auth` | `authRoutes.js` | Autentikasi pengguna |
| `/api/profile` | `profileRoutes.js` | Profil pengguna |
| `/api/predict` | `predictRoutes.js` | Prediksi audio dan master syllable |
| `/api/history` | `historyRoutes.js` | Riwayat latihan |

Endpoint detail:

| Method | Endpoint | Auth | Fungsi |
| --- | --- | --- | --- |
| `GET` | `/` | Tidak | Health check API |
| `POST` | `/api/auth/register` | Tidak | Registrasi user |
| `POST` | `/api/auth/login` | Tidak | Login user |
| `POST` | `/api/auth/logout` | Cookie refresh token | Logout user |
| `POST` | `/api/auth/refresh` | Cookie refresh token | Refresh access token |
| `GET` | `/api/profile` | Ya | Ambil profil user |
| `PUT` | `/api/profile` | Ya | Update profil user |
| `GET` | `/api/predict/master` | Ya | Ambil daftar syllable dari database |
| `GET` | `/api/predict/warmup` | Ya | Memicu warmup service ML |
| `POST` | `/api/predict` | Ya | Upload audio dan prediksi pelafalan |
| `GET` | `/api/history` | Ya | Ambil riwayat latihan |
| `GET` | `/api/history/summary` | Ya | Ambil ringkasan progres |
| `GET` | `/api/history/:sessionId` | Ya | Ambil detail sesi latihan |

Catatan: front-end saat ini memanggil `GET /api/auth/me`, tetapi route tersebut belum terlihat pada `authRoutes.js` di checkout ini. Jika fitur ini dibutuhkan, tambahkan route dan controller terkait atau sesuaikan front-end.

## Alur Autentikasi

1. User melakukan registrasi melalui `/api/auth/register`.
2. Password di-hash menggunakan bcrypt sebelum disimpan.
3. User login melalui `/api/auth/login`.
4. Backend membuat access token dan refresh token.
5. Access token dikirim pada response body.
6. Refresh token dikirim sebagai cookie HTTP-only.
7. Front-end mengirim access token melalui header `Authorization`.
8. Saat access token expired, front-end memanggil `/api/auth/refresh`.
9. Backend memvalidasi refresh token, membuat token baru, dan memperbarui session.
10. Logout menghapus session refresh token dan membersihkan cookie.

## Alur Prediksi Audio

1. User mengirim request `POST /api/predict`.
2. Request harus menyertakan JWT access token.
3. Request membawa `multipart/form-data` berisi file `audio` dan field `target_label`.
4. Middleware upload memvalidasi dan membaca audio.
5. Backend mencari target syllable di database.
6. Audio di-upload ke AWS S3.
7. Backend meneruskan audio ke service ML pada `ML_API_URL`.
8. Response ML dipetakan menjadi hasil prediksi.
9. Backend menyimpan `AudioFile`, `PracticeSession`, dan `Prediction` melalui Prisma transaction.
10. Backend mengembalikan hasil prediksi ke front-end.

Contoh response sukses prediksi:

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Audio berhasil diproses oleh model AI.",
  "data": {
    "sessionId": "session-id",
    "date": "2026-06-03T00:00:00.000Z",
    "targetSyllable": "ma",
    "predictedSyllable": "ma",
    "isCorrect": true,
    "accuracyScore": 0.95,
    "affirmation": "Teruskan latihanmu!"
  }
}
```

## Skema Database

Model utama pada `prisma/schema.prisma`:

| Model | Fungsi |
| --- | --- |
| `User` | Data akun pengguna. |
| `Syllable` | Master target bunyi atau suku kata. |
| `AudioFile` | Metadata audio yang disimpan di S3. |
| `PracticeSession` | Sesi latihan pengguna. |
| `Prediction` | Hasil prediksi dari model AI. |
| `AuthSession` | Refresh token session pengguna. |
| `WeeklySummary` | Ringkasan progres mingguan pengguna. |

Relasi penting:

- `User` memiliki banyak `PracticeSession`, `AudioFile`, `AuthSession`, dan `WeeklySummary`.
- `PracticeSession` terhubung dengan target `Syllable`.
- `Prediction` terhubung dengan `PracticeSession`, `AudioFile`, dan predicted `Syllable`.
- `AudioFile` menyimpan metadata file yang di-upload ke S3.
- `AuthSession` menyimpan refresh token session user.

## Environment Variable

Backend di-deploy ke Render dan membutuhkan environment variable berikut pada dashboard Render:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/database
CORS_ORIGIN=https://your-frontend-domain.vercel.app
JWT_SECRET=your-access-token-secret
JWT_REFRESH_SECRET=your-refresh-token-secret
ML_API_URL=https://your-ml-service.example.com
AWS_REGION=ap-southeast-3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name
GEMINI_API_KEY=your-gemini-api-key
```

Keterangan:

| Variable | Fungsi |
| --- | --- |
| `NODE_ENV` | Gunakan `production` pada Render agar cookie memakai konfigurasi production. |
| `PORT` | Port server. Pada Render biasanya dibaca dari environment platform. |
| `DATABASE_URL` | Koneksi PostgreSQL untuk Prisma. Database ini menyimpan data aplikasi, bukan file audio. |
| `CORS_ORIGIN` | Daftar origin front-end yang diizinkan, misalnya domain Vercel. Pisahkan dengan koma jika lebih dari satu. |
| `JWT_SECRET` | Secret untuk access token. |
| `JWT_REFRESH_SECRET` | Secret untuk refresh token. |
| `ML_API_URL` | Base URL service Machine Learning. |
| `AWS_REGION` | Region bucket S3. |
| `AWS_ACCESS_KEY_ID` | Access key AWS. |
| `AWS_SECRET_ACCESS_KEY` | Secret key AWS. |
| `AWS_S3_BUCKET` | Nama bucket S3 untuk menyimpan file audio rekaman pengguna. |
| `GEMINI_API_KEY` | API key Google Gemini. |

## Cara Menjalankan Lokal

Masuk ke folder backend:

```bash
cd back-end
```

Install dependency:

```bash
npm install
```

Siapkan file `.env`, lalu jalankan migrasi atau sinkronisasi Prisma sesuai workflow tim.

Generate Prisma client jika diperlukan:

```bash
npx prisma generate
```

Jalankan seed data syllable:

```bash
npm run seed
```

Jalankan development server:

```bash
npm run dev
```

Jalankan production server:

```bash
npm start
```

## Catatan Teknis Checkout Saat Ini

Berdasarkan isi repo pada saat dokumentasi ini dibuat, ada beberapa file yang diimpor tetapi belum terlihat di folder backend:

| File yang dirujuk | Dirujuk dari | Dampak |
| --- | --- | --- |
| `src/server.js` | `package.json` script `start` dan `dev` | Server tidak dapat dijalankan dengan script npm sampai entry file dibuat. |
| `src/utils/catchAsync.js` | Controller backend | Import error saat controller dimuat. |
| `src/utils/AppError.js` | Controller dan CORS config | Import error saat error helper dipakai. |
| `src/middlewares/notFound.js` | `src/app.js` | Import error saat app dimuat. |
| `src/middlewares/errorHandler.js` | `src/app.js` | Import error saat app dimuat. |

Sebelum backend dijalankan lokal atau di-deploy ulang, pastikan file-file tersebut tersedia atau sesuaikan import dan script npm.

## Integrasi dengan Front-End

- Backend harus mengizinkan origin front-end melalui `CORS_ORIGIN`.
- Karena front-end memakai cookie refresh token, backend harus mengaktifkan `credentials: true`.
- Untuk production lintas domain, cookie perlu memakai `Secure` dan `SameSite=None`.
- Semua endpoint protected membutuhkan header `Authorization: Bearer <accessToken>`.
- Endpoint prediksi harus menerima `multipart/form-data`.

## Deployment

Backend Heartz di-deploy ke Render sebagai service Node.js. Render menjalankan Express API, sedangkan data aplikasi tetap disimpan di PostgreSQL dan file audio rekaman pengguna disimpan di AWS S3.

Pembagian layanan production:

| Komponen | Platform/Layanan | Fungsi |
| --- | --- | --- |
| Front-end | Vercel | Menyajikan aplikasi React/Vite ke pengguna. |
| Back-end API | Render | Menjalankan Express.js API. |
| Database | PostgreSQL | Menyimpan user, auth session, syllable, practice session, prediction, dan summary. |
| File storage | AWS S3 | Menyimpan file audio rekaman pengguna. |
| ML service | Service inference eksternal | Memproses audio dan mengembalikan hasil prediksi. |

Konfigurasi Render yang disarankan:

| Pengaturan | Nilai |
| --- | --- |
| Root Directory | `back-end` |
| Runtime | Node.js |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Environment | Node |

Hal yang perlu dipastikan saat deployment:

- Environment variable production lengkap.
- `DATABASE_URL` mengarah ke PostgreSQL yang dapat diakses dari Render.
- Prisma client sudah sesuai dengan schema.
- Bucket AWS S3 tersedia dan credential memiliki permission upload.
- Service ML pada `ML_API_URL` aktif.
- URL backend Render memakai HTTPS karena dipanggil oleh front-end Vercel.
- `CORS_ORIGIN` berisi domain front-end production dari Vercel.
- Cookie refresh token production kompatibel dengan request lintas domain, yaitu `HttpOnly`, `Secure`, dan `SameSite=None`.

Catatan penting: AWS S3 tidak digunakan sebagai database. PostgreSQL digunakan untuk menyimpan data terstruktur aplikasi, sedangkan AWS S3 digunakan sebagai object storage untuk file audio.
