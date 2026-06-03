"""
YouTube Audio Scraper & Data Augmentation Pipeline
Package untuk scraping audio dari YouTube, augmentasi data, transkripsi, dan ekstraksi fitur.
Dengan support untuk indexed paths (auto-incrementing folder names)
"""

__version__ = "2.1.0"
__author__ = "Data Science Team"

from . import config
from . import audio_processor
from . import scraper
from . import path_manager
from . import augmentation_config
from . import audio_augmenter
from . import augmentation_pipeline

# Expose main functions - Scraping
from .scraper import process_youtube_video, process_youtube_video_indexed, process_multiple_videos
from .audio_processor import (
    validate_youtube_url,
    download_audio,
    clean_audio_file,
    transcribe_words,
    syllabify,
    extract_features_from_audio_chunk,
)
from .path_manager import (
    setup_run_directories,
    get_next_index,
    get_indexed_path,
    get_run_info,
)

# Expose main functions - Augmentation
from .augmentation_pipeline import (
    run_augmentation_pipeline,
    setup_augmentation_run,
    get_source_data,
)
from .audio_augmenter import (
    pitch_shift_audio,
    time_stretch_audio,
    normalize_rms,
    pad_or_truncate_audio,
    augment_single_audio,
    augment_label_to_target,
    normalize_duration_in_label,
    get_label_statistics,
)

__all__ = [
    # Modules
    "config",
    "audio_processor",
    "scraper",
    "path_manager",
    "augmentation_config",
    "audio_augmenter",
    "augmentation_pipeline",
    # Scraping functions
    "process_youtube_video",
    "process_youtube_video_indexed",
    "process_multiple_videos",
    "validate_youtube_url",
    "download_audio",
    "clean_audio_file",
    "transcribe_words",
    "syllabify",
    "extract_features_from_audio_chunk",
    "setup_run_directories",
    "get_next_index",
    "get_indexed_path",
    "get_run_info",
    # Augmentation functions
    "run_augmentation_pipeline",
    "setup_augmentation_run",
    "get_source_data",
    "pitch_shift_audio",
    "time_stretch_audio",
    "normalize_rms",
    "pad_or_truncate_audio",
    "augment_single_audio",
    "augment_label_to_target",
    "normalize_duration_in_label",
    "get_label_statistics",
]
