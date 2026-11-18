@echo off
setlocal
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0mobile\scripts\run-preview.ps1"
if errorlevel 1 pause
endlocal
