@echo off
setlocal EnableDelayedExpansion
title SPIDER STATION — Deep Clean + Fresh Build
color 0A

cd /d "%~dp0"
echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║   SPIDER STATION — Deep Clean ^& Force Rebuild           ║
echo  ║   This will delete .next cache and rebuild from scratch  ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.

:: ════════════════════════════════════════════════════════════════════════════
::  STEP 1 — Kill all node processes (release file locks on .next)
:: ════════════════════════════════════════════════════════════════════════════
echo  [1/6] Killing all node.exe processes...
taskkill /f /im node.exe /t >nul 2>&1
taskkill /f /im node  /t >nul 2>&1
timeout /t 2 /nobreak >nul 2>&1
echo  [1/6] Done.

:: ════════════════════════════════════════════════════════════════════════════
::  STEP 2 — Force delete the .next directory (handles ENOTEMPTY)
::           robocopy trick: sync empty dir over .next, then rd removes it
:: ════════════════════════════════════════════════════════════════════════════
echo  [2/6] Removing .next directory...
if exist ".next" (
    :: Create a guaranteed-empty temp dir to robocopy over .next
    if not exist "%TEMP%\click_empty" md "%TEMP%\click_empty"
    robocopy "%TEMP%\click_empty" ".next" /mir /njh /njs /ndl /nc /ns >nul 2>&1
    rd /s /q ".next" >nul 2>&1
    if exist ".next" (
        echo  [WARN] .next still locked — trying takeown...
        takeown /f ".next" /r /d y >nul 2>&1
        icacls ".next" /grant "%USERNAME%":F /t >nul 2>&1
        rd /s /q ".next" >nul 2>&1
    )
)
echo  [2/6] Done.

:: ════════════════════════════════════════════════════════════════════════════
::  STEP 3 — Delete node_modules\.cache (Webpack / SWC cache)
:: ════════════════════════════════════════════════════════════════════════════
echo  [3/6] Clearing Webpack/SWC cache...
if exist "node_modules\.cache" (
    rd /s /q "node_modules\.cache" >nul 2>&1
)
echo  [3/6] Done.

:: ════════════════════════════════════════════════════════════════════════════
::  STEP 4 — Clear Next.js temp files from Windows %TEMP%
:: ════════════════════════════════════════════════════════════════════════════
echo  [4/6] Clearing Next.js temp files from %%TEMP%%...
for /d %%D in ("%TEMP%\next-*" "%TEMP%\webpack-*" "%TEMP%\click_empty") do (
    if exist "%%D" rd /s /q "%%D" >nul 2>&1
)
del /f /q "%TEMP%\*.hot-update.*" >nul 2>&1
echo  [4/6] Done.

:: ════════════════════════════════════════════════════════════════════════════
::  STEP 5 — npm install (ensure no missing packages)
:: ════════════════════════════════════════════════════════════════════════════
echo  [5/6] Running npm install...
echo.
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo  [ERROR] npm install failed. Check your internet connection or package.json.
    pause
    exit /b 1
)
echo.
echo  [5/6] Done.

:: ════════════════════════════════════════════════════════════════════════════
::  STEP 6 — Fresh production build
:: ════════════════════════════════════════════════════════════════════════════
echo  [6/6] Running npm run build (production)...
echo.
call npm run build
echo.

if exist ".next\server\app\page.js" (
    echo  ─────────────────────────────────────────────────────────────
    echo  [SUCCESS] Build completed! .next directory is ready.
) else if exist ".next" (
    echo  [SUCCESS] Build completed! .next directory created.
) else (
    echo  ─────────────────────────────────────────────────────────────
    echo  [ERROR] Build may have failed — .next folder not found.
    echo  Review the npm output above for errors.
    pause
    exit /b 1
)

:: Check for standalone server.js (needed by RUN-CLICK.bat)
if exist ".next\standalone\server.js" (
    echo  [INFO] Copying standalone server.js to project root...
    copy /y ".next\standalone\server.js" "server.js" >nul 2>&1
    echo  [INFO] server.js is ready at root.
) else if exist "server.js" (
    echo  [INFO] server.js already exists at root.
) else (
    echo  [WARN] standalone server.js not found. If output:standalone is set,
    echo         check that next.config.js has output: 'standalone' and rebuild.
)

echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║   All done! You can now run RUN-CLICK.bat to launch.    ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.
pause
