"""
Audio Data Augmentation Utilities
Modul untuk augmentasi audio dengan berbagai teknik (pitch shift, time stretch, dll)
"""

import os
import random
import numpy as np
import librosa
import soundfile as sf
from glob import glob
from typing import List, Dict, Tuple, Optional

from . import augmentation_config as aug_config


# ===== 1. PITCH SHIFTING FUNCTIONS =====
def pitch_shift_audio(y: np.ndarray, sr: int, n_steps: float) -> np.ndarray:
    """
    Shift pitch audio tanpa mengubah durasi.
    
    Args:
        y: Audio time series
        sr: Sampling rate
        n_steps: Pitch shift dalam semitone (negatif untuk turun, positif untuk naik)
        
    Returns:
        Audio dengan pitch yang di-shift
    """
    return librosa.effects.pitch_shift(y, sr=sr, n_steps=n_steps)


# ===== 2. TIME STRETCHING FUNCTIONS =====
def time_stretch_audio(y: np.ndarray, rate: float) -> np.ndarray:
    """
    Stretch atau compress durasi audio tanpa mengubah pitch.
    
    Args:
        y: Audio time series
        rate: Stretch rate (< 1.0 untuk lambat, > 1.0 untuk cepat)
        
    Returns:
        Audio dengan durasi yang di-stretch
    """
    return librosa.effects.time_stretch(y, rate=rate)


# ===== 3. NORMALIZATION FUNCTIONS =====
def normalize_rms(y: np.ndarray, target_rms: float = aug_config.TARGET_RMS) -> np.ndarray:
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


def pad_or_truncate_audio(y: np.ndarray, target_samples: int) -> np.ndarray:
    """
    Seragamkan durasi audio dengan padding atau truncating.
    
    Args:
        y: Audio time series
        target_samples: Target jumlah samples
        
    Returns:
        Audio dengan target length
    """
    current_len = len(y)
    
    if current_len < target_samples:
        # Zero padding di akhir
        pad_width = target_samples - current_len
        return np.pad(y, (0, pad_width), 'constant', constant_values=0)
    elif current_len > target_samples:
        # Truncate: ambil bagian pertama
        return y[:target_samples]
    else:
        return y


# ===== 4. AUGMENTATION PIPELINE =====
def augment_single_audio(y: np.ndarray, sr: int, technique: str = "random") -> np.ndarray:
    """
    Apply single augmentation technique ke audio.
    
    Args:
        y: Audio time series
        sr: Sampling rate
        technique: "pitch" | "stretch" | "combined" | "random"
        
    Returns:
        Augmented audio
    """
    y_aug = y.copy()
    
    if technique == "pitch":
        if aug_config.ENABLE_PITCH_SHIFT:
            n_steps = random.uniform(aug_config.PITCH_SHIFT_MIN, aug_config.PITCH_SHIFT_MAX)
            y_aug = pitch_shift_audio(y_aug, sr, n_steps)
    
    elif technique == "stretch":
        if aug_config.ENABLE_TIME_STRETCH:
            rate = random.uniform(aug_config.TIME_STRETCH_MIN, aug_config.TIME_STRETCH_MAX)
            y_aug = time_stretch_audio(y_aug, rate)
    
    elif technique == "combined":
        if aug_config.ENABLE_PITCH_SHIFT:
            n_steps = random.uniform(aug_config.PITCH_SHIFT_MIN, aug_config.PITCH_SHIFT_MAX)
            y_aug = pitch_shift_audio(y_aug, sr, n_steps)
        
        if aug_config.ENABLE_TIME_STRETCH and random.random() < aug_config.TIME_STRETCH_PROBABILITY:
            rate = random.uniform(aug_config.TIME_STRETCH_MIN, aug_config.TIME_STRETCH_MAX)
            y_aug = time_stretch_audio(y_aug, rate)
    
    elif technique == "random":
        techniques = []
        if aug_config.ENABLE_PITCH_SHIFT:
            techniques.append("pitch")
        if aug_config.ENABLE_TIME_STRETCH:
            techniques.append("stretch")
        
        if techniques:
            chosen_tech = random.choice(techniques)
            if chosen_tech == "pitch":
                n_steps = random.uniform(aug_config.PITCH_SHIFT_MIN, aug_config.PITCH_SHIFT_MAX)
                y_aug = pitch_shift_audio(y_aug, sr, n_steps)
            elif chosen_tech == "stretch":
                rate = random.uniform(aug_config.TIME_STRETCH_MIN, aug_config.TIME_STRETCH_MAX)
                y_aug = time_stretch_audio(y_aug, rate)
    
    # Normalisasi RMS
    if aug_config.ENABLE_RMS_NORMALIZATION:
        y_aug = normalize_rms(y_aug)
    
    return y_aug


# ===== 5. LABEL DIRECTORY FUNCTIONS =====
def get_file_count(label_dir: str) -> int:
    """
    Hitung jumlah file .wav di direktori label.
    
    Args:
        label_dir: Path ke direktori label
        
    Returns:
        Jumlah file
    """
    if not os.path.exists(label_dir):
        return 0
    return len(glob(os.path.join(label_dir, "*.wav")))


def load_audio_files(label_dir: str, sr: int = aug_config.SAMPLE_RATE) -> List[np.ndarray]:
    """
    Load semua file audio dari direktori label.
    
    Args:
        label_dir: Path ke direktori label
        sr: Sampling rate untuk loading
        
    Returns:
        List of audio arrays
    """
    files = glob(os.path.join(label_dir, "*.wav"))
    audios = []
    
    for file_path in files:
        try:
            y, _ = librosa.load(file_path, sr=sr)
            if len(y) > 0:
                audios.append(y)
        except Exception as e:
            if aug_config.VERBOSE:
                print(f"   ⚠️  Gagal load {file_path}: {e}")
    
    return audios


def augment_label_to_target(label_dir: str, label: str, 
                           target_count: int = aug_config.TARGET_SAMPLES_PER_LABEL,
                           sr: int = aug_config.SAMPLE_RATE) -> Tuple[int, int]:
    """
    Augmentasi audio di label_dir hingga mencapai target_count.
    
    Args:
        label_dir: Path ke direktori label
        label: Nama label untuk logging
        target_count: Target jumlah file
        sr: Sampling rate
        
    Returns:
        Tuple (current_count, generated_count)
    """
    files = glob(os.path.join(label_dir, "*.wav"))
    current_count = len(files)
    
    if current_count >= target_count:
        if aug_config.VERBOSE:
            print(f"   ✅ {label}: sudah {current_count} file (target: {target_count})")
        return current_count, 0
    
    if aug_config.VERBOSE:
        print(f"   ⚠️  {label}: hanya {current_count}/{target_count} file, augmentasi...")
    
    needed = target_count - current_count
    
    # Load base audios
    base_audios = load_audio_files(label_dir, sr)
    
    if not base_audios:
        if aug_config.VERBOSE:
            print(f"   ❌ {label}: tidak ada file audio valid")
        return current_count, 0
    
    # Generate augmented files
    generated = 0
    for i in range(needed):
        try:
            # Random pick base audio
            y_base = random.choice(base_audios).copy()
            
            # Apply augmentation
            y_aug = augment_single_audio(y_base, sr, technique="random")
            
            # Save
            new_filename = f"{label}_aug_{current_count + generated + 1:04d}.wav"
            new_path = os.path.join(label_dir, new_filename)
            sf.write(new_path, y_aug, sr)
            generated += 1
            
        except Exception as e:
            if aug_config.VERBOSE:
                print(f"   ⚠️  Error generating file {i+1}: {e}")
    
    if aug_config.VERBOSE:
        print(f"   ✅ {label}: generated {generated} files (total: {current_count + generated})")
    
    return current_count + generated, generated


# ===== 6. DURATION NORMALIZATION =====
def normalize_duration_in_label(label_dir: str, label: str,
                               target_duration: float = aug_config.TARGET_DURATION_SEC,
                               sr: int = aug_config.SAMPLE_RATE) -> int:
    """
    Seragamkan durasi semua file di label_dir.
    
    Args:
        label_dir: Path ke direktori label
        label: Nama label untuk logging
        target_duration: Target durasi dalam detik
        sr: Sampling rate
        
    Returns:
        Jumlah file yang di-normalize
    """
    files = glob(os.path.join(label_dir, "*.wav"))
    target_samples = int(target_duration * sr)
    modified = 0
    
    for file_path in files:
        try:
            y, sr_current = librosa.load(file_path, sr=sr)
            y_normalized = pad_or_truncate_audio(y, target_samples)
            
            # Hanya save jika ada perubahan
            if len(y) != len(y_normalized):
                sf.write(file_path, y_normalized, sr)
                modified += 1
        except Exception as e:
            if aug_config.VERBOSE:
                print(f"   ⚠️  Error normalizing {file_path}: {e}")
    
    if modified > 0 and aug_config.VERBOSE:
        print(f"   ✅ {label}: normalized {modified} files to {target_duration}s")
    
    return modified


# ===== 7. AUGMENTATION STATISTICS =====
def get_label_statistics(labels: List[str], source_dir: str) -> Dict:
    """
    Get statistik jumlah file per label sebelum dan sesudah augmentasi.
    
    Args:
        labels: List of label names
        source_dir: Source directory
        
    Returns:
        Dictionary dengan statistik
    """
    stats = {}
    for label in labels:
        label_dir = os.path.join(source_dir, label)
        count = get_file_count(label_dir)
        stats[label] = {
            "count": count,
            "status": "OK" if count >= aug_config.TARGET_SAMPLES_PER_LABEL else "NEEDS_AUG"
        }
    return stats


def print_augmentation_report(stats: Dict, augmented_count: Dict) -> str:
    """
    Generate augmentation report.
    
    Args:
        stats: Statistik sebelum augmentasi
        augmented_count: Jumlah file yang di-generate
        
    Returns:
        Report string
    """
    report = "\n" + "="*60 + "\n"
    report += "AUGMENTATION REPORT\n"
    report += "="*60 + "\n\n"
    
    total_before = sum(s["count"] for s in stats.values())
    total_generated = sum(augmented_count.values())
    total_after = total_before + total_generated
    
    report += f"Total files BEFORE: {total_before}\n"
    report += f"Total files GENERATED: {total_generated}\n"
    report += f"Total files AFTER: {total_after}\n\n"
    
    report += "Per-Label Summary:\n"
    report += "-"*60 + "\n"
    
    for label in sorted(stats.keys()):
        before = stats[label]["count"]
        generated = augmented_count.get(label, 0)
        after = before + generated
        status = "✅" if after >= aug_config.TARGET_SAMPLES_PER_LABEL else "⚠️"
        report += f"{status} {label:10s}: {before:3d} → {generated:3d} generated → {after:3d}\n"
    
    report += "="*60 + "\n"
    
    return report
