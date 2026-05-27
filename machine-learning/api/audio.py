"""Audio loading utilities for Heartz inference/evaluation.

Design goals:
- Accept arbitrary WAV sample rates for inference/evaluation (resample to 16 kHz).
- Produce a fixed-length 1s mono waveform (16000 samples) as float32.

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
    else:
        audio = audio[:NUM_SAMPLES]

    return audio.astype(np.float32)


def load_wav_file_to_waveform(path: str | Path) -> np.ndarray:
    path = Path(path)
    return load_wav_bytes_to_waveform(path.read_bytes())
