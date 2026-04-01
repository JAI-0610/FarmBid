# FarmBid WhatsApp Automation - Setup Guide

## ✅ All Fixes Applied

Your WhatsApp automation backend has been fixed with the following improvements:

### 1. **Fixed Session Path Configuration**
- Resolved duplicate and incorrect session path in `.env`
- Session data will now be stored in `backend/.wwebjs_auth` (correct location)

### 2. **Improved Browser Detection (Windows)**
- Enhanced Chrome/Edge detection for Windows systems
- Uses `LOCALAPPDATA` paths and common install locations
- Falls back to Puppeteer's bundled Chromium

### 3. **Fixed Client Ready State Bug**
- Corrected `clientReady` flag to be set to `true` on ready event (was incorrectly false in some code)
- Better state management for message queuing

### 4. **Optimized Puppeteer Configuration**
- Removed problematic Chrome flags that caused crashes
- Default to **visible browser mode** (easier for initial setup and debugging)
- Headless mode can be enabled via `WHATSAPP_HEADLESS=true` in `.env`

### 5. **Better Error Handling & Logging**
- Comprehensive logging for QR code, authentication, disconnections
- Automatic reconnection on disconnect (with 5-second retry)
- Clear error messages for common issues

### 6. **Simplified Code Structure**
- Removed try-catch wrappers that hid errors
- Direct imports of required modules
- Clean initialization flow

---

## 🚀 Quick Start

### **Option A: Using Windows Batch File (Recommended on Windows)**

1. Open a command prompt or PowerShell in the `backend` folder
2. Run:
   ```cmd
   start.bat
   ```

### **Option B: Using Shell Script (Linux/Mac/Git Bash)**
```bash
cd BGSCET/FarmBid/backend
chmod +x start.sh
./start.sh
```

### **Option C: Manual Start**
```bash
cd BGSCET/FarmBid/backend
npm start
```

---

## 📱 WhatsApp Authentication Steps

1. **Start the backend** using one of the methods above
2. **Wait for the QR code** to appear in the terminal
3. **Open WhatsApp** on your phone
4. Go to **Settings → Linked Devices** (or WhatsApp Web/Desktop)
5. **Scan the QR code** with your phone's camera
6. Wait for the message: `✅ WhatsApp client is ready and authenticated!`
7. Your backend is now ready to send/receive WhatsApp messages!

---

## 📡 Testing the API

Once the server is running and WhatsApp is authenticated:

### Check WhatsApp status:
```bash
curl http://localhost:3001/api/whatsapp/status
```

Expected response:
```json
{
  "ready": true,
  "qr": null,
  "authFailure": null
}
```

### Send a test message:
```bash
curl -X POST http://localhost:3001/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{"phone":"+91XXXXXXXXXX","text":"Hello from FarmBid!"}'
```

### Test farmer notification:
```bash
curl -X POST http://localhost:3001/api/whatsapp/notify-bid \
  -H "Content-Type: application/json" \
  -d '{"farmerPhone":"+91XXXXXXXXXX","bidAmount":50,"quantity":100,"buyerCity":"Bangalore"}'
```

---

## 🔧 Configuration

Edit the `.env` file in the backend folder to customize:

```env
# Server
PORT=3001
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# WhatsApp
WHATSAPP_SESSION_PATH=./.wwebjs_auth
WHATSAPP_HEADLESS=false          # Set to true for headless mode (server without display)
PUPPETEER_EXECUTABLE_PATH=       # Optional: full path to Chrome/Edge executable
```

**Important:** The `.env` file must be in the `backend` directory (same level as `server.js`).

---

## 🐛 Troubleshooting

### **Issue: QR code not showing / Browser not opening**
**Solution:** Make sure Chrome or Edge is installed.
- Set `PUPPETEER_EXECUTABLE_PATH` in `.env` to your browser path:
  - Chrome: `C:\Program Files\Google\Chrome\Application\chrome.exe`
  - Edge: `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`

Or install Chrome if not present.

---

### **Issue: Browser opens but stays blank / crashes**
**Solution:** Set `WHATSAPP_HEADLESS=false` in `.env` (already default). The visible browser mode works more reliably on Windows.

---

### **Issue: Authentication fails after first scan**
**Solution:** Delete the `.wwebjs_auth` folder and restart the server to get a fresh QR code.
```bash
rm -rf .wwebjs_auth  # or delete manually
npm start
```

---

### **Issue: "Cannot find module 'whatsapp-web.js' or 'puppeteer'**
**Solution:** Run `npm install` to install dependencies.

---

### **Issue: Session directory not writable**
**Solution:** Ensure the backend folder is writable. The `.wwebjs_auth` folder will be created automatically.

---

### **Issue: WhatsApp disconnects frequently**
**Cause:** WhatsApp Web has anti-bot detection and may disconnect if many messages are sent.
**Solution:** The client auto-reconnects. If disconnects persist, try:
- Increase reconnection delay in code (currently 5 seconds)
- Use a real phone device (not emulator) for scanning
- Avoid sending too many messages rapidly (WhatsApp rate limits)

---

## 📊 Diagnostic Tool

Run the diagnostic script to check your setup:

```bash
cd BGSCET/FarmBid/backend
node diagnostic.js
```

This will show:
- Environment variables
- Browser installation status
- Module versions
- Directory structure
- Common issues

---

## 🧪 Automated Test

You can also test the WhatsApp client directly (without full server):

```bash
cd BGSCET/FarmBid/backend
node test-whatsapp-client.js
```

This will:
- Initialize the WhatsApp client
- Show QR code
- Wait for authentication
- Display success message

Press `Ctrl+C` to exit.

---

## 🔄 What Was Fixed

| Issue | Status | Fix Applied |
|-------|--------|-------------|
| Incorrect session path | ✅ Fixed | Updated `.env` and code fallbacks |
| Browser not found on Windows | ✅ Fixed | Improved `getBrowserExecutable()` with Windows paths |
| Client ready state bug | ✅ Fixed | `clientReady = true` on ready event |
| Headless mode crashes | ✅ Fixed | Default to `headless: false` |
| Missing auto-reconnect | ✅ Fixed | Added reconnect logic on disconnect |
| Message queuing not working | ✅ Fixed | Proper queue and flush on ready |
| Poor error logging | ✅ Fixed | Added detailed console logs |

---

## 📚 Files Modified

- `backend/.env` - Created with correct config
- `backend/.env.example` - Fixed duplicate entries
- `backend/utils/whatsapp.js` - Completely rewritten with fixes
- `backend/package.json` - Updated to compatible versions
- `backend/start.bat` - Added Windows startup script
- `backend/start.sh` - Added Unix startup script
- `backend/diagnostic.js` - Added diagnostic tool
- `backend/test-whatsapp-client.js` - Added quick test script

---

## 🎯 Next Steps

1. **Start the server**: Run `start.bat` or `npm start`
2. **Scan QR code** with your WhatsApp mobile app
3. **Wait for ready** message
4. **Test API**: Open browser to `http://localhost:3001/api/health`
5. **Use the platform**: WhatsApp automation is now integrated!

---

**Need help?** Check the console logs for detailed error messages. The diagnostic tool (`node diagnostic.js`) is your first step for troubleshooting.
