# npm run test → existing Python consistency test (pytest is not installed)
$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "Resolve-Python.ps1")

$backendRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $backendRoot

$python = Resolve-TomatoPython
if (-not $python) {
    Write-Host "ERROR: Could not find a Python environment with TensorFlow."
    exit 1
}

$testImageDir = Join-Path $backendRoot "docs\testdata"
$env:TEST_IMAGE_DIR = $testImageDir
$env:API_BASE_URL = if ($env:API_BASE_URL) { $env:API_BASE_URL } else { "http://127.0.0.1:8001" }

Write-Host "Running consistency test against $($env:API_BASE_URL)"
Write-Host "TEST_IMAGE_DIR=$testImageDir"
Write-Host "Python: $python"
Write-Host ""

& $python (Join-Path $backendRoot "tests\consistency_test.py")
exit $LASTEXITCODE
