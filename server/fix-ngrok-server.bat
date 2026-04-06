@echo off
echo 🔧 Fixing Ngrok Server Connection
echo ================================
echo.

REM Kill existing processes
taskkill /F /IM node.exe 2>NUL

REM Start the working server
echo 🚀 Starting Fixed Server...
node working-telegram-server.js

pause
