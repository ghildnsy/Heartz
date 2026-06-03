import { useCallback, useState } from 'react';
import { ApiError, predictApi } from '../services/api';

export function usePredict() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const predict = useCallback(async (wavBlob, targetLabel) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await predictApi.predict(wavBlob, targetLabel);
      setResult(data);
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        if (requestError.statusCode === 503) {
          setError(requestError.message || 'AI service sedang tidak tersedia. Coba lagi nanti.');
        } else if (requestError.statusCode === 401) {
          setError('Sesi habis. Silakan login ulang.');
        } else {
          setError(requestError.message);
        }
      } else {
        setError('Koneksi gagal. Periksa jaringan internet.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { predict, result, isLoading, error, reset };
}
