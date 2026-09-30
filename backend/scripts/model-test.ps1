# npm run model:test -- "path\to\image.jpg"
$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "Resolve-Python.ps1")

$backendRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $backendRoot

$python = Resolve-TomatoPython
if (-not $python) {
    Write-Host "ERROR: Could not find a Python environment with TensorFlow."
    exit 1
}

if ($args.Count -lt 1) {
    Write-Host "Usage: npm run model:test -- `"path\to\image.jpg`""
    exit 2
}

& $python (Join-Path $backendRoot "test_model.py") @args
exit $LASTEXITCODE
