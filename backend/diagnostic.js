#!/usr/bin/env node
/**
 * FarmBid WhatsApp Backend Diagnostic
 * Run this to check your WhatsApp automation setup
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║       FarmBid WhatsApp Automation Diagnostic             ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

// 1. Check environment
console.log('1️⃣  Environment Variables:');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('   WHATSAPP_SESSION_PATH:', process.env.WHATSAPP_SESSION_PATH || 'not set (using default)');
console.log('   WHATSAPP_HEADLESS:', process.env.WHATSAPP_HEADLESS || 'not set (default: false)');
console.log('   PUPPETEER_EXECUTABLE_PATH:', process.env.PUPPETEER_EXECUTABLE_PATH || 'not set');
console.log('   CHROME_PATH:', process.env.CHROME_PATH || 'not set');
console.log('   LOCALAPPDATA:', process.env.LOCALAPPDATA || 'not set (Windows only)');
console.log('   CWD:', process.cwd());

// 2. Check session directory
console.log('\n2️⃣  Session Directory:');
const sessionPath = process.env.WHATSAPP_SESSION_PATH
  ? path.resolve(process.cwd(), process.env.WHATSAPP_SESSION_PATH)
  : path.resolve(__dirname, '../.wwebjs_auth');
console.log('   Path:', sessionPath);
console.log('   Exists:', fs.existsSync(sessionPath));
if (fs.existsSync(sessionPath)) {
  const contents = fs.readdirSync(sessionPath);
  console.log('   Contents:', contents.join(', '));
}

// 3. Check Puppeteer
console.log('\n3️⃣  Puppeteer:');
try {
  const puppeteerPath = puppeteer.executablePath();
  console.log('   Version:', require('puppeteer/package.json').version);
  console.log('   Executable:', puppeteerPath);
  console.log('   Exists:', fs.existsSync(puppeteerPath));
} catch (err) {
  console.log('   ✗ Error getting Puppeteer info:', err.message);
}

// 4. Check whatsapp-web.js
console.log('\n4️⃣  whatsapp-web.js:');
try {
  const wwebjs = require('whatsapp-web.js');
  console.log('   ✓ Module loaded');
  console.log('   Version:', require('whatsapp-web.js/package.json').version);
} catch (err) {
  console.log('   ✗ Module not found:', err.message);
}

// 5. Check qrcode-terminal
console.log('\n5️⃣  qrcode-terminal:');
try {
  require('qrcode-terminal');
  console.log('   ✓ Module loaded');
} catch (err) {
  console.log('   ✗ Module not found:', err.message);
}

// 6. Check upload directories
console.log('\n6️⃣  Upload Directories:');
const uploadDir = path.resolve(process.cwd(), 'uploads/listings');
console.log('   Listings upload dir:', uploadDir);
console.log('   Exists:', fs.existsSync(uploadDir));
const baseUploads = path.resolve(process.cwd(), 'uploads');
console.log('   Base uploads dir:', baseUploads);
console.log('   Exists:', fs.existsSync(baseUploads));

// 7. Check .env file
console.log('\n7️⃣  .env Configuration File:');
const envPath = path.join(__dirname, '.env');
console.log('   Path:', envPath);
console.log('   Exists:', fs.existsSync(envPath));
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('   Content:\n' + envContent.split('\n').map(l => '     ' + l).join('\n'));
}

// 8. Common issues checklist
console.log('\n8️⃣  Common Issues Checklist:');
const issues = [];

if (!fs.existsSync(sessionPath)) {
  issues.push('  ⚠️  Session directory missing - will be created on first run');
} else {
  const sessionFiles = fs.readdirSync(sessionPath);
  if (sessionFiles.length === 0) {
    issues.push('  ⚠️  Session directory empty - need to authenticate');
  }
}

try {
  const puppeteerPath = puppeteer.executablePath();
  if (!fs.existsSync(puppeteerPath)) {
    issues.push('  ⚠️  Puppeteer browser not found at:', puppeteerPath);
  }
} catch (err) {
  issues.push('  ⚠️  Could not check Puppeteer executable:', err.message);
}

if (process.env.WHATSAPP_HEADLESS === 'false') {
  issues.push('  ℹ️  Running in visible browser mode (WHATSAPP_HEADLESS=false)');
} else if (process.env.WHATSAPP_HEADLESS !== 'true') {
  issues.push('  ℹ️  Defaulting to visible browser (set WHATSAPP_HEADLESS for headless mode)');
}

if (issues.length === 0) {
  console.log('   ✓ No obvious issues detected');
} else {
  issues.forEach(issue => console.log(issue));
}

// 9. Recommendations
console.log('\n9️⃣  Recommendations:');
console.log('   • If QR code not showing, install Chrome or set PUPPETEER_EXECUTABLE_PATH');
console.log('   • Run with visible browser first: set WHATSAPP_HEADLESS=false');
console.log('   • Delete .wwebjs_auth folder to force re-authentication');
console.log('   • Check console logs when starting server for QR code');
console.log('   • Make sure port 3001 is not blocked by firewall');

// 10. Test run suggestion
console.log('\n🔟  Next Steps:');
console.log('   1. Start the backend: npm start');
console.log('   2. Look for "Scan this QR code with WhatsApp" in console');
console.log('   3. Open WhatsApp on your phone, scan QR code');
console.log('   4. Wait for "✅ WhatsApp client is ready" message');
console.log('   5. Test endpoint: GET http://localhost:3001/api/whatsapp/status');

console.log('\n═══════════════════════════════════════════════════════════');
console.log('Diagnostic complete!');
console.log('═══════════════════════════════════════════════════════════\n');
