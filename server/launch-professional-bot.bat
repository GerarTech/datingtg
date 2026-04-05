@echo off
echo 🌟 Launching Professional Yene Dating Bot + Mini App
echo =================================================
echo.

REM Kill existing processes
taskkill /F /IM node.exe 2>NUL

REM Start professional bot with mini app
echo 🚀 Starting Professional Bot + Mini App...
node telegram-mini-app.js

pause
