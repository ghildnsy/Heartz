"""
FFmpeg Availability Checker dan Setup Helper
Untuk mengecek dan memberikan panduan instalasi FFmpeg

Support:
- System-wide FFmpeg (recommended)
- Bundled FFmpeg (optional, untuk deployment)
"""

import subprocess
import os
import sys
import platform


def get_local_ffmpeg_path() -> str:
    """
    Get path ke local FFmpeg binary jika ada.
    Lokasi: libs/ffmpeg/bin/ffmpeg.exe (Windows) atau ffmpeg (Linux/macOS)
    
    Returns:
        Path ke FFmpeg binary, atau None jika tidak ada
    """
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    if platform.system() == "Windows":
        local_ffmpeg = os.path.join(current_dir, "ffmpeg", "bin", "ffmpeg.exe")
    else:
        local_ffmpeg = os.path.join(current_dir, "ffmpeg", "bin", "ffmpeg")
    
    if os.path.exists(local_ffmpeg):
        return local_ffmpeg
    
    return None


def get_local_ffprobe_path() -> str:
    """
    Get path ke local FFprobe binary jika ada.
    Lokasi: libs/ffmpeg/bin/ffprobe.exe (Windows) atau ffprobe (Linux/macOS)
    
    Returns:
        Path ke FFprobe binary, atau None jika tidak ada
    """
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    if platform.system() == "Windows":
        local_ffprobe = os.path.join(current_dir, "ffmpeg", "bin", "ffprobe.exe")
    else:
        local_ffprobe = os.path.join(current_dir, "ffmpeg", "bin", "ffprobe")
    
    if os.path.exists(local_ffprobe):
        return local_ffprobe
    
    return None


def check_ffmpeg_installed(prefer_local: bool = False) -> tuple:
    """
    Check apakah FFmpeg sudah tersedia (system-wide atau local).
    
    Args:
        prefer_local: Jika True, prefer local FFmpeg jika ada
    
    Returns:
        (is_installed: bool, ffmpeg_path: str or None)
    """
    # Check local FFmpeg dulu jika prefer_local=True
    if prefer_local:
        local_path = get_local_ffmpeg_path()
        if local_path:
            try:
                result = subprocess.run(
                    [local_path, '-version'],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    timeout=5
                )
                if result.returncode == 0:
                    return (True, local_path)
            except Exception:
                pass
    
    # Check system-wide FFmpeg
    try:
        result = subprocess.run(
            ['ffmpeg', '-version'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=5
        )
        if result.returncode == 0:
            return (True, 'ffmpeg')
    except (subprocess.TimeoutExpired, FileNotFoundError, Exception):
        pass
    
    # Last resort: check local FFmpeg jika belum dicek
    if not prefer_local:
        local_path = get_local_ffmpeg_path()
        if local_path:
            try:
                result = subprocess.run(
                    [local_path, '-version'],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    timeout=5
                )
                if result.returncode == 0:
                    return (True, local_path)
            except Exception:
                pass
    
    return (False, None)


def check_ffprobe_installed(prefer_local: bool = False) -> tuple:
    """
    Check apakah FFprobe sudah tersedia (system-wide atau local).
    
    Args:
        prefer_local: Jika True, prefer local FFprobe jika ada
    
    Returns:
        (is_installed: bool, ffprobe_path: str or None)
    """
    # Check local FFprobe dulu jika prefer_local=True
    if prefer_local:
        local_path = get_local_ffprobe_path()
        if local_path:
            try:
                result = subprocess.run(
                    [local_path, '-version'],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    timeout=5
                )
                if result.returncode == 0:
                    return (True, local_path)
            except Exception:
                pass
    
    # Check system-wide FFprobe
    try:
        result = subprocess.run(
            ['ffprobe', '-version'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=5
        )
        if result.returncode == 0:
            return (True, 'ffprobe')
    except (subprocess.TimeoutExpired, FileNotFoundError, Exception):
        pass
    
    # Last resort: check local FFprobe jika belum dicek
    if not prefer_local:
        local_path = get_local_ffprobe_path()
        if local_path:
            try:
                result = subprocess.run(
                    [local_path, '-version'],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    timeout=5
                )
                if result.returncode == 0:
                    return (True, local_path)
            except Exception:
                pass
    
    return (False, None)


def print_ffmpeg_installation_guide():
    """
    Print panduan instalasi FFmpeg sesuai operating system.
    """
    system = platform.system()
    
    print("\n" + "="*70)
    print("⚠️  FFmpeg tidak terdeteksi di system!")
    print("="*70)
    print("\nFFmpeg diperlukan untuk konversi video YouTube ke audio.")
    print("Silakan install FFmpeg sesuai OS Anda:\n")
    
    if system == "Windows":
        print("📦 WINDOWS - Menggunakan Chocolatey (RECOMMENDED):")
        print("   Buka PowerShell as Administrator dan jalankan:")
        print("   $ choco install ffmpeg")
        print("\n   Atau download manual dari:")
        print("   https://ffmpeg.org/download.html")
        print("   1. Download build \"Full\"")
        print("   2. Extract ke folder (misal: C:\\ffmpeg)")
        print("   3. Add ke PATH environment variable")
        print("   4. Verify: buka CMD baru dan jalankan: ffmpeg -version")
        
    elif system == "Darwin":  # macOS
        print("📦 macOS - Menggunakan Homebrew:")
        print("   $ brew install ffmpeg")
        print("\n   Atau download dari:")
        print("   https://ffmpeg.org/download.html")
        
    elif system == "Linux":
        print("📦 Linux - Menggunakan Package Manager:")
        print("\n   Ubuntu/Debian:")
        print("   $ sudo apt-get update")
        print("   $ sudo apt-get install ffmpeg")
        print("\n   Fedora/RHEL:")
        print("   $ sudo dnf install ffmpeg")
        print("\n   Arch:")
        print("   $ sudo pacman -S ffmpeg")
    
    print("\n" + "="*70)
    print("Setelah install FFmpeg:")
    print("1. Close dan buka ulang terminal/IDE Anda")
    print("2. Jalankan: ffmpeg -version (untuk verify)")
    print("3. Jalankan ulang notebook cell")
    print("="*70 + "\n")


def print_ffmpeg_status():
    """
    Print status FFmpeg dan FFprobe (system-wide dan local).
    """
    ffmpeg_ok, ffmpeg_path = check_ffmpeg_installed()
    ffprobe_ok, ffprobe_path = check_ffprobe_installed()
    
    print("\n" + "="*70)
    print("🔍 FFMPEG STATUS CHECK")
    print("="*70)
    
    if ffmpeg_ok:
        print(f"✅ FFmpeg:  Found at {ffmpeg_path}")
    else:
        print(f"❌ FFmpeg:  Not Found")
    
    if ffprobe_ok:
        print(f"✅ FFprobe: Found at {ffprobe_path}")
    else:
        print(f"❌ FFprobe: Not Found")
    
    # Check local bundled FFmpeg
    local_ffmpeg = get_local_ffmpeg_path()
    if local_ffmpeg:
        print(f"\n💾 Local bundled FFmpeg detected: {local_ffmpeg}")
    else:
        print(f"\n💾 Local bundled FFmpeg: Not present")
    
    print("="*70 + "\n")
    
    if not ffmpeg_ok or not ffprobe_ok:
        print_ffmpeg_installation_guide()
        return False
    
    return True


def print_installation_options():
    """
    Print opsi instalasi FFmpeg berdasarkan OS.
    """
    system = platform.system()
    
    print("\n" + "="*70)
    print("🚀 FFMPEG INSTALLATION OPTIONS")
    print("="*70)
    
    if system == "Windows":
        print("\n✅ OPTION 1: Chocolatey (EASIEST - Recommended)")
        print("   Prerequisites: Chocolatey installed (https://chocolatey.org/install)")
        print("   Command: choco install ffmpeg")
        print("   Time: ~2 minutes")
        
        print("\n✅ OPTION 2: Scoop")
        print("   Prerequisites: Scoop installed (https://scoop.sh)")
        print("   Command: scoop install ffmpeg")
        print("   Time: ~2 minutes")
        
        print("\n✅ OPTION 3: Manual Download")
        print("   1. Go to: https://ffmpeg.org/download.html")
        print("   2. Click 'Windows builds from gyan.dev'")
        print("   3. Download 'full' build (single file ~200MB)")
        print("   4. Extract to: C:\\ffmpeg\\")
        print("   5. Add C:\\ffmpeg\\bin to Environment Variables PATH")
        print("   6. Restart computer")
        print("   Time: ~10 minutes")
        
    elif system == "Darwin":
        print("\n✅ OPTION 1: Homebrew (RECOMMENDED)")
        print("   Prerequisites: Homebrew installed (https://brew.sh)")
        print("   Command: brew install ffmpeg")
        print("   Time: ~2 minutes")
        
        print("\n✅ OPTION 2: MacPorts")
        print("   Prerequisites: MacPorts installed (https://www.macports.org)")
        print("   Command: sudo port install ffmpeg")
        print("   Time: ~5 minutes")
        
    elif system == "Linux":
        print("\n✅ OPTION 1: APT (Ubuntu/Debian)")
        print("   Command: sudo apt-get install ffmpeg")
        print("   Time: ~1 minute")
        
        print("\n✅ OPTION 2: DNF (Fedora)")
        print("   Command: sudo dnf install ffmpeg")
        print("   Time: ~1 minute")
        
        print("\n✅ OPTION 3: Pacman (Arch)")
        print("   Command: sudo pacman -S ffmpeg")
        print("   Time: ~1 minute")
    
    print("\n" + "="*70 + "\n")


if __name__ == "__main__":
    ffmpeg_ok = print_ffmpeg_status()
    if not ffmpeg_ok:
        print_installation_options()
