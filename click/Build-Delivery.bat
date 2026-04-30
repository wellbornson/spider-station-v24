@echo off
setlocal EnableDelayedExpansion

:: ─────────────────────────────────────────────────────────────────────────────
::  SPIDER STATION — Build & Delivery Packager
::  Run this from inside the "click" project folder.
::  Output: %USERPROFILE%\Desktop\CLICK_CLIENT_SOFTWARE
:: ─────────────────────────────────────────────────────────────────────────────

set "PROJECT_DIR=%~dp0"
set "DELIVERY_DIR=%USERPROFILE%\Desktop\CLICK_CLIENT_SOFTWARE"

echo.
echo  ============================================================
echo   SPIDER STATION — Build ^& Delivery Packager
echo  ============================================================
echo.

:: ── Step 1: Build ─────────────────────────────────────────────────────────
echo [1/5] Running production build...
cd /d "%PROJECT_DIR%"
call npm run build
if %ERRORLEVEL% neq 0 (
    echo.
    echo  ERROR: Build failed. Fix errors above and try again.
    pause
    exit /b 1
)
echo  Build complete.
echo.

:: ── Step 2: Clean previous delivery folder ────────────────────────────────
echo [2/5] Preparing delivery folder...
if exist "%DELIVERY_DIR%" (
    echo  Removing old delivery folder...
    rmdir /s /q "%DELIVERY_DIR%"
)
mkdir "%DELIVERY_DIR%"
mkdir "%DELIVERY_DIR%\.next\static"
mkdir "%DELIVERY_DIR%\public"
mkdir "%DELIVERY_DIR%\data"
echo  Folder created: %DELIVERY_DIR%
echo.

:: ── Step 3: Copy standalone server ────────────────────────────────────────
echo [3/5] Copying standalone server files...
xcopy /e /i /q "%PROJECT_DIR%.next\standalone\." "%DELIVERY_DIR%\"
if %ERRORLEVEL% neq 0 (
    echo  ERROR: Failed to copy standalone output.
    pause
    exit /b 1
)
echo  Standalone files copied.
echo.

:: ── Step 4: Copy static assets ────────────────────────────────────────────
echo [4/5] Copying static assets and public folder...
xcopy /e /i /q "%PROJECT_DIR%.next\static\." "%DELIVERY_DIR%\.next\static\"
xcopy /e /i /q "%PROJECT_DIR%public\." "%DELIVERY_DIR%\public\"
echo  Assets copied.
echo.

:: ── Step 5: Copy data folder (empty record JSONs) ─────────────────────────
if exist "%PROJECT_DIR%data\" (
    xcopy /e /i /q "%PROJECT_DIR%data\." "%DELIVERY_DIR%\data\"
    echo  Data folder copied.
) else (
    echo  No data folder found — creating empty placeholder.
    echo {} > "%DELIVERY_DIR%\data\.gitkeep"
)

:: ── Step 6: Copy .env.local (DRM keys) ────────────────────────────────────
if exist "%PROJECT_DIR%.env.local" (
    copy /y "%PROJECT_DIR%.env.local" "%DELIVERY_DIR%\.env.local" >nul
    echo  .env.local copied (DRM + email config included).
) else (
    echo  WARNING: .env.local not found — DRM secrets not included.
)
echo.

:: ── Step 7: Copy launcher scripts ────────────────────────────────────────
echo [5/6] Copying launcher scripts...
for %%F in (RUN-CLICK.bat Silent-Run.vbs Create-Shortcut.vbs) do (
    if exist "%PROJECT_DIR%%%F" (
        copy /y "%PROJECT_DIR%%%F" "%DELIVERY_DIR%\%%F" >nul
        echo  Copied %%F
    ) else (
        echo  WARNING: %%F not found in project root.
    )
)
echo.

:: ── Step 8: Drop Start-Software.bat into delivery folder ──────────────────
echo [6/6] Writing Start-Software.bat for client...
(
    echo @echo off
    echo setlocal
    echo.
    echo set "PORT=3000"
    echo set "HOSTNAME=localhost"
    echo.
    echo echo.
    echo echo  ====================================================
    echo echo   SPIDER STATION — Starting Software...
    echo echo  ====================================================
    echo echo.
    echo echo  Server starting at http://localhost:3000
    echo echo  Close this window to stop the software.
    echo echo.
    echo.
    echo :: Open browser after a short delay
    echo start "" cmd /c "timeout /t 3 /nobreak ^>nul ^& start http://localhost:%PORT%"
    echo.
    echo :: Start the Next.js standalone server
    echo node server.js
    echo.
    echo pause
) > "%DELIVERY_DIR%\Start-Software.bat"
echo  Start-Software.bat written.
echo.

:: ── Done ──────────────────────────────────────────────────────────────────
echo  ============================================================
echo   DELIVERY PACKAGE READY
echo   Location: %DELIVERY_DIR%
echo  ============================================================
echo.
echo  Give the client the CLICK_CLIENT_SOFTWARE folder.
echo  CLIENT SETUP (one-time):
echo    1. Double-click Create-Shortcut.vbs  (creates Desktop icon)
echo  DAILY USE:
echo    Double-click "CLICK CAFE OS" icon on Desktop.
echo    (No CMD window — opens Chrome App Mode directly)
echo.
pause
