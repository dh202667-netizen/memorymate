param(
  [string]$HBuilderPath = 'D:\HBuilderX\HBuilderX.5.26.2026091802\HBuilderX',
  [string]$DeviceId = '',
  [switch]$CompileOnly
)
$ErrorActionPreference = 'Stop'
$projectPath = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$cliPath = Join-Path $HBuilderPath 'cli.exe'
$appPath = Join-Path $HBuilderPath 'HBuilderX.exe'
if (-not (Test-Path -LiteralPath $cliPath)) { throw '请通过 -HBuilderPath 指定已安装的 HBuilderX 目录。' }
if (-not (Get-Process -Name HBuilderX -ErrorAction SilentlyContinue)) {
  Start-Process -FilePath $appPath -WindowStyle Hidden
  $ready = $false
  for ($attempt = 0; $attempt -lt 20; $attempt++) {
    Start-Sleep -Seconds 1
    $versionOutput = & $cliPath version
    if ($versionOutput -match '\d+\.\d+') { $ready = $true; break }
  }
  if (-not $ready) { throw 'HBuilderX 尚未就绪，请打开后重试。' }
}
& $cliPath project open --path $projectPath
if ($CompileOnly) {
  $buildOutput = & $cliPath launch app-android --project $projectPath --compile true
  $buildOutput | Write-Output
  if (($buildOutput -join "`n") -notmatch '编译成功') { throw '未观察到 Android 调试编译成功，请检查上方日志。' }
  exit 0
}
$adbPath = Join-Path $HBuilderPath 'plugins\launcher-tools\tools\adbs\adb.exe'
if (-not (Test-Path -LiteralPath $adbPath)) { throw '请先在 HBuilderX 安装 App 真机运行插件。' }
$devices = @(& $adbPath devices | Where-Object { $_ -match '^\S+\s+device$' } | ForEach-Object { ($_ -split '\s+')[0] })
if (-not $devices.Count) { & $adbPath devices -l; throw '未检测到已授权的 Android 设备。请开启手机 USB 调试，并在手机上允许此电脑。' }
if ($DeviceId -and $DeviceId -notin $devices) { throw '指定设备不在已授权设备列表中。' }
if (-not $DeviceId) { $DeviceId = $devices[0] }
& $cliPath launch app-android --project $projectPath --deviceId $DeviceId --playground standard --native-log true
