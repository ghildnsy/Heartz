import AppError from '../utils/AppError.js';
import { MOCK_TOKEN } from '../middlewares/mockAuth.js';

const EXISTING_EMAIL = 'pengguna@email.com';
const VALID_PASSWORD = 'admin123';

export function registerMock(req, res, next) {
  const { name, email, password } = req.body || {};

  // simple required fields validation
  if (!name || !email || !password) {
    return next(
      new AppError(
        'Format data tidak valid. Pastikan semua kolom diisi dengan benar.',
        400,
        { code: 'VALIDATION_ERROR' }
      )
    );
  }

  if (email === EXISTING_EMAIL) {
    return next(
      new AppError(
        'Email sudah digunakan oleh akun lain. Silakan gunakan email yang berbeda.',
        400,
        { code: 'EMAIL_ALREADY_USED' }
      )
    );
  }

  return res.status(201).json({
    status: 'success',
    statusCode: 201,
    message: 'Registrasi berhasil.',
    data: {
      userId: 'usr_7739',
      name: name || 'Pengguna Uji Coba',
      email,
    },
  });
}

export function loginMock(req, res, next) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return next(
      new AppError('Email atau kata sandi yang Anda masukkan salah.', 401, {
        code: 'INVALID_CREDENTIALS',
      })
    );
  }

  // mock credential check
  if (email !== EXISTING_EMAIL || password !== VALID_PASSWORD) {
    return next(
      new AppError('Email atau kata sandi yang Anda masukkan salah.', 401, {
        code: 'INVALID_CREDENTIALS',
      })
    );
  }

  return res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: 'Login berhasil.',
    token: MOCK_TOKEN,
    data: {
      userId: 'usr_7739',
      name: 'Pengguna Uji Coba',
      email: EXISTING_EMAIL,
    },
  });
}

export function logoutMock(req, res) {
  return res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: 'Berhasil keluar. Sesi telah diakhiri.',
  });
}