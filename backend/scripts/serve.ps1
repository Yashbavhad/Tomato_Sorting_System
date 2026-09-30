# Starts Tomato Sorting FastAPI via the verified Python + Uvicorn.
# Does NOT install packages. Does NOT kill processes on port conflicts.
param(
    [switch]$Reload
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "Resolve-Python.ps1")

$backendRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $backendRoot

$hostName = if ($env:HOST) { $env:HOST } else { "127.0.0.1" }
$port = if ($env:PORT) { [int]$env:PORT } else { 8001 }
$apiBase = "http://${hostName}:${port}"
$modelRel = "weights/best_tomato_finetuned.keras"
$modelPath = Join-Path $backendRoot $modelRel

function Test-TomatoHealth {
    param([string]$BaseUrl)
    try {
        $resp = Invoke-WebRequest -Uri "$BaseUrl/api/health" -UseBasicParsing -TimeoutSec 3
        if ($resp.StatusCode -ne 200) { return $null }
        return ($resp.Content | ConvertFrom-Json)
    } catch {
        return $null
    }
}

function Test-PortInUse {
    param([int]$PortNumber)
    $listeners = @(Get-NetTCPConnection -LocalPort $PortNumber -State Listen -ErrorAction SilentlyContinue)
    return ($listeners.Count -gt 0)
}

function Get-PortOwnerInfo {
    param([int]$PortNumber)
    $conn = Get-NetTCPConnection -LocalPort $PortNumber -State Listen -ErrorAction SilentlyContinue |
        Select-Object -First 1
    if (-not $conn) {
        return @{ Pid = "unknown"; Process = "unknown" }
    }
    $procId = $conn.OwningProcess
    $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
    $name = if ($proc) { $proc.ProcessName } else { "unknown" }
    return @{ Pid = "$procId"; Process = $name }
}

# --- Port already occupied? ---
if (Test-PortInUse -PortNumber $port) {
    $health = Test-TomatoHealth -BaseUrl $apiBase
    if ($health -and $health.status -eq "ok" -and $health.model_loaded -eq $true) {
        Write-Host "Tomato Sorting FastAPI is already running on port $port."
        Write-Host "No second server was started."
        exit 0
    }

    $owner = Get-PortOwnerInfo -PortNumber $port
    Write-Host "Port $port is already in use by another process."
    Write-Host ""
    Write-Host "PID:"
    Write-Host $owner.Pid
    Write-Host "Process:"
    Write-Host $owner.Process
    Write-Host ""
    Write-Host "The Tomato Sorting backend was not started."
    exit 1
}

# --- Resolve verified Python ---
$python = Resolve-TomatoPython
if (-not $python) {
    Write-Host "ERROR: Could not find a Python environment with TensorFlow."
    Write-Host ""
    Write-Host "Expected one of:"
    Write-Host "  - backend\.venv (project venv with TensorFlow 2.21.x)"
    Write-Host "  - %USERPROFILE%\venv (verified machine environment)"
    Write-Host "  - TOMATO_PYTHON pointing to python.exe"
    Write-Host ""
    Write-Host "System 'python' without TensorFlow will not be used."
    exit 1
}

$pyVersion = (& $python --version 2>&1 | Out-String).Trim()
$tfVersion = (& $python -c "import tensorflow as tf; print(tf.__version__)" 2>$null | Select-Object -Last 1)
$kerasVersion = (& $python -c "import keras; print(keras.__version__)" 2>$null | Select-Object -Last 1)

if (-not (Test-Path -LiteralPath $modelPath)) {
    Write-Host "ERROR: Model file not found: $modelRel"
    Write-Host "Full path: $modelPath"
    exit 1
}

Write-Host "========================================"
Write-Host " Tomato Sorting FastAPI Backend"
Write-Host "========================================"
Write-Host ""
Write-Host "Python:"
Write-Host $pyVersion
Write-Host ""
Write-Host "Python exe:"
Write-Host $python
Write-Host ""
Write-Host "TensorFlow:"
Write-Host $tfVersion
Write-Host ""
Write-Host "Keras:"
Write-Host $kerasVersion
Write-Host ""
Write-Host "Model:"
Write-Host $modelRel
Write-Host ""
Write-Host "Host:"
Write-Host $hostName
Write-Host ""
Write-Host "Port:"
Write-Host $port
Write-Host ""
Write-Host "API:"
Write-Host $apiBase
Write-Host ""
Write-Host "Health:"
Write-Host "$apiBase/api/health"
Write-Host ""
Write-Host "========================================"
Write-Host "Starting FastAPI..."
Write-Host "========================================"
Write-Host ""

$uvicornArgs = @(
    "-m", "uvicorn",
    "app.main:app",
    "--host", $hostName,
    "--port", "$port"
)
if ($Reload) {
    $uvicornArgs += "--reload"
}

& $python @uvicornArgs
exit $LASTEXITCODE
