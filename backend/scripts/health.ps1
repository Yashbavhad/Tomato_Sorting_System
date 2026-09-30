# npm run health → GET /api/health
$ErrorActionPreference = "Stop"
$base = if ($env:API_BASE_URL) { $env:API_BASE_URL.TrimEnd("/") } else { "http://127.0.0.1:8001" }
try {
    $resp = Invoke-WebRequest -Uri "$base/api/health" -UseBasicParsing -TimeoutSec 5
    Write-Host $resp.Content
    exit 0
} catch {
    Write-Host "Health check failed: $($_.Exception.Message)"
    exit 1
}
