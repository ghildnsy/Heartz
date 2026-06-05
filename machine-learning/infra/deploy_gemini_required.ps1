$ErrorActionPreference = 'Stop'
$env:AWS_PAGER = ''

# Deploy a new SageMaker model/config to endpoint `heartz` using the latest pushed ECR image URI.
# Prompts for GEMINI_API_KEY securely (won't echo), and never prints the key.

$region = 'ap-southeast-2'
$endpoint = 'heartz'

$awsCmd = Get-Command aws -ErrorAction SilentlyContinue
$awsCandidates = @()
if ($awsCmd) {
  $awsCandidates += $awsCmd.Source
}

# Common AWS CLI v2 locations (when PATH isn't loaded in non-interactive shells).
if ($env:ProgramFiles) {
  $awsCandidates += (Join-Path $env:ProgramFiles 'Amazon\AWSCLIV2\aws.exe')
  $awsCandidates += (Join-Path $env:ProgramFiles 'Amazon\AWSCLIV2\aws.cmd')
}
if ($env:ProgramW6432) {
  $awsCandidates += (Join-Path $env:ProgramW6432 'Amazon\AWSCLIV2\aws.exe')
  $awsCandidates += (Join-Path $env:ProgramW6432 'Amazon\AWSCLIV2\aws.cmd')
}

$aws = $awsCandidates | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
if (-not $aws) {
  throw "AWS CLI not found. Install AWS CLI v2, or ensure `aws` is on PATH. Tried: $($awsCandidates -join '; ')"
}

function Invoke-Aws {
  param(
    [Parameter(Mandatory=$true)][string[]]$Args
  )

  & $aws @Args
  $code = $LASTEXITCODE
  if ($code -ne 0) {
    throw "AWS CLI failed with exit code $code. Args: $($Args -join ' ')"
  }
}

$mlRoot = Split-Path -Parent $PSScriptRoot
$latestImageFile = Join-Path $mlRoot 'outputs/latest_image_uri.txt'

if (-not (Test-Path $latestImageFile)) {
  throw "Missing file: $latestImageFile. Build/push first to write latest image URI."
}

$imageUri = (Get-Content -Raw $latestImageFile).Trim()
if ([string]::IsNullOrWhiteSpace($imageUri)) {
  throw "latest_image_uri.txt is empty: $latestImageFile"
}

Write-Host "Using image: $imageUri"

# Prompt for Gemini key in THIS terminal session.
# Retry a few times because Ctrl+V can insert 0x16 (control char) instead of pasting.
$env:GEMINI_API_KEY = $null
for ($attempt = 1; $attempt -le 3; $attempt++) {
  $sec = Read-Host "Paste GEMINI_API_KEY (attempt $attempt/3)" -AsSecureString
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)
  try {
    $raw = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
  }
  finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
  }

  $rawLen = if ($null -eq $raw) { 0 } else { $raw.Length }
  $san = ($raw -replace '[\x00-\x1F\x7F]', '').Trim()
  $sanLen = if ($null -eq $san) { 0 } else { $san.Length }
  if ($sanLen -ne $rawLen) {
    Write-Host "Note: GEMINI_API_KEY sanitized (len $rawLen -> $sanLen)."
  }

  if (-not [string]::IsNullOrWhiteSpace($san)) {
    $env:GEMINI_API_KEY = $san
    break
  }

  Write-Host 'GEMINI_API_KEY empty after sanitize. Paste using Ctrl+Shift+V, Shift+Insert, or right-click paste (avoid Ctrl+V).'
}

if ([string]::IsNullOrWhiteSpace($env:GEMINI_API_KEY)) {
  throw 'GEMINI_API_KEY is empty after prompt.'
}

# Read current endpoint sizing + execution role.

$currentCfg = (& $aws sagemaker describe-endpoint --region $region --endpoint-name $endpoint --query EndpointConfigName --output text).Trim()
$currentModel = (& $aws sagemaker describe-endpoint-config --region $region --endpoint-config-name $currentCfg --query 'ProductionVariants[0].ModelName' --output text).Trim()
$role = (& $aws sagemaker describe-model --region $region --model-name $currentModel --query ExecutionRoleArn --output text).Trim()

$variant = & $aws sagemaker describe-endpoint-config --region $region --endpoint-config-name $currentCfg --query 'ProductionVariants[0].{InstanceType:InstanceType,InitialInstanceCount:InitialInstanceCount,InitialVariantWeight:InitialVariantWeight,VariantName:VariantName}' --output json | ConvertFrom-Json

$ts = Get-Date -Format 'yyyyMMdd-HHmmss'
$newModel = "heartz-model-gemini-required-$ts"
$newCfg = "heartz-config-gemini-required-$ts"

$geminiTimeoutSeconds = if (-not [string]::IsNullOrWhiteSpace($env:HEARTZ_GEMINI_TIMEOUT_SECONDS)) { $env:HEARTZ_GEMINI_TIMEOUT_SECONDS } else { '20' }
Write-Host "GEMINI_TIMEOUT_SECONDS=$geminiTimeoutSeconds"

$geminiModel = if (-not [string]::IsNullOrWhiteSpace($env:HEARTZ_GEMINI_MODEL)) { $env:HEARTZ_GEMINI_MODEL.Trim() } else { 'gemini-2.5-flash' }
Write-Host "GEMINI_MODEL=$geminiModel"

Write-Host "Current EndpointConfig: $currentCfg"
Write-Host "Current Model:        $currentModel"
Write-Host "New Model:            $newModel"
Write-Host "New EndpointConfig:   $newCfg"

# Create model/config JSON via temp files (avoid quoting issues in PowerShell/cmd).
$modelFile = Join-Path $env:TEMP ("heartz-model-$ts.json")
$cfgFile = Join-Path $env:TEMP ("heartz-endpoint-config-$ts.json")

try {
  # Create model.
$modelPayload = @{
  ModelName = $newModel
  ExecutionRoleArn = $role
  PrimaryContainer = @{
    Image = $imageUri
    Mode = 'SingleModel'
    Environment = @{
      GEMINI_API_KEY = $env:GEMINI_API_KEY
      GEMINI_MODEL = $geminiModel
      GEMINI_TIMEOUT_SECONDS = $geminiTimeoutSeconds
      GEMINI_REQUIRED = '1'
    }
  }
}

$modelJson = $modelPayload | ConvertTo-Json -Depth 12
[System.IO.File]::WriteAllText($modelFile, $modelJson, (New-Object System.Text.UTF8Encoding($false)))
$modelFileUri = 'file://' + ($modelFile -replace '\\','/')
Invoke-Aws -Args @('sagemaker','create-model','--region',$region,'--cli-input-json',$modelFileUri)

# Create endpoint config.
$cfgPayload = @{
  EndpointConfigName = $newCfg
  ProductionVariants = @(
    @{
      VariantName = $variant.VariantName
      ModelName = $newModel
      InitialInstanceCount = [int]$variant.InitialInstanceCount
      InstanceType = $variant.InstanceType
      InitialVariantWeight = [double]$variant.InitialVariantWeight
    }
  )
}

$cfgJson = $cfgPayload | ConvertTo-Json -Depth 12
[System.IO.File]::WriteAllText($cfgFile, $cfgJson, (New-Object System.Text.UTF8Encoding($false)))
$cfgFileUri = 'file://' + ($cfgFile -replace '\\','/')
Invoke-Aws -Args @('sagemaker','create-endpoint-config','--region',$region,'--cli-input-json',$cfgFileUri)

# Update endpoint + wait.
Invoke-Aws -Args @('sagemaker','update-endpoint','--region',$region,'--endpoint-name',$endpoint,'--endpoint-config-name',$newCfg)
Write-Host 'Waiting for endpoint to be InService...'
Invoke-Aws -Args @('sagemaker','wait','endpoint-in-service','--region',$region,'--endpoint-name',$endpoint)

Write-Host 'Done. Endpoint is InService.'
Write-Host "Active EndpointConfig should now be: $newCfg"
$activeCfg = (& $aws sagemaker describe-endpoint --region $region --endpoint-name $endpoint --query EndpointConfigName --output text).Trim()
Write-Host "EndpointConfig reported by AWS: $activeCfg"
}
finally {
  Remove-Item $modelFile, $cfgFile -Force -ErrorAction SilentlyContinue

  # Best-effort cleanup of secret from environment in this session.
  Remove-Item Env:\GEMINI_API_KEY -ErrorAction SilentlyContinue
}
