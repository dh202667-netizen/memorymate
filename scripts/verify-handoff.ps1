param([string]$PackageRoot = (Join-Path $PSScriptRoot '..'))
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath $PackageRoot).Path
$manifest = Get-Content -LiteralPath (Join-Path $root 'PACKAGE-MANIFEST.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$verified = 0
foreach ($entry in $manifest.files) {
  $target = [System.IO.Path]::GetFullPath((Join-Path $root $entry.path))
  if (-not $target.StartsWith($root + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)) { throw 'Archive manifest contains an unsafe path.' }
  if (-not (Test-Path -LiteralPath $target -PathType Leaf)) { throw "Missing file: $($entry.path)" }
  $actual = (Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($actual -ne $entry.sha256) { throw "Hash mismatch: $($entry.path)" }
  $verified++
}
Write-Output "Verified $verified packaged files."
