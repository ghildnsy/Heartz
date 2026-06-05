## Akses dari FE/BE/Postman (tanpa AWS signing)

SageMaker Runtime (`InvokeEndpoint`) idealnya dipanggil pakai IAM/SigV4 (AWS SDK/CLI). Browser/Postman itu ribet kalau harus signing.
Pola yang paling simpel untuk dipakai FE/BE:
**API Gateway → Lambda → SageMaker endpoint**.

Repo ini menyediakan contoh proxy (SAM):
- `machine-learning/infra/sagemaker_proxy_lambda.py`
- `machine-learning/infra/template.yaml`

Kalau deploy infra via CLI mentok `AccessDenied` (mis. `s3:PutObject`, `cloudformation:*`, `apigateway:*`), berarti kredensial AWS yang dipakai belum punya izin untuk provisioning infra. Dalam kondisi itu, workaround paling cepat adalah patch Lambda/API Gateway yang sudah ada.

Repo ini juga menyediakan file handler untuk dipakai sebagai kode Lambda (drop-in untuk function `heartz-api-wrapper`):
- `machine-learning/infra/lambda_function.py`

Kontrak proxy:
- `POST /predict`
- Body: raw WAV bytes
- Header: `Content-Type: audio/wav`
- Opsional verifikasi target:
	- query string `?target=A`, atau
	- header `x-heartz-target: A`
Invoke (contoh curl):

```bash
curl -X POST "https://<api-id>.execute-api.<region>.amazonaws.com/prod/predict?target=A" \
	-H "Content-Type: audio/wav" \
	--data-binary "@A_0001.wav"
```
# Heartz ML — Production Inference (AWS SageMaker)

Dokumen ini menjelaskan **cara pakai API produksi** Heartz yang sudah dideploy:
**API Gateway → Lambda → SageMaker endpoint**.
Targetnya: FE/BE/Postman bisa akses tanpa AWS SigV4 signing.

## Struktur

```text
machine-learning/
├── api/
│   ├── sagemaker.py
│   ├── Dockerfile.sagemaker
│   └── postman/
├── notebooks/
│   └── Heartz_Train.ipynb
├── outputs/
│   ├── heartz_model.keras
│   ├── class_names.json
│   └── heartz_config.json
├── buildspec.sagemaker.yml
└── requirements.txt
```

## Production API (public HTTP, tanpa SigV4)

Endpoint (current deploy):

- Region: `ap-southeast-2`
- URL Predict: `https://30gz15d4bh.execute-api.ap-southeast-2.amazonaws.com/prod/predict`
- URL Health: `https://30gz15d4bh.execute-api.ap-southeast-2.amazonaws.com/prod/health` (atau `/prod/ping`)

### 1. Endpoint Predict (POST)

Kontrak request:

- Method: `POST`
- Path: `/prod/predict`
- Header: `Content-Type: audio/wav` (atau `application/octet-stream`)
- Body: **raw bytes** file WAV (bukan multipart)
- Optional (mode latihan target):
	- query string `?target=Ma`
	- atau header `x-heartz-target: Ma`

Contoh (curl):

```bash
curl -X POST "https://30gz15d4bh.execute-api.ap-southeast-2.amazonaws.com/prod/predict?target=Ma" \
	-H "Content-Type: audio/wav" \
	--data-binary "@Ma_0001.wav"
```

Mode response:

1) **Classify (tanpa target)**
- `predicted_class`, `confidence`, `top_k`, `motivational_text`

2) **Verify / latihan target (dengan target)**
- Semua field classify + tambahan:
	`target`, `match`, `score`/`target_confidence`, `margin`, `target_rank`, `threshold`, `pass_soft`, `pass_strict`

Catatan motivasi:

- Jika `GEMINI_API_KEY` tersedia di container, `motivational_text` dihasilkan via Gemini **untuk semua mode** (classify & verify/latihan target).
- Jika Gemini gagal/timeout/masih busy, API akan mengembalikan **HTTP 503** (tanpa fallback template), supaya behavior sesuai requirement “Gemini wajib keluar”.
- Guardrail verifikasi: jika `pass_strict=false`, output Gemini **tidak boleh memuji**; jika terdeteksi memuji, API mengembalikan **HTTP 503** dan client perlu retry.

### 2. Endpoint Health & Ping (GET)

Mengecek status kesehatan server Lambda proxy dan koneksi real-time ke SageMaker endpoint.

Kontrak request:

- Method: `GET`
- Path: `/prod/health` (atau `/prod/ping`)

Contoh (curl):

```bash
curl -X GET "https://30gz15d4bh.execute-api.ap-southeast-2.amazonaws.com/prod/health"
```

Contoh Response (200 OK):

```json
{
  "status": "ok",
  "sagemaker_endpoint": "heartz",
  "sagemaker_status": "InService",
  "region": "ap-southeast-2"
}
```
*(Catatan: Jika Lambda proxy tidak memiliki izin IAM `sagemaker:DescribeEndpoint`, response akan tetap bernilai `200 OK` dengan keterangan `sagemaker_status: "unknown (describe_endpoint AccessDenied)"`).*

## Cara pakai (tim backend)

### Kontrak input

- Audio harus `.wav`.
- Diproses menjadi waveform **1 detik @ 16kHz (16000 sampel)**.
- Request inference ke SageMaker menggunakan **raw bytes WAV**.

### Kontrak output

Response JSON minimal:
- `predicted_class`
- `confidence`
- `top_k` (top 3)
- `motivational_text`

Mode verifikasi (latihan target):
- Kirim `CustomAttributes: target=<label>` (contoh: `target=Ba`)
- Response akan menambah: `target`, `match`, `score`, `target_confidence`, `margin`, `target_rank`, `threshold`, `pass_soft`, `pass_strict`

Threshold default: `TARGET_SCORE_THRESHOLD=0.60`

### Invoke via AWS CLI (langsung ke SageMaker, pakai IAM)

Set variable (sekali saja):

```bash
$env:AWS_REGION = "ap-southeast-2"
$env:SAGEMAKER_ENDPOINT_NAME = "heartz"
```

Invoke (klasifikasi):

```bash
aws sagemaker-runtime invoke-endpoint --region $env:AWS_REGION --endpoint-name $env:SAGEMAKER_ENDPOINT_NAME --content-type audio/wav --body fileb://data/clean_wav/A/A_0001.wav out.json
```

Invoke (verifikasi dengan target):

```bash
aws sagemaker-runtime invoke-endpoint --region $env:AWS_REGION --endpoint-name $env:SAGEMAKER_ENDPOINT_NAME --content-type audio/wav --custom-attributes "target=Ba" --body fileb://data/clean_wav/Ba/Ba_0001.wav out.json
```

### Invoke via Node.js (AWS SDK)

Install:

```bash
npm i @aws-sdk/client-sagemaker-runtime
```

Contoh invoke:

```js
import fs from "fs";
import {
	SageMakerRuntimeClient,
	InvokeEndpointCommand,
} from "@aws-sdk/client-sagemaker-runtime";

const client = new SageMakerRuntimeClient({ region: process.env.AWS_REGION });

const wavBytes = fs.readFileSync("./audio.wav");
const target = process.env.TARGET_LABEL; // optional, contoh: "Ba"

const cmd = new InvokeEndpointCommand({
	EndpointName: process.env.SAGEMAKER_ENDPOINT_NAME,
	ContentType: "audio/wav",
	Body: wavBytes,
	CustomAttributes: target ? `target=${target}` : undefined,
});

const resp = await client.send(cmd);
const jsonText = new TextDecoder().decode(resp.Body);
console.log(jsonText);
```

## Dokumentasi request (Postman)

Postman yang ada di repo ini diset untuk **production API Gateway URL** (public HTTP) dan mengirim body WAV sebagai binary:
- [machine-learning/api/postman/Heartz_ML_API.postman_collection.json](machine-learning/api/postman/Heartz_ML_API.postman_collection.json)
- [machine-learning/api/postman/Heartz_ML_API.postman_environment.json](machine-learning/api/postman/Heartz_ML_API.postman_environment.json)

Di environment Postman, update variable `wavFilePath` ke path file `.wav` di laptop kamu.

## Training (internal tim ML)

1) Dataset: `data/clean_wav/<class_name>/*.wav`
2) Notebook: `notebooks/Heartz_Train.ipynb`
3) Output export yang dipakai container:

```text
outputs/heartz_model.keras
outputs/class_names.json
outputs/heartz_config.json
```

## Ops note (ringkas)

Yang dipakai di produksi:

- SageMaker endpoint name: `heartz`
- Proxy infra (SAM): [machine-learning/infra/template.yaml](machine-learning/infra/template.yaml)
- Lambda handler: [machine-learning/infra/sagemaker_proxy_lambda.py](machine-learning/infra/sagemaker_proxy_lambda.py)

```bash
docker run --rm -p 8080:8080 heartz-sagemaker
```

Tes health:

```bash
curl.exe http://127.0.0.1:8080/ping
```

Tes predict (kirim WAV sebagai raw bytes):

```bash
curl.exe -X POST "http://127.0.0.1:8080/invocations" --data-binary "@data/clean_wav/A/A_0001.wav" -H "Content-Type: audio/wav"
```

3) Buat ECR repository (sekali saja) + push image

Garis besar:
- Buat repo di ECR
- Login docker ke ECR
- Tag image
- Push

Contoh (ganti `REGION`, `ACCOUNT_ID`, `REPO_NAME`):

```bash
aws ecr create-repository --repository-name REPO_NAME --region REGION
aws ecr get-login-password --region REGION | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com
docker tag heartz-sagemaker ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/REPO_NAME:latest
docker push ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/REPO_NAME:latest
```

4) Deploy di SageMaker (Console paling gampang)

Di AWS Console:
- Buka **SageMaker** → **Inference** → **Endpoints**
- Klik **Create endpoint**
- Buat **Model** baru:
	- Container image: pilih image dari ECR (yang barusan kamu push)
	- IAM role: pilih role yang punya akses SageMaker (minimal)
- Buat **Endpoint configuration**:
	- Instance type (CPU): mulai dari `ml.m5.large` atau `ml.c5.large` (sesuaikan budget)
	- Initial instance count: `1`
- Create endpoint → tunggu status **InService**

5) Cara backend Node/Express pakai SageMaker endpoint

SageMaker endpoint itu **bukan public HTTP** kayak `/predict`. Biasanya backend kalian yang call ke SageMaker pakai AWS SDK.

Install AWS SDK:

```bash
npm i @aws-sdk/client-sagemaker-runtime
```

Contoh invoke dari Node (kirim WAV bytes):

```js
import fs from "fs";
import {
	SageMakerRuntimeClient,
	InvokeEndpointCommand,
} from "@aws-sdk/client-sagemaker-runtime";

const client = new SageMakerRuntimeClient({ region: process.env.AWS_REGION });
const wavBytes = fs.readFileSync("data/clean_wav/A/A_0001.wav");

const cmd = new InvokeEndpointCommand({
	EndpointName: process.env.SAGEMAKER_ENDPOINT_NAME,
	ContentType: "audio/wav",
	Body: wavBytes,
});

const resp = await client.send(cmd);
const jsonText = new TextDecoder().decode(resp.Body);
console.log(jsonText);
```

Kalau kamu mau tetap punya API public kayak temen kamu (URL `/predict`), biasanya pakai:
- Backend Express sebagai public API, lalu backend itu invoke SageMaker (seperti contoh di atas)
- (opsional) tambah auth/rate limit di backend

## Catatan preprocessing audio (penting)

API akan resample ke 16kHz lalu membuat waveform **tepat 1 detik (16000 sampel)**.
Kalau audio lebih dari 1 detik, sistem akan memilih **window 1 detik dengan energi paling besar** (paling “kenceng”) lalu memakai window itu sebagai input model.
Kalau audio kurang dari 1 detik, audio dipad 0 di belakang sampai 1 detik.

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
