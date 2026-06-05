"""
=======================================
Heartz Project — STEP 2: Audio Splitter
=======================================
Memotong file audio panjang dari YouTube menjadi clip-clip
pendek per suku kata berdasarkan deteksi silence.

File dari dataset/downloads/ → dipotong → dataset/raw/{kelas}/

Cara Pakai:
-----------
1. Pastikan sudah ada file audio di dataset/downloads/
2. Jalankan: python splitter.py
3. Atau dari notebook:
   from splitter import split_audio_file, split_and_preview
   split_audio_file("dataset/downloads/video.wav", "dataset/raw", "Ba")
"""

import numpy as np
import librosa
from pathlib import Path
from tqdm import tqdm

from config import (
    DOWNLOADS_DIR, RAW_DIR, SAMPLE_RATE, ALL_CLASSES,
    SILENCE_THRESH_DB, MIN_SILENCE_LEN_MS, KEEP_SILENCE_MS,
    CLIP_DURATION_MIN, CLIP_DURATION_MAX,
    ensure_dirs,
)
from utils import load_audio, save_audio, generate_next_filename, count_dataset


def detect_nonsilent_regions(y, sr=SAMPLE_RATE, top_db=30,
                              min_duration=0.3, max_duration=2.5,
                              hop_length=512):
    """
    Deteksi region non-silent dalam audio menggunakan librosa.

    Args:
        y: Audio array
        sr: Sample rate
        top_db: Threshold dB di bawah peak yang dianggap silence
        min_duration: Durasi minimum region (detik)
        max_duration: Durasi maksimum region (detik)
        hop_length: Hop length untuk analisis

    Returns:
        list: [(start_sample, end_sample), ...]
    """
    # Gunakan librosa untuk deteksi non-silent intervals
    intervals = librosa.effects.split(y, top_db=top_db, hop_length=hop_length)

    # Filter berdasarkan durasi
    filtered = []
    for start, end in intervals:
        duration = (end - start) / sr
        if min_duration <= duration <= max_duration:
            filtered.append((start, end))
        elif duration > max_duration:
            # Potong menjadi sub-clip yang lebih kecil
            sub_len = int(max_duration * sr)
            for sub_start in range(start, end, sub_len):
                sub_end = min(sub_start + sub_len, end)
                sub_duration = (sub_end - sub_start) / sr
                if sub_duration >= min_duration:
                    filtered.append((sub_start, sub_end))

    return filtered


def add_margin(start, end, margin_samples, total_length):
    """Tambahkan margin (silence) di awal dan akhir region."""
    new_start = max(0, start - margin_samples)
    new_end = min(total_length, end + margin_samples)
    return new_start, new_end


def split_audio_file(input_path, output_dir, label,
                      top_db=30, min_duration=None, max_duration=None,
                      margin_ms=None):
    """
    Split satu file audio menjadi clip-clip pendek dan simpan ke folder kelas.

    Args:
        input_path: Path ke file audio (WAV)
        output_dir: Direktori output (misal: dataset/raw)
        label: Label kelas (misal: "Ba", "A", "Ma")
        top_db: Threshold silence detection
        min_duration: Override durasi minimum (detik)
        max_duration: Override durasi maksimum (detik)
        margin_ms: Override margin silence (ms)

    Returns:
        int: Jumlah clip yang berhasil disimpan
    """
    input_path = Path(input_path)
    output_dir = Path(output_dir)

    if min_duration is None:
        min_duration = CLIP_DURATION_MIN
    if max_duration is None:
        max_duration = CLIP_DURATION_MAX
    if margin_ms is None:
        margin_ms = KEEP_SILENCE_MS

    # Load audio
    y, sr = load_audio(input_path, SAMPLE_RATE)

    # Deteksi region non-silent
    regions = detect_nonsilent_regions(
        y, sr, top_db=top_db,
        min_duration=min_duration,
        max_duration=max_duration,
    )

    if not regions:
        print(f"⚠️  Tidak ada region valid ditemukan di {input_path.name}")
        return 0

    # Simpan setiap region sebagai file terpisah
    class_dir = output_dir / label
    class_dir.mkdir(parents=True, exist_ok=True)

    margin_samples = int(margin_ms / 1000 * sr)
    saved = 0

    for start, end in regions:
        # Tambahkan margin
        start_m, end_m = add_margin(start, end, margin_samples, len(y))
        clip = y[start_m:end_m]

        # Cek apakah clip terlalu pelan (mungkin hanya noise)
        rms = np.sqrt(np.mean(clip ** 2))
        if rms < 0.005:
            continue

        # Generate nama file
        filename = generate_next_filename(class_dir, label)
        save_audio(clip, class_dir / filename, sr)
        saved += 1

    print(f"  ✂️  {label}: {saved} clip dari {input_path.name}")
    return saved


def split_and_preview(input_path, top_db=30, min_duration=None, max_duration=None):
    """
    Preview berapa clip yang akan dihasilkan dari sebuah file audio
    TANPA menyimpan file apapun. Berguna untuk tuning parameter.

    Args:
        input_path: Path ke file audio
        top_db: Threshold silence detection
        min_duration: Durasi minimum clip (detik)
        max_duration: Durasi maksimum clip (detik)

    Returns:
        list: Informasi tiap region yang terdeteksi
    """
    input_path = Path(input_path)

    if min_duration is None:
        min_duration = CLIP_DURATION_MIN
    if max_duration is None:
        max_duration = CLIP_DURATION_MAX

    y, sr = load_audio(input_path, SAMPLE_RATE)
    total_duration = len(y) / sr

    regions = detect_nonsilent_regions(
        y, sr, top_db=top_db,
        min_duration=min_duration,
        max_duration=max_duration,
    )

    print(f"\n🔍 Preview Split: {input_path.name}")
    print(f"   Total durasi : {total_duration:.1f} detik")
    print(f"   top_db       : {top_db}")
    print(f"   Durasi clip  : {min_duration:.1f}s - {max_duration:.1f}s")
    print(f"   Region valid : {len(regions)}")
    print()

    preview_list = []
    for i, (start, end) in enumerate(regions):
        duration = (end - start) / sr
        start_sec = start / sr
        end_sec = end / sr
        rms = np.sqrt(np.mean(y[start:end] ** 2))

        info = {
            "index": i + 1,
            "start_sec": round(start_sec, 2),
            "end_sec": round(end_sec, 2),
            "duration_sec": round(duration, 2),
            "rms": round(rms, 4),
        }
        preview_list.append(info)

        print(f"   [{i+1:3d}] {start_sec:7.2f}s - {end_sec:7.2f}s "
              f"({duration:.2f}s, RMS={rms:.4f})")

    return preview_list


def batch_split(label, downloads_dir=None, output_dir=None, top_db=30):
    """
    Split SEMUA file audio di folder downloads untuk satu label/kelas.

    Args:
        label: Label kelas (misal: "Ba")
        downloads_dir: Folder berisi file audio mentah
        output_dir: Folder output (misal: dataset/raw)
        top_db: Threshold silence

    Returns:
        int: Total clip yang disimpan
    """
    if downloads_dir is None:
        downloads_dir = DOWNLOADS_DIR
    if output_dir is None:
        output_dir = RAW_DIR

    downloads_dir = Path(downloads_dir)
    wav_files = sorted(downloads_dir.glob("*.wav"))

    if not wav_files:
        print(f"⚠️  Tidak ada file .wav di {downloads_dir}")
        return 0

    print(f"\n📂 Batch split untuk kelas '{label}' dari {len(wav_files)} file")
    total = 0
    for wav_file in wav_files:
        count = split_audio_file(wav_file, output_dir, label, top_db=top_db)
        total += count

    print(f"   Total '{label}': {total} clip")
    return total


def split_audio_with_labels(input_path, output_dir, labels,
                              top_db=30, min_duration=None, max_duration=None,
                              margin_ms=None):
    """
    Split satu file audio menjadi clip-clip dan assign label berdasarkan urutan.
    
    PENTING: Jumlah region yang terdeteksi HARUS SESUAI dengan jumlah labels!
    
    Contoh penggunaan:
        labels = ["A", "I", "U", "E", "O", "Ba", "Bi", "Bu", "Be", "Bo"]
        split_audio_with_labels("dataset/downloads/aiueo_babibubebo.wav", 
                                 "dataset/raw", labels, top_db=30)
    
    Maka:
        - Region 1 (pertama) -> A
        - Region 2 (kedua) -> I
        - Region 3 (ketiga) -> U
        - ... dst

    Args:
        input_path: Path ke file audio (WAV)
        output_dir: Direktori output (misal: dataset/raw)
        labels: List of labels (misal: ["A", "I", "U", "E", "O", "Ba", ...])
        top_db: Threshold silence detection
        min_duration: Override durasi minimum (detik)
        max_duration: Override durasi maksimum (detik)
        margin_ms: Override margin silence (ms)

    Returns:
        dict: Hasil split per label
    """
    input_path = Path(input_path)
    output_dir = Path(output_dir)

    if min_duration is None:
        min_duration = CLIP_DURATION_MIN
    if max_duration is None:
        max_duration = CLIP_DURATION_MAX
    if margin_ms is None:
        margin_ms = KEEP_SILENCE_MS

    # Load audio
    y, sr = load_audio(input_path, SAMPLE_RATE)

    # Deteksi region non-silent
    regions = detect_nonsilent_regions(
        y, sr, top_db=top_db,
        min_duration=min_duration,
        max_duration=max_duration,
    )

    # Cek jumlah region vs labels
    if len(regions) != len(labels):
        print(f"\n⚠️  WARNING: Jumlah region tidak cocok!")
        print(f"   File: {input_path.name}")
        print(f"   Region terdeteksi: {len(regions)}")
        print(f"   Label yang diberikan: {len(labels)}")
        print(f"   Labels: {labels}")
        print(f"\n   Region details:")
        for i, (start, end) in enumerate(regions):
            duration = (end - start) / sr
            print(f"   [{i+1}] {start/sr:.2f}s - {end/sr:.2f}s (durasi: {duration:.2f}s)")
        print(f"\n   ❌ Batal. Sesuaikan jumlah labels atau tuning top_db!")
        return {}

    # Simpan setiap region dengan label yang sesuai
    margin_samples = int(margin_ms / 1000 * sr)
    results = {}

    print(f"\n✂️  Splitting: {input_path.name}")
    print(f"   Threshold: top_db={top_db}")
    print(f"   Total region: {len(regions)}")
    print()

    for i, (start, end) in enumerate(regions):
        label = labels[i]
        
        # Tambahkan margin
        start_m, end_m = add_margin(start, end, margin_samples, len(y))
        clip = y[start_m:end_m]

        # Cek apakah clip terlalu pelan (mungkin hanya noise)
        rms = np.sqrt(np.mean(clip ** 2))
        if rms < 0.005:
            print(f"   [{i+1:2d}] ⚠️  {label}: terlalu pelan (RMS={rms:.4f}), skip")
            continue

        # Create class folder
        class_dir = output_dir / label
        class_dir.mkdir(parents=True, exist_ok=True)

        # Generate nama file
        filename = generate_next_filename(class_dir, label)
        save_audio(clip, class_dir / filename, sr)

        # Track hasil
        if label not in results:
            results[label] = 0
        results[label] += 1

        duration = (end - start) / sr
        print(f"   [{i+1:2d}] ✓ {label}: {filename} ({duration:.2f}s, RMS={rms:.4f})")

    return results


def split_audio_selective(input_path, output_dir, region_labels_map,
                          top_db=30, min_duration=None, max_duration=None,
                          margin_ms=None):
    """
    Split satu file audio dengan SELECTIVE region selection.
    
    Gunakan ini ketika file berisi banyak region, tapi Anda hanya ingin
    mengambil region-region TERTENTU saja.
    
    WORKFLOW:
    1. Jalankan preview untuk lihat semua region
    2. Identifikasi region index mana saja yang ingin diambil
    3. Tentukan label untuk setiap region yang dipilih
    4. Panggil fungsi ini dengan mapping
    
    Contoh penggunaan:
        region_labels_map = {
            0: "A",      # Ambil region 0 -> label "A"
            1: "I",      # Ambil region 1 -> label "I"
            3: "U",      # Ambil region 3 -> label "U" (skip region 2)
            5: "Ba",     # Ambil region 5 -> label "Ba"
        }
        split_audio_selective("dataset/downloads/video.wav", 
                               "dataset/raw", region_labels_map, top_db=30)

    Args:
        input_path: Path ke file audio (WAV)
        output_dir: Direktori output (misal: dataset/raw)
        region_labels_map: Dict mapping {region_index: label}
                          Contoh: {0: "A", 1: "I", 2: "U"}
        top_db: Threshold silence detection
        min_duration: Override durasi minimum (detik)
        max_duration: Override durasi maksimum (detik)
        margin_ms: Override margin silence (ms)

    Returns:
        dict: Hasil split per label
    """
    input_path = Path(input_path)
    output_dir = Path(output_dir)

    if min_duration is None:
        min_duration = CLIP_DURATION_MIN
    if max_duration is None:
        max_duration = CLIP_DURATION_MAX
    if margin_ms is None:
        margin_ms = KEEP_SILENCE_MS

    # Load audio
    y, sr = load_audio(input_path, SAMPLE_RATE)

    # Deteksi region non-silent
    regions = detect_nonsilent_regions(
        y, sr, top_db=top_db,
        min_duration=min_duration,
        max_duration=max_duration,
    )

    # Simpan hanya region yang dipilih
    margin_samples = int(margin_ms / 1000 * sr)
    results = {}

    print(f"\n Selective Split: {input_path.name}")
    print(f"   Threshold: top_db={top_db}")
    print(f"   Total region terdeteksi: {len(regions)}")
    print(f"   Region yang akan diambil: {len(region_labels_map)}")
    print()

    for region_idx, label in sorted(region_labels_map.items()):
        # Validasi index
        if region_idx < 0 or region_idx >= len(regions):
            print(f"   ❌ Region index {region_idx} invalid (hanya ada {len(regions)} region)")
            continue

        start, end = regions[region_idx]
        
        # Tambahkan margin
        start_m, end_m = add_margin(start, end, margin_samples, len(y))
        clip = y[start_m:end_m]

        # Cek apakah clip terlalu pelan
        rms = np.sqrt(np.mean(clip ** 2))
        if rms < 0.005:
            print(f"   [{region_idx:2d}] ⚠️  {label}: terlalu pelan (RMS={rms:.4f}), skip")
            continue

        # Create class folder
        class_dir = output_dir / label
        class_dir.mkdir(parents=True, exist_ok=True)

        # Generate nama file
        filename = generate_next_filename(class_dir, label)
        save_audio(clip, class_dir / filename, sr)

        # Track hasil
        if label not in results:
            results[label] = 0
        results[label] += 1

        duration = (end - start) / sr
        start_sec = start / sr
        end_sec = end / sr
        print(f"   [{region_idx:2d}] ✓ {label}: {filename} ({start_sec:.2f}s-{end_sec:.2f}s, {duration:.2f}s)")

    print()
    return results


def interactive_split(input_path):
    """
    Mode interaktif: preview → pilih parameter → split.
    Cocok untuk digunakan di notebook.

    Args:
        input_path: Path ke file audio
    """
    input_path = Path(input_path)
    print(f"🎵 File: {input_path.name}")

    # Test beberapa threshold
    for db in [20, 25, 30, 35, 40]:
        y, sr = load_audio(input_path, SAMPLE_RATE)
        regions = detect_nonsilent_regions(y, sr, top_db=db)
        print(f"   top_db={db}: {len(regions)} region terdeteksi")


# ====
# MAIN
# ====
if __name__ == "__main__":
    ensure_dirs()

    # Cek apakah ada file di downloads
    downloads = list(DOWNLOADS_DIR.glob("*.wav"))

    if not downloads:
        print("⚠️  Belum ada file audio di dataset/downloads/")
        print("   Jalankan scraper.py terlebih dahulu, atau pindahkan file .wav ke folder tersebut.")
    else:
        print(f"📁 Ditemukan {len(downloads)} file audio di downloads/")
        print("\nGunakan dari notebook:")
        print('  from splitter import split_audio_file, split_and_preview')
        print('  split_and_preview("dataset/downloads/namafile.wav")')
        print('  split_audio_file("dataset/downloads/namafile.wav", "dataset/raw", "Ba")')

    # Tampilkan status dataset/raw
    print()
    from utils import print_dataset_summary
    print_dataset_summary(RAW_DIR, "Dataset RAW (Sebelum Cleaning)")
