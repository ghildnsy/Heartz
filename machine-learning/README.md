# Heartz Machine Learning — Simplified Notebook + API

Struktur ini sengaja dibuat simpel untuk monorepo:

```text
machine-learning/
├── notebooks/
│   └── Heartz_MVP_Training_All_in_One.ipynb
├── api/
│   ├── main.py
│   └── Dockerfile
├── data/
│   └── clean_wav/
├── outputs/
└── requirements.txt
```

## Alur kerja

1. Taruh dataset di `data/clean_wav/<class_name>/*.wav`.
2. Buka `notebooks/Heartz_MVP_Training_All_in_One.ipynb`.
3. Run all cells untuk build model, training, evaluasi, TensorBoard log, dan export model.
4. Jalankan API:

```bash
uvicorn api.main:app --reload
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
