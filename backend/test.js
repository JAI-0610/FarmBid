#!/usr/bin/env node
/**
 * FarmBid Backend API Test Script
 * Run: node backend/test.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3001';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}\n${msg}\n${colors.cyan}${'='.repeat(60)}${colors.reset}`)
};

const makeRequest = (method, path, body = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
};

const testEndpoint = async (name, method, path, expectedStatus = 200, body = null) => {
  try {
    const { status, data } = await makeRequest(method, path, body);

    if (status === expectedStatus) {
      log.success(`${name} - Status ${status}`);
      if (typeof data === 'object') {
        if (data.listings) log.info(`  Listings: ${data.listings.length}`);
        if (data.farmers) log.info(`  Farmers: ${data.farmers.length}`);
        if (data.buyers) log.info(`  Buyers: ${data.buyers.length}`);
        if (data.events) log.info(`  Events: ${data.events.length}`);
        if (data.kpis) log.info(`  KPIs keys: ${Object.keys(data.kpis).join(', ')}`);
        if (data.success) log.info(`  Success: ${data.success}`);
        if (data.listing) log.info(`  Listing: ${data.listing.produce} - ₹${data.listing.currentBidPerKg}/kg`);
        if (data.bid) log.info(`  Bid: ₹${data.bid.bidPerKg}/kg`);
        if (data.result) log.info(`  Quality: ${data.result.grade} (${data.result.qualityIndex}%)`);
        if (data.wallet) log.info(`  Wallet: ₹${data.wallet.balance}`);
      }
      return true;
    } else {
      log.error(`${name} - Expected ${expectedStatus}, got ${status}`);
      if (data && typeof data === 'object') {
        console.error('  Error:', data.error || data.message || JSON.stringify(data));
      }
      return false;
    }
  } catch (error) {
    log.error(`${name} - ${error.message}`);
    return false;
  }
};

const runTests = async () => {
  console.log('\n' + '='.repeat(60));
  console.log('🌾 FarmBid Backend API Tests');
  console.log('='.repeat(60));
  console.log(`Target: ${BASE_URL}`);
  console.log(`Started: ${new Date().toISOString()}`);

  const results = {};

  // Health check
  log.header('Health Check');
  results.health = await testEndpoint('Health endpoint', 'GET', '/api/health');

  // Listings
  log.header('Listings API');
  results.listings = await testEndpoint('GET /api/listings', 'GET', '/api/listings');
  results.createListing = await testEndpoint(
    'POST /api/listings (create)',
    'POST',
    '/api/listings',
    201,
    {
      farmerId: '507f1f77bcf86cd799439011', // dummy ID for testing structure
      produce: 'Tomatoes',
      quantity: 100,
      minPricePerKg: 30,
      harvestDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      location: 'Test Village',
      pincode: '560001'
    }
  );

  // Bids
  log.header('Bids API');
  results.bids = await testEndpoint('POST /api/bids', 'POST', '/api/bids', 400, {
    listingId: 'test',
    buyerId: 'test',
    bidPerKg: 50
  }); // Expected to fail with invalid listing ID

  // Farmers
  log.header('Farmers API');
  results.farmers = await testEndpoint('GET /api/farmers', 'GET', '/api/farmers');
  results.farmerStats = await testEndpoint('GET /api/farmers/stats/summary', 'GET', '/api/farmers/stats/summary');

  // Buyers
  log.header('Buyers API');
  results.buyers = await testEndpoint('GET /api/buyers', 'GET', '/api/buyers');
  results.buyerStats = await testEndpoint('GET /api/buyers/stats/summary', 'GET', '/api/buyers/stats/summary');

  // Blockchain
  log.header('Blockchain API');
  results.blockchainEvents = await testEndpoint('GET /api/blockchain/events', 'GET', '/api/blockchain/events');
  results.blockchainStats = await testEndpoint('GET /api/blockchain/stats', 'GET', '/api/blockchain/stats');

  // Auctions
  log.header('Auctions API');
  results.auctions = await testEndpoint('GET /api/auctions/completed', 'GET', '/api/auctions/completed');

  // Disputes
  log.header('Disputes API');
  results.disputes = await testEndpoint('GET /api/disputes', 'GET', '/api/disputes');
  results.createDispute = await testEndpoint(
    'POST /api/disputes (create)',
    'POST',
    '/api/disputes',
    400,
    {
      auctionId: 'test',
      buyerId: 'test',
      farmerId: '507f1f77bcf86cd799439011',
      reason: 'weight_mismatch',
      description: 'Test dispute',
      amount: 1000
    }
  ); // Expected to fail with invalid auction ID

  // Deliveries
  log.header('Deliveries API');
  results.deliveries = await testEndpoint('GET /api/deliveries', 'GET', '/api/deliveries');

  // Admin
  log.header('Admin API');
  results.adminKPIs = await testEndpoint('GET /api/admin/kpis', 'GET', '/api/admin/kpis');
  results.adminDistricts = await testEndpoint('GET /api/admin/districts', 'GET', '/api/admin/districts');
  results.adminFraud = await testEndpoint('GET /api/admin/fraud-alerts', 'GET', '/api/admin/fraud-alerts');
  results.adminHealth = await testEndpoint('GET /api/admin/platform-health', 'GET', '/api/admin/platform-health');

  // Quality
  log.header('Quality API');
  results.quality = await testEndpoint(
    'POST /api/quality/analyze',
    'POST',
    '/api/quality/analyze',
    200,
    { produce: 'Tomatoes', imageUrl: 'test.jpg' }
  );

  // Wallet
  log.header('Wallet API');
  results.walletBalance = await testEndpoint('GET /api/wallet/balance?buyerId=b1', 'GET', '/api/wallet/balance?buyerId=b1');
  results.walletTopup = await testEndpoint(
    'POST /api/wallet/topup',
    'POST',
    '/api/wallet/topup',
    200,
    { userId: 'b1', amount: 1000, paymentMethod: 'upi' }
  );

  // Orders
  log.header('Orders API');
  results.orders = await testEndpoint('GET /api/orders', 'GET', '/api/orders');

  // Summary
  log.header('Test Summary');
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  const percentage = ((passed / total) * 100).toFixed(1);

  console.log(`Passed: ${passed}/${total} (${percentage}%)`);

  Object.entries(results).forEach(([test, result]) => {
    const status = result ? `${colors.green}PASS${colors.reset}` : `${colors.red}FAIL${colors.reset}`;
    console.log(`  ${status} - ${test}`);
  });

  console.log('\n' + '='.repeat(60));
  if (passed === total) {
    console.log(`${colors.green}🎉 All tests passed!${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`${colors.yellow}⚠️  Some tests failed${colors.reset}`);
    process.exit(1);
  }
};

// Check if server is running first
const checkServer = async () => {
  try {
    await makeRequest('GET', '/api/health');
    return true;
  } catch (error) {
    console.error(`${colors.red}Error: Backend server is not running on ${BASE_URL}${colors.reset}`);
    console.log('Please start the backend server first:');
    console.log('  cd backend && npm install && npm start');
    process.exit(1);
  }
};

checkServer().then(() => runTests()).catch(console.error);
