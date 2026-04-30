@echo off
:: ─────────────────────────────────────────────────────────────────────────────
::  CLICK CAFE OS — One-Click Desktop Shortcut Setup
::  Creates a "CLICK CAFE OS" shortcut on the current user's Desktop.
::  The shortcut silently launches launcher.vbs (no CMD window shown).
:: ─────────────────────────────────────────────────────────────────────────────

set "DIR=%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$dir = '%DIR%' -replace '\\$',''; " ^
  "$lnk = [Environment]::GetFolderPath('Desktop') + '\CLICK CAFE OS.lnk'; " ^
  "$ws  = New-Object -ComObject WScript.Shell; " ^
  "$sc  = $ws.CreateShortcut($lnk); " ^
  "$sc.TargetPath       = 'wscript.exe'; " ^
  "$sc.Arguments        = '\"' + $dir + '\launcher.vbs\"'; " ^
  "$sc.WorkingDirectory = $dir; " ^
  "$sc.Description      = 'CLICK Cafe OS - Spider Station by Zahid ImAm'; " ^
  "$ico = $dir + '\public\favicon.ico'; " ^
  "if (Test-Path $ico) { $sc.IconLocation = $ico + ',0' } else { $sc.IconLocation = 'shell32.dll,15' }; " ^
  "$sc.Save(); " ^
  "Write-Host 'Shortcut created on Desktop.'"

echo.
echo  Setup complete! "CLICK CAFE OS" shortcut has been placed on your Desktop.
echo  Double-click it anytime to launch Spider Station silently.
echo.
pause
