#!/bin/bash
# FarmBid Backend Startup Script for WhatsApp Automation

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║       FarmBid Backend with WhatsApp Automation          ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "   Please edit .env and set your configuration."
    echo ""
fi

# Ensure upload directories exist
mkdir -p uploads/listings
echo "✓ Upload directories ready"

# Ensure session directory exists
mkdir -p .wwebjs_auth
echo "✓ Session directory ready"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "🚀 Starting FarmBid Backend..."
echo "   Server will run on: http://localhost:3001"
echo "   API docs: http://localhost:3001/api/health"
echo ""
echo "📱 WhatsApp Setup Instructions:"
echo "   1. Wait for QR code to appear in terminal"
echo "   2. Open WhatsApp on your phone"
echo "   3. Go to Settings → Linked Devices"
echo "   4. Scan the QR code with your phone"
echo "   5. Wait for 'WhatsApp client is ready' message"
echo ""
echo "Press Ctrl+C to stop the server"
echo "═══════════════════════════════════════════════════════════"
echo ""

npm start
