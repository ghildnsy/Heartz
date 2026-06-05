"""Audio loading utilities for Heartz inference/evaluation.

Design goals:
- Accept arbitrary WAV sample rates for inference/evaluation (resample to 16 kHz).
- Produce a fixed-length 1s mono waveform (16000 samples) as float32.

Cropping behavior (important):
- After resampling, if the clip is longer than 1s, we pick the 1-second window with maximum energy.
- If shorter, we pad zeros at the end.
- This does NOT perform voice activity detection (VAD); it can still be fooled by loud noise.

Note: The training notebook may assume the dataset is already 16 kHz. These utilities
are intentionally more forgiving for real-world inference.
"""

from __future__ import annotations

import io
from math import gcd
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

SAMPLE_RATE = 16_000
NUM_SAMPLES = 16_000


def select_max_energy_window(
    audio: np.ndarray,
    window_size: int,
    hop_size: int,
) -> np.ndarray:
    """Select a fixed-length window with maximum energy.

    Energy is computed in the time domain as mean(square(samples)).
    This helps pick the most "spoken" 1-second region when the user clip is longer.

    Notes:
    - This is not VAD; it will pick any high-energy region (including loud noise).
    - `hop_size` trades off speed vs accuracy.
    """

    if window_size <= 0:
        raise ValueError("window_size must be > 0")
    if hop_size <= 0:
        raise ValueError("hop_size must be > 0")

    if audio.size <= window_size:
        return audio

    total = int(audio.size)
    last_start = total - window_size

    starts = np.arange(0, last_start + 1, hop_size, dtype=np.int32)
    if starts.size == 0 or int(starts[-1]) != last_start:
        starts = np.append(starts, np.int32(last_start))

    # Compute energy per candidate window.
    # Keep it simple and robust; typical inputs are short (a few seconds).
    energies = np.empty(starts.size, dtype=np.float32)
    audio_f = audio.astype(np.float32, copy=False)
    for idx, start in enumerate(starts):
        chunk = audio_f[int(start) : int(start) + window_size]
        energies[idx] = float(np.mean(chunk * chunk))

    best_start = int(starts[int(np.argmax(energies))])
    return audio_f[best_start : best_start + window_size]


def load_wav_bytes_to_waveform(content: bytes) -> np.ndarray:
    audio, sr = sf.read(io.BytesIO(content), dtype="float32", always_2d=False)

    if audio.ndim == 2:
        audio = np.mean(audio, axis=1)

    if int(sr) != SAMPLE_RATE:
        divisor = gcd(int(sr), SAMPLE_RATE)
        up = SAMPLE_RATE // divisor
        down = int(sr) // divisor
        audio = resample_poly(audio, up, down).astype(np.float32)

    if len(audio) < NUM_SAMPLES:
        audio = np.pad(audio, (0, NUM_SAMPLES - len(audio)))
    elif len(audio) > NUM_SAMPLES:
        # Pick the most energetic 1-second window instead of always taking the first second.
        # 50ms hop is a good balance for short user clips.
        audio = select_max_energy_window(audio, window_size=NUM_SAMPLES, hop_size=800)

    return audio.astype(np.float32)


def load_wav_file_to_waveform(path: str | Path) -> np.ndarray:
    path = Path(path)
    return load_wav_bytes_to_waveform(path.read_bytes())
