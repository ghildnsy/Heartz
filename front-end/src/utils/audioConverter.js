import { WaveFile } from 'wavefile';

const TARGET_SAMPLE_RATE = 16000;
const MAX_SECONDS = 5;

export async function convertToWav(inputBlob) {
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextCtor || !window.OfflineAudioContext) {
    throw new Error('Browser tidak mendukung pemrosesan audio.');
  }

  const audioContext = new AudioContextCtor();
  const arrayBuffer = await inputBlob.arrayBuffer();
  let decoded;

  try {
    decoded = await audioContext.decodeAudioData(arrayBuffer);
  } finally {
    await audioContext.close();
  }

  const mono = downmixToMono(decoded);
  const resampled =
    decoded.sampleRate === TARGET_SAMPLE_RATE
      ? mono
      : await resample(mono, decoded.sampleRate, TARGET_SAMPLE_RATE);

  const pcm16 = float32ToInt16(resampled);
  const wav = new WaveFile();
  wav.fromScratch(1, TARGET_SAMPLE_RATE, '16', Array.from(pcm16));

  return new Blob([wav.toBuffer()], { type: 'audio/wav' });
}

function downmixToMono(audioBuffer) {
  const maxSamples = Math.min(audioBuffer.length, Math.floor(audioBuffer.sampleRate * MAX_SECONDS));
  const mono = new Float32Array(maxSamples);

  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
    const data = audioBuffer.getChannelData(channel);
    for (let index = 0; index < maxSamples; index += 1) {
      mono[index] += data[index] / audioBuffer.numberOfChannels;
    }
  }

  return mono;
}

async function resample(data, fromRate, toRate) {
  const outputLength = Math.ceil((data.length * toRate) / fromRate);
  const offlineContext = new OfflineAudioContext(1, outputLength, toRate);
  const buffer = offlineContext.createBuffer(1, data.length, fromRate);

  buffer.copyToChannel(data, 0);

  const source = offlineContext.createBufferSource();
  source.buffer = buffer;
  source.connect(offlineContext.destination);
  source.start();

  const rendered = await offlineContext.startRendering();
  return rendered.getChannelData(0);
}

function float32ToInt16(input) {
  const output = new Int16Array(input.length);

  for (let index = 0; index < input.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, input[index]));
    output[index] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }

  return output;
}
