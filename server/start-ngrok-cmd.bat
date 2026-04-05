@echo off
echo Starting Telegram Bot with ngrok...
echo.

REM Kill any existing node processes
taskkill /F /IM node.exe 2>NUL

REM Start the enhanced webhook server
echo Starting server on port 3001...
start /B node test-webhook.js

REM Wait a moment for server to start
timeout /t 3 /nobreak >NUL

REM Start ngrok
echo Starting ngrok tunnel...
ngrok http 3001 --region=us

pause
