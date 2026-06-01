# Machine Learning Inference (SageMaker)

## Uji Endpoint via AWS CLI

Jalankan dari root repository (`Heartz`) agar path file relatif terbaca:

```powershell
aws sagemaker-runtime invoke-endpoint `
  --region ap-southeast-2 `
  --endpoint-name heartz `
  --content-type audio/wav `
  --body fileb://machine-learning/data/clean_wav/A/A_0001.wav `
  out.json
```

Jika muncul error:

`Unable to load paramfile ... No such file or directory`

berarti path file di `--body` tidak ditemukan dari folder aktif saat ini. Solusinya:

1. `cd` dulu ke root repo `Heartz`, atau
2. pakai path absolut file audio.

## Next Step Setelah Prediksi Berhasil

Jika output sudah seperti ini:

- `ContentType: application/json`
- `predicted_class`, `confidence`, `top_k`, `motivational_text` muncul di `out.json`

maka endpoint inference sudah jalan. Lanjutkan ke:

1. **Uji batch sample** untuk setiap huruf vokal (`A, I, U, E, O`) dan cek konsistensi confidence.
2. **Integrasi ke back-end/front-end**: kirim audio rekaman user ke endpoint ini lalu tampilkan `predicted_class`, `top_k`, dan `motivational_text`.
3. **Monitoring kualitas**: simpan log prediksi (tanpa data sensitif) untuk evaluasi model.
