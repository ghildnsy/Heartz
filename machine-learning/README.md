# Heartz ML — Production Inference (AWS SageMaker)

Repo ini berisi model + container inference untuk produksi lewat **AWS SageMaker Real-time Endpoint**.
Tujuan README ini: tim backend bisa langsung pakai endpoint (tanpa bahas run/test lokal).

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

### Invoke via AWS CLI

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

Kalau tim kamu butuh “documentation page” ala Postman, file Postman sudah disiapkan:
- [machine-learning/api/postman/Heartz_ML_API.postman_collection.json](machine-learning/api/postman/Heartz_ML_API.postman_collection.json)
- [machine-learning/api/postman/Heartz_ML_API.postman_environment.json](machine-learning/api/postman/Heartz_ML_API.postman_environment.json)

Catatan: Postman ini paling cocok untuk **backend proxy API** (public HTTP) yang nanti invoke SageMaker.

## Training (internal tim ML)

1) Dataset: `data/clean_wav/<class_name>/*.wav`
2) Notebook: `notebooks/Heartz_Train.ipynb`
3) Output export yang dipakai container:

```text
outputs/heartz_model.keras
outputs/class_names.json
outputs/heartz_config.json
```

## Deploy / redeploy (ops)

Jalur deploy yang dipakai: **ECR → SageMaker (custom container)**.

### 1) Build + push image (tanpa Docker lokal)

Pakai AWS CodeBuild dengan buildspec:
- [machine-learning/buildspec.sagemaker.yml](machine-learning/buildspec.sagemaker.yml)

Buildspec ini:
- region: `ap-southeast-2`
- repo ECR: `heartz`
- image tag: `build-<CODEBUILD_BUILD_NUMBER>` (aman untuk tag immutability)

### 2) SageMaker real-time endpoint

Di SageMaker Console:
- Create **Model** (container image dari ECR)
- Create **Endpoint configuration** (mulai dari 1 instance CPU)
- Create **Endpoint** → tunggu `InService`

Untuk production di SageMaker, pakai entrypoint khusus:
- `GET /ping`
- `POST /invocations` (body = raw bytes WAV)

### Deploy ke AWS SageMaker (real-time endpoint, custom container)

Poin penting (biar tidak bingung): di SageMaker kamu biasanya deploy **container inference** (yang di dalamnya ada code preprocessing + load model + predict). Jadi bukan cuma “model doang”.

Di repo ini sudah disiapkan entrypoint khusus SageMaker:
- Healthcheck: `GET /ping`
- Inference: `POST /invocations` (body = raw bytes file WAV)

File-nya:
- [machine-learning/api/sagemaker.py](machine-learning/api/sagemaker.py)
- [machine-learning/api/Dockerfile.sagemaker](machine-learning/api/Dockerfile.sagemaker)

#### Step-by-step (bahasa bayi)

0) Pastikan model export sudah ada:
- `outputs/heartz_model.keras`
- `outputs/class_names.json`

1) Build Docker image (dari folder `machine-learning/`):

```bash
docker build -t heartz-sagemaker -f api/Dockerfile.sagemaker .
```

##### Kalau kamu TIDAK bisa install Docker di laptop (pakai AWS CodeBuild)

Intinya: CodeBuild itu “mesin AWS” yang bisa build Docker image buat kamu.

Syarat:
- Repo kamu harus bisa diakses oleh CodeBuild (paling gampang: GitHub/CodeCommit). Kalau belum, kamu bisa upload source sebagai `.zip` ke S3.

Yang sudah disiapkan di repo ini:
- Build spec: [machine-learning/buildspec.sagemaker.yml](machine-learning/buildspec.sagemaker.yml)

Catatan penting: Dockerfile akan `COPY outputs/heartz_model.keras` dan `outputs/class_names.json`.
Jadi pastikan folder `machine-learning/outputs/` itu ikut ke-upload ke source CodeBuild (atau sudah ada di repo).

Langkah bayi (Console):

1) Pastikan ECR repo sudah ada (misal `heartz-sagemaker`) di region `ap-southeast-2`.

2) Buka AWS Console → **CodeBuild** → **Create build project**
	 - Project name: `heartz-sagemaker-build`
	 - Source:
		 - Kalau repo ada di GitHub: pilih GitHub lalu connect repo
		 - Kalau pakai S3: upload zip source repo, lalu pilih S3 object itu
	 - Environment:
		 - Managed image: `Ubuntu`
		 - Runtime: `Standard`
		 - Image: pilih yang terbaru (contoh `aws/codebuild/standard:7.0`)
		 - **Centang**: `Privileged` (WAJIB supaya bisa build Docker)
	 - Service role:
		 - Create new role (biar gampang)
		 - Role harus punya izin push ke ECR + `sts:GetCallerIdentity`
	 - Buildspec:
		 - Pilih `Use a buildspec file`
		 - Path: `machine-learning/buildspec.sagemaker.yml`
	 - Create project

3) Klik **Start build**
	 - Kalau sukses, image otomatis ke-push ke ECR sebagai `:latest`.

Habis itu kamu lanjut ke step “Deploy di SageMaker (Console)”, pakai image dari ECR.

2) Test lokal (optional tapi disarankan):

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
