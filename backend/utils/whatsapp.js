#!/usr/bin/env node
/**
 * FarmBid WhatsApp Automation Utility
 * Uses whatsapp-web.js with Puppeteer for browser automation
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
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
const pendingWhatsAppMessages = [];

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
  return `whatsapp:${normalized}`;
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

// WhatsApp client initialization
const initClient = () => {
  if (!Client || !LocalAuth) {
    console.error('[WhatsApp] whatsapp-web.js not loaded properly');
    return;
  }

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

    // Initialize the client
    console.log('[WhatsApp] Initializing WhatsApp client...');
    client.initialize();

  } catch (err) {
    console.error('[WhatsApp] Failed to initialize client:', err);
    clientReady = false;
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

// Internal send message (no queue)
const sendMessageInternal = async ({ to, body }) => {
  const toAddress = to.startsWith('whatsapp:') ? to : getWhatsAppId(to);

  if (!client || !clientReady) {
    throw new Error('WhatsApp client not ready');
  }

  try {
    const result = await client.sendMessage(toAddress, body);
    console.log(`[WhatsApp] Message sent to ${toAddress}: ${body.substring(0, 50)}${body.length > 50 ? '...' : ''}`);
    return result;
  } catch (err) {
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
const getOrCreateFarmer = (phone) => {
  const normalized = normalizePhone(phone);
  if (!normalized) {
    throw new Error('Invalid phone number.');
  }

  let farmer = farmerStore.get(normalized);
  if (!farmer) {
    farmer = {
      phone: normalized,
      name: null,
      aadhaar: null,
      upiId: null,
      trustScore: 0,
      state: 0,
      listingStep: null,
      tempListing: { images: [] },
      registeredAt: null,
      totalListings: 0,
      violations: 0
    };
    farmerStore.set(normalized, farmer);
    console.log(`[WhatsApp] Created new farmer record for ${normalized}`);
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

  const farmer = getOrCreateFarmer(phone);
  const body = msg.body?.trim() || '';
  const lower = body.toLowerCase();
  let reply = null;

  const sendReply = async (text) => {
    if (text) {
      try {
        await msg.reply(text);
      } catch (err) {
        console.error('[WhatsApp] Failed to send reply:', err.message);
        // Try sending as new message if reply fails
        await sendMessage({ to: phone, body: text });
      }
    }
  };

  const transitionState = (nextState) => {
    console.log(`[WhatsApp] ${phone} state: ${farmer.state} -> ${nextState}`);
    farmer.state = nextState;
  };

  // State machine for farmer registration and listing creation
  if (farmer.state === 0) {
    if (lower === 'yes' || lower === 'y') {
      transitionState(1);
      farmer.listingStep = null;
      reply = 'Please send your 12-digit Aadhaar number.';
    } else {
      reply = 'Welcome to FARM BID! Are you a farmer? Reply YES to register.';
    }
    await sendReply(reply);
    return;
  }

  if (farmer.state === 1) {
    if (/^\d{12}$/.test(body)) {
      const result = await verifyAadhaar(body);
      if (result.success) {
        farmer.aadhaar = hashAadhaar(body);
        farmer.name = result.name;
        transitionState(2);
        reply = `✅ Aadhaar verified for ${result.name}. Please send the 6-digit OTP.`;
      } else {
        reply = '❌ Invalid Aadhaar. Please try again.';
      }
    } else {
      reply = '⚠️  Aadhaar must be exactly 12 digits. Please send your 12-digit Aadhaar number.';
    }
    await sendReply(reply);
    return;
  }

  if (farmer.state === 2) {
    if (/^\d{6}$/.test(body)) {
      const result = await verifyOTP(phone, body);
      if (result.success) {
        transitionState(3);
        reply = `✅ Identity verified! Welcome ${farmer.name}. Please send your UPI ID for payment (example: yourname@upi).`;
      } else {
        farmer.aadhaar = null;
        farmer.name = null;
        farmer.state = 0;
        farmer.listingStep = null;
        farmer.tempListing.images = [];
        reply = '❌ Wrong OTP. Your chat session has been restarted. Reply YES to begin registration again.';
      }
    } else {
      reply = '⚠️  OTP must be exactly 6 digits. Please send the OTP.';
    }
    await sendReply(reply);
    return;
  }

  if (farmer.state === 3) {
    if (/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(body)) {
      const result = await verifyUPI(body);
      if (result.success) {
        farmer.upiId = body;
        farmer.trustScore = 100;
        farmer.registeredAt = new Date();
        farmer.totalListings = farmer.totalListings || 0;
        farmer.violations = farmer.violations || 0;
        transitionState(4);
        farmer.listingStep = null;
        farmer.tempListing.images = [];
        reply = `✅ UPI verified! You are now registered, ${farmer.name}.\n\n${buildRegisteredMenu(farmer.name)}`;
      } else {
        reply = '❌ UPI verification failed. Please check and retry.';
      }
    } else {
      reply = '⚠️  Invalid UPI format. Please send your UPI ID like: yourname@upi';
    }
    await sendReply(reply);
    return;
  }

  if (farmer.state === 4) {
    if (lower === '1') {
      transitionState(5);
      farmer.listingStep = 'awaiting_photo';
      farmer.tempListing = { images: [] };
      reply = '📸 Please send a clear photo of your produce.';
      await sendReply(reply);
      return;
    }

    if (lower === '2') {
      const activeListings = Array.from(listingStore.values()).filter(
        (listing) => listing.farmerPhone === phone && listing.status === 'active'
      );

      if (activeListings.length === 0) {
        reply = '📭 You have no active listings right now. Reply 1 to create a new listing.';
      } else {
        const summary = activeListings
          .map(
            (listing) => `ID: ${listing.listingId}\nProduce: ${listing.produce}\nWeight: ${listing.quantity}kg\nMin price: ₹${listing.minPricePerKg}/kg\nStatus: ${listing.status}\nAuction closes: ${new Date(listing.auctionEndsAt).toLocaleString()}`
          )
          .join('\n\n');
        reply = `📋 Your active listings:\n\n${summary}`;
      }
      await sendReply(reply);
      return;
    }

    if (lower === '3') {
      reply = `📊 Your trust score is ${farmer.trustScore}/100.`;
      await sendReply(reply);
      return;
    }

    reply = `❓ Sorry, I did not understand that.\n\n${buildRegisteredMenu(farmer.name)}`;
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
          reply = `✅ Photo received! (${farmer.tempListing.images.length} image saved).\nNow send the total weight in kg. Example: 100`;
          farmer.listingStep = 'awaiting_weight';
        } catch (err) {
          reply = '❌ Could not save the photo. Please send it again.';
        }
      } else {
        reply = '⚠️  Please send a clear photo of your produce.';
      }
      await sendReply(reply);
      return;
    }

    if (step === 'awaiting_weight') {
      if (/^\d+(\.\d+)?$/.test(body)) {
        farmer.tempListing.weight = parseFloat(body);
        farmer.listingStep = 'awaiting_min_price';
        reply = '✅ Weight noted! What is your minimum price per kg in rupees? Example: 40';
      } else {
        reply = '⚠️  Weight must be a number. Please send the weight in kg. Example: 100';
      }
      await sendReply(reply);
      return;
    }

    if (step === 'awaiting_min_price') {
      if (/^\d+(\.\d+)?$/.test(body)) {
        farmer.tempListing.minPrice = parseFloat(body);
        farmer.listingStep = 'awaiting_harvest_date';
        reply = '✅ Price noted! When will the produce be ready? Send date as DD-MM-YYYY';
      } else {
        reply = '⚠️  Price must be a number. Please send your minimum price per kg in rupees.';
      }
      await sendReply(reply);
      return;
    }

    if (step === 'awaiting_harvest_date') {
      if (/^\d{2}-\d{2}-\d{4}$/.test(body)) {
        const [day, month, year] = body.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        if (
          date.getFullYear() === year &&
          date.getMonth() === month - 1 &&
          date.getDate() === day
        ) {
          farmer.tempListing.harvestDate = body;
          await completeListingCreation(phone, farmer);
          return;
        }
      }
      reply = '❌ Invalid date. Please send harvest date as DD-MM-YYYY. Example: 15-12-2024';
      await sendReply(reply);
      return;
    }

    reply = '⚠️  Please follow the listing creation prompts. Send the requested information.';
    await sendReply(reply);
    return;
  }

  reply = '❓ Sorry, I did not understand that. Please follow the prompts.';
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
    if (FarmerModel && Listing) {
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
    }

    // Store in local memory store
    const newListing = {
      listingId: listingResult.listingId,
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
      totalBids: 0,
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

    reply = `🎉 Your listing is LIVE!\n\nListing ID: ${newListing.listingId}\nProduce: ${newListing.produce}\nWeight: ${newListing.quantity}kg\nMin price: ₹${newListing.minPricePerKg}/kg\nAuction closes: ${new Date(newListing.auctionClosesAt).toLocaleString()}\n\nBuyers can now bid! We will notify you of all bids.`;

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
  const total = bidAmount * quantity;
  const message = `🔔 NEW BID on your listing!\n\nBuyer from ${buyerCity || 'your area'} bids:\n${quantity}kg @ ₹${bidAmount}/kg\nTotal: ₹${total}\n\nReply ACCEPT to lock this deal, or wait for higher bids.`;
  return sendMessage({ to: farmerPhone, body: message });
};

const notifyFarmerDealLocked = async (farmerPhone, listingId, buyerDetails) => {
  const message = `✅ DEAL LOCKED!\n\nListing ID: ${listingId}\nBuyer: ${buyerDetails || 'Confirmed'}\n\nPlease prepare your produce for pickup.\nOur delivery partner will contact you within 24 hours.\n\nPlease upload a photo of your packed produce when ready.`;
  return sendMessage({ to: farmerPhone, body: message });
};

const notifyFarmerPaymentSent = async (farmerPhone, amount, upiId) => {
  const message = `💰 PAYMENT SENT!\n\nAmount: ₹${amount}\nUPI ID: ${upiId}\n\nThank you for using FARM BID!`;
  return sendMessage({ to: farmerPhone, body: message });
};

const notifyFarmerDispute = async (farmerPhone, listingId, reason) => {
  const message = `⚠️  DISPUTE RAISED\n\nListing ID: ${listingId}\nReason: ${reason}\n\nOur team will contact you within 2 hours to resolve this.`;
  return sendMessage({ to: farmerPhone, body: message });
};

const notifyFarmerListingExpired = async (farmerPhone, listingId) => {
  const message = `⏰ LISTING EXPIRED\n\nYour listing ${listingId} has expired with no bids.\nReply 1 to relist at a lower price.`;
  return sendMessage({ to: farmerPhone, body: message });
};

// Build registered menu
const buildRegisteredMenu = (name) => {
  return `📋 ${name}, what would you like to do?\n\n1. Create new listing\n2. View my active listings\n3. View my trust score\n\nReply with 1, 2, or 3`;
};

// Initialize the client when this module loads
ensureUploadDir().then(() => {
  console.log('[WhatsApp] Upload directory ready:', uploadDir);
}).catch(console.error);

initClient();

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
