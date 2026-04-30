@echo off
color 0A
title SPIDER STATION - CLICK
cls

echo.
echo  ============================================================
echo.
echo        *** SPIDER STATION - CLICK   ***
echo        *** INTERNET CAFE MANAGEMENT OS  ***
echo.
echo  ============================================================
echo.

:: --- Directory Check ---
:: %~dp0 matlab yehi folder, uske andar 'click' folder mein jana hai
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

:: --- Launch Dev Server ---
echo.
echo  [1/3] Starting Next.js server...
:: High priority taake software slow na chale
start /high /min "CLICK-SERVER" cmd /c "npm run dev"
echo        Server process launched in background (HIGH priority).

:: --- Initial Buffer Wait ---
echo.
echo  [2/3] SYSTEM INITIALIZING... [WAIT]
echo.
echo        Base wait: 10 seconds before health check begins.
echo.
timeout /t 10 /nobreak >nul
echo  [==========] 100%% Base wait complete.
echo.

:: --- Smart Health Check Loop ---
echo  [WAIT] WAITING FOR SERVER TO WAKE UP...
echo.
set ATTEMPT=0

:healthcheck
set /a ATTEMPT+=1
:: Server ko check karna ke wo zinda hua ya nahi
curl -s -o nul -w "%%{http_code}" http://localhost:3000 >"%TEMP%\click_ping.txt" 2>nul
set /p HTTP_CODE=<"%TEMP%\click_ping.txt"
del "%TEMP%\click_ping.txt" 2>nul

if "%HTTP_CODE%"=="200" goto server_ready
if "%HTTP_CODE%"=="304" goto server_ready

echo  [PING #%ATTEMPT%] Server not ready yet... retrying in 3s
timeout /t 3 /nobreak >nul
goto healthcheck

:server_ready
echo  [OK] Server is UP after %ATTEMPT% ping(s). Launching interface...
echo.

:: --- Launch Chrome in App Mode ---
echo  [3/3] Launching CLICK interface...
:: Chrome check
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app="http://localhost:3000" --start-maximized
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --app="http://localhost:3000" --start-maximized
) else (
    echo  [WARN] Chrome not found. Opening default browser...
    start http://localhost:3000
)

echo.
echo  ============================================================
echo   Spider Station is Running. DO NOT CLOSE THIS WINDOW.
echo  ============================================================
echo.

:keepalive
timeout /t 60 /nobreak >nul
goto keepalive