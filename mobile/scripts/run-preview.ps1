param([switch]$NoBrowser)

$ErrorActionPreference = 'Stop'
$projectPath = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$previewUrl = 'http://127.0.0.1:5173/'
$previewResponse = $null
try {
  $previewResponse = Invoke-WebRequest -Uri $previewUrl -UseBasicParsing -TimeoutSec 3
} catch {
  # An offline preview is expected before the first launch.
}

if ($previewResponse) {
  if ($previewResponse.Content -notmatch '<title>[^<]*MemoryMate[^<]*</title>') {
    throw 'Port 5173 is occupied by another service. Close that service before starting MemoryMate.'
  }
  Write-Host "MemoryMate is already running: $previewUrl"
  if (-not $NoBrowser) { Start-Process -FilePath $previewUrl }
  return
}

$npmCommand = Get-Command npm.cmd -ErrorAction SilentlyContinue
if (-not $npmCommand) { throw 'Node.js/npm is required. Install Node.js 22 or newer, then retry.' }
if (-not (Test-Path -LiteralPath (Join-Path $projectPath 'node_modules\@dcloudio\vite-plugin-uni\bin\uni.js'))) {
  throw 'Project dependencies are missing. Run npm ci in the mobile folder, then retry.'
}

Write-Host "Starting MemoryMate: $previewUrl"
Write-Host 'Keep this window open while using the preview. Press Ctrl+C to stop.'
$previewArguments = @('run', 'dev:h5', '--', '--strictPort')
if (-not $NoBrowser) { $previewArguments += '--open' }
Push-Location -LiteralPath $projectPath
try {
  & $npmCommand.Source @previewArguments
  if ($LASTEXITCODE -ne 0) { throw "MemoryMate exited with code $LASTEXITCODE." }
} finally {
  Pop-Location
}
