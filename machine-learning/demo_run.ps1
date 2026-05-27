<#
Full demo run for Heartz Machine Learning (Windows PowerShell).

What it does:
1) Runs evaluation (Accuracy + MAE) and writes metrics JSON.
2) Starts FastAPI server (uvicorn).
3) Calls /health and /predict with a WAV file and writes response JSON.
4) Stops the API server.

Run from repo root:
  powershell -ExecutionPolicy Bypass -File machine-learning/demo_run.ps1

Or run from machine-learning/:
  powershell -ExecutionPolicy Bypass -File demo_run.ps1
#>

[CmdletBinding()]
param(
  [string]$HostAddress = "127.0.0.1",
  [int]$Port = 8000,
  [int]$MaxSamples = 0,
  [string]$WavPath = "data/clean_wav/A/A_0001.wav",
  [string]$MetricsOut = "outputs/metrics.json",
  [string]$PredictOut = "outputs/predict_demo.json",
  [switch]$FailOnThresholds
)

$ErrorActionPreference = "Stop"

function Resolve-RepoPython {
  $here = Split-Path -Parent $PSCommandPath
  $candidate = Join-Path $here "..\.venv\Scripts\python.exe"
  if (Test-Path $candidate) { return (Resolve-Path $candidate).Path }

  $candidate = Join-Path $here ".venv\Scripts\python.exe"
  if (Test-Path $candidate) { return (Resolve-Path $candidate).Path }

  $cmd = Get-Command python -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Path }

  throw "Python executable not found. Create a venv at repo/.venv or ensure python is on PATH."
}

$mlRoot = Split-Path -Parent $PSCommandPath
Push-Location $mlRoot

try {
  $pythonExe = Resolve-RepoPython

  Write-Host "[1/4] Evaluating model..." -ForegroundColor Cyan

  $evalArgs = @("evaluate.py")
  if ($MaxSamples -gt 0) {
    $evalArgs += @("--max-samples", "$MaxSamples", "--shuffle")
  }
  if ($FailOnThresholds) {
    $evalArgs += "--fail-on-thresholds"
  }
  $evalArgs += @("--output-json", "$MetricsOut")

  & $pythonExe @evalArgs

  Write-Host "[2/4] Starting API server..." -ForegroundColor Cyan

  $apiArgs = @(
    "-m",
    "uvicorn",
    "api.main:app",
    "--host",
    "$HostAddress",
    "--port",
    "$Port"
  )

  $apiProc = Start-Process -FilePath $pythonExe -ArgumentList $apiArgs -PassThru -WindowStyle Hidden

  # Wait for /health
  $baseUrl = "http://$HostAddress`:$Port"
  $healthUrl = "$baseUrl/health"

  $deadline = (Get-Date).AddSeconds(30)
  $ready = $false
  while ((Get-Date) -lt $deadline) {
    try {
      $health = & curl.exe -s $healthUrl
      if ($LASTEXITCODE -eq 0 -and $health) {
        $ready = $true
        break
      }
    } catch {
      # ignore
    }
    Start-Sleep -Milliseconds 400
  }

  if (-not $ready) {
    throw "API did not become ready within 30s at $healthUrl"
  }

  Write-Host "[3/4] Calling /predict..." -ForegroundColor Cyan

  $wavFull = (Resolve-Path $WavPath).Path
  $predictUrl = "$baseUrl/predict"

  $predictJson = & curl.exe -s -X POST $predictUrl -F "file=@$wavFull"
  if ($LASTEXITCODE -ne 0 -or -not $predictJson) {
    throw "curl.exe request failed. Check that the server is running and the WAV path is valid."
  }

  $predictOutPath = Resolve-Path (Join-Path $mlRoot ".") | ForEach-Object { Join-Path $_ $PredictOut }
  $predictOutDir = Split-Path -Parent $predictOutPath
  if (-not (Test-Path $predictOutDir)) { New-Item -ItemType Directory -Path $predictOutDir | Out-Null }
  $predictJson | Out-File -FilePath $predictOutPath -Encoding utf8

  Write-Host "Saved predict response: $PredictOut" -ForegroundColor Green
  Write-Host "Saved metrics: $MetricsOut" -ForegroundColor Green

  Write-Host "[4/4] Stopping API server..." -ForegroundColor Cyan
  Stop-Process -Id $apiProc.Id -Force

  Write-Host "Demo run complete." -ForegroundColor Green
}
finally {
  Pop-Location
}
