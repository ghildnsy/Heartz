"""
Data Augmentation Pipeline
Pipeline utama untuk augmentasi audio dengan indexed paths support
"""

import os
import shutil
from typing import Dict, Optional

from . import augmentation_config as aug_config
from . import audio_augmenter as augmenter
from . import path_manager


def setup_augmentation_run(source_run_index: int = None, base_dir: str = aug_config.BASE_AUGMENTED_DIR) -> Dict:
    """
    Setup augmentation run dengan indexed paths.
    
    Args:
        source_run_index: Index dari source run (jika None, use latest)
        base_dir: Base directory untuk output
        
    Returns:
        Dictionary berisi paths untuk augmentation run
    """
    # Get next augmentation index
    os.makedirs(base_dir, exist_ok=True)
    aug_index = path_manager.get_next_index(base_dir, "augmented")
    
    # Setup directories
    aug_paths = {
        "aug_index": aug_index,
        "source_run_index": source_run_index,
        "augmented_root": os.path.join(base_dir, f"augmented_{aug_index}"),
        "base_dir": base_dir,
    }
    
    # Create directories for each label
    for label in aug_config.TARGET_LABELS:
        label_dir = os.path.join(aug_paths["augmented_root"], label)
        os.makedirs(label_dir, exist_ok=True)
    
    return aug_paths


def get_source_data(source_run_index: int, base_dir: str = aug_config.BASE_AUGMENTED_DIR) -> str:
    """
    Get source data directory dari scraper run atau augmentation run sebelumnya.
    
    Args:
        source_run_index: Run index untuk source data
        base_dir: Base directory
        
    Returns:
        Path ke source directory
    """
    # Priority: augmented > extracted_syllables
    
    # Check if augmented run exists
    aug_source = os.path.join(base_dir, f"augmented_{source_run_index}")
    if os.path.exists(aug_source):
        return aug_source
    
    # Check if extracted_syllables exists
    extracted_source = os.path.join(base_dir, f"extracted_syllables_{source_run_index}")
    if os.path.exists(extracted_source):
        return extracted_source
    
    raise FileNotFoundError(f"Source data tidak ditemukan untuk run {source_run_index}")


def copy_source_to_target(source_dir: str, target_dir: str, labels: list) -> int:
    """
    Copy file dari source ke target directory.
    
    Args:
        source_dir: Source directory
        target_dir: Target directory
        labels: List of labels
        
    Returns:
        Jumlah file yang di-copy
    """
    copied = 0
    
    for label in labels:
        source_label_dir = os.path.join(source_dir, label)
        target_label_dir = os.path.join(target_dir, label)
        
        if not os.path.exists(source_label_dir):
            if aug_config.VERBOSE:
                print(f"   ⚠️  Source tidak ada: {source_label_dir}")
            continue
        
        os.makedirs(target_label_dir, exist_ok=True)
        
        for file in os.listdir(source_label_dir):
            if file.endswith(".wav"):
                src_file = os.path.join(source_label_dir, file)
                dst_file = os.path.join(target_label_dir, file)
                shutil.copy2(src_file, dst_file)
                copied += 1
    
    return copied


def run_augmentation_pipeline(source_run_index: int = None, 
                             target_count: int = aug_config.TARGET_SAMPLES_PER_LABEL,
                             normalize_duration: bool = aug_config.ENABLE_DURATION_NORMALIZATION) -> Dict:
    """
    Pipeline lengkap untuk augmentasi dengan indexed paths.
    
    Processing steps:
    1. Setup indexed augmentation directories
    2. Copy source data (dari scraper atau augmentation sebelumnya)
    3. Augmentasi untuk mencapai target count
    4. Normalize duration semua file
    5. Generate report
    
    Args:
        source_run_index: Source run index (jika None, auto-detect)
        target_count: Target jumlah file per label
        normalize_duration: Enable duration normalization
        
    Returns:
        Dictionary berisi hasil augmentation
    """
    
    print("\n" + "="*60)
    print("AUDIO DATA AUGMENTATION PIPELINE")
    print("="*60)
    
    # Setup augmentation run
    aug_run = setup_augmentation_run(source_run_index)
    aug_index = aug_run["aug_index"]
    aug_root = aug_run["augmented_root"]
    
    print(f"\n📁 Augmentation Run #{aug_index}")
    print(f"   Output Directory: {aug_root}")
    
    # Determine source
    if source_run_index is None:
        # Auto-detect latest
        run_info = path_manager.get_run_info(aug_config.BASE_AUGMENTED_DIR)
        if run_info['total_runs'] == 0:
            print("❌ Tidak ada source data. Run scraper terlebih dahulu.")
            return {"status": "failed"}
        source_run_index = max(run_info['runs'])
    
    # Get source directory
    try:
        source_dir = get_source_data(source_run_index, aug_config.BASE_AUGMENTED_DIR)
        print(f"📂 Source Directory (Run #{source_run_index}): {source_dir}")
    except FileNotFoundError as e:
        print(f"❌ {e}")
        return {"status": "failed"}
    
    # Copy source to target
    print(f"\n[1/3] Copying source data...")
    copied = copy_source_to_target(source_dir, aug_root, aug_config.TARGET_LABELS)
    print(f"   ✓ Copied {copied} files")
    
    # Get initial statistics
    stats_before = augmenter.get_label_statistics(aug_config.TARGET_LABELS, aug_root)
    
    # Augmentasi
    print(f"\n[2/3] Augmenting audio (target: {target_count} per label)...")
    augmented_count = {}
    for label in aug_config.TARGET_LABELS:
        label_dir = os.path.join(aug_root, label)
        _, generated = augmenter.augment_label_to_target(label_dir, label, target_count)
        augmented_count[label] = generated
    
    # Duration normalization
    if normalize_duration:
        print(f"\n[3/3] Normalizing duration ({aug_config.TARGET_DURATION_SEC}s)...")
        for label in aug_config.TARGET_LABELS:
            label_dir = os.path.join(aug_root, label)
            augmenter.normalize_duration_in_label(label_dir, label)
    else:
        print(f"\n[3/3] Skipping duration normalization")
    
    # Generate report
    print(augmenter.print_augmentation_report(stats_before, augmented_count))
    
    # Save report
    if aug_config.GENERATE_REPORT:
        report_path = os.path.join(aug_config.BASE_AUGMENTED_DIR, f"augmentation_report_{aug_index}.txt")
        with open(report_path, 'w') as f:
            f.write(augmenter.print_augmentation_report(stats_before, augmented_count))
        print(f"✓ Report saved: {report_path}")
    
    print("\n" + "="*60)
    print(f"✅ AUGMENTATION RUN #{aug_index} COMPLETED")
    print("="*60 + "\n")
    
    return {
        "status": "success",
        "aug_index": aug_index,
        "source_run_index": source_run_index,
        "output_dir": aug_root,
        "files_generated": sum(augmented_count.values()),
        "augmented_counts": augmented_count,
    }


if __name__ == "__main__":
    result = run_augmentation_pipeline()
    print(result)
