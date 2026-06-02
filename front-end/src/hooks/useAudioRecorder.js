import { useCallback, useEffect, useRef, useState } from 'react';
import { convertToWav } from '../utils/audioConverter';

const MAX_RECORDING_MS = 5000;
const WAVEFORM_BAR_COUNT = 36;
const EMPTY_WAVEFORM = Array.from({ length: WAVEFORM_BAR_COUNT }, () => 0);

function getSupportedMimeType() {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
  return candidates.find((mimeType) => MediaRecorder.isTypeSupported(mimeType)) || '';
}

function getWaveformBars(timeDomainData) {
  const chunkSize = Math.max(1, Math.floor(timeDomainData.length / WAVEFORM_BAR_COUNT));
  return EMPTY_WAVEFORM.map((_, barIndex) => {
    const start = barIndex * chunkSize;
    const end = Math.min(start + chunkSize, timeDomainData.length);
    let sum = 0;

    for (let index = start; index < end; index += 1) {
      sum += Math.abs(timeDomainData[index] - 128) / 128;
    }

    const average = sum / Math.max(1, end - start);
    return Math.min(1, average * 3.4);
  });
}

function getAudioLevel(timeDomainData) {
  let sum = 0;

  for (let index = 0; index < timeDomainData.length; index += 1) {
    const amplitude = (timeDomainData[index] - 128) / 128;
    sum += amplitude * amplitude;
  }

  const rms = Math.sqrt(sum / timeDomainData.length);
  return Math.min(1, rms * 4);
}

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [error, setError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [waveformBars, setWaveformBars] = useState(EMPTY_WAVEFORM);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timeoutRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const analyserFrameRef = useRef(null);
  const analyserDataRef = useRef(null);

  const resetMeter = useCallback(() => {
    setAudioLevel(0);
    setWaveformBars(EMPTY_WAVEFORM);
  }, []);

  const stopAnalyser = useCallback(() => {
    if (analyserFrameRef.current) {
      window.cancelAnimationFrame(analyserFrameRef.current);
      analyserFrameRef.current = null;
    }

    sourceRef.current?.disconnect();
    sourceRef.current = null;
    analyserRef.current = null;
    analyserDataRef.current = null;

    if (audioContextRef.current?.state !== 'closed') {
      void audioContextRef.current?.close();
    }
    audioContextRef.current = null;
    resetMeter();
  }, [resetMeter]);

  const stopStream = useCallback(() => {
    stopAnalyser();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, [stopAnalyser]);

  const startAnalyser = useCallback((stream) => {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return;

    const audioContext = new AudioContextCtor();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.72;
    const source = audioContext.createMediaStreamSource(stream);
    const timeDomainData = new Uint8Array(analyser.fftSize);

    source.connect(analyser);
    void audioContext.resume?.();

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    sourceRef.current = source;
    analyserDataRef.current = timeDomainData;

    const updateMeter = () => {
      if (!analyserRef.current || !analyserDataRef.current) return;

      analyserRef.current.getByteTimeDomainData(analyserDataRef.current);
      setAudioLevel(getAudioLevel(analyserDataRef.current));
      setWaveformBars(getWaveformBars(analyserDataRef.current));
      analyserFrameRef.current = window.requestAnimationFrame(updateMeter);
    };

    updateMeter();
  }, []);

  const stopRecording = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
    }
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    setAudioBlob(null);

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Browser belum mendukung perekaman audio.');
      return;
    }

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError('Izin mikrofon ditolak. Aktifkan akses mikrofon di browser.');
      return;
    }

    try {
      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      chunksRef.current = [];
      streamRef.current = stream;
      startAnalyser(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        setError('Perekaman audio gagal. Coba ulangi sekali lagi.');
        setIsRecording(false);
        stopStream();
      };

      recorder.onstop = async () => {
        setIsRecording(false);
        stopStream();

        try {
          setIsConverting(true);
          const recordedBlob = new Blob(chunksRef.current, {
            type: mimeType || 'audio/webm',
          });

          if (!recordedBlob.size) {
            throw new Error('Audio kosong.');
          }

          const wavBlob = await convertToWav(recordedBlob);
          setAudioBlob(wavBlob);
        } catch (conversionError) {
          console.error('Audio conversion error:', conversionError);
          setError('Gagal memproses audio. Coba ulangi dengan rekaman yang lebih jelas.');
        } finally {
          setIsConverting(false);
          recorderRef.current = null;
        }
      };

      recorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);

      timeoutRef.current = window.setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      }, MAX_RECORDING_MS);
    } catch (recorderError) {
      console.error('Recorder error:', recorderError);
      stopStream();
      setError('Perekam audio tidak bisa dimulai di browser ini.');
    }
  }, [startAnalyser, stopStream]);

  const reset = useCallback(() => {
    stopRecording();
    stopStream();
    setAudioBlob(null);
    setError(null);
    setIsConverting(false);
  }, [stopRecording, stopStream]);

  useEffect(() => {
    return () => {
      stopRecording();
      stopStream();
    };
  }, [stopRecording, stopStream]);

  return {
    isRecording,
    isConverting,
    audioBlob,
    error,
    audioLevel,
    waveformBars,
    maxRecordingMs: MAX_RECORDING_MS,
    startRecording,
    stopRecording,
    reset,
  };
}
