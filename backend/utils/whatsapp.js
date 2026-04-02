#!/usr/bin/env node
/**
 * FarmBid WhatsApp Automation Utility
 * Uses whatsapp-web.js with Puppeteer for browser automation
 */

const { Client, LocalAuth, Poll } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const {
  verifyAadhaar,
  verifyOTP,
  verifyUPI,
  createListing
} = require('./mockAPIs');

let Listing, FarmerModel;
try {
  Listing = require('../models/Listing');
  FarmerModel = require('../models/Farmer');
} catch (err) {
  console.warn('[WhatsApp] MongoDB models not available:', err.message);
}

// Configuration
const sessionPath = process.env.WHATSAPP_SESSION_PATH
  ? path.resolve(process.cwd(), process.env.WHATSAPP_SESSION_PATH)
  : path.resolve(__dirname, '../.wwebjs_auth');

const uploadDir = path.resolve(process.cwd(), 'uploads/listings');

// In-memory stores
const farmerStore = new Map();
const listingStore = new Map();

// Localized strings
const t = (key, lang = 'en', data = {}) => {
  const strings = {
    en: {
      menu: (name) => `🏠 *${name}, what would you like to do?*\n\n1️⃣ Create new listing\n2️⃣ View active listings\n3️⃣ View trust score\n4️⃣ Change Language`,
      reg_complete: (name) => `Registration complete, ${name}!\n\n1️⃣ Create new listing\n2️⃣ View active listings\n3️⃣ View trust score`,
      step_photo: '📸 *Step 1/4: Photo*\n\nPlease send a clear photo of your produce.\n\n_Reply 0 to Cancel_',
      listing_started: '📸 *Listing Started!*\n\n✅ Photo received.',
      step_produce: '📦 *Step 2/4:* What are you selling?\n\n1️⃣ Tomatoes 🍅\n2️⃣ Onions 🧅\n3️⃣ Potatoes 🥔\n4️⃣ Green Chilies 🌶️\n5️⃣ Grapes 🍇\n\n_Or type produce name_',
      step_weight: (prod) => `✅ *${prod}* noted!\n\n⚖️ *Step 3/4:* Send total weight in kg.\nExample: 500`,
      step_price: (kg) => `✅ *${kg}kg* noted!\n\n💰 *Step 4/4:* What is your min price per kg?\nExample: 40`,
      step_harvest: '✅ *Price noted!*\n\n🗓️ When will it be ready?\n\n1️⃣ Tomorrow\n2️⃣ 3 days\n3️⃣ 1 week\n4️⃣ 2 weeks',
      listing_live: (id, name, qty, price) => `🎉 *CONGRATS! YOUR LISTING IS LIVE!*\n\n🔹 *ID:* ${id}\n🔹 *Item:* ${name}\n🔹 *Weight:* ${qty}kg\n🔹 *Min Price:* ₹${price}/kg\n\n🚀 Buyers are being notified!`,
      cancel_back: '🏠 *Returned to Main Menu*',
      no_active: '📭 You have no active listings right now.',
      trust_score: (score) => `📊 Your trust score is *${score}/100*.`,
      invalid_price: '⚠️ Please send price as a number (e.g. 40).',
      invalid_weight: '⚠️ Please send weight as a number (e.g. 100).',
      invalid_name: '⚠️ Select 1-5 or type the name of your produce.'
    },
    kn: {
      menu: (name) => `🏠 *${name}, ನೀವು ಏನು ಮಾಡಲು ಬಯಸುತ್ತೀರಿ?*\n\n1️⃣ ಹೊಸ ಪಟ್ಟಿ ರಚಿಸಿ (Listing)\n2️⃣ ಸಕ್ರಿಯ ಪಟ್ಟಿಗಳನ್ನು ನೋಡಿ\n3️⃣ ವಿಶ್ವಾಸಾರ್ಹತೆ ಸ್ಕೋರ್ ನೋಡಿ\n4️⃣ ಭಾಷೆ ಬದಲಾಯಿಸಿ`,
      reg_complete: (name) => `ನೋಂದಣಿ ಪೂರ್ಣಗೊಂಡಿದೆ, ${name}!\n\n1️⃣ ಹೊಸ ಪಟ್ಟಿ ರಚಿಸಿ\n2️⃣ ಸಕ್ರಿಯ ಪಟ್ಟಿಗಳನ್ನು ನೋಡಿ\n3️⃣ ವಿಶ್ವಾಸಾರ್ಹತೆ ಸ್ಕೋರ್ ನೋಡಿ`,
      step_photo: '📸 *ಹಂತ 1/4: ಫೋಟೋ*\n\nದಯವಿಟ್ಟು ನಿಮ್ಮ ಉತ್ಪನ್ನದ ಸ್ಪಷ್ಟ ಫೋಟೋ ಕಳಿಸಿ.\n\n_ರದ್ದು ಮಾಡಲು 0 ಒತ್ತಿರಿ_',
      listing_started: '📸 *ಪಟ್ಟಿ ಪ್ರಾರಂಭವಾಗಿದೆ!*\n\n✅ ಫೋಟೋ ಸ್ವೀಕರಿಸಲಾಗಿದೆ.',
      step_produce: '📦 *ಹಂತ 2/4:* ನೀವು ಏನು ಮಾರಾಟ ಮಾಡುತ್ತಿದ್ದೀರಿ?\n\n1️⃣ ಟೊಮೆಟೊ 🍅\n2️⃣ ಈರುಳ್ಳಿ 🧅\n3️⃣ ಆಲೂಗಡ್ಡೆ 🥔\n4️⃣ ಹಸಿ ಮೆಣಸಿನಕಾಯಿ 🌶️\n5️⃣ ದ್ರಾಕ್ಷಿ 🍇\n\n_ಅಥವಾ ಹೆಸರನ್ನು ಟೈಪ್ ಮಾಡಿ_',
      step_weight: (prod) => `✅ *${prod}* ಗುರುತಿಸಲಾಗಿದೆ!\n\n⚖️ *ಹಂತ 3/4:* ಒಟ್ಟು ತೂಕವನ್ನು ಕೆಜಿಯಲ್ಲಿ ಕಳಿಸಿ.\nಉದಾಹರಣೆ: 500`,
      step_price: (kg) => `✅ *${kg}kg* ಗುರುತಿಸಲಾಗಿದೆ!\n\n💰 *ಹಂತ 4/4:* ಕನಿಷ್ಠ ಬೆಲೆ ಎಷ್ಟು? (ಒಂದು ಕೆಜಿಗೆ)\nಉದಾಹರಣೆ: 40`,
      step_harvest: '✅ *ಬೆಲೆ ಗುರುತಿಸಲಾಗಿದೆ!*\n\n🗓️ ಇದು ಯಾವಾಗ ಸಿದ್ಧವಾಗುತ್ತದೆ?\n\n1️⃣ ನಾಳೆ\n2️⃣ 3 ದಿನಗಳಲ್ಲಿ\n3️⃣ 1 ವಾರದಲ್ಲಿ\n4️⃣ 2 ವಾರಗಳಲ್ಲಿ',
      listing_live: (id, name, qty, price) => `🎉 *ಅಭಿನಂದನೆಗಳು! ನಿಮ್ಮ ಪಟ್ಟಿ ಸಕ್ರಿಯವಾಗಿದೆ!*\n\n🔹 *ID:* ${id}\n🔹 *ವಸ್ತು:* ${name}\n🔹 *ತೂಕ:* ${qty}kg\n🔹 *ಕನಿಷ್ಠ ಬೆಲೆ:* ₹${price}/kg\n\n🚀 ಖರೀದಿದಾರರಿಗೆ ತಿಳಿಸಲಾಗಿದೆ!`,
      cancel_back: '🏠 *ಮುಖ್ಯ ಮೆನುಗೆ ಹಿಂತಿರುಗಲಾಗಿದೆ*',
      no_active: '📭 ನಿಮ್ಮ ಬಳಿ ಸದ್ಯಕ್ಕೆ ಯಾವುದೇ ಸಕ್ರಿಯ ಪಟ್ಟಿಗಳಿಲ್ಲ.',
      trust_score: (score) => `📊 ನಿಮ್ಮ ವಿಶ್ವಾಸಾರ್ಹತೆ ಸ್ಕೋರ್ *${score}/100* ಆಗಿದೆ.`,
      invalid_price: '⚠️ ಬೆಲೆಯನ್ನು ಸಂಖ್ಯೆಯಲ್ಲಿ ಕಳಿಸಿ (ಉದಾ: 40).',
      invalid_weight: '⚠️ ತೂಕವನ್ನು ಸಂಖ್ಯೆಯಲ್ಲಿ ಕಳಿಸಿ (ಉದಾ: 100).',
      invalid_name: '⚠️ 1-5 ಆಯ್ಕೆ ಮಾಡಿ ಅಥವಾ ಹೆಸರನ್ನು ಟೈಪ್ ಮಾಡಿ.',
      notify_bid: (amt, qty, city) => `🔔 ಹೊಸ ಬಿಡ್ ಬಂದಿದೆ!\n\n${city || 'ಖರೀದಿದಾರ'}ರಿಂದ ಬಿಡ್:\n${qty}kg @ ₹${amt}/kg\nಒಟ್ಟು: ₹${amt * qty}\n\nಈ ಒಪ್ಪಂದವನ್ನು ಖಚಿತಪಡಿಸಲು *ACCEPT* ಎಂದು ಉತ್ತರಿಸಿ.`,
      notify_locked: (id) => `✅ ಖರೀದಿ ಖಚಿತವಾಗಿದೆ!\n\nಪಟ್ಟಿ ಸಂಖ್ಯೆ: ${id}\nದಯವಿಟ್ಟು ನಿಮ್ಮ ಉತ್ಪನ್ನವನ್ನು ಪ್ಯಾಕ್ ಮಾಡಿ ಸಿದ್ಧವಾಗಿಡಿ.\nನಮ್ಮ ಡೆಲಿವರಿ ಪಾಲುದಾರರು 24 ಗಂಟೆಯೊಳಗೆ ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸುತ್ತಾರೆ.`,
      notify_payment: (amt) => `💰 ಹಣ ಪಾವತಿಸಲಾಗಿದೆ!\n\nಮೊತ್ತ: ₹${amt}\nಫಾರ್ಮ್ ಬಿಡ್ ಬಳಸಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು!`,
      notify_dispute: (id, reason) => `⚠️ ವಿವಾದ ಉಂಟಾಗಿದೆ\n\nಪಟ್ಟಿ ಸಂಖ್ಯೆ: ${id}\nಕಾರಣ: ${reason}\nನಮ್ಮ ತಂಡವು ಶೀಘ್ರದಲ್ಲೇ ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸುತ್ತದೆ.`,
      notify_expired: (id) => `⏰ ಅವಧಿ ಮುಗಿದಿದೆ\n\nನಿಮ್ಮ ಪಟ್ಟಿ ${id} ಯಾವುದೇ ಬಿಡ್ ಇಲ್ಲದೆ ಅವಧಿ ಮುಗಿದಿದೆ. ಕಡಿಮೆ ಬೆಲೆಗೆ ಮರು ಪಟ್ಟಿ ಮಾಡಲು 1 ಒತ್ತಿರಿ.`,
      upi_fail: '❌ UPI ಪರಿಶೀಲನೆ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಸರಿಯಾದ ID ಕಳಿಸಿ ಅಥವಾ SKIP ಒತ್ತಿರಿ.',
      invalid_upi: '⚠️ ತಪ್ಪು ಮಾಹಿತಿ. ದಯವಿಟ್ಟು ನಿಮ್ಮ UPI ID ಕಳಿಸಿ (ಉದಾ: name@upi) ಅಥವಾ SKIP ಒತ್ತಿರಿ.'
    }
  };

  const res = strings[lang][key];
  if (typeof res === 'function') return res(...Object.values(data));
  return res || strings.en[key] || key;
};

// Client state
let client = null;
let clientReady = false;
let lastQr = null;
let lastAuthFailure = null;

// Ensure upload directory exists
const ensureUploadDir = async () => {
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  } catch (err) {
    console.error('[WhatsApp] Failed to ensure upload directory:', err);
  }
};

// Helper functions
const hashAadhaar = (aadhaar) => {
  return crypto.createHash('sha256').update(aadhaar).digest('hex');
};

const normalizePhone = (phone) => {
  if (!phone) return null;
  const digits = phone.toString().replace(/[^0-9+]/g, '');
  if (!digits) return null;
  return digits.startsWith('+') ? digits : `+${digits}`;
};

const formatPhone = (phone) => {
  if (!phone) return null;
  return phone.toString().replace(/^\+?([0-9]+)@.*$/, '$1');
};

const getWhatsAppId = (phone) => {
  const normalized = normalizePhone(phone);
  if (!normalized) {
    throw new Error('Invalid phone number for WhatsApp delivery');
  }
  // whatsapp-web.js expects number@c.us format (no + prefix)
  const digits = normalized.replace(/^\+/, '');
  return `${digits}@c.us`;
};

const getBrowserExecutable = () => {
  // Check environment variables first
  if (process.env.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
    console.log('[WhatsApp] Using PUPPETEER_EXECUTABLE_PATH:', process.env.PUPPETEER_EXECUTABLE_PATH);
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
    console.log('[WhatsApp] Using CHROME_PATH:', process.env.CHROME_PATH);
    return process.env.CHROME_PATH;
  }

  // Windows-specific paths
  if (process.platform === 'win32' && process.env.LOCALAPPDATA) {
    const chromePath = path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe');
    const edgePath = path.join(process.env.LOCALAPPDATA, 'Microsoft', 'Edge', 'Application', 'msedge.exe');

    if (fs.existsSync(chromePath)) {
      console.log('[WhatsApp] Found Chrome at:', chromePath);
      return chromePath;
    }
    if (fs.existsSync(edgePath)) {
      console.log('[WhatsApp] Found Edge at:', edgePath);
      return edgePath;
    }
  }

  // Default system paths
  const defaultPaths = [
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  ];

  for (const p of defaultPaths) {
    if (fs.existsSync(p)) {
      console.log('[WhatsApp] Found browser at:', p);
      return p;
    }
  }

  // Fall back to Puppeteer's bundled Chromium
  try {
    const bundledPath = puppeteer.executablePath();
    if (bundledPath && fs.existsSync(bundledPath)) {
      console.log('[WhatsApp] Using Puppeteer bundled Chromium:', bundledPath);
      return bundledPath;
    }
  } catch (err) {
    console.warn('[WhatsApp] Could not get Puppeteer executable:', err.message);
  }

  console.warn('[WhatsApp] No browser executable found. Please install Chrome or set PUPPETEER_EXECUTABLE_PATH.');
  return null;
};

const browserExecutablePath = getBrowserExecutable();

// Puppeteer options optimized for WhatsApp Web
const puppeteerOptions = {
  headless: process.env.WHATSAPP_HEADLESS === 'true', // Default to false (visible browser)
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu',
    '--window-size=1280,800'
  ]
};

if (browserExecutablePath) {
  puppeteerOptions.executablePath = browserExecutablePath;
}

// Clean up stale Puppeteer lock files that prevent re-launch
const cleanupStaleLocks = () => {
  try {
    const sessionDir = path.join(sessionPath, 'session-farmbid-whatsapp');
    if (fs.existsSync(sessionDir)) {
      const lockFiles = ['SingletonLock', 'SingletonSocket', 'SingletonCookie'];
      for (const lockFile of lockFiles) {
        const lockPath = path.join(sessionDir, 'Default', lockFile);
        if (fs.existsSync(lockPath)) {
          fs.unlinkSync(lockPath);
          console.log(`[WhatsApp] Removed stale lock: ${lockFile}`);
        }
        // Also check in session root
        const rootLockPath = path.join(sessionDir, lockFile);
        if (fs.existsSync(rootLockPath)) {
          fs.unlinkSync(rootLockPath);
          console.log(`[WhatsApp] Removed stale lock: ${lockFile} (root)`);
        }
      }
    }
  } catch (err) {
    console.warn('[WhatsApp] Could not clean up stale locks:', err.message);
  }
};

// WhatsApp client initialization
const initClient = async () => {
  if (!Client || !LocalAuth) {
    console.error('[WhatsApp] whatsapp-web.js not loaded properly');
    return;
  }

  // Destroy any existing client first
  if (client) {
    try {
      await client.destroy();
    } catch (err) {
      console.warn('[WhatsApp] Could not destroy previous client:', err.message);
    }
    client = null;
    clientReady = false;
  }

  // Clean up stale browser locks from previous crash
  cleanupStaleLocks();

  try {
    client = new Client({
      authStrategy: new LocalAuth({
        clientId: 'farmbid-whatsapp',
        dataPath: sessionPath
      }),
      puppeteer: puppeteerOptions
    });

    console.log('[WhatsApp] Setting up event handlers...');

    // QR Code event
    client.on('qr', (qr) => {
      lastQr = qr;
      lastAuthFailure = null;
      console.log('\n========================================');
      console.log('📱 Scan this QR code with WhatsApp:');
      console.log('========================================');
      if (qrcode) {
        qrcode.generate(qr, { small: true });
      } else {
        console.log(qr);
      }
      console.log('========================================\n');
    });

    // Ready event - client is authenticated
    client.on('ready', () => {
      clientReady = true;
      console.log('✅ WhatsApp client is ready and authenticated!');
      console.log('   You can now send and receive messages.');
    });

    // Authentication success (but not ready)
    client.on('authenticated', () => {
      console.log('[WhatsApp] Authentication successful, waiting for ready...');
    });

    // Authentication failure
    client.on('auth_failure', (msg) => {
      clientReady = false;
      lastAuthFailure = msg;
      console.error('❌ WhatsApp authentication failed:', msg);
      console.error('   Please delete the .wwebjs_auth folder and restart the server.');
    });

    // Disconnection handler
    client.on('disconnected', async (reason) => {
      clientReady = false;
      console.warn('⚠️  WhatsApp client disconnected:', reason);
      try {
        await client.destroy();
      } catch (err) {
        console.error('[WhatsApp] Error destroying client:', err.message);
      }
      // Auto-reconnect after 5 seconds
      setTimeout(() => {
        console.log('[WhatsApp] Attempting to reconnect...');
        initClient();
      }, 5000);
    });

    // Message handler
    client.on('message', async (msg) => {
      try {
        if (!clientReady) {
          console.log('[WhatsApp] Received message but client not ready, ignoring');
          return;
        }
        if (msg.from.endsWith('@g.us')) return; // Ignore group messages
        await handleFarmerMessage(msg);
      } catch (err) {
        console.error('[WhatsApp] Error handling message:', err);
      }
    });

    // Poll vote handler
    client.on('vote_update', async (vote) => {
      try {
        if (!clientReady) return;
        if (!vote.selectedOptions || vote.selectedOptions.length === 0) return;
        
        const selectedText = vote.selectedOptions[0].name;
        const mockMsg = {
          from: vote.voter,
          body: selectedText,
          hasMedia: false,
          reply: async (content) => client.sendMessage(vote.voter, content),
          getContact: async () => ({ pushname: null })
        };
        await handleFarmerMessage(mockMsg);
      } catch (err) {
        console.error('[WhatsApp] Error handling vote_update:', err);
      }
    });

    // Initialize the client
    console.log('[WhatsApp] Initializing WhatsApp client...');
    await client.initialize();

  } catch (err) {
    console.error('[WhatsApp] ⚠️  Failed to initialize client:', err.message);
    console.error('[WhatsApp] The server will continue running without WhatsApp.');
    console.error('[WhatsApp] To fix: kill any leftover chrome/chromium processes and restart.');
    clientReady = false;
    client = null;
  }
};

// Flush queued messages when client becomes ready
const flushPendingMessages = async () => {
  if (pendingWhatsAppMessages.length === 0) return;

  console.log(`[WhatsApp] Flushing ${pendingWhatsAppMessages.length} pending messages...`);

  while (pendingWhatsAppMessages.length > 0 && clientReady) {
    const message = pendingWhatsAppMessages.shift();
    try {
      await sendMessageInternal(message);
    } catch (err) {
      console.error('[WhatsApp] Failed to flush queued message:', err);
      // Re-queue the message
      pendingWhatsAppMessages.unshift(message);
      break;
    }
  }
};

// Internal send message with retry logic for execution context errors
const MAX_SEND_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 2000;

const sendMessageInternal = async ({ to, body }, retryCount = 0) => {
  // Normalize to @c.us format
  const toAddress = to.endsWith('@c.us') ? to : getWhatsAppId(to);

  if (!client || !clientReady) {
    throw new Error('WhatsApp client not ready');
  }

  try {
    const result = await client.sendMessage(toAddress, body);
    console.log(`[WhatsApp] Message sent to ${toAddress}: ${body.substring(0, 50)}${body.length > 50 ? '...' : ''}`);
    return result;
  } catch (err) {
    const isContextError = err.message && (
      err.message.includes('Execution context was destroyed') ||
      err.message.includes('context') ||
      err.message.includes('navigation') ||
      err.message.includes('Target closed') ||
      err.message.includes('Session closed')
    );

    if (isContextError && retryCount < MAX_SEND_RETRIES) {
      const delay = RETRY_BASE_DELAY_MS * Math.pow(2, retryCount);
      console.warn(`[WhatsApp] Execution context error, retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_SEND_RETRIES})...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return sendMessageInternal({ to, body }, retryCount + 1);
    }

    console.error(`[WhatsApp] Failed to send message to ${toAddress}:`, err.message);
    throw err;
  }
};

// Public send message with queue fallback
const sendMessage = async ({ to, body }) => {
  if (!clientReady) {
    console.log('[WhatsApp] Client not ready, queuing message for:', to);
    pendingWhatsAppMessages.push({ to, body });
    return { queued: true };
  }

  return sendMessageInternal({ to, body });
};

// Media handling
const saveMedia = async (msg, phone) => {
  try {
    await ensureUploadDir();
    const media = await msg.downloadMedia();
    if (!media || !media.data) {
      throw new Error('No media data found.');
    }

    const extension = media.mimetype?.includes('png') ? 'png' : 'jpg';
    const timestamp = Date.now();
    const sanitizedPhone = phone.replace(/^\+/, '');
    const fileName = `${sanitizedPhone}-${timestamp}.${extension}`;
    const filePath = path.join(uploadDir, fileName);

    await fs.promises.writeFile(filePath, Buffer.from(media.data, 'base64'));
    console.log(`[WhatsApp] Saved media to: ${filePath}`);
    return filePath;
  } catch (err) {
    console.error(`[WhatsApp] Failed to save media for ${phone}:`, err);
    throw err;
  }
};

// Farmer management
const getOrCreateFarmer = async (phone) => {
  const normalized = normalizePhone(phone);
  if (!normalized) {
    throw new Error('Invalid phone number.');
  }

  let farmer = farmerStore.get(normalized);
  if (!farmer) {
    let dbName = null;
    let trustScore = 0;
    // Check MongoDB to avoid repeated authentication
    if (FarmerModel) {
      try {
        const existing = await FarmerModel.findOne({ phone: normalized });
        if (existing) {
          dbName = existing.name;
          trustScore = existing.trustScore || 100;
        }
      } catch (err) {}
    }

    farmer = {
      phone: normalized,
      name: dbName,
      aadhaar: null,
      upiId: null,
      trustScore: trustScore,
      language: 'en', // Default to English initially
      state: dbName ? 4 : -1, // Direct to main menu if recognized, else language select
      listingStep: null,
      tempListing: { images: [] },
      registeredAt: null,
      totalListings: 0,
      violations: 0
    };
    farmerStore.set(normalized, farmer);
    console.log(`[WhatsApp] Created new farmer record for ${normalized}. Recognized: ${!!dbName}`);
  }

  return farmer;
};

// Message handler for interactive farmer registration
const handleFarmerMessage = async (msg) => {
  const phone = formatPhone(msg.from);
  if (!phone) {
    console.warn('[WhatsApp] Could not parse sender phone from', msg.from);
    return;
  }

  const farmer = await getOrCreateFarmer(phone);
  
  // Try to safely get pushname without hanging
  try {
    const notifyName = msg._data && msg._data.notifyName;
    if (notifyName && (!farmer.name || farmer.state === 0)) {
      farmer.name = notifyName;
    } else if (msg.getContact && (!farmer.name || farmer.state === 0)) {
      // Promise race to prevent infinite hang
      const contactPromise = msg.getContact();
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000));
      const contact = await Promise.race([contactPromise, timeoutPromise]);
      const pushname = contact.pushname || contact.name;
      if (pushname) farmer.name = pushname;
    }
  } catch (e) {
    console.log('[WhatsApp] Could not fetch contact name, using default.');
  }
  
  if (!farmer.name) farmer.name = 'Farmer';

  const body = msg.body?.trim() || '';
  const lower = body.toLowerCase();

  // GLOBAL: Reply 0 to go back to main menu anytime
  if (lower === '0' && farmer && (farmer.state > 4 || farmer.listingStep)) {
    farmer.state = 4;
    farmer.listingStep = null;
    farmer.tempListing = { images: [] };
    await msg.reply(t('cancel_back', farmer.language) + '\n\n' + t('menu', farmer.language, { name: farmer.name }));
    return;
  }

  let reply = null;

  const sendReply = async (content) => {
    if (!content) return;
    // Retry logic: try msg.reply first, then fall back to sendMessage with retries
    for (let attempt = 0; attempt < MAX_SEND_RETRIES; attempt++) {
      try {
        if (attempt === 0 && msg.reply) {
          await msg.reply(content);
        } else {
          await sendMessageInternal({ to: phone, body: content });
        }
        return; // success
      } catch (err) {
        const isContextError = err.message && (
          err.message.includes('Execution context was destroyed') ||
          err.message.includes('context') ||
          err.message.includes('navigation') ||
          err.message.includes('Target closed') ||
          err.message.includes('Session closed')
        );
        if (isContextError && attempt < MAX_SEND_RETRIES - 1) {
          const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
          console.warn(`[WhatsApp] Reply failed (attempt ${attempt + 1}), retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          console.error('[WhatsApp] Failed to send reply after retries:', err.message);
          throw err;
        }
      }
    }
  };

  const transitionState = (nextState) => {
    console.log(`[WhatsApp] ${phone} state: ${farmer.state} -> ${nextState}`);
    farmer.state = nextState;
  };

  // Language Selection
  if (farmer.state === -1) {
    if (lower === '1') {
      farmer.language = 'en';
      transitionState(0);
      reply = `Welcome to FARM BID, ${farmer.name}! Are you a farmer?\n\nReply *YES* to register.`;
      await sendReply(reply);
    } else if (lower === '2' || lower.includes('kannada') || lower.includes('ಕನ್ನಡ')) {
      farmer.language = 'kn';
      transitionState(0);
      reply = `ಫಾರ್ಮ್ ಬಿಡ್ (FARM BID) ಗೆ ಸ್ವಾಗತ, ${farmer.name}! ನೀವು ರೈತರೇ?\n\nನೋಂದಾಯಿಸಲು *YES* ಎಂದು ಉತ್ತರಿಸಿ.`;
      await sendReply(reply);
    } else {
      reply = "Welcome to FarmBid! Please select your language:\n\n1️⃣ English\n2️⃣ Kannada (ಕನ್ನಡ)\n\n_Reply 1 or 2_";
      await sendReply(reply);
    }
    return;
  }

  // State machine for farmer registration and listing creation
  if (farmer.state === 0) {
    if (lower === 'yes' || lower === 'y' || lower === 'yes, i am a farmer') {
      transitionState(3); // SKIP Aadhaar & OTP straight to UPI Check
      farmer.listingStep = null;
      if (farmer.language === 'kn') {
        reply = `ಧನ್ಯವಾದಗಳು, ${farmer.name}! ದಯವಿಟ್ಟು ಹಣ ಪಾವತಿಗಾಗಿ ನಿಮ್ಮ UPI ID ಕಳುಹಿಸಿ (ಅಥವಾ ನಂತರ ಸೇರಿಸಲು SKIP ಎಂದು ಟೈಪ್ ಮಾಡಿ).`;
      } else {
        reply = `Thank you, ${farmer.name}! Please send your UPI ID for payments (or type SKIP to add later).`;
      }
      await sendReply(reply);
      return;
    } else {
      if (farmer.language === 'kn') {
        reply = `ಫಾರ್ಮ್ ಬಿಡ್ ಗೆ ಸ್ವಾಗತ, ${farmer.name}! ನೀವು ರೈತರೇ?\n\nನೋಂದಾಯಿಸಲು *YES* ಎಂದು ಉತ್ತರಿಸಿ.`;
      } else {
        reply = `Welcome to FARM BID, ${farmer.name}! Are you a farmer?\n\nReply *YES* to register.`;
      }
      await sendReply(reply);
      return;
    }
  }

  // Skip state 1 and 2 (Aadhaar & OTP)

  if (farmer.state === 3) {
    if (lower === 'skip' || /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(body)) {
      if (lower !== 'skip') {
        const result = await verifyUPI(body);
        if (result.success) {
          farmer.upiId = body;
        } else {
          reply = t('upi_fail', farmer.language);
          await sendReply(reply);
          return;
        }
      }
      farmer.trustScore = 100;
      farmer.registeredAt = new Date();
      farmer.totalListings = farmer.totalListings || 0;
      farmer.violations = farmer.violations || 0;
      transitionState(4);
      farmer.listingStep = null;
      farmer.tempListing.images = [];
      reply = t('reg_complete', farmer.language, { name: farmer.name });
      await sendReply(reply);
    } else {
      reply = t('invalid_upi', farmer.language);
      await sendReply(reply);
    }
    return;
  }

  if (farmer.state === 4) {
    if (lower === '1' || lower === 'create new listing' || msg.hasMedia) {
      transitionState(5);
      farmer.listingStep = 'awaiting_photo';
      farmer.tempListing = { images: [] };
      
      if (msg.hasMedia) {
        try {
          const photoPath = await saveMedia(msg, phone);
          farmer.tempListing.images.push(photoPath);
          reply = t('listing_started', farmer.language) + '\n\n' + t('step_produce', farmer.language);
          farmer.listingStep = 'awaiting_produce_name';
        } catch (err) {
          reply = '❌ Error saving photo.';
          transitionState(4);
        }
      } else {
        reply = t('step_photo', farmer.language);
      }
      await sendReply(reply);
      return;
    }

    if (lower === '2' || lower === 'view my active listings') {
      const activeListings = Array.from(listingStore.values()).filter(
        (listing) => listing.farmerPhone === phone && listing.status === 'active'
      );

      if (activeListings.length === 0) {
        reply = t('no_active', farmer.language);
      } else {
        const summary = activeListings
          .map(
            (listing) => `🆔 *${listing.listingId}*\n📦 ${listing.produce}\n⚖️ ${listing.quantity}kg\n💰 ₹${listing.minPricePerKg}/kg`
          )
          .join('\n\n---\n\n');
        reply = `📋 *${farmer.language === 'kn' ? 'ಸಕ್ರಿಯ ಪಟ್ಟಿಗಳು' : 'Active Listings'}*\n\n${summary}`;
      }
      await sendReply(reply);
      reply = t('menu', farmer.language, { name: farmer.name });
      await sendReply(reply);
      return;
    }

    if (lower === '3' || lower === 'view my trust score') {
      reply = t('trust_score', farmer.language, { score: farmer.trustScore });
      await sendReply(reply);
      reply = t('menu', farmer.language, { name: farmer.name });
      await sendReply(reply);
      return;
    }

    if (lower === '4' || lower.includes('language') || lower.includes('ಭಾಷೆ')) {
      transitionState(-1);
      reply = "Select Language / ಭಾಷೆಯನ್ನು ಆರಿಸಿ:\n\n1️⃣ English\n2️⃣ Kannada (ಕನ್ನಡ)";
      await sendReply(reply);
      return;
    }

    reply = t('menu', farmer.language, { name: farmer.name });
    await sendReply(reply);
    return;
  }

  if (farmer.state === 5) {
    const step = farmer.listingStep;

    if (step === 'awaiting_photo') {
      if (msg.hasMedia) {
        try {
          const photoPath = await saveMedia(msg, phone);
          farmer.tempListing.images.push(photoPath);
          reply = `✅ Photo received! (${farmer.tempListing.images.length} image saved).\n\nIf you want to add more photos, just send them now.\nOtherwise, what is the name of your produce? (e.g. Tomatoes, Chilies)`;
          // Do not wait strictly, allow taking text
          farmer.listingStep = 'awaiting_produce_name';
        } catch (err) {
          reply = '❌ Could not save the photo. Please send it again.';
        }
      } else {
        reply = '⚠️  Please send a clear photo of your produce.';
      }
      await sendReply(reply);
      return;
    }

    if (step === 'awaiting_produce_name') {
      if (msg.hasMedia) {
        try {
          const photoPath = await saveMedia(msg, phone);
          farmer.tempListing.images.push(photoPath);
          reply = `✅ Extra photo added (${farmer.tempListing.images.length} total).\n\n` + t('step_produce', farmer.language);
          await sendReply(reply);
          return;
        } catch (err) {}
      }

      const crops = {
        '1': farmer.language === 'kn' ? 'ಟೊಮೆಟೊ 🍅' : 'Tomatoes 🍅',
        '2': farmer.language === 'kn' ? 'ಈರುಳ್ಳಿ 🧅' : 'Onions 🧅',
        '3': farmer.language === 'kn' ? 'ಆಲೂಗಡ್ಡೆ 🥔' : 'Potatoes 🥔',
        '4': farmer.language === 'kn' ? 'ಹಸಿ ಮೆಣಸಿನಕಾಯಿ 🌶️' : 'Green Chilies 🌶️',
        '5': farmer.language === 'kn' ? 'ದ್ರಾಕ್ಷಿ 🍇' : 'Grapes 🍇'
      };

      if (crops[body]) {
        farmer.tempListing.produce = crops[body];
        reply = t('step_weight', farmer.language, { prod: crops[body] });
        farmer.listingStep = 'awaiting_weight';
      } else if (body.trim().length >= 2 && !msg.hasMedia) {
        farmer.tempListing.produce = body.trim();
        reply = t('step_weight', farmer.language, { prod: farmer.tempListing.produce });
        farmer.listingStep = 'awaiting_weight';
      } else if (!msg.hasMedia) {
        reply = t('invalid_name', farmer.language);
      }
      if (reply) await sendReply(reply);
      return;
    }

    if (step === 'awaiting_weight') {
      if (/^\d+(\.\d+)?$/.test(body)) {
        farmer.tempListing.weight = parseFloat(body);
        farmer.listingStep = 'awaiting_min_price';
        reply = t('step_price', farmer.language, { kg: body });
      } else {
        reply = t('invalid_weight', farmer.language);
      }
      await sendReply(reply);
      return;
    }

    if (step === 'awaiting_min_price') {
      if (/^\d+(\.\d+)?$/.test(body)) {
        farmer.tempListing.minPrice = parseFloat(body);
        farmer.listingStep = 'awaiting_harvest_date';
        reply = t('step_harvest', farmer.language);
        await sendReply(reply);
      } else {
        reply = t('invalid_price', farmer.language);
        await sendReply(reply);
      }
      return;
    }

    if (step === 'awaiting_harvest_date') {
      let daysAhead;
      if (lower.includes('tomorrow') || lower === '1') daysAhead = 1;
      else if (lower.includes('3 days') || lower === '2') daysAhead = 3;
      else if (lower.includes('1 week') || lower === '3') daysAhead = 7;
      else if (lower.includes('2 weeks') || lower === '4') daysAhead = 14;
      else if (lower.includes('1 month') || lower === '5') daysAhead = 30;

      if (daysAhead !== undefined) {
        const harvestDate = new Date();
        harvestDate.setDate(harvestDate.getDate() + daysAhead);
        const dd = String(harvestDate.getDate()).padStart(2, '0');
        const mm = String(harvestDate.getMonth() + 1).padStart(2, '0');
        const yyyy = harvestDate.getFullYear();
        farmer.tempListing.harvestDate = `${dd}-${mm}-${yyyy}`;
        await completeListingCreation(phone, farmer);
        return;
      }
      reply = '⚠️ Please reply with a valid number:\n\n1️⃣ Tomorrow\n2️⃣ In 3 days\n3️⃣ In 1 week\n4️⃣ In 2 weeks\n5️⃣ In 1 month';
      await sendReply(reply);
      return;
    }

    reply = '⚠️  Please follow the listing creation prompts. Send the requested information.';
    await sendReply(reply);
    return;
  }

  reply = '❓ Sorry, I did not understand that. Please reply with a valid option.';
  await sendReply(reply);
};

const completeListingCreation = async (phone, farmer) => {
  let reply = '';
  const payload = {
    phone,
    images: farmer.tempListing.images,
    weight: farmer.tempListing.weight,
    minPrice: farmer.tempListing.minPrice,
    harvestDate: farmer.tempListing.harvestDate,
    trustScore: farmer.trustScore
  };

  try {
    // Call your listing creation API (should return auction details)
    const listingResult = await createListing(payload);
    console.log('[WhatsApp] Listing created:', listingResult);

    // Save to MongoDB if models are available
    const isDbConnected = mongoose.connection && mongoose.connection.readyState === 1;
    
    if (isDbConnected && FarmerModel && Listing) {
      console.log('[WhatsApp] DB is connected, saving listing to MongoDB...');
      let dbFarmer = await FarmerModel.findOne({ phone });
      if (!dbFarmer) {
        const phoneDigits = phone.replace(/[^0-9]/g, '');
        dbFarmer = await FarmerModel.create({
          code: `WAPP-${phoneDigits.slice(-10)}`,
          name: farmer.name || 'WhatsApp Farmer',
          phone,
          village: 'Unknown',
          district: 'Unknown',
          pincode: '000000',
          landSize: 'Unknown',
          trustScore: farmer.trustScore,
          totalListings: 0,
          successfulSales: 0,
          joinedDate: new Date().toISOString(),
          aadhaarVerified: true,
          upiVerified: true,
          landVerified: false,
          language: 'Kannada',
          crops: [],
          profileImage: ''
        });
      }

      const dbListing = new Listing({
        farmerId: dbFarmer._id,
        farmerCode: dbFarmer.code,
        farmerName: farmer.name || dbFarmer.name,
        farmerTrustScore: farmer.trustScore,
        produce: farmer.tempListing.produce || 'Farm Produce',
        produceIcon: '🌾',
        quantity: farmer.tempListing.weight,
        unit: 'kg',
        minPricePerKg: farmer.tempListing.minPrice,
        currentBidPerKg: farmer.tempListing.minPrice,
        totalBids: 0,
        harvestDate: farmer.tempListing.harvestDate,
        expiryDate: farmer.tempListing.harvestDate,
        auctionEndsAt: new Date(listingResult.auctionClosesAt),
        qualityIndex: listingResult.qualityIndex || 85,
        qualityGrade: 'Standard',
        freshness: 85,
        surfaceDamage: 10,
        colorUniformity: 85,
        status: 'live',
        location: 'Unknown location',
        pincode: '000000',
        images: farmer.tempListing.images,
        blockchainHash: `0x${crypto.randomBytes(20).toString('hex')}`
      });

      await dbListing.save();
      dbFarmer.totalListings = (dbFarmer.totalListings || 0) + 1;
      await dbFarmer.save();
      console.log('[WhatsApp] Listing saved to MongoDB:', dbListing._id);
    } else {
      console.log('[WhatsApp] Database not connected or missing models. Saving to memory store only.');
    }

    // Always store in local memory store for immediate visibility and fallback
    const newListing = {
      id: listingResult.listingId || `l-${Date.now()}`,
      listingId: listingResult.listingId || `l-${Date.now()}`,
      farmerPhone: phone,
      farmerName: farmer.name || 'WhatsApp Farmer',
      farmerTrustScore: farmer.trustScore,
      produce: farmer.tempListing.produce || 'Farm Produce',
      produceIcon: '🌾',
      images: farmer.tempListing.images,
      quantity: farmer.tempListing.weight,
      unit: 'kg',
      minPricePerKg: farmer.tempListing.minPrice,
      currentBidPerKg: farmer.tempListing.minPrice,
      totalBids: 0,
      harvestDate: farmer.tempListing.harvestDate,
      qualityIndex: listingResult.qualityIndex || 85,
      qualityGrade: 'Standard',
      status: 'active',
      auctionClosesAt: listingResult.auctionClosesAt,
      createdAt: new Date().toISOString()
    };

    listingStore.set(newListing.listingId, newListing);

    // Reset farmer state
    farmer.totalListings += 1;
    farmer.state = 4;
    farmer.listingStep = null;
    farmer.tempListing = { images: [] };

    reply = t('listing_live', farmer.language, {
      id: newListing.listingId,
      name: newListing.produce,
      qty: newListing.quantity,
      price: newListing.minPricePerKg
    });

  } catch (err) {
    console.error('[WhatsApp] Failed to create listing:', err);
    reply = '❌ Sorry, there was an error creating your listing. Please try again later.';
    farmer.state = 4;
    farmer.listingStep = null;
    farmer.tempListing = { images: [] };
  }

  // Send final reply
  try {
    await sendMessage({ to: phone, body: reply });
  } catch (err) {
    console.error('[WhatsApp] Failed to send final reply:', err);
  }
};

// Notification functions (called from other parts of the app)
const notifyFarmerNewBid = async (farmerPhone, bidAmount, quantity, buyerCity) => {
  const farmer = farmerStore.get(farmerPhone) || { language: 'en' };
  const message = t('notify_bid', farmer.language, { amt: bidAmount, qty: quantity, city: buyerCity });
  return sendMessage({ to: farmerPhone, body: message });
};

const notifyFarmerDealLocked = async (farmerPhone, listingId, buyerDetails) => {
  const farmer = farmerStore.get(farmerPhone) || { language: 'en' };
  const message = t('notify_locked', farmer.language, { id: listingId });
  return sendMessage({ to: farmerPhone, body: message });
};

const notifyFarmerPaymentSent = async (farmerPhone, amount, upiId) => {
  const farmer = farmerStore.get(farmerPhone) || { language: 'en' };
  const message = t('notify_payment', farmer.language, { amt: amount });
  return sendMessage({ to: farmerPhone, body: message });
};

const notifyFarmerDispute = async (farmerPhone, listingId, reason) => {
  const farmer = farmerStore.get(farmerPhone) || { language: 'en' };
  const message = t('notify_dispute', farmer.language, { id: listingId, reason });
  return sendMessage({ to: farmerPhone, body: message });
};

const notifyFarmerListingExpired = async (farmerPhone, listingId) => {
  const farmer = farmerStore.get(farmerPhone) || { language: 'en' };
  const message = t('notify_expired', farmer.language, { id: listingId });
  return sendMessage({ to: farmerPhone, body: message });
};

// Build registered menu
const buildRegisteredMenu = (name) => {
  return `📋 ${name}, what would you like to do?\n\n1. Create new listing\n2. View my active listings\n3. View my trust score\n\nReply with 1, 2, or 3`;
};

// Initialize the client when this module loads (non-blocking, non-crashing)
ensureUploadDir().then(() => {
  console.log('[WhatsApp] Upload directory ready:', uploadDir);
}).catch(console.error);

// Use async IIFE so the require() doesn't throw and crash the server
(async () => {
  try {
    await initClient();
  } catch (err) {
    console.error('[WhatsApp] ⚠️  WhatsApp initialization failed:', err.message);
    console.error('[WhatsApp] Server will continue without WhatsApp support.');
  }
})();

// Export public API
module.exports = {
  sendWhatsAppMessage: sendMessage,
  isReady: () => clientReady,
  getQrCode: () => lastQr,
  getAuthFailure: () => lastAuthFailure,
  notifyFarmerNewBid,
  notifyFarmerDealLocked,
  notifyFarmerPaymentSent,
  notifyFarmerDispute,
  notifyFarmerListingExpired,
  farmerStore,
  listingStore
};
