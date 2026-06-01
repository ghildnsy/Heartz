# Heartz Machine Learning

## Uji Endpoint SageMaker (AWS CLI)

Kalau muncul error `Unable to load paramfile ... No such file or directory`, berarti path file audio dibaca relatif dari folder kerja saat ini.

### Opsi 1: Jalankan dari root project

```powershell
cd D:\Hemkerr\Heartz
aws sagemaker-runtime invoke-endpoint \
  --region ap-southeast-2 \
  --endpoint-name heartz \
  --content-type audio/wav \
  --body fileb://machine-learning/data/clean_wav/A/A_0001.wav \
  out.json
```

### Opsi 2: Tetap dari folder mana pun (pakai path absolut)

```powershell
aws sagemaker-runtime invoke-endpoint \
  --region ap-southeast-2 \
  --endpoint-name heartz \
  --content-type audio/wav \
  --body fileb://D:/Hemkerr/Heartz/machine-learning/data/clean_wav/A/A_0001.wav \
  out.json
```

## Next Step Setelah `invoke-endpoint` Berhasil

1. Validasi hasil prediksi di `out.json` (`predicted_class`, `confidence`, `top_k`, `motivational_text`).
2. Ulangi test untuk beberapa file dari kelas lain (A/I/U/E/O dan suku kata lain) untuk cek konsistensi model.
3. Tentukan `confidence threshold` (mis. 0.7) untuk handling prediksi ragu-ragu di aplikasi.
4. Integrasikan pemanggilan endpoint ini ke backend API agar frontend cukup hit endpoint backend.
