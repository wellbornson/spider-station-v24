@echo off
title SPIDER CAFE OS - SERVER
cd /d "%~dp0"

echo ------------------------------------------
echo     SPIDER CAFE OS IS STARTING...
echo ------------------------------------------

:: 1. Server ko Fast mode mein start karein
start /b npm run start

:: 2. Thora wait karein taake server ready ho jaye
echo Loading System...
timeout /t 10 /nobreak > nul

:: 3. Chrome ko direct App Mode mein kholiye
echo Launching SPIDER App...
start chrome --app="http://localhost:3000"

echo ------------------------------------------
echo  SERVER IS LIVE! DO NOT CLOSE THIS WINDOW.
echo ------------------------------------------
pause