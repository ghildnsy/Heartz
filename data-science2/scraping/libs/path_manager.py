"""
Path Management Utilities
Fungsi untuk mengelola indexed paths dan folder structures
"""

import os
import re
from pathlib import Path


def get_next_index(base_dir: str, prefix: str = "temp_audio", pattern: str = None) -> int:
    """
    Cari index terakhir dari pattern dan return index berikutnya.
    
    Args:
        base_dir: Direktori untuk scanning
        prefix: Prefix nama folder (default: "temp_audio")
        pattern: Custom regex pattern (optional)
        
    Returns:
        Index berikutnya (dimulai dari 1)
        
    Example:
        >>> get_next_index("scraped", "temp_audio")
        3  # Jika ada temp_audio_1, temp_audio_2, maka return 3
    """
    if not os.path.exists(base_dir):
        return 1
    
    if pattern is None:
        pattern = rf"^{re.escape(prefix)}_(\d+)$"
    
    indexes = []
    for item in os.listdir(base_dir):
        match = re.match(pattern, item)
        if match:
            try:
                idx = int(match.group(1))
                indexes.append(idx)
            except (ValueError, IndexError):
                continue
    
    return max(indexes) + 1 if indexes else 1


def get_indexed_path(base_dir: str, prefix: str = "temp_audio") -> tuple:
    """
    Generate path dengan indexing otomatis.
    
    Args:
        base_dir: Direktori base (misal: "scraped")
        prefix: Prefix nama (misal: "temp_audio")
        
    Returns:
        Tuple (index, full_path)
        
    Example:
        >>> get_indexed_path("scraped", "temp_audio")
        (1, "scraped/temp_audio_1")
    """
    os.makedirs(base_dir, exist_ok=True)
    next_index = get_next_index(base_dir, prefix)
    path = os.path.join(base_dir, f"{prefix}_{next_index}")
    return next_index, path


def setup_run_directories(base_dir: str = "scraped", run_index: int = None) -> dict:
    """
    Setup semua direktori untuk run baru dengan auto-indexing.
    
    Args:
        base_dir: Direktori base untuk semua results
        run_index: Index run (optional, akan auto-generate jika None)
        
    Returns:
        Dictionary berisi paths untuk run ini:
        {
            "run_index": int,
            "temp_audio_dir": str,
            "output_dir": str,
            "dataset_filename": str,
            "extracted_dir": str
        }
        
    Example:
        >>> setup_run_directories()
        {
            "run_index": 1,
            "temp_audio_dir": "scraped/temp_audio_1",
            "output_dir": "scraped",
            "dataset_filename": "scraped/syllable_dataset_1.csv",
            "extracted_dir": "scraped/extracted_syllables_1"
        }
    """
    # Create base directory
    os.makedirs(base_dir, exist_ok=True)
    
    # Get index
    if run_index is None:
        run_index = get_next_index(base_dir, "temp_audio")
    
    # Generate paths
    paths = {
        "run_index": run_index,
        "temp_audio_dir": os.path.join(base_dir, f"temp_audio_{run_index}"),
        "output_dir": base_dir,
        "dataset_filename": os.path.join(base_dir, f"syllable_dataset_{run_index}.csv"),
        "extracted_dir": os.path.join(base_dir, f"extracted_syllables_{run_index}"),
    }
    
    # Create directories
    os.makedirs(paths["temp_audio_dir"], exist_ok=True)
    os.makedirs(paths["extracted_dir"], exist_ok=True)
    
    return paths


def get_run_info(base_dir: str = "scraped") -> dict:
    """
    Dapatkan informasi tentang semua runs yang sudah dilakukan.
    
    Args:
        base_dir: Direktori base
        
    Returns:
        Dictionary berisi info runs
    """
    if not os.path.exists(base_dir):
        return {"total_runs": 0, "runs": [], "next_index": 1}
    
    runs = []
    for item in os.listdir(base_dir):
        if item.startswith("temp_audio_"):
            match = re.match(r"temp_audio_(\d+)", item)
            if match:
                idx = int(match.group(1))
                runs.append(idx)
    
    runs.sort()
    
    return {
        "total_runs": len(runs),
        "runs": runs,
        "next_index": max(runs) + 1 if runs else 1,
    }
