@echo off
title CLICK CAFE OS - SERVER
cd /d %~dp0

echo ------------------------------------------
echo     CLICK CAFE OS IS STARTING (PRODUCTION)
echo ------------------------------------------

:: 1. Server ko Production mode mein start karein (Ye bohat FAST hai)
start /b npm run start

:: 2. Wait karein (Ab sirf 5-7 second kafi hain kyunke build tayyar hai)
echo Waiting for system to be ready...
timeout /t 7 /nobreak > nul

:: 3. Chrome ko App Mode mein kholiye
echo Launching CLICK Cafe App...
start chrome --app="http://localhost:3000"

echo ------------------------------------------
echo  SERVER IS LIVE! MINIMIZE THIS WINDOW.
echo ------------------------------------------
pause