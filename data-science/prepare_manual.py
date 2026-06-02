"""
========================================
Heartz Project — Manual Data Preparation
========================================
Konversi file video/audio manual menjadi format WAV standar
untuk pipeline (16kHz, Mono).

Folder Input  : dataset/manual_downloads/
Folder Output : dataset/downloads/
"""

import subprocess
from pathlib import Path
from tqdm import tqdm

from config import MANUAL_DIR, DOWNLOADS_DIR, SAMPLE_RATE, ensure_dirs

def check_ffmpeg():
    try:
        subprocess.run(["ffmpeg", "-version"], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Error: FFmpeg tidak ditemukan. Pastikan FFmpeg sudah terinstall dan ada di system PATH.")
        return False

def convert_manual_to_wav():
    """Konversi semua file di manual_downloads ke format WAV standar"""
    ensure_dirs()
    
    if not check_ffmpeg():
        return

    # Kumpulkan semua file di manual_downloads (mengabaikan folder)
    valid_extensions = {".mp4", ".mkv", ".webm", ".avi", ".mov", ".mp3", ".m4a", ".wav", ".flac", ".ogg", ".aac", ".ts", ".m2ts"}
    
    manual_files = []
    if MANUAL_DIR.exists():
        for f in MANUAL_DIR.iterdir():
            if f.is_file() and f.suffix.lower() in valid_extensions:
                manual_files.append(f)
            
    if not manual_files:
        print(f"⚠️  Tidak ada file media yang ditemukan di {MANUAL_DIR}")
        print(f"   Silakan copy file hasil download manual Anda ke folder tersebut.")
        return
        
    print(f"📂 Ditemukan {len(manual_files)} file di manual_downloads. Memulai konversi...")
    
    success_count = 0
    
    for f in tqdm(manual_files, desc="Converting"):
        output_file = DOWNLOADS_DIR / f"{f.stem}.wav"
        
        # Skip jika sudah ada
        if output_file.exists():
            success_count += 1
            continue
            
        cmd = [
            "ffmpeg",
            "-i", str(f),
            "-ar", str(SAMPLE_RATE),
            "-ac", "1",
            "-vn", # Disable video
            "-y",  # Overwrite if exists
            str(output_file)
        ]
        
        try:
            r = subprocess.run(cmd, capture_output=True, text=True)
            if r.returncode == 0:
                success_count += 1
            else:
                print(f"\n❌ Gagal konversi {f.name}: {r.stderr.splitlines()[-1] if r.stderr else 'Unknown error'}")
        except Exception as e:
            print(f"\n❌ Error processing {f.name}: {e}")
            
    print(f"\n✅ Konversi selesai: {success_count}/{len(manual_files)} berhasil diproses.")
    print(f"📁 Hasil konversi disimpan di: {DOWNLOADS_DIR}")
    
def list_manual_files():
    """Menampilkan daftar file yang ada di manual_downloads"""
    if not MANUAL_DIR.exists():
        return []
    
    files = [f for f in MANUAL_DIR.iterdir() if f.is_file()]
    if not files:
        print(f"⚠️ Folder {MANUAL_DIR.name} masih kosong.")
        return []
        
    print(f"📋 Isi folder {MANUAL_DIR.name}:")
    for i, f in enumerate(files):
        print(f"  [{i+1}] {f.name}")
    return files

def list_downloads():
    """Menampilkan daftar file yang sudah dikonversi di downloads"""
    if not DOWNLOADS_DIR.exists():
        return []
        
    files = list(DOWNLOADS_DIR.glob("*.wav"))
    if not files:
        return []
        
    return files

if __name__ == "__main__":
    ensure_dirs()
    list_manual_files()
    convert_manual_to_wav()
