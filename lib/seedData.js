import { v4 as uuidv4 } from 'uuid'

// Farmer seed data - Karnataka focused
export const seedFarmers = [
  {
    id: 'f1',
    code: 'KA-KOL-001',
    name: 'Ramappa Gowda',
    phone: '+91 98765 43210',
    village: 'Srinivaspur',
    district: 'Kolar',
    pincode: '563135',
    landSize: '2.5 acres',
    trustScore: 95,
    totalListings: 47,
    successfulSales: 45,
    joinedDate: '2024-08-15',
    aadhaarVerified: true,
    upiVerified: true,
    landVerified: true,
    language: 'Kannada',
    crops: ['Tomatoes', 'Chilies', 'Onions'],
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  },
  {
    id: 'f2',
    code: 'KA-KOL-002',
    name: 'Lakshmi Devi',
    phone: '+91 87654 32109',
    village: 'Bangarpet',
    district: 'Kolar',
    pincode: '563114',
    landSize: '1.8 acres',
    trustScore: 88,
    totalListings: 23,
    successfulSales: 20,
    joinedDate: '2024-09-20',
    aadhaarVerified: true,
    upiVerified: true,
    landVerified: true,
    language: 'Kannada',
    crops: ['Tomatoes', 'Grapes'],
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
  },
  {
    id: 'f3',
    code: 'KA-KOL-003',
    name: 'Venkatesh Naidu',
    phone: '+91 76543 21098',
    village: 'Mulbagal',
    district: 'Kolar',
    pincode: '563131',
    landSize: '3.2 acres',
    trustScore: 72,
    totalListings: 12,
    successfulSales: 9,
    joinedDate: '2025-01-10',
    aadhaarVerified: true,
    upiVerified: true,
    landVerified: false,
    language: 'Telugu',
    crops: ['Potatoes', 'Onions'],
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  },
  {
    id: 'f4',
    code: 'KA-BLR-001',
    name: 'Manjunath Kumar',
    phone: '+91 65432 10987',
    village: 'Anekal',
    district: 'Bengaluru Rural',
    pincode: '562106',
    landSize: '4.0 acres',
    trustScore: 100,
    totalListings: 65,
    successfulSales: 64,
    joinedDate: '2024-06-01',
    aadhaarVerified: true,
    upiVerified: true,
    landVerified: true,
    language: 'Kannada',
    crops: ['Tomatoes', 'Chilies', 'Capsicum'],
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  }
]

// Buyer seed data
export const seedBuyers = [
  {
    id: 'b1',
    name: 'Bengaluru Fresh Foods Pvt Ltd',
    email: 'procurement@blrfresh.in',
    phone: '+91 80 2345 6789',
    type: 'Retailer',
    location: 'Bengaluru',
    walletBalance: 250000,
    totalBids: 156,
    wonAuctions: 89,
    trustScore: 98,
    joinedDate: '2024-07-01'
  },
  {
    id: 'b2',
    name: 'Farm2Table Restaurant Chain',
    email: 'supply@farm2table.co',
    phone: '+91 80 3456 7890',
    type: 'Restaurant',
    location: 'Bengaluru',
    walletBalance: 85000,
    totalBids: 78,
    wonAuctions: 45,
    trustScore: 92,
    joinedDate: '2024-08-15'
  },
  {
    id: 'b3',
    name: 'Karnataka Vegetables Export',
    email: 'buy@kavegetables.com',
    phone: '+91 80 4567 8901',
    type: 'Exporter',
    location: 'Bengaluru',
    walletBalance: 500000,
    totalBids: 234,
    wonAuctions: 156,
    trustScore: 100,
    joinedDate: '2024-05-20'
  }
]

// Produce types
export const produceTypes = [
  { id: 'tomato', name: 'Tomatoes', icon: '🍅', avgPrice: 35 },
  { id: 'onion', name: 'Onions', icon: '🧅', avgPrice: 28 },
  { id: 'chili', name: 'Green Chilies', icon: '🌶️', avgPrice: 55 },
  { id: 'potato', name: 'Potatoes', icon: '🥔', avgPrice: 22 },
  { id: 'grape', name: 'Grapes', icon: '🍇', avgPrice: 85 },
  { id: 'capsicum', name: 'Capsicum', icon: '🫑', avgPrice: 45 }
]

// Active auction listings
export const seedListings = [
  {
    id: 'l1',
    farmerId: 'f1',
    farmerCode: 'KA-KOL-001',
    farmerName: 'Ramappa Gowda',
    farmerTrustScore: 95,
    produce: 'Tomatoes',
    produceIcon: '🍅',
    quantity: 500,
    unit: 'kg',
    minPricePerKg: 32,
    currentBidPerKg: 38,
    totalBids: 7,
    harvestDate: '2025-06-28',
    expiryDate: '2025-06-30',
    auctionEndsAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    qualityIndex: 92,
    qualityGrade: 'Premium',
    freshness: 95,
    surfaceDamage: 8,
    colorUniformity: 90,
    status: 'live',
    location: 'Srinivaspur, Kolar',
    pincode: '563135',
    images: ['https://images.pexels.com/photos/15279908/pexels-photo-15279908.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'],
    blockchainHash: '0x8f9a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
    createdAt: '2025-06-28T08:30:00Z',
    highestBidderId: 'b1'
  },
  {
    id: 'l2',
    farmerId: 'f2',
    farmerCode: 'KA-KOL-002',
    farmerName: 'Lakshmi Devi',
    farmerTrustScore: 88,
    produce: 'Grapes',
    produceIcon: '🍇',
    quantity: 200,
    unit: 'kg',
    minPricePerKg: 75,
    currentBidPerKg: 92,
    totalBids: 12,
    harvestDate: '2025-06-27',
    expiryDate: '2025-06-29',
    auctionEndsAt: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    qualityIndex: 88,
    qualityGrade: 'Premium',
    freshness: 92,
    surfaceDamage: 5,
    colorUniformity: 88,
    status: 'ending_soon',
    location: 'Bangarpet, Kolar',
    pincode: '563114',
    images: ['https://images.unsplash.com/photo-1586319985690-3ed8cdc362ec?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGZhcm0lMjB2ZWdldGFibGVzfGVufDB8fHxncmVlbnwxNzc1MDQxMDI3fDA&ixlib=rb-4.1.0&q=85'],
    blockchainHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
    createdAt: '2025-06-27T14:00:00Z',
    highestBidderId: 'b3'
  },
  {
    id: 'l3',
    farmerId: 'f4',
    farmerCode: 'KA-BLR-001',
    farmerName: 'Manjunath Kumar',
    farmerTrustScore: 100,
    produce: 'Green Chilies',
    produceIcon: '🌶️',
    quantity: 150,
    unit: 'kg',
    minPricePerKg: 48,
    currentBidPerKg: 55,
    totalBids: 5,
    harvestDate: '2025-06-28',
    expiryDate: '2025-07-01',
    auctionEndsAt: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    qualityIndex: 96,
    qualityGrade: 'Premium',
    freshness: 98,
    surfaceDamage: 3,
    colorUniformity: 95,
    status: 'live',
    location: 'Anekal, Bengaluru Rural',
    pincode: '562106',
    images: ['https://images.pexels.com/photos/31404683/pexels-photo-31404683.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'],
    blockchainHash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c',
    createdAt: '2025-06-28T06:00:00Z',
    highestBidderId: 'b2'
  },
  {
    id: 'l4',
    farmerId: 'f3',
    farmerCode: 'KA-KOL-003',
    farmerName: 'Venkatesh Naidu',
    farmerTrustScore: 72,
    produce: 'Potatoes',
    produceIcon: '🥔',
    quantity: 800,
    unit: 'kg',
    minPricePerKg: 18,
    currentBidPerKg: 22,
    totalBids: 3,
    harvestDate: '2025-06-26',
    expiryDate: '2025-07-05',
    auctionEndsAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    qualityIndex: 78,
    qualityGrade: 'Standard',
    freshness: 82,
    surfaceDamage: 15,
    colorUniformity: 80,
    status: 'live',
    location: 'Mulbagal, Kolar',
    pincode: '563131',
    images: ['https://images.unsplash.com/photo-1527542293608-68743ba7d06e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTZ8MHwxfHNlYXJjaHwyfHxwcm9kdWNlJTIwbWFya2V0fGVufDB8fHxncmVlbnwxNzc1MDQxMDMyfDA&ixlib=rb-4.1.0&q=85'],
    blockchainHash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
    createdAt: '2025-06-26T10:00:00Z',
    highestBidderId: 'b1'
  },
  {
    id: 'l5',
    farmerId: 'f1',
    farmerCode: 'KA-KOL-001',
    farmerName: 'Ramappa Gowda',
    farmerTrustScore: 95,
    produce: 'Onions',
    produceIcon: '🧅',
    quantity: 650,
    unit: 'kg',
    minPricePerKg: 24,
    currentBidPerKg: 28,
    totalBids: 4,
    harvestDate: '2025-06-27',
    expiryDate: '2025-07-10',
    auctionEndsAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    qualityIndex: 85,
    qualityGrade: 'Premium',
    freshness: 88,
    surfaceDamage: 10,
    colorUniformity: 86,
    status: 'live',
    location: 'Srinivaspur, Kolar',
    pincode: '563135',
    images: ['https://images.pexels.com/photos/5473228/pexels-photo-5473228.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'],
    blockchainHash: '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e',
    createdAt: '2025-06-27T16:00:00Z',
    highestBidderId: 'b3'
  }
]

// Completed auctions
export const seedCompletedAuctions = [
  {
    id: 'c1',
    listingId: 'past-l1',
    farmerId: 'f1',
    farmerCode: 'KA-KOL-001',
    farmerName: 'Ramappa Gowda',
    buyerId: 'b1',
    buyerName: 'Bengaluru Fresh Foods Pvt Ltd',
    produce: 'Tomatoes',
    quantity: 400,
    finalPricePerKg: 42,
    totalValue: 16800,
    status: 'settled',
    deliveryStatus: 'delivered',
    settledAt: '2025-06-25T14:30:00Z',
    blockchainHash: '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f'
  },
  {
    id: 'c2',
    listingId: 'past-l2',
    farmerId: 'f4',
    farmerCode: 'KA-BLR-001',
    farmerName: 'Manjunath Kumar',
    buyerId: 'b2',
    buyerName: 'Farm2Table Restaurant Chain',
    produce: 'Green Chilies',
    quantity: 100,
    finalPricePerKg: 62,
    totalValue: 6200,
    status: 'disputed',
    deliveryStatus: 'delivered',
    disputeReason: 'Weight mismatch - 8% less than listed',
    settledAt: '2025-06-24T11:00:00Z',
    blockchainHash: '0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a'
  }
]

// Bid history
export const seedBids = [
  { id: 'bid1', listingId: 'l1', buyerId: 'b1', buyerName: 'Bengaluru Fresh Foods', bidPerKg: 38, timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
  { id: 'bid2', listingId: 'l1', buyerId: 'b2', buyerName: 'Farm2Table', bidPerKg: 36, timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
  { id: 'bid3', listingId: 'l1', buyerId: 'b3', buyerName: 'KA Vegetables Export', bidPerKg: 35, timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
  { id: 'bid4', listingId: 'l2', buyerId: 'b3', buyerName: 'KA Vegetables Export', bidPerKg: 92, timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
  { id: 'bid5', listingId: 'l2', buyerId: 'b1', buyerName: 'Bengaluru Fresh Foods', bidPerKg: 88, timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString() },
  { id: 'bid6', listingId: 'l3', buyerId: 'b2', buyerName: 'Farm2Table', bidPerKg: 55, timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString() }
]

// Blockchain events
export const seedBlockchainEvents = [
  {
    id: 'bc1',
    type: 'listing_created',
    entityId: 'l1',
    description: 'New listing created - 500kg Tomatoes',
    txHash: '0x8f9a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
    blockNumber: 58234567,
    timestamp: '2025-06-28T08:30:00Z',
    farmer: 'KA-KOL-001',
    network: 'Polygon Mainnet'
  },
  {
    id: 'bc2',
    type: 'bid_placed',
    entityId: 'l1',
    description: 'Bid placed - ₹38/kg by Bengaluru Fresh Foods',
    txHash: '0x9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
    blockNumber: 58234590,
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    buyer: 'b1',
    network: 'Polygon Mainnet'
  },
  {
    id: 'bc3',
    type: 'quality_anchored',
    entityId: 'l1',
    description: 'AI Quality Score anchored - Index: 92 (Premium)',
    txHash: '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0',
    blockNumber: 58234568,
    timestamp: '2025-06-28T08:31:00Z',
    qualityIndex: 92,
    network: 'Polygon Mainnet'
  },
  {
    id: 'bc4',
    type: 'escrow_locked',
    entityId: 'c1',
    description: 'Escrow locked - ₹16,800 for 400kg Tomatoes',
    txHash: '0xb2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1',
    blockNumber: 58234200,
    timestamp: '2025-06-25T10:00:00Z',
    amount: 16800,
    network: 'Polygon Mainnet'
  },
  {
    id: 'bc5',
    type: 'settlement_released',
    entityId: 'c1',
    description: 'Payment released to farmer KA-KOL-001',
    txHash: '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f',
    blockNumber: 58234500,
    timestamp: '2025-06-25T14:30:00Z',
    amount: 16464,
    network: 'Polygon Mainnet'
  },
  {
    id: 'bc6',
    type: 'dispute_raised',
    entityId: 'c2',
    description: 'Dispute raised - Weight mismatch 8%',
    txHash: '0xc3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2',
    blockNumber: 58234100,
    timestamp: '2025-06-24T12:00:00Z',
    disputeType: 'weight_mismatch',
    network: 'Polygon Mainnet'
  }
]

// Disputes
export const seedDisputes = [
  {
    id: 'd1',
    auctionId: 'c2',
    buyerId: 'b2',
    buyerName: 'Farm2Table Restaurant Chain',
    farmerId: 'f4',
    farmerCode: 'KA-BLR-001',
    produce: 'Green Chilies',
    reason: 'weight_mismatch',
    description: 'Received 92kg instead of listed 100kg. Difference of 8%.',
    evidence: ['photo_weighin.jpg', 'receipt.pdf'],
    status: 'pending_review',
    amount: 6200,
    proposedRefund: 496,
    createdAt: '2025-06-24T12:00:00Z',
    trustPenalty: 12
  }
]

// Delivery records
export const seedDeliveries = [
  {
    id: 'del1',
    auctionId: 'c1',
    farmerId: 'f1',
    buyerId: 'b1',
    status: 'delivered',
    pickupWeight: 402,
    deliveredWeight: 400,
    weightDiscrepancy: 0.5,
    pickupPhoto: true,
    deliveryPhoto: true,
    deliveryAgent: 'Suresh Kumar',
    deliveryAgentPhone: '+91 99887 76655',
    pickupTime: '2025-06-25T08:00:00Z',
    deliveryTime: '2025-06-25T12:30:00Z',
    geotagPickup: { lat: 13.1507, lng: 78.2046 },
    geotagDelivery: { lat: 12.9716, lng: 77.5946 }
  }
]

// Platform KPIs
export const platformKPIs = {
  totalGMV: 4285000,
  totalFarmers: 247,
  totalBuyers: 89,
  activeAuctions: 28,
  avgQualityIndex: 84,
  avgSettlementTime: '4.2 hours',
  disputeRate: 3.2,
  fraudFlagsToday: 2,
  transactionFees: 128550,
  successRate: 94.5
}

// District data
export const districtData = [
  { district: 'Kolar', farmers: 156, listings: 312, gmv: 2450000, topCrop: 'Tomatoes' },
  { district: 'Bengaluru Rural', farmers: 45, listings: 98, gmv: 980000, topCrop: 'Chilies' },
  { district: 'Chikkaballapur', farmers: 28, listings: 54, gmv: 520000, topCrop: 'Grapes' },
  { district: 'Ramanagara', farmers: 18, listings: 32, gmv: 335000, topCrop: 'Potatoes' }
]

// WhatsApp chat messages for demo
export const whatsappDemoMessages = {
  english: [
    { type: 'bot', text: 'Welcome to FarmBid! I am your assistant. How can I help you today?' },
    { type: 'bot', text: 'Reply with:\n1️⃣ Create new listing\n2️⃣ Check my listings\n3️⃣ View earnings\n4️⃣ Help' },
    { type: 'user', text: '1' },
    { type: 'bot', text: 'Great! Let\'s create a new listing. Please send a photo of your produce.' },
    { type: 'user', text: '[Photo of tomatoes]', isImage: true, imageUrl: 'https://images.pexels.com/photos/15279908/pexels-photo-15279908.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940' },
    { type: 'bot', text: '🍅 I see fresh Tomatoes! Quality looks Premium grade.\n\nWhat is the total weight (in kg)?' },
    { type: 'user', text: '500 kg' },
    { type: 'bot', text: 'Got it! 500 kg of Tomatoes.\n\nWhat is your minimum price per kg? (Current market: ₹30-40/kg)' },
    { type: 'user', text: '32' },
    { type: 'bot', text: 'Perfect! ₹32 per kg minimum.\n\nWhen was this harvested? (DD/MM or today)' },
    { type: 'user', text: 'today' },
    { type: 'bot', text: '✅ Your listing is being processed...\n\n📋 Summary:\n🍅 Tomatoes - 500 kg\n💰 Min Price: ₹32/kg\n🏷️ Total Value: ₹16,000+\n📍 Srinivaspur, Kolar\n\n⛓️ Anchoring to blockchain...' },
    { type: 'bot', text: '🎉 Listing is LIVE!\n\nAuction ID: #KOL-2025-0628\nEnds in: 24 hours\n\nYou will receive updates when buyers bid.\n\n🔗 Chain Hash: 0x8f9a...8f9a' }
  ],
  hindi: [
    { type: 'bot', text: 'FarmBid में आपका स्वागत है! मैं आपका सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?' },
    { type: 'bot', text: 'जवाब दें:\n1️⃣ नई लिस्टिंग बनाएं\n2️⃣ मेरी लिस्टिंग देखें\n3️⃣ कमाई देखें\n4️⃣ मदद' },
    { type: 'user', text: '1' },
    { type: 'bot', text: 'बहुत अच्छा! नई लिस्टिंग बनाते हैं। कृपया अपनी उपज की फोटो भेजें।' },
    { type: 'user', text: '[टमाटर की फोटो]', isImage: true, imageUrl: 'https://images.pexels.com/photos/15279908/pexels-photo-15279908.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940' },
    { type: 'bot', text: '🍅 ताजे टमाटर दिख रहे हैं! गुणवत्ता प्रीमियम ग्रेड है।\n\nकुल वजन कितना है (किलो में)?' },
    { type: 'user', text: '500 किलो' },
    { type: 'bot', text: 'समझ गया! 500 किलो टमाटर।\n\nआपकी न्यूनतम कीमत प्रति किलो क्या है? (वर्तमान बाजार: ₹30-40/किलो)' },
    { type: 'user', text: '32' },
    { type: 'bot', text: 'बढ़िया! न्यूनतम ₹32 प्रति किलो।\n\nइसकी कटाई कब हुई थी? (DD/MM या आज)' },
    { type: 'user', text: 'आज' },
    { type: 'bot', text: '✅ आपकी लिस्टिंग प्रोसेस हो रही है...\n\n📋 सारांश:\n🍅 टमाटर - 500 किलो\n💰 न्यूनतम: ₹32/किलो\n🏷️ कुल मूल्य: ₹16,000+\n📍 श्रीनिवासपुर, कोलार\n\n⛓️ ब्लॉकचेन पर एंकरिंग...' },
    { type: 'bot', text: '🎉 लिस्टिंग लाइव है!\n\nऑक्शन ID: #KOL-2025-0628\nसमाप्ति: 24 घंटे में\n\nजब खरीदार बोली लगाएंगे तो आपको अपडेट मिलेगा।\n\n🔗 चेन हैश: 0x8f9a...8f9a' }
  ],
  kannada: [
    { type: 'bot', text: 'FarmBid ಗೆ ಸ್ವಾಗತ! ನಾನು ನಿಮ್ಮ ಸಹಾಯಕ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?' },
    { type: 'bot', text: 'ಉತ್ತರಿಸಿ:\n1️⃣ ಹೊಸ ಪಟ್ಟಿ ರಚಿಸಿ\n2️⃣ ನನ್ನ ಪಟ್ಟಿಗಳನ್ನು ನೋಡಿ\n3️⃣ ಗಳಿಕೆ ನೋಡಿ\n4️⃣ ಸಹಾಯ' },
    { type: 'user', text: '1' },
    { type: 'bot', text: 'ಅದ್ಭುತ! ಹೊಸ ಪಟ್ಟಿ ಮಾಡೋಣ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಉತ್ಪನ್ನದ ಫೋಟೋ ಕಳಿಸಿ.' },
    { type: 'user', text: '[ಟೊಮೆಟೊ ಫೋಟೋ]', isImage: true, imageUrl: 'https://images.pexels.com/photos/15279908/pexels-photo-15279908.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940' },
    { type: 'bot', text: '🍅 ತಾಜಾ ಟೊಮೆಟೊ ಕಾಣಿಸುತ್ತಿದೆ! ಗುಣಮಟ್ಟ ಪ್ರೀಮಿಯಂ ಆಗಿದೆ.\n\nಒಟ್ಟು ತೂಕ ಎಷ್ಟು (ಕೆಜಿಯಲ್ಲಿ)?' },
    { type: 'user', text: '500 ಕೆಜಿ' },
    { type: 'bot', text: 'ಆಯಿತು! 500 ಕೆಜಿ ಟೊಮೆಟೊ.\n\nನಿಮ್ಮ ಕನಿಷ್ಠ ಬೆಲೆ ಪ್ರತಿ ಕೆಜಿಗೆ ಎಷ್ಟು? (ಪ್ರಸ್ತುತ ಮಾರುಕಟ್ಟೆ: ₹30-40/ಕೆಜಿ)' },
    { type: 'user', text: '32' },
    { type: 'bot', text: 'ಉತ್ತಮ! ಕನಿಷ್ಠ ₹32 ಪ್ರತಿ ಕೆಜಿ.\n\nಇದನ್ನು ಯಾವಾಗ ಕೊಯ್ಲು ಮಾಡಲಾಯಿತು? (DD/MM ಅಥವಾ ಇಂದು)' },
    { type: 'user', text: 'ಇಂದು' },
    { type: 'bot', text: '✅ ನಿಮ್ಮ ಪಟ್ಟಿ ಪ್ರಕ್ರಿಯೆಯಾಗುತ್ತಿದೆ...\n\n📋 ಸಾರಾಂಶ:\n🍅 ಟೊಮೆಟೊ - 500 ಕೆಜಿ\n💰 ಕನಿಷ್ಠ: ₹32/ಕೆಜಿ\n🏷️ ಒಟ್ಟು ಮೌಲ್ಯ: ₹16,000+\n📍 ಶ್ರೀನಿವಾಸಪುರ, ಕೋಲಾರ\n\n⛓️ ಬ್ಲಾಕ್‌ಚೈನ್‌ಗೆ ಆಂಕರಿಂಗ್...' },
    { type: 'bot', text: '🎉 ಪಟ್ಟಿ ಲೈವ್ ಆಗಿದೆ!\n\nಹರಾಜು ID: #KOL-2025-0628\nಮುಕ್ತಾಯ: 24 ಗಂಟೆಗಳಲ್ಲಿ\n\nಖರೀದಿದಾರರು ಬಿಡ್ ಮಾಡಿದಾಗ ನಿಮಗೆ ಅಪ್‌ಡೇಟ್ ಸಿಗುತ್ತದೆ.\n\n🔗 ಚೈನ್ ಹ್ಯಾಶ್: 0x8f9a...8f9a' }
  ]
}
