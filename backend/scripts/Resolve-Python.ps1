# Resolves the verified Python executable for Tomato Sorting FastAPI.
# Preference order (no package reinstalls):
#   1) TOMATO_PYTHON env
#   2) backend/.venv or backend/venv
#   3) repo-root /.venv
#   4) active VIRTUAL_ENV
#   5) $HOME/venv (verified machine fallback)
#   6) python on PATH (only if TensorFlow imports)

function Test-PythonHasTensorFlow {
    param([Parameter(Mandatory = $true)][string]$PythonExe)
    if (-not (Test-Path -LiteralPath $PythonExe)) { return $false }
    & $PythonExe -c "import tensorflow" 2>$null
    return ($LASTEXITCODE -eq 0)
}

function Resolve-TomatoPython {
    $backendRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
    $repoRoot = (Resolve-Path (Join-Path $backendRoot "..")).Path
    $candidates = @()

    if ($env:TOMATO_PYTHON) {
        $candidates += $env:TOMATO_PYTHON
    }

    $candidates += @(
        (Join-Path $backendRoot ".venv\Scripts\python.exe")
        (Join-Path $backendRoot "venv\Scripts\python.exe")
        (Join-Path $repoRoot ".venv\Scripts\python.exe")
    )

    if ($env:VIRTUAL_ENV) {
        $candidates += (Join-Path $env:VIRTUAL_ENV "Scripts\python.exe")
        $candidates += (Join-Path $env:VIRTUAL_ENV "bin\python")
    }

    if ($env:USERPROFILE) {
        $candidates += (Join-Path $env:USERPROFILE "venv\Scripts\python.exe")
    }
    if ($env:HOME) {
        $candidates += (Join-Path $env:HOME "venv\Scripts\python.exe")
        $candidates += (Join-Path $env:HOME "venv\bin\python")
    }

    foreach ($candidate in $candidates) {
        if (-not $candidate) { continue }
        if (Test-PythonHasTensorFlow -PythonExe $candidate) {
            return (Resolve-Path -LiteralPath $candidate).Path
        }
    }

    $pathPython = Get-Command python -ErrorAction SilentlyContinue
    if ($pathPython -and (Test-PythonHasTensorFlow -PythonExe $pathPython.Source)) {
        return $pathPython.Source
    }

    return $null
}
