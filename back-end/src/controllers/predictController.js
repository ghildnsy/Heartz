export function mockPredict(req, res) {
  return res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: 'Audio berhasil diproses.',
    data: {
      targetSyllable: 'ba',
      predictedSyllable: 'ba',
      isCorrect: true,
      accuracyScore: 0.94,
      waveformMetrics: [0.12, 0.45, 0.78, 0.89, 0.65, 0.32, 0.1, 0.05],
      affirmation:
        "Luar biasa! Pelafalan suku kata 'ba' Anda sudah sangat konsisten dan mendekati sempurna. Pertahankan posisi bibir tetap rapat di awal suara.",
    },
  });
}