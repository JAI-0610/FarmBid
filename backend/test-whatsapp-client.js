#!/usr/bin/env node
/**
 * Quick WhatsApp client initialization test
 * This will initialize the client and show QR code (if any) or errors
 */

require('dotenv').config();
const path = require('path');
const fs = require('fs');

console.log('═══════════════════════════════════════════════════════════');
console.log('     WhatsApp Client Initialization Test');
console.log('═══════════════════════════════════════════════════════════\n');

// Ensure session directory exists
const sessionPath = process.env.WHATSAPP_SESSION_PATH
  ? path.resolve(process.cwd(), process.env.WHATSAPP_SESSION_PATH)
  : path.resolve(__dirname, '.wwebjs_auth');

if (!fs.existsSync(sessionPath)) {
  fs.mkdirSync(sessionPath, { recursive: true });
  console.log('✓ Created session directory:', sessionPath);
}

console.log('Configuration:');
console.log('  Session path:', sessionPath);
console.log('  Headless mode:', process.env.WHATSAPP_HEADLESS === 'true' ? 'Yes' : 'No (visible browser)');
if (process.env.PUPPETEER_EXECUTABLE_PATH) {
  console.log('  Chrome path:', process.env.PUPPETEER_EXECUTABLE_PATH);
}
console.log('');

try {
  const { Client, LocalAuth } = require('whatsapp-web.js');
  const qrcode = require('qrcode-terminal');

  console.log('Initializing WhatsApp client...');
  console.log('(A browser window will open and a QR code will appear)\n');

  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: 'farmbid-test',
      dataPath: sessionPath
    }),
    puppeteer: {
      headless: process.env.WHATSAPP_HEADLESS === 'true',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    }
  });

  client.on('qr', (qr) => {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('   SCAN THIS QR CODE WITH WHATSAPP MOBILE APP');
    console.log('═══════════════════════════════════════════════════════════\n');
    qrcode.generate(qr, { small: true });
    console.log('\n═══════════════════════════════════════════════════════════\n');
  });

  client.on('ready', () => {
    console.log('✅ SUCCESS! WhatsApp client is ready and authenticated.');
    console.log('   You can now send and receive messages.');
    console.log('\n   Test the API endpoint: GET http://localhost:3001/api/whatsapp/status');
    console.log('\n   Press Ctrl+C to exit.\n');
  });

  client.on('authenticated', () => {
    console.log('   Authentication successful...');
  });

  client.on('auth_failure', (msg) => {
    console.error('❌ Authentication failed:', msg);
    console.error('   Delete the session folder and try again.');
  });

  client.on('disconnected', (reason) => {
    console.warn('⚠️  Disconnected:', reason);
    console.log('   Attempting to reconnect...');
  });

  client.initialize();

} catch (err) {
  console.error('❌ Error initializing WhatsApp client:', err);
  process.exit(1);
}

// Keep process running
process.on('SIGINT', () => {
  console.log('\n\n👋 Exiting...');
  process.exit(0);
});
