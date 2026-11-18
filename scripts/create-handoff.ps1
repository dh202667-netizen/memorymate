param([switch]$StageOnly)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$manifest = Get-Content -LiteralPath (Join-Path $root 'mobile\src\manifest.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss-fff'
$stageRoot = Join-Path $root "output\handoff-$stamp"
$sourceStage = Join-Path $stageRoot 'source\MemoryMate'
$fullStage = Join-Path $stageRoot 'full\MemoryMate'
$sourceFiles = @('README.md','START_HERE.md','NEXT_AI_PROMPT.md','AGENTS.md','.gitignore',
  '.github/workflows/build.yml','.devcontainer/devcontainer.json',
  'publish/deployment.json',
  'releases/MemoryMate-v0.3.0-verification.json','releases/SHA256SUMS.txt')
Push-Location -LiteralPath $root
try {
  $sourceFiles += @(rg --files --hidden mobile docs handoff scripts -g '!mobile/node_modules/**' -g '!mobile/dist/**' -g '!mobile/unpackage/**' -g '!mobile/.hbuilderx/**' -g '!mobile/.env.local' -g '!**/*.log')
  if ($LASTEXITCODE -ne 0) { throw 'Unable to enumerate source files with rg.' }
} finally { Pop-Location }
$sourceFiles = @($sourceFiles | ForEach-Object { $_.Replace('\','/') } | Sort-Object -Unique)

function Copy-Selection([string[]]$Files, [string]$Destination) {
  foreach ($relative in $Files) {
    if (($relative -match '(^|/)\.env($|\.)' -and $relative -notmatch '(^|/)\.env\.example$') -or $relative -match '(^|/)(\.npmrc|\.netrc|\.pypirc|\.git-credentials)$') { throw "Credential configuration rejected: $relative" }
    if ($relative -match '(^|/)(node_modules|\.git|\.hbuilderx|\.local-signing)(/|$)|\.env\.local$|\.(jks|keystore|p12|pfx|pem|key)$') { throw "Private or generated file rejected: $relative" }
    $origin = [System.IO.Path]::GetFullPath((Join-Path $root $relative))
    if (-not $origin.StartsWith($root + [System.IO.Path]::DirectorySeparatorChar,[System.StringComparison]::OrdinalIgnoreCase)) { throw 'Source path escaped workspace.' }
    $target = Join-Path $Destination $relative
    New-Item -ItemType Directory -Path (Split-Path -Parent $target) -Force | Out-Null
    Copy-Item -LiteralPath $origin -Destination $target
  }
}
function Write-Inventory([string]$Directory, [string]$Kind) {
  $items = @()
  foreach ($file in (Get-ChildItem -LiteralPath $Directory -File -Recurse -Force | Sort-Object FullName)) {
    $relative = $file.FullName.Substring($Directory.Length+1).Replace('\','/')
    if ($relative -eq 'PACKAGE-MANIFEST.json') { continue }
    if ($file.Extension -match '^\.(md|json|ts|js|mjs|cjs|vue|scss|ps1|cmd|html|svg)$') {
      $text = [System.IO.File]::ReadAllText($file.FullName)
      if ($text -match 'gh[pousr]_[A-Za-z0-9]{30,}|sk-(?:proj-)?[A-Za-z0-9_-]{24,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|(?i:token=)[A-Za-z0-9_-]{24,}|https?://[^\s/@:]+:[^\s/@]+@') { throw "Potential credential detected: $relative" }
    }
    $items += [ordered]@{path=$relative;bytes=$file.Length;sha256=(Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()}
  }
  [ordered]@{formatVersion=1;kind=$Kind;version=$manifest.versionName;createdAt=[DateTime]::UtcNow.ToString('o');files=$items} | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $Directory 'PACKAGE-MANIFEST.json') -Encoding UTF8
  return $items.Count
}
function Write-Zip([string]$Directory, [string]$Target) {
  if (Test-Path -LiteralPath $Target) { throw "Archive already exists; preserve it or choose a new destination before rebuilding: $Target" }
  $zip = [System.IO.Compression.ZipFile]::Open($Target,[System.IO.Compression.ZipArchiveMode]::Create,[System.Text.Encoding]::UTF8)
  try {
    foreach ($file in (Get-ChildItem -LiteralPath $Directory -File -Recurse -Force)) {
      $entry = 'MemoryMate/' + $file.FullName.Substring($Directory.Length+1).Replace('\','/')
      [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip,$file.FullName,$entry,[System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
  } finally { $zip.Dispose() }
}

Copy-Selection $sourceFiles $sourceStage
$sourceCount = Write-Inventory $sourceStage 'source'
if ($StageOnly) { @{sourceStage=$sourceStage;files=$sourceCount} | ConvertTo-Json -Compress; return }
$webFiles = @()
Push-Location -LiteralPath $root
try { $webFiles = @(rg --files --hidden publish/github-pages -g '!**/.git/**' -g '!**/*.log') } finally { Pop-Location }
Copy-Selection @($sourceFiles + $webFiles + 'releases/MemoryMate-v0.3.0-android.apk') $fullStage
$fullCount = Write-Inventory $fullStage 'full'
$sourceZip = Join-Path $root "MemoryMate-v$($manifest.versionName)-Handoff-Source.zip"
$fullZip = Join-Path $root "MemoryMate-v$($manifest.versionName)-Handoff-Full.zip"
Write-Zip $sourceStage $sourceZip
Write-Zip $fullStage $fullZip
$checksumLines = @($sourceZip,$fullZip) | ForEach-Object { ((Get-FileHash -LiteralPath $_ -Algorithm SHA256).Hash.ToLowerInvariant()) + '  ' + (Split-Path -Leaf $_) }
$checksumLines | Set-Content -LiteralPath (Join-Path $root 'MemoryMate-Handoff-SHA256SUMS.txt') -Encoding ASCII
@{sourceZip=$sourceZip;fullZip=$fullZip;sourceFiles=$sourceCount;fullFiles=$fullCount;sourceStage=$sourceStage;fullStage=$fullStage} | ConvertTo-Json -Compress
