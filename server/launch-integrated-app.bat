@echo off
echo 🌟 Launching Yene Dating App + Telegram Integration
echo ===================================================
echo.

REM Kill existing processes
taskkill /F /IM node.exe 2>NUL

REM Start integrated app server
echo 🚀 Starting Yene Dating App + Telegram Integration...
echo 📱 Mini App will load your actual React app
echo 🤖 Bot commands will link to your app
echo.

node integrated-mini-app.js

pause
