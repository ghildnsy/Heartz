import AppError from '../utils/AppError.js';

export function getProfileMock(req, res) {
  return res.status(200).json({
    status: 'success',
    statusCode: 200,
    data: {
      userId: 'usr_7739',
      name: 'Pengguna Uji Coba',
      email: 'pengguna@email.com',
      joinedAt: '2026-05-01T10:00:00Z',
      totalSessions: 128,
    },
  });
}

export function updateProfileMock(req, res, next) {
  const { name, email } = req.body || {};

  // Mock validation: require name/email, and basic length
  if (!name || typeof name !== 'string' || name.trim().length < 3) {
    return next(
      new AppError('Format data tidak valid. Pastikan semua kolom diisi dengan benar.', 400, {
        code: 'VALIDATION_ERROR',
      })
    );
  }

  // email optional in UI, but if sent, must look like email
  if (email && (typeof email !== 'string' || !email.includes('@'))) {
    return next(
      new AppError('Format data tidak valid. Pastikan semua kolom diisi dengan benar.', 400, {
        code: 'VALIDATION_ERROR',
      })
    );
  }

  return res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: 'Profil berhasil diperbarui.',
    data: {
      userId: 'usr_7739',
      name: name.trim(),
      email: email || 'pengguna@email.com',
    },
  });
}