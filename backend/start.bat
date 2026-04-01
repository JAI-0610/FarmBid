@echo off
REM FarmBid Backend Startup Script for WhatsApp Automation

echo ============================================================
echo      FarmBid Backend with WhatsApp Automation
echo ============================================================
echo.

REM Check if .env exists
if not exist ".env" (
    echo Warning: .env file not found. Creating from .env.example...
    copy .env.example .env
    echo Please edit .env and set your configuration.
    echo.
)

REM Ensure upload directories exist
if not exist "uploads\listings" mkdir uploads\listings
echo Upload directories ready

REM Ensure session directory exists
if not exist ".wwebjs_auth" mkdir .wwebjs_auth
echo Session directory ready

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting FarmBid Backend...
echo Server will run on: http://localhost:3001
echo API docs: http://localhost:3001/api/health
echo.
echo WhatsApp Setup Instructions:
echo   1. Wait for QR code to appear in terminal
echo   2. Open WhatsApp on your phone
echo   3. Go to Settings -^> Linked Devices
echo   4. Scan the QR code with your phone
echo   5. Wait for "WhatsApp client is ready" message
echo.
echo Press Ctrl+C to stop the server
echo ============================================================
echo.

npm start
