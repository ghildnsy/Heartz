# ✅ FINALISASI SETUP - Data Science Pipeline

Checklist lengkap untuk finalisasi environment Heartz Data Science Pipeline.

---

## 📋 Pre-Requisite Setup

### 1. Python Version ✓

```bash
python --version
# Expected: Python 3.8+ (3.10+ recommended)
```

### 2. Virtual Environment ✓

```bash
# Windows PowerShell
python -m venv .venv
.venv\Scripts\Activate.ps1

# Mac/Linux
python -m venv .venv
source .venv/bin/activate
```

**Verify:** Prompt harus menunjukkan `(.venv)` prefix

### 3. Install Dependencies ✓

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**Expected output:** Semua package terinstall tanpa error

### 4. Initialize Dataset Structure ✓

```bash
python -c "from config import ensure_dirs; ensure_dirs()"
```

**Expected output:**

```
✅ Semua direktori siap (20 kelas)
```

---

## 🧪 Verification Checklist

### ✅ Test 1: Module Imports

```bash
python -c "
from config import ensure_dirs, ALL_CLASSES
from utils import load_audio, count_dataset
from cleaner import clean_audio
from splitter import split_audio_by_silence
from augmentor import augment_dataset
from feature_engineering import extract_all_features
from ab_testing import run_all_ab_tests
print('✅ All modules imported successfully')
print(f'✅ Total classes: {len(ALL_CLASSES)}')
"
```

### ✅ Test 2: Config Paths

```bash
python -c "
from config import RAW_DIR, CLEAN_DIR, AUGMENTED_DIR, METADATA_DIR
print('✅ Dataset Paths:')
for name, path in [('RAW', RAW_DIR), ('CLEAN', CLEAN_DIR), ('AUG', AUGMENTED_DIR), ('META', METADATA_DIR)]:
    print(f'   {name}: {path}')
"
```

### ✅ Test 3: Dataset Initialization

```bash
python -c "
from pathlib import Path
from config import RAW_DIR, ALL_CLASSES

# Check if all class folders exist
raw_classes = sorted([d.name for d in RAW_DIR.glob('*') if d.is_dir()])
expected = sorted(ALL_CLASSES)

if raw_classes == expected:
    print(f'✅ All 20 class folders created')
else:
    print(f'❌ Mismatch: Found {len(raw_classes)}, Expected {len(expected)}')
"
```

---

## 📚 Setup Jupyter Kernel (For Notebook)

### Register Kernel

```bash
# Virtual environment harus ACTIVE
pip install ipykernel
python -m ipykernel install --user --name heartz --display-name 'Heartz (Python)'
```

### Verify Kernel

```bash
jupyter kernelspec list
# Output harus include: heartz    ...
```

### Launch Notebook

```bash
jupyter notebook main.ipynb
```

**In Jupyter:**

- Top-right: Verify kernel adalah "Heartz (Python)"
- If not: Kernel → Change kernel → select "Heartz (Python)"

---

## 📊 Optional: Streamlit Dashboard Setup

### Install (already in requirements.txt)

```bash
streamlit run app.py
```

- Browser auto-open ke http://localhost:8501
- Features: data visualization, audio playback, feature analysis

---

## 📦 Project Structure Finalization

### ✅ Current Structure

```
data-science/
├── main.ipynb              ✓ Core notebook
├── config.py               ✓ Configuration
├── requirements.txt        ✓ Dependencies
│
├── 🔧 Processing Modules
├── prepare_manual.py       ✓ Video→WAV conversion
├── splitter.py             ✓ Split by silence
├── cleaner.py              ✓ Noise reduction
├── augmentor.py            ✓ Data augmentation
├── utils.py                ✓ Helpers
│
├── 📊 Analysis Modules
├── eda.py                  ✓ EDA functions
├── feature_engineering.py  ✓ MFCC/ZCR extraction
├── ab_testing.py           ✓ Statistical tests
│
├── 📈 Dashboard (Optional)
├── app.py                  ✓ Streamlit app
├── .streamlit/config.toml  ✓ Streamlit config
│
├── 📚 Documentation
├── README.md               ✓ Pipeline overview
├── data_dictionary.md      ✓ Dataset schema
├── laporan_teknis.md       ✓ Technical report
├── FINALIZATION.md         ✓ This file
│
├── 🔐 Config
├── .gitignore              ✓ Git ignore patterns
├── .venv/                  ✓ Virtual environment
│
└── 📂 dataset/ (create on first run)
    ├── manual_downloads/   (input)
    ├── downloads/          (intermediate)
    ├── raw/                (intermediate)
    ├── clean/              (intermediate)
    ├── augmented/          (final)
    └── metadata/           (output CSV)
```

### ✅ What's NOT Needed

- ❌ `back-end/`, `front-end/`, `machine-learning/` (handled by other teams)
- ❌ Root-level README.md (maintained by project lead)

---

## 🚀 First Run: Full Pipeline

### Step 1: Prepare Data

1. Collect audio/video files (mp3, mp4, wav, flac)
2. Name them by syllable: `Ba.mp3`, `Me2.wav`, `O3.mp4`
3. Place in `dataset/manual_downloads/`

### Step 2: Run Pipeline

```bash
# Make sure venv is ACTIVE
jupyter notebook main.ipynb
```

### Step 3: Execute Cells in Order

- **STEP 0:** Setup & initialization
- **STEP 1:** Prepare audio (convert to WAV)
- **STEP 2:** Split by syllable
- **STEP 3:** Clean & normalize
- **STEP 4:** Augment data (4x replication)
- **STEP 5:** Feature extraction (MFCC, ZCR, RMS)
- **STEP 6:** A/B Testing & validation

### Step 4: Verify Output

```bash
python -c "
from utils import count_dataset
stats = count_dataset()
print(f'Total samples: {stats[\"total\"]}')
print(f'By stage: {stats[\"by_stage\"]}')
"
```

---

## 🔧 Common Maintenance Tasks

### Clear Virtual Environment Cache

```bash
# Deactivate first
deactivate

# Delete venv
rm -r .venv

# Recreate & reinstall
python -m venv .venv
.venv\Scripts\Activate.ps1  # Windows or source .venv/bin/activate
pip install -r requirements.txt
```

### Update Dependencies

```bash
# Check outdated
pip list --outdated

# Update specific package
pip install --upgrade librosa

# Full update
pip install --upgrade -r requirements.txt
```

### Fix Module Not Found

```bash
# Make sure venv is ACTIVE
pip install -r requirements.txt --force-reinstall --no-cache-dir
```

### Clear Notebook Cache

```bash
# Remove checkpoints
rm -r .ipynb_checkpoints

# Remove Python cache
find . -type d -name __pycache__ -exec rm -r {} +
```

---

## 📋 Final Checklist Before Start

- [ ] Python 3.8+ installed
- [ ] Virtual environment created & activated
- [ ] `pip install -r requirements.txt` completed
- [ ] `ensure_dirs()` ran successfully
- [ ] All module imports work
- [ ] Jupyter kernel registered (heartz)
- [ ] `dataset/` folder structure created with 20 classes
- [ ] No errors in verification tests
- [ ] Ready to place audio files in `dataset/manual_downloads/`

**Result:** ✅ Environment sepenuhnya siap untuk pipeline!

---

## 📞 Troubleshooting

### Virtual Environment Won't Activate (Windows)

```bash
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.venv\Scripts\Activate.ps1
```

### LibROSA Installation Fails

```bash
pip install --upgrade pip setuptools wheel
pip install librosa
```

### Jupyter Kernel Not Found

```bash
python -m ipykernel install --user --name heartz --display-name "Heartz (Python)" --force
```

### Module Import Error

```bash
# Reinstall from requirements
pip install -r requirements.txt --force-reinstall

# Verify
python -c "from config import ensure_dirs; print('✅ OK')"
```

### Port Already in Use

```bash
# Jupyter on port 8889
jupyter notebook main.ipynb --port 8889

# Streamlit on port 8502
streamlit run app.py --server.port 8502
```

---

## 📚 Additional Resources

- **Main Pipeline Overview:** [README.md](README.md)
- **Dataset Schema:** [data_dictionary.md](data_dictionary.md)
- **Technical Report:** [laporan_teknis.md](laporan_teknis.md)
- **LibROSA Docs:** https://librosa.org/doc/latest/
- **Audio Processing Guide:** https://en.wikipedia.org/wiki/Digital_signal_processing

---

## ✨ Ready to Go!

Setelah semua checklist selesai, Anda siap menjalankan full data science pipeline Heartz! 🚀

**Next:** Mulai dengan STEP 0 di `main.ipynb` 📖
