param(
  [ValidateSet('Check','Build','Status')][string]$Action = 'Check',
  [string]$HBuilderPath = 'D:\HBuilderX\HBuilderX.5.26.2026091802\HBuilderX'
)
$ErrorActionPreference = 'Stop'
$project = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$manifest = Get-Content -LiteralPath (Join-Path $project 'src\manifest.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$package = Get-Content -LiteralPath (Join-Path $project 'package.json') -Raw -Encoding UTF8 | ConvertFrom-Json
if ($manifest.appid -notmatch '^__UNI__[A-Za-z0-9]+$') { throw 'A valid DCloud AppID is required.' }
if ($package.version -ne $manifest.versionName) { throw 'Package and manifest versions differ.' }
foreach ($icon in $manifest.'app-plus'.distribute.icons.android.PSObject.Properties) {
  if (-not (Test-Path -LiteralPath (Join-Path $project $icon.Value))) { throw "Missing native icon: $($icon.Value)" }
}
Write-Output "AppID $($manifest.appid); version $($manifest.versionName); package com.memorymate.demo"
if ($Action -eq 'Check') { Write-Output 'Local packaging inputs checked. No cloud job was submitted.'; return }
$cli = Join-Path $HBuilderPath 'cli.exe'
if (-not (Test-Path -LiteralPath $cli)) { throw 'Set -HBuilderPath to your HBuilderX 5.26 installation.' }
& $cli open
& $cli project open --path $project
$arguments = if ($Action -eq 'Status') { @('pack','status','--project',$project,'--json','true') } else {
  @('pack','--project',$project,'--platform','android','--android.packagename','com.memorymate.demo','--android.androidpacktype','3','--safemode','false')
}
& $cli @arguments | ForEach-Object {
  # HBuilderX may append authenticated promotion links to its status output.
  Write-Output ([string]$_ -replace '(?i)(token=)[^&\s"<>]+','$1[redacted]')
}
if ($LASTEXITCODE -ne 0) { throw "HBuilderX CLI exited with $LASTEXITCODE." }
Write-Output 'Review the actual final build status; CLI exit code alone does not verify an APK.'
