@echo off
color 0A
title SPIDER STATION - CLICK

:: ============================================================
::
::        *** SPIDER STATION - CLICK ***
::        *** INTERNET CAFE MANAGEMENT OS ***
::
:: ============================================================

cls
echo.
echo  ============================================================
echo.
echo        ***   SPIDER STATION - CLICK   ***
echo        ***  INTERNET CAFE MANAGEMENT OS  ***
echo.
echo  ============================================================
echo.

:: ── Directory Check ──────────────────────────────────────────
set TARGET_DIR=%~dp0click
cd /d "%TARGET_DIR%" 2>nul
if errorlevel 1 (
    echo.
    echo  [ERROR] Directory not found: %TARGET_DIR%
    echo  Please verify the project path and try again.
    echo.
    pause
    exit /b 1
)
echo  [PATH] OK - %TARGET_DIR%

:: ── Launch Dev Server (HIGH priority, minimized background) ───
echo.
echo  [1/3] Starting Next.js server...
start /high /min "CLICK-SERVER" cmd /c "npm run dev"
echo        Server process launched in background (HIGH priority).

:: ── Initial Buffer Wait (10 seconds) ─────────────────────────
echo.
echo  [2/3] SYSTEM INITIALIZING... [WAIT]
echo.
echo         Base wait: 10 seconds before health check begins.
echo.
echo  [          ]  0%%
timeout /t 2 /nobreak >nul
echo  [==        ] 20%%
timeout /t 2 /nobreak >nul
echo  [====      ] 40%%
timeout /t 2 /nobreak >nul
echo  [======    ] 60%%
timeout /t 2 /nobreak >nul
echo  [========  ] 80%%
timeout /t 2 /nobreak >nul
echo  [==========] 100%%  Base wait complete.
echo.

:: ── Smart Health Check Loop ───────────────────────────────────
echo  [WAIT] WAITING FOR SERVER TO WAKE UP...
echo.
set ATTEMPT=0

:healthcheck
set /a ATTEMPT+=1
:: Use curl (available on Windows 10+) to ping the server silently
curl -s -o nul -w "%%{http_code}" http://localhost:3000 >"%TEMP%\click_ping.txt" 2>nul
set /p HTTP_CODE=<"%TEMP%\click_ping.txt"
del "%TEMP%\click_ping.txt" 2>nul

if "%HTTP_CODE%"=="200" goto server_ready
if "%HTTP_CODE%"=="304" goto server_ready

echo  [PING #%ATTEMPT%] Server not ready yet (code: %HTTP_CODE%)... retrying in 3s
timeout /t 3 /nobreak >nul
goto healthcheck

:server_ready
echo  [OK] Server is UP after %ATTEMPT% ping(s). Launching interface...
echo.

:: ── Launch Chrome in App Mode ─────────────────────────────────
echo  [3/3] Launching CLICK interface in Chrome App Mode...
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app="http://localhost:3000" --start-maximized
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --app="http://localhost:3000" --start-maximized
) else (
    echo  [WARN] Chrome not found in standard paths. Opening default browser...
    start http://localhost:3000
)
echo.

:: ── Keep-Alive Message ────────────────────────────────────────
echo  ============================================================
echo.
echo    Software is Running.
echo    Minimize this window to keep the system active.
echo.
echo    To shut down: close Chrome, then close this window.
echo.
echo  ============================================================
echo.

:: Keep the window alive indefinitely
:keepalive
timeout /t 60 /nobreak >nul
goto keepalive
