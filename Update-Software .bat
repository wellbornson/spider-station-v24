@echo off
title Spider Station - Smart Updater
echo Deleting old cache...
rd /s /q .next
echo Copying new updates...
echo Updating system logic...
npm install --production
echo Update Complete! Your data is safe.
pause
start Reset-Software.bat