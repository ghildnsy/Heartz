"""
Main Scraper Pipeline
Modul ini berisi pipeline utama untuk menggabungkan semua proses
scraping, pemrosesan audio, transkripsi, dan ekstraksi fitur.
Dengan support untuk indexed paths (auto-incrementing)
"""

import os
import pandas as pd
from typing import Optional, Dict
import shutil

from . import config
from . import audio_processor as ap
from . import path_manager


def process_youtube_video_indexed(youtube_url: str, base_dir: str = config.BASE_SCRAPED_DIR) -> tuple:
    """
    Pipeline lengkap dengan indexed paths (auto-incrementing).
    
    Processing steps:
    1. Setup indexed directories
    2. Validasi URL
    3. Download audio dari YouTube
    4. Membersihkan audio (denoising, bandpass filter, normalisasi)
    5. Transkripsi dengan WhisperX
    6. Pecah kata menjadi suku kata
    7. Segmentasi audio per suku kata
    8. Ekstraksi fitur dari setiap suku kata
    9. Simpan hasil ke CSV dengan indexed filename
    
    Args:
        youtube_url: URL video YouTube
        base_dir: Base directory untuk indexed results (default: "scraped")
        
    Returns:
        Tuple (DataFrame, run_info_dict) atau (None, {}) jika gagal
    """
    
    # Setup indexed directories
    run_dirs = path_manager.setup_run_directories(base_dir)
    run_index = run_dirs["run_index"]
    temp_audio_dir = run_dirs["temp_audio_dir"]
    output_dataset_filename = run_dirs["dataset_filename"]
    
    print("\n" + "="*60)
    print(f"RUN #{run_index} - YOUTUBE VIDEO SCRAPER")
    print("="*60)
    print(f"📁 Temp Audio: {temp_audio_dir}")
    print(f"📊 Output Dataset: {output_dataset_filename}")
    
    # Validasi URL
    if not ap.validate_youtube_url(youtube_url):
        print(f"❌ URL tidak valid: {youtube_url}")
        return None, {}
    
    try:
        # 1. Download audio
        print("\n[1/6] Mengunduh audio dari YouTube...")
        audio_path = ap.download_audio(youtube_url, temp_audio_dir)
        if not audio_path or not os.path.exists(audio_path):
            print(f"❌ Gagal mengunduh audio")
            return None, {}
        print(f"   ✓ Audio asli: {audio_path}")

        # 2. Clean audio
        print("\n[2/6] Membersihkan audio...")
        print("   - Denoising spectral gating")
        print(f"   - Bandpass filter ({config.BANDPASS_LOWCUT}-{config.BANDPASS_HIGHCUT} Hz)")
        print("   - Normalisasi RMS")
        cleaned_audio_path = ap.clean_audio_file(audio_path)
        print(f"   ✓ Audio bersih: {cleaned_audio_path}")

        # 3. Transcribe
        print("\n[3/6] Transkripsi audio dengan WhisperX...")
        words = ap.transcribe_words(cleaned_audio_path)
        if not words:
            print(f"❌ Tidak ada kata yang ditemukan")
            return None, {}
        print(f"   ✓ Ditemukan {len(words)} kata")
        print(f"   Kata-kata: {[w['text'] for w in words[:10]]}", end="")
        if len(words) > 10:
            print(f" ... dan {len(words) - 10} kata lainnya")
        else:
            print()

        # 4-7. Process syllables
        print("\n[4/6] Memecah kata menjadi suku kata...")
        all_syllables_data = []
        total_syllables = 0
        
        for word_idx, word_info in enumerate(words, 1):
            word_text = word_info["text"]
            start = word_info["start"]
            end = word_info["end"]
            
            syllables = ap.syllabify(word_text)
            if not syllables:
                syllables = [word_text]
            
            print(f"   - Kata {word_idx}: '{word_text}' → {syllables}")
            
            # Segmentasi audio per suku kata
            segs = ap.split_word_into_syllables_audio(cleaned_audio_path, start, end, syllables)
            
            # Ekstraksi fitur per suku kata
            for seg in segs:
                features = ap.extract_features_from_audio_chunk(seg["audio_chunk"])
                if features:
                    row = {
                        "original_word": word_text,
                        "syllable": seg["syllable_text"],
                        "syllable_start_sec": seg["start_sec"],
                        "syllable_end_sec": seg["end_sec"],
                        **features
                    }
                    all_syllables_data.append(row)
                    total_syllables += 1
        
        print(f"   ✓ Total {total_syllables} suku kata berhasil diproses")

        # 5. Create DataFrame
        print(f"\n[5/6] Membuat dataset...")
        if not all_syllables_data:
            print(f"❌ Tidak ada data suku kata yang dihasilkan")
            return None, {}
        
        df = pd.DataFrame(all_syllables_data)
        print(f"   ✓ Dataset shape: {df.shape}")
        print(f"   Kolom: {list(df.columns)[:5]}...")

        # 6. Save to CSV
        print(f"\n[6/6] Menyimpan dataset...")
        df.to_csv(output_dataset_filename, index=False)
        print(f"   ✓ Dataset disimpan ke: {output_dataset_filename}")

        print("\n" + "="*60)
        print(f"✅ RUN #{run_index} SELESAI! {len(df)} suku kata berhasil diekstrak.")
        print("="*60 + "\n")
        
        return df, run_dirs

    except Exception as e:
        print(f"\n❌ Error saat memproses: {e}")
        import traceback
        traceback.print_exc()
        return None, {}
    
    finally:
        # Cleanup temp files dari temp_audio_dir (bukan default)
        pass  # Keep temp_audio_dir untuk reference


def process_youtube_video(youtube_url: str, output_dataset_filename: str = config.OUTPUT_DATASET_FILENAME) -> Optional[pd.DataFrame]:
    """
    Pipeline lengkap untuk memproses video YouTube (legacy, tanpa indexing).
    Untuk penggunaan dengan indexed paths, gunakan process_youtube_video_indexed()
    
    Args:
        youtube_url: URL video YouTube
        output_dataset_filename: Nama file output CSV
        
    Returns:
        DataFrame berisi dataset suku kata dengan fitur, atau None jika gagal
    """
    df, _ = process_youtube_video_indexed(youtube_url)
    return df


def process_multiple_videos(youtube_urls: list, output_dataset_filename: str = config.OUTPUT_DATASET_FILENAME) -> Optional[pd.DataFrame]:
    """
    Proses multiple video YouTube dan gabungkan hasilnya.
    
    Args:
        youtube_urls: List of YouTube URLs
        output_dataset_filename: Nama file output CSV
        
    Returns:
        Combined DataFrame dari semua video, atau None jika semua gagal
    """
    all_results = []
    success_count = 0
    
    for idx, url in enumerate(youtube_urls, 1):
        print(f"\n\n{'#'*60}")
        print(f"Memproses video {idx}/{len(youtube_urls)}")
        print(f"{'#'*60}")
        
        df_result = process_youtube_video(url)
        if df_result is not None:
            all_results.append(df_result)
            success_count += 1
        else:
            print(f"⚠️  Video {idx} gagal diproses, lanjut ke video berikutnya...")
    
    if not all_results:
        print(f"\n❌ Semua video gagal diproses!")
        return None
    
    # Combine hasil
    combined_df = pd.concat(all_results, ignore_index=True)
    combined_df.to_csv(output_dataset_filename, index=False)
    
    print(f"\n{'='*60}")
    print(f"✅ SELESAI! {success_count}/{len(youtube_urls)} video berhasil diproses")
    print(f"Total suku kata: {len(combined_df)}")
    print(f"Dataset disimpan ke: {output_dataset_filename}")
    print(f"{'='*60}\n")
    
    return combined_df


if __name__ == "__main__":
    import sys
    
    # Script untuk dijalankan langsung di terminal
    print("\n📹 YouTube Audio Scraper & Syllable Dataset Generator")
    print("-" * 60)
    
    max_attempts = config.MAX_DOWNLOAD_ATTEMPTS
    attempt = 0
    
    while attempt < max_attempts:
        youtube_url = input("\nMasukkan link YouTube (atau 'q' untuk keluar): ").strip()
        
        if youtube_url.lower() == 'q':
            print("Keluar dari program.")
            sys.exit(0)
        
        if not youtube_url:
            print("URL tidak boleh kosong, silakan coba lagi.")
            continue
        
        attempt += 1
        df_result = process_youtube_video(youtube_url)
        
        if df_result is not None:
            print("\n📊 Preview Dataset:")
            print(df_result.head())
            print(f"\nDataset berhasil disimpan!")
            break
        else:
            remaining = max_attempts - attempt
            if remaining > 0:
                print(f"\n⚠️  Percobaan {attempt} gagal. Coba link lain.")
                print(f"Sisa percobaan: {remaining}")
            else:
                print(f"\n❌ Semua percobaan gagal.")
