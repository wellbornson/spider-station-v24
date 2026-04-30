@echo off
title SPIDER CAFE OS - SERVER
cd /d "%~dp0"
if exist "click" (cd /d "click")

echo ------------------------------------------
echo     SPIDER CAFE OS IS STARTING...
echo ------------------------------------------

:: Server start karein (Production mode)
start /b npm run start

echo Waiting for server to initialize (20s)...
timeout /t 20 /nobreak > nul

:: Chrome App Mode
echo Launching SPIDER Cafe App...
start chrome --app="http://localhost:3000"

echo ------------------------------------------
echo  SERVER IS LIVE! MINIMIZE THIS WINDOW.
echo ------------------------------------------
pause