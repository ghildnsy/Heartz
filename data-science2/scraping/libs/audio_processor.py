"""
Audio Processing Utilities
Modul ini berisi semua fungsi untuk pemrosesan audio, termasuk:
- Filtering (bandpass)
- Denoising
- Normalisasi
- Transkripsi
- Syllabifikasi
- Segmentasi audio
- Ekstraksi fitur
"""

import os
import numpy as np
import pandas as pd
import librosa
import soundfile as sf
import noisereduce as nr
import torch
import whisperx
import yt_dlp
import subprocess
from scipy.signal import butter, sosfilt
from pydub import AudioSegment
from typing import List, Dict, Tuple, Optional

from . import config
from . import ffmpeg_checker


# ===== 1. BANDPASS FILTER FUNCTIONS =====
def butter_bandpass(lowcut: float, highcut: float, fs: float, order: int = 4) -> np.ndarray:
    """
    Desain Butterworth bandpass filter.
    
    Args:
        lowcut: Frekuensi cutoff bawah (Hz)
        highcut: Frekuensi cutoff atas (Hz)
        fs: Sampling rate (Hz)
        order: Orde filter
        
    Returns:
        SOS (Second-order sections) array
    """
    nyquist = 0.5 * fs
    low = lowcut / nyquist
    high = highcut / nyquist
    sos = butter(order, [low, high], btype='band', output='sos')
    return sos


def apply_bandpass(y: np.ndarray, sr: float, lowcut: float = config.BANDPASS_LOWCUT,
                   highcut: float = config.BANDPASS_HIGHCUT, order: int = config.BANDPASS_ORDER) -> np.ndarray:
    """
    Terapkan bandpass filter untuk mempertahankan frekuensi suara manusia.
    
    Args:
        y: Audio time series
        sr: Sampling rate
        lowcut: Frekuensi cutoff bawah (Hz)
        highcut: Frekuensi cutoff atas (Hz)
        order: Orde filter
        
    Returns:
        Audio yang sudah difilter
    """
    sos = butter_bandpass(lowcut, highcut, sr, order)
    y_filtered = sosfilt(sos, y)
    return y_filtered


# ===== 2. DENOISING FUNCTIONS =====
def denoise_audio(y: np.ndarray, sr: float, stationary: bool = config.DENOISE_STATIONARY,
                  prop_decrease: float = config.DENOISE_PROP_DECREASE) -> np.ndarray:
    """
    Mengurangi noise dari audio menggunakan spectral gating.
    
    Args:
        y: Audio time series
        sr: Sampling rate
        stationary: Jika True, gunakan mode stationary
        prop_decrease: Besarnya penurunan noise (0-1)
        
    Returns:
        Audio yang sudah di-denoise
    """
    if len(y) < sr * config.MIN_AUDIO_LENGTH_SEC:
        # Audio terlalu pendek, gunakan mode non-stationary
        y_clean = nr.reduce_noise(y=y, sr=sr, stationary=False, prop_decrease=prop_decrease)
    else:
        y_clean = nr.reduce_noise(y=y, sr=sr, stationary=stationary, prop_decrease=prop_decrease)
    return y_clean


# ===== 3. NORMALISASI FUNCTIONS =====
def normalize_rms(y: np.ndarray, target_rms: float = config.TARGET_RMS) -> np.ndarray:
    """
    Normalisasi audio berdasarkan RMS (Root Mean Square).
    
    Args:
        y: Audio time series
        target_rms: Target RMS value
        
    Returns:
        Audio yang sudah dinormalisasi
    """
    rms = np.sqrt(np.mean(y**2))
    if rms > 0:
        return y * (target_rms / rms)
    return y


# ===== 4. CLEAN AUDIO PIPELINE =====
def clean_audio_file(input_path: str, output_path: Optional[str] = None) -> str:
    """
    Pipeline lengkap untuk membersihkan audio:
    1. Denoising
    2. Bandpass filter
    3. Normalisasi volume
    
    Args:
        input_path: Path ke file audio input
        output_path: Path untuk menyimpan audio bersih (optional)
        
    Returns:
        Path ke file audio yang sudah dibersihkan
    """
    if output_path is None:
        base, ext = os.path.splitext(input_path)
        output_path = f"{base}_cleaned{ext}"

    # Baca audio dengan sample rate 16 kHz
    y, sr = librosa.load(input_path, sr=config.SAMPLE_RATE)
    if len(y) == 0:
        print(f"⚠️  Peringatan: {input_path} kosong, tidak diproses.")
        return input_path

    # 1. Denoising
    y_denoised = denoise_audio(y, sr)
    
    # 2. Bandpass filter (suara manusia)
    y_filtered = apply_bandpass(y_denoised, sr)
    
    # 3. Normalisasi volume
    y_normalized = normalize_rms(y_filtered)

    # Simpan sebagai WAV
    sf.write(output_path, y_normalized, sr)
    print(f"   ✓ Audio bersih disimpan ke: {output_path}")
    return output_path


# ===== 5. YOUTUBE DOWNLOAD FUNCTIONS =====
def download_audio(youtube_url: str, output_dir: str = config.TEMP_AUDIO_DIR) -> Optional[str]:
    """
    Unduh audio dari YouTube dan konversi ke format WAV.
    
    Strategy:
    1. Try dengan FFmpeg (jika tersedia) - fastest & best quality
    2. Fallback dengan librosa - jika FFmpeg tidak ada
    
    Args:
        youtube_url: URL YouTube
        output_dir: Direktori output untuk menyimpan file audio
        
    Returns:
        Path ke file audio yang diunduh, atau None jika gagal
    """
    os.makedirs(output_dir, exist_ok=True)
    
    # Check FFmpeg availability
    ffmpeg_available, ffmpeg_path = ffmpeg_checker.check_ffmpeg_installed()
    
    if not ffmpeg_available:
        print("   ⚠️  FFmpeg tidak terdeteksi. Akan menggunakan fallback method (librosa)...")
        print("       Untuk hasil optimal, install FFmpeg:")
        ffmpeg_checker.print_ffmpeg_installation_guide()
    
    # Try dengan subprocess + yt-dlp CLI (method 1 - terbaik, dengan Node.js runtime)
    if ffmpeg_available:
        try:
            print(f"   - Downloading dengan FFmpeg + yt-dlp CLI (Node.js runtime)...")
            cmd = [
                'yt-dlp',
                '--js-runtimes', 'node',
                '--remote-components', 'ejs:github',
                '-x',  # Extract audio
                '-f', config.YOUTUBE_DL_FORMAT,
                '-o', os.path.join(output_dir, 'original_audio.%(ext)s'),
                '--audio-format', config.YOUTUBE_DL_AUDIO_CODEC,
                '--audio-quality', str(config.YOUTUBE_DL_AUDIO_QUALITY),
                '--no-check-certificate',
                youtube_url
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            
            if result.returncode == 0:
                # Check if audio file was created
                for f in os.listdir(output_dir):
                    if f.startswith('original_audio'):
                        file_path = os.path.join(output_dir, f)
                        file_size = os.path.getsize(file_path) / (1024*1024)
                        print(f"   ✓ Download OK ({file_size:.1f}MB): {f}")
                        
                        # Convert to WAV if not already
                        if not f.endswith('.wav'):
                            y, sr = librosa.load(file_path, sr=config.SAMPLE_RATE, mono=True)
                            wav_path = os.path.join(output_dir, 'original_audio.wav')
                            sf.write(wav_path, y, sr)
                            try:
                                os.remove(file_path)
                            except:
                                pass
                            return wav_path
                        return file_path
            else:
                error_msg = result.stderr[:200] if result.stderr else str(result.returncode)
                print(f"   ⚠️  CLI method gagal: {error_msg}")
        except FileNotFoundError:
            print("   ⚠️  yt-dlp CLI tidak ditemukan, menggunakan Python API...")
        except Exception as e:
            print(f"   ⚠️  CLI method error: {str(e)[:100]}")
    
    # Try dengan FFmpeg (method 2 - Python API)
    if ffmpeg_available:
        ydl_opts_ffmpeg = {
            'format': config.YOUTUBE_DL_FORMAT,
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': config.YOUTUBE_DL_AUDIO_CODEC,
                'preferredquality': config.YOUTUBE_DL_AUDIO_QUALITY,
            }],
            'outtmpl': os.path.join(output_dir, 'original_audio.%(ext)s'),
            'quiet': False,
            'no_check_certificate': True,
            'ffmpeg_location': os.path.dirname(ffmpeg_path) if ffmpeg_path != 'ffmpeg' else None,
        }
        
        try:
            print(f"   - Downloading dengan FFmpeg (Python API)...")
            with yt_dlp.YoutubeDL(ydl_opts_ffmpeg) as ydl:
                ydl.download([youtube_url])
            
            # Check if WAV exists
            for f in os.listdir(output_dir):
                if f.endswith(".wav"):
                    file_path = os.path.join(output_dir, f)
                    file_size = os.path.getsize(file_path) / (1024*1024)  # MB
                    print(f"   ✓ Download OK ({file_size:.1f}MB): {f}")
                    return file_path
        except Exception as e:
            print(f"   ⚠️  FFmpeg API method gagal: {str(e)[:100]}")
    
    # Attempt 3: Fallback - Download format lain dan convert dengan librosa
    print("   - Fallback: Downloading dengan librosa...")
    
    ydl_opts_fallback = {
        'format': 'best[ext=m4a]/best[ext=webm]/best[ext=mp3]/best',
        'outtmpl': os.path.join(output_dir, 'original_audio.%(ext)s'),
        'quiet': False,
        'no_check_certificate': True,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts_fallback) as ydl:
            info = ydl.extract_info(youtube_url, download=True)
            print(f"   ✓ Video download OK: {info.get('title', 'unknown')}")
        
        # Find downloaded file
        downloaded_file = None
        for f in os.listdir(output_dir):
            if f.startswith("original_audio") and not f.endswith(".wav"):
                downloaded_file = os.path.join(output_dir, f)
                break
        
        if downloaded_file is None:
            print(f"   ❌ Audio file tidak ditemukan setelah download")
            return None
        
        file_size = os.path.getsize(downloaded_file) / (1024*1024)
        print(f"   - Converting {os.path.basename(downloaded_file)} ({file_size:.1f}MB) to WAV...")
        
        # Convert to WAV using librosa + soundfile
        y, sr = librosa.load(downloaded_file, sr=config.SAMPLE_RATE, mono=True)
        
        if len(y) == 0:
            print(f"   ❌ Audio loading gagal atau file kosong")
            return None
        
        wav_output = os.path.join(output_dir, "original_audio.wav")
        sf.write(wav_output, y, sr)
        
        # Remove original file
        try:
            os.remove(downloaded_file)
        except Exception:
            pass
        
        wav_size = os.path.getsize(wav_output) / (1024*1024)
        print(f"   ✓ Conversion OK: {wav_size:.1f}MB WAV file")
        return wav_output
        
    except Exception as e:
        error_msg = str(e)[:150]
        print(f"   ❌ Download gagal: {error_msg}")
        
        if "unable to extract" in error_msg.lower() or "no matching format" in error_msg.lower():
            print(f"       Kemungkinan video tidak punya audio atau video private/geo-restricted")
        
        return None


# ===== 6. TRANSCRIPTION FUNCTIONS =====
def transcribe_words(audio_path: str) -> List[Dict]:
    """
    Transkripsi audio menggunakan WhisperX dengan alignment.
    Mengembalikan daftar kata dengan timestamp.
    
    Args:
        audio_path: Path ke file audio
        
    Returns:
        List of dictionaries dengan format:
        {
            "text": str,
            "start": float,
            "end": float,
            "confidence": float
        }
    """
    device = "cuda" if torch.cuda.is_available() else "cpu"
    compute_type = "float16" if device == "cuda" else "int8"
    
    print(f"   - Menggunakan device: {device}")
    print(f"   - Loading WhisperX model '{config.WHISPER_MODEL}'...")
    print(f"   - Language: Bahasa Indonesia (id)")
    
    model = whisperx.load_model(config.WHISPER_MODEL, device, compute_type=compute_type)
    result = model.transcribe(audio_path, batch_size=config.WHISPER_BATCH_SIZE, language=config.WHISPER_LANGUAGE)
    
    print(f"   - Loading alignment model...")
    align_model, align_metadata = whisperx.load_align_model(
        language_code=config.ALIGN_LANGUAGE_CODE,
        device=device,
        model_name=config.ALIGN_MODEL_NAME
    )
    
    result_aligned = whisperx.align(
        result["segments"],
        align_model,
        align_metadata,
        audio_path,
        device
    )
    
    # Extract words dengan timestamp
    words = []
    for seg in result_aligned["segments"]:
        for word in seg.get("words", []):
            words.append({
                "text": word["word"].strip(),
                "start": word["start"],
                "end": word["end"],
                "confidence": word.get("confidence", 0.0)
            })
    
    # Bersihkan memory
    del model, align_model
    torch.cuda.empty_cache()
    
    return words


# ===== 7. SYLLABIFICATION FUNCTIONS =====
def syllabify(word: str) -> List[str]:
    """
    Pecah kata menjadi suku kata berdasarkan vokal.
    
    Args:
        word: Kata untuk dipecah
        
    Returns:
        List of syllables
    """
    vowels = set('aiueo')
    syllables = []
    current = ""
    
    for ch in word.lower():
        if ch in vowels:
            current += ch
            syllables.append(current)
            current = ""
        else:
            current += ch
    
    if current:
        if syllables:
            syllables[-1] += current
        else:
            syllables.append(current)
    
    return syllables if syllables else [word]


# ===== 8. AUDIO SEGMENTATION FUNCTIONS =====
def split_word_into_syllables_audio(audio_path: str, word_start: float, word_end: float,
                                   syllables: List[str]) -> List[Dict]:
    """
    Segmentasi audio kata menjadi segmen per suku kata.
    
    Args:
        audio_path: Path ke file audio
        word_start: Start time kata dalam detik
        word_end: End time kata dalam detik
        syllables: List of syllables dari kata
        
    Returns:
        List of segmentation data dengan audio chunks
    """
    audio = AudioSegment.from_wav(audio_path)
    word_duration = (word_end - word_start) * 1000  # dalam ms
    start_ms = word_start * 1000
    syllable_duration = word_duration / len(syllables)
    
    segments = []
    for i, syll in enumerate(syllables):
        seg_start = start_ms + i * syllable_duration
        seg_end = seg_start + syllable_duration
        
        if seg_end > (word_end * 1000):
            seg_end = word_end * 1000
        
        chunk = audio[int(seg_start):int(seg_end)]
        segments.append({
            "syllable_text": syll,
            "start_sec": seg_start / 1000.0,
            "end_sec": seg_end / 1000.0,
            "duration_sec": (seg_end - seg_start) / 1000.0,
            "audio_chunk": chunk
        })
    
    return segments


# ===== 9. FEATURE EXTRACTION FUNCTIONS =====
def extract_features_from_audio_chunk(chunk: AudioSegment, sample_rate: int = config.SAMPLE_RATE) -> Optional[Dict]:
    """
    Ekstraksi fitur audio dari audio chunk.
    
    Fitur yang diekstraksi:
    - Duration
    - Zero Crossing Rate (ZCR)
    - RMS Energy
    - Spectral Centroid
    - MFCC (13 coefficients)
    - F0 (Fundamental Frequency)
    
    Args:
        chunk: AudioSegment chunk
        sample_rate: Sampling rate
        
    Returns:
        Dictionary berisi features, atau None jika error
    """
    # Konversi AudioSegment ke numpy array
    samples = np.array(chunk.get_array_of_samples(), dtype=np.float32)
    
    if chunk.channels == 2:
        samples = samples.reshape((-1, 2)).mean(axis=1)
    
    samples = samples / (2**15)
    
    if len(samples) == 0:
        return None
    
    y = samples
    sr = sample_rate
    duration = len(y) / sr
    
    # Extract features
    zcr = np.mean(librosa.feature.zero_crossing_rate(y))
    rms = np.sqrt(np.mean(y**2))
    spec_cent = np.mean(librosa.feature.spectral_centroid(y=y, sr=sr))
    
    # MFCC features
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=config.MFCC_N_COEFFICIENTS)
    mfcc_mean = np.mean(mfcc, axis=1)
    mfcc_std = np.std(mfcc, axis=1)
    
    # Fundamental frequency
    f0, _, _ = librosa.pyin(y, fmin=config.F0_MIN_FREQUENCY, fmax=config.F0_MAX_FREQUENCY, sr=sr)
    f0_mean = np.nanmean(f0)
    
    features = {
        "duration_sec": duration,
        "zcr": zcr,
        "rms": rms,
        "spectral_centroid": spec_cent,
        "f0_mean": f0_mean if not np.isnan(f0_mean) else 0.0,
    }
    
    # Add MFCC coefficients
    for i in range(config.MFCC_N_COEFFICIENTS):
        features[f"mfcc_{i+1}_mean"] = float(mfcc_mean[i])
        features[f"mfcc_{i+1}_std"] = float(mfcc_std[i])
    
    return features


# ===== 10. VALIDATION FUNCTIONS =====
def validate_youtube_url(url: str) -> bool:
    """
    Validasi format YouTube URL.
    
    Args:
        url: URL untuk divalidasi
        
    Returns:
        True jika valid, False sebaliknya
    """
    valid_domains = ['youtube.com', 'youtu.be', 'www.youtube.com']
    return any(domain in url for domain in valid_domains)
