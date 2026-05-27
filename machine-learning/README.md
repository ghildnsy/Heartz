# Heartz Machine Learning — Simplified Notebook + API

Struktur ini sengaja dibuat simpel untuk monorepo:

```text
machine-learning/
├── notebooks/
│   └── Heartz_Train.ipynb
├── api/
│   ├── main.py
│   └── Dockerfile
├── data/
│   └── clean_wav/
├── outputs/
├── infer.py
├── evaluate.py
└── requirements.txt
```

## Alur kerja

1. Taruh dataset di `data/clean_wav/<class_name>/*.wav`.
2. Buka `notebooks/Heartz_Train.ipynb`.
3. Run all cells untuk build model, training, evaluasi, TensorBoard log, dan export model.
4. Jalankan API:

```bash
uvicorn api.main:app --reload
```

Catatan: jalankan dari folder `machine-learning/`. Jika `uvicorn` tidak ada di PATH, gunakan:

```bash
python -m uvicorn api.main:app --reload
```

5. Test Swagger:

```text
http://127.0.0.1:8000/docs
```

## Output notebook

```text
outputs/heartz_model.keras
outputs/saved_model/
outputs/class_names.json
outputs/heartz_config.json
outputs/logs/
```

## Simple inference (non-API)

Jalankan dari folder `machine-learning/`:

```bash
python infer.py path\\to\\audio.wav
```

## Evaluation + threshold check (Accuracy & MAE)

Default layout: `data/clean_wav/<class_name>/*.wav`

```bash
python evaluate.py --fail-on-thresholds
```

Hasil metrics juga akan ditulis ke `outputs/metrics.json` (bisa diubah lewat `--output-json`).

Quick check (lebih cepat):

```bash
python evaluate.py --max-samples 1000 --shuffle --fail-on-thresholds
```

## Test API `/predict` (Windows)

Start server (dari folder `machine-learning/`):

```bash
python -m uvicorn api.main:app --reload
```

Panggil endpoint pakai `curl.exe` (hindari alias PowerShell `curl`):

```bash
curl.exe -X POST "http://127.0.0.1:8000/predict" -F "file=@data/clean_wav/A/A_0001.wav"
```

Alternatif PowerShell:

```powershell
$form = @{ file = Get-Item "data/clean_wav/A/A_0001.wav" }
Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8000/predict" -Form $form
```

## Full demo run (one command)

Script ini akan:
- run evaluasi (tulis `outputs/metrics.json`)
- start API
- call `/health` dan `/predict` (tulis `outputs/predict_demo.json`)
- stop API

Run dari repo root:

```powershell
powershell -ExecutionPolicy Bypass -File machine-learning/demo_run.ps1
```

## Catatan arsitektur

Notebook tetap mengikuti requirement Heartz MVP:

- Functional API, bukan Sequential.
- Input raw waveform `(16000,)`.
- Layer pertama custom `MelSpectrogramLayer` memakai `tf.signal.stft`.
- CNN 2D from scratch.
- Output 20 softmax classes.
- Custom training loop `tf.GradientTape`, tanpa `model.fit()`.
- Custom categorical crossentropy + label smoothing 0.1.
- Manual early stopping.
- TensorBoard logging.
- Export `.keras` dan SavedModel.
