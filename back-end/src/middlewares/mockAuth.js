import AppError from '../utils/AppError.js';

export const MOCK_TOKEN = 'mock_jwt_header.mock_jwt_payload.mock_jwt_signature';

export default function mockAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(
      new AppError('Akses ditolak. Token tidak valid atau sesi Anda telah berakhir.', 401, {
        code: 'UNAUTHORIZED',
      })
    );
  }

  const token = authHeader.slice('Bearer '.length).trim();

  if (token !== MOCK_TOKEN) {
    return next(
      new AppError('Akses ditolak. Token tidak valid atau sesi Anda telah berakhir.', 401, {
        code: 'INVALID_TOKEN',
      })
    );
  }

  // attach mock user context (optional)
  req.user = {
    userId: 'usr_7739',
    name: 'Pengguna Uji Coba',
    email: 'pengguna@email.com',
  };

  next();
}