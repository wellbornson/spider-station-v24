@echo on
setlocal EnableDelayedExpansion
title SPIDER STATION — DEBUG MODE

:: ─────────────────────────────────────────────────────────────────────────────
::  DEBUG-RUN.bat — Every line visible, every error stays on screen.
::  Use this when the silent launcher fails. Read the red lines carefully.
:: ─────────────────────────────────────────────────────────────────────────────

:: STEP 1 — Lock working directory to this script's folder
cd /d "%~dp0"
echo [DEBUG] Working directory: %CD%

:: STEP 2 — Confirm server.js exists
if not exist "server.js" (
    echo.
    echo ====================================================
    echo  ERROR: server.js NOT FOUND in %CD%
    echo  Fix:   Run Build-Delivery.bat first, then retry.
    echo ====================================================
    echo.
    pause
    exit /b 1
)
echo [DEBUG] server.js found: OK

:: STEP 3 — Confirm Node.js is reachable
node -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [DEBUG] 'node' not in PATH. Searching common install locations...

    set "NODE="
    if exist "C:\Program Files\nodejs\node.exe"       set "NODE=C:\Program Files\nodejs\node.exe"
    if exist "C:\Program Files (x86)\nodejs\node.exe" set "NODE=C:\Program Files (x86)\nodejs\node.exe"
    if exist "%APPDATA%\nvm\current\node.exe"          set "NODE=%APPDATA%\nvm\current\node.exe"

    if not defined NODE (
        echo.
        echo ====================================================
        echo  ERROR: Node.js NOT found anywhere on this machine.
        echo  Install from: https://nodejs.org
        echo ====================================================
        echo.
        pause
        exit /b 1
    )
    echo [DEBUG] Node.js found at: !NODE!
) else (
    for /f "tokens=*" %%V in ('node -v 2^>nul') do echo [DEBUG] Node.js version: %%V
    set "NODE=node"
)

:: STEP 4 — Open Chrome now so it's ready when the server comes up
echo [DEBUG] Opening Chrome for http://localhost:3000 ...
start chrome http://localhost:3000

:: STEP 5 — Run server in FOREGROUND (all output visible here — errors stay)
echo.
echo [DEBUG] Starting server.js in foreground. Press CTRL+C to stop.
echo ─────────────────────────────────────────────────────────────
%NODE% server.js

:: Execution only reaches here if the server crashes or is stopped
echo.
echo [DEBUG] Server exited. Review the output above for errors.
pause
