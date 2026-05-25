import multer from 'multer';
import AppError from '../utils/AppError.js';

const WAV_SAMPLE_RATE = 16000;
const WAV_CHANNELS = 1;
const WAV_BITS_PER_SAMPLE = 16;

const TARGET_SECONDS = 1.0;
const MAX_SECONDS = 2.0;

const TARGET_SAMPLES = WAV_SAMPLE_RATE * TARGET_SECONDS; // 16000
const MAX_SAMPLES = WAV_SAMPLE_RATE * MAX_SECONDS; // 32000

// WAV PCM 16-bit mono 16kHz 2 detik ≈ 64KB data + header; kasih toleransi.
const MAX_FILE_SIZE_BYTES = 250 * 1024; // 250KB

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  const okMime =
    file.mimetype === 'audio/wav' ||
    file.mimetype === 'audio/x-wav' ||
    file.mimetype === 'audio/wave' ||
    file.mimetype === 'audio/vnd.wave';

  const okExt = (file.originalname || '').toLowerCase().endsWith('.wav');

  if (!okMime && !okExt) {
    return cb(
      new AppError(
        'Format file tidak didukung. Sistem hanya menerima file .wav PCM 16-bit mono sample rate 16 kHz.',
        400,
        { code: 'INVALID_AUDIO_TYPE' }
      )
    );
  }

  cb(null, true);
}

const uploader = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
}).single('audio');

// Helper read functions (little-endian)
function readUInt32LE(buf, offset) {
  return buf.readUInt32LE(offset);
}
function readUInt16LE(buf, offset) {
  return buf.readUInt16LE(offset);
}

function parseWav(buffer) {
  if (!buffer || buffer.length < 44) {
    throw new AppError('File .wav tidak valid atau rusak.', 400, {
      code: 'WAV_TOO_SMALL',
    });
  }

  const riff = buffer.toString('ascii', 0, 4);
  const wave = buffer.toString('ascii', 8, 12);

  if (riff !== 'RIFF' || wave !== 'WAVE') {
    throw new AppError(
      'Format file tidak didukung. Sistem hanya menerima file .wav PCM 16-bit mono sample rate 16 kHz.',
      400,
      { code: 'NOT_WAV_RIFF' }
    );
  }

  // chunk scanning
  let offset = 12;
  let fmt = null;
  let data = null;

  while (offset + 8 <= buffer.length) {
    const chunkId = buffer.toString('ascii', offset, offset + 4);
    const chunkSize = readUInt32LE(buffer, offset + 4);
    const chunkDataStart = offset + 8;

    if (chunkDataStart + chunkSize > buffer.length) {
      throw new AppError('File .wav tidak valid atau rusak.', 400, {
        code: 'WAV_CHUNK_OUT_OF_RANGE',
      });
    }

    if (chunkId === 'fmt ') {
      if (chunkSize < 16) {
        throw new AppError('File .wav tidak valid atau rusak.', 400, {
          code: 'WAV_FMT_TOO_SMALL',
        });
      }

      const audioFormat = readUInt16LE(buffer, chunkDataStart + 0); // 1 = PCM
      const numChannels = readUInt16LE(buffer, chunkDataStart + 2);
      const sampleRate = readUInt32LE(buffer, chunkDataStart + 4);
      const byteRate = readUInt32LE(buffer, chunkDataStart + 8);
      const blockAlign = readUInt16LE(buffer, chunkDataStart + 12);
      const bitsPerSample = readUInt16LE(buffer, chunkDataStart + 14);

      fmt = {
        audioFormat,
        numChannels,
        sampleRate,
        byteRate,
        blockAlign,
        bitsPerSample,
      };
    }

    if (chunkId === 'data') {
      data = {
        dataSize: chunkSize,
        dataOffset: chunkDataStart,
      };
    }

    // word aligned
    offset = chunkDataStart + chunkSize + (chunkSize % 2);
    if (fmt && data) break;
  }

  if (!fmt || !data) {
    throw new AppError('File .wav tidak valid atau tidak lengkap.', 400, {
      code: 'WAV_MISSING_CHUNK',
      errors: [{ hasFmt: Boolean(fmt), hasData: Boolean(data) }],
    });
  }

  return { fmt, data };
}

function validateFormat(fmt) {
  if (fmt.audioFormat !== 1) {
    throw new AppError(
      'Format file tidak didukung. Sistem hanya menerima WAV PCM (audioFormat=1).',
      400,
      { code: 'WAV_NOT_PCM', errors: [{ audioFormat: fmt.audioFormat }] }
    );
  }

  if (fmt.numChannels !== WAV_CHANNELS) {
    throw new AppError(
      'Channel audio tidak sesuai. Sistem hanya menerima audio mono (1 channel).',
      400,
      { code: 'WAV_INVALID_CHANNELS', errors: [{ numChannels: fmt.numChannels }] }
    );
  }

  if (fmt.sampleRate !== WAV_SAMPLE_RATE) {
    throw new AppError(
      'Sample rate tidak sesuai. Sistem hanya menerima sample rate 16 kHz (16000 Hz).',
      400,
      { code: 'WAV_INVALID_SAMPLE_RATE', errors: [{ sampleRate: fmt.sampleRate }] }
    );
  }

  if (fmt.bitsPerSample !== WAV_BITS_PER_SAMPLE) {
    throw new AppError('Bit depth tidak sesuai. Sistem hanya menerima WAV PCM 16-bit.', 400, {
      code: 'WAV_INVALID_BIT_DEPTH',
      errors: [{ bitsPerSample: fmt.bitsPerSample }],
    });
  }
}

function buildWavBufferFromPcm16Mono(pcmData, sampleRate = WAV_SAMPLE_RATE) {
  // pcmData is Buffer of signed 16-bit little-endian samples
  const dataSize = pcmData.length;
  const headerSize = 44;
  const fileSizeMinus8 = headerSize - 8 + dataSize;

  const buffer = Buffer.alloc(headerSize + dataSize);

  // RIFF header
  buffer.write('RIFF', 0, 4, 'ascii');
  buffer.writeUInt32LE(fileSizeMinus8, 4);
  buffer.write('WAVE', 8, 4, 'ascii');

  // fmt chunk
  buffer.write('fmt ', 12, 4, 'ascii');
  buffer.writeUInt32LE(16, 16); // PCM fmt chunk size
  buffer.writeUInt16LE(1, 20); // audio format = 1 (PCM)
  buffer.writeUInt16LE(1, 22); // channels = 1
  buffer.writeUInt32LE(sampleRate, 24);
  const byteRate = sampleRate * 1 * 16 / 8;
  buffer.writeUInt32LE(byteRate, 28);
  const blockAlign = 1 * 16 / 8;
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // bits per sample

  // data chunk
  buffer.write('data', 36, 4, 'ascii');
  buffer.writeUInt32LE(dataSize, 40);

  // PCM data
  pcmData.copy(buffer, 44);

  return buffer;
}

function normalizeTo1Second(buffer, fmt, data) {
  const bytesPerSample = (fmt.bitsPerSample / 8) * fmt.numChannels; // 2 bytes
  const originalSamples = Math.floor(data.dataSize / bytesPerSample);

  const originalDurationSeconds = originalSamples / fmt.sampleRate;

  if (originalSamples > MAX_SAMPLES) {
    throw new AppError(
      `Durasi audio terlalu panjang. Maksimal ${MAX_SECONDS} detik.`,
      400,
      {
        code: 'WAV_DURATION_TOO_LONG',
        errors: [
          {
            maxSeconds: MAX_SECONDS,
            originalSeconds: originalDurationSeconds,
            originalSamples,
            sampleRate: fmt.sampleRate,
          },
        ],
      }
    );
  }

  const pcmStart = data.dataOffset;
  const pcmEnd = data.dataOffset + data.dataSize;
  const pcmOriginal = buffer.subarray(pcmStart, pcmEnd); // raw PCM bytes

  // Target PCM bytes for 1 second
  const targetBytes = TARGET_SAMPLES * bytesPerSample; // 16000 * 2 = 32000

  let pcmNormalized;

  if (originalSamples === TARGET_SAMPLES) {
    pcmNormalized = pcmOriginal;
  } else if (originalSamples < TARGET_SAMPLES) {
    // Zero padding at the end
    pcmNormalized = Buffer.alloc(targetBytes); // auto-filled with zeros
    pcmOriginal.copy(pcmNormalized, 0, 0, pcmOriginal.length);
  } else {
    // Truncate to first 1 second
    pcmNormalized = pcmOriginal.subarray(0, targetBytes);
  }

  const wavNormalized = buildWavBufferFromPcm16Mono(pcmNormalized, fmt.sampleRate);

  return {
    wavBuffer: wavNormalized,
    meta: {
      originalSamples,
      normalizedSamples: TARGET_SAMPLES,
      originalDurationSeconds,
      normalizedDurationSeconds: TARGET_SECONDS,
      operation:
        originalSamples === TARGET_SAMPLES
          ? 'none'
          : originalSamples < TARGET_SAMPLES
            ? 'pad'
            : 'truncate',
    },
  };
}

export function uploadAudio(req, res, next) {
  uploader(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(
          new AppError(
            `Ukuran file terlalu besar. Maksimal durasi ${MAX_SECONDS} detik untuk WAV PCM 16-bit mono 16 kHz.`,
            400,
            { code: 'FILE_TOO_LARGE' }
          )
        );
      }
      return next(err);
    }

    if (!req.file) {
      return next(
        new AppError('File audio wajib dikirim pada field "audio".', 400, {
          code: 'AUDIO_REQUIRED',
        })
      );
    }

    try {
      const { fmt, data } = parseWav(req.file.buffer);
      validateFormat(fmt);

      const { wavBuffer, meta } = normalizeTo1Second(req.file.buffer, fmt, data);

      // overwrite buffer with normalized 1-second wav
      req.file.buffer = wavBuffer;

      // attach metadata for later stages (proxy to AI, logging, etc.)
      req.audio = {
        sampleRate: fmt.sampleRate,
        channels: fmt.numChannels,
        bitsPerSample: fmt.bitsPerSample,
        ...meta,
      };

      return next();
    } catch (e) {
      return next(e);
    }
  });
}