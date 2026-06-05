# Heartz
Heartz adalah platform terapi wicara mandiri berbasis kecerdasan buatan yang dirancang khusus untuk membantu penyandang disabilitas rungu (Tuli) dalam melatih artikulasi lisan secara konsisten, terjangkau, dan fleksibel dari rumah.

## Production API

Untuk penggunaan produksi (tanpa AWS SigV4 signing) gunakan:

- `POST https://30gz15d4bh.execute-api.ap-southeast-2.amazonaws.com/prod/predict`
	- Header: `Content-Type: audio/wav`
	- Body: raw bytes WAV
	- Optional latihan target: `?target=Ma`

Dokumentasi lengkap + file Postman ada di:
- [machine-learning/README.md](machine-learning/README.md)
