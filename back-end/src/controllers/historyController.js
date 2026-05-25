import AppError from '../utils/AppError.js';

const historyList = [
  {
    sessionId: 'sess_101',
    date: '2026-05-25T10:00:00Z',
    targetSyllable: 'a',
    isCorrect: true,
    score: 0.92,
  },
  {
    sessionId: 'sess_102',
    date: '2026-05-25T10:05:00Z',
    targetSyllable: 'ba',
    isCorrect: false,
    score: 0.65,
  },
  {
    sessionId: 'sess_103',
    date: '2026-05-25T10:07:00Z',
    targetSyllable: 'ba',
    isCorrect: true,
    score: 0.88,
  },
  {
    sessionId: 'sess_104',
    date: '2026-05-24T15:30:00Z',
    targetSyllable: 'ma',
    isCorrect: true,
    score: 0.9,
  },
  {
    sessionId: 'sess_105',
    date: '2026-05-24T15:35:00Z',
    targetSyllable: 'pa',
    isCorrect: false,
    score: 0.55,
  },
];

export function getHistoryMock(req, res) {
  return res.status(200).json({
    status: 'success',
    statusCode: 200,
    results: historyList.length,
    data: historyList,
  });
}

export function getHistorySummaryMock(req, res) {
  return res.status(200).json({
    status: 'success',
    statusCode: 200,
    data: {
      week: '2026-W21',
      totalPracticeCount: 35,
      overallAccuracy: 0.82,
      mostPracticed: 'ba',
      needsImprovement: 'pa',
      geminiWeeklyReport:
        "Minggu ini Anda menunjukkan dedikasi yang sangat baik. Akurasi pelafalan vokal Anda stabil, namun mari fokus memberikan tekanan lebih pada bibir untuk suku kata 'pa' di sesi latihan minggu depan.",
    },
  });
}

export function getHistoryBySessionIdMock(req, res, next) {
  const { sessionId } = req.params;

  if (!sessionId) {
    return next(new AppError('Session ID tidak valid.', 400, { code: 'INVALID_SESSION_ID' }));
  }

  // Use the exact example from your spec when sess_102 is requested
  if (sessionId === 'sess_102') {
    return res.status(200).json({
      status: 'success',
      statusCode: 200,
      data: {
        sessionId: 'sess_102',
        date: '2026-05-25T10:05:00Z',
        targetSyllable: 'ba',
        predictedSyllable: 'pa',
        isCorrect: false,
        score: 0.65,
        waveformMetrics: [0.05, 0.2, 0.45, 0.3, 0.15],
        affirmation:
          "Bentuk bibir sudah hampir tepat, namun getaran udara yang dikeluarkan terlalu kuat sehingga terbaca sebagai 'pa'. Coba kurangi letupan udara pada repetisi berikutnya.",
      },
    });
  }

  // Otherwise, return a generic derived detail if found in list
  const found = historyList.find((s) => s.sessionId === sessionId);
  if (!found) {
    // Spec doesn't define this explicitly; return 404 as reasonable mock behavior
    return next(new AppError(`Riwayat dengan sessionId ${sessionId} tidak ditemukan.`, 404, {
      code: 'SESSION_NOT_FOUND',
    }));
  }

  return res.status(200).json({
    status: 'success',
    statusCode: 200,
    data: {
      sessionId: found.sessionId,
      date: found.date,
      targetSyllable: found.targetSyllable,
      predictedSyllable: found.isCorrect ? found.targetSyllable : 'pa',
      isCorrect: found.isCorrect,
      score: found.score,
      waveformMetrics: [0.12, 0.45, 0.22, 0.18, 0.09],
      affirmation: found.isCorrect
        ? `Bagus! Sesi ${found.targetSyllable} Anda menunjukkan hasil yang konsisten.`
        : `Ayo coba lagi—pelafalan '${found.targetSyllable}' Anda masih perlu sedikit penyesuaian.`,
    },
  });
}