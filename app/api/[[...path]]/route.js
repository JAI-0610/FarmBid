import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import {
  seedFarmers,
  seedBuyers,
  seedListings,
  seedCompletedAuctions,
  seedBids,
  seedBlockchainEvents,
  seedDisputes,
  seedDeliveries,
  platformKPIs,
  districtData,
  produceTypes
} from '@/lib/seedData'

// MongoDB connection
let client
let db

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(process.env.DB_NAME)
  }
  return db
}

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// Helper: Update auction timers dynamically
function updateAuctionTimers(listings) {
  const now = new Date()
  return listings.map(listing => {
    const endsAt = new Date(listing.auctionEndsAt)
    const diff = endsAt - now
    let status = listing.status
    if (diff <= 0) {
      status = 'ended'
    } else if (diff <= 60 * 60 * 1000) {
      status = 'ending_soon'
    }
    return { ...listing, status, timeRemaining: Math.max(0, diff) }
  })
}

// Route handler function
async function handleRoute(request, { params }) {
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method
  const url = new URL(request.url)

  try {
    const db = await connectToMongo()

    // ===== ROOT ENDPOINTS =====
    if ((route === '/' || route === '/root') && method === 'GET') {
      return handleCORS(NextResponse.json({ 
        message: 'FarmBid API v1.0',
        tagline: 'Farmers set the price. Buyers compete upward. Blockchain guarantees it all.',
        status: 'operational'
      }))
    }

    // ===== LISTINGS ENDPOINTS =====
    // GET /api/listings - Get all active listings
    if (route === '/listings' && method === 'GET') {
      const status = url.searchParams.get('status')
      let listings = updateAuctionTimers(seedListings)
      if (status && status !== 'all') {
        listings = listings.filter(l => l.status === status)
      }
      return handleCORS(NextResponse.json({ listings, count: listings.length }))
    }

    // GET /api/listings/:id - Get specific listing
    if (route.startsWith('/listings/') && method === 'GET') {
      const id = route.split('/')[2]
      const listing = seedListings.find(l => l.id === id)
      if (!listing) {
        return handleCORS(NextResponse.json({ error: 'Listing not found' }, { status: 404 }))
      }
      const bids = seedBids.filter(b => b.listingId === id)
      const events = seedBlockchainEvents.filter(e => e.entityId === id)
      return handleCORS(NextResponse.json({ 
        ...updateAuctionTimers([listing])[0],
        bids,
        blockchainEvents: events
      }))
    }

    // POST /api/listings - Create new listing
    if (route === '/listings' && method === 'POST') {
      const body = await request.json()
      const newListing = {
        id: uuidv4(),
        ...body,
        status: 'live',
        totalBids: 0,
        currentBidPerKg: body.minPricePerKg,
        createdAt: new Date().toISOString(),
        auctionEndsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        blockchainHash: '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')
      }
      // In production, save to DB
      return handleCORS(NextResponse.json({ success: true, listing: newListing }))
    }

    // ===== BIDS ENDPOINTS =====
    // POST /api/bids - Place a bid
    if (route === '/bids' && method === 'POST') {
      const body = await request.json()
      const { listingId, buyerId, bidPerKg } = body
      
      const listing = seedListings.find(l => l.id === listingId)
      if (!listing) {
        return handleCORS(NextResponse.json({ error: 'Listing not found' }, { status: 404 }))
      }
      if (bidPerKg <= listing.currentBidPerKg) {
        return handleCORS(NextResponse.json({ error: 'Bid must be higher than current bid' }, { status: 400 }))
      }

      const newBid = {
        id: uuidv4(),
        listingId,
        buyerId,
        bidPerKg,
        timestamp: new Date().toISOString(),
        blockchainHash: '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')
      }

      // Create blockchain event
      const blockchainEvent = {
        id: uuidv4(),
        type: 'bid_placed',
        entityId: listingId,
        description: `Bid placed - ₹${bidPerKg}/kg`,
        txHash: newBid.blockchainHash,
        blockNumber: 58234600 + Math.floor(Math.random() * 100),
        timestamp: newBid.timestamp,
        buyer: buyerId,
        network: 'Polygon Mainnet'
      }

      return handleCORS(NextResponse.json({ 
        success: true, 
        bid: newBid,
        blockchainEvent,
        message: 'Bid placed successfully and anchored to blockchain'
      }))
    }

    // GET /api/bids - Get bids for a listing
    if (route === '/bids' && method === 'GET') {
      const listingId = url.searchParams.get('listingId')
      let bids = seedBids
      if (listingId) {
        bids = bids.filter(b => b.listingId === listingId)
      }
      return handleCORS(NextResponse.json({ bids }))
    }

    // ===== FARMERS ENDPOINTS =====
    if (route === '/farmers' && method === 'GET') {
      return handleCORS(NextResponse.json({ farmers: seedFarmers }))
    }

    if (route.startsWith('/farmers/') && method === 'GET') {
      const id = route.split('/')[2]
      const farmer = seedFarmers.find(f => f.id === id)
      if (!farmer) {
        return handleCORS(NextResponse.json({ error: 'Farmer not found' }, { status: 404 }))
      }
      const listings = seedListings.filter(l => l.farmerId === id)
      return handleCORS(NextResponse.json({ ...farmer, listings }))
    }

    // ===== BUYERS ENDPOINTS =====
    if (route === '/buyers' && method === 'GET') {
      return handleCORS(NextResponse.json({ buyers: seedBuyers }))
    }

    if (route.startsWith('/buyers/') && method === 'GET') {
      const id = route.split('/')[2]
      const buyer = seedBuyers.find(b => b.id === id)
      if (!buyer) {
        return handleCORS(NextResponse.json({ error: 'Buyer not found' }, { status: 404 }))
      }
      const bids = seedBids.filter(b => b.buyerId === id)
      const wonAuctions = seedCompletedAuctions.filter(a => a.buyerId === id)
      return handleCORS(NextResponse.json({ ...buyer, bids, wonAuctions }))
    }

    // ===== AUCTIONS ENDPOINTS =====
    if (route === '/auctions/completed' && method === 'GET') {
      return handleCORS(NextResponse.json({ auctions: seedCompletedAuctions }))
    }

    // ===== BLOCKCHAIN ENDPOINTS =====
    if (route === '/blockchain/events' && method === 'GET') {
      const type = url.searchParams.get('type')
      const entityId = url.searchParams.get('entityId')
      let events = [...seedBlockchainEvents]
      if (type) events = events.filter(e => e.type === type)
      if (entityId) events = events.filter(e => e.entityId === entityId)
      events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      return handleCORS(NextResponse.json({ events }))
    }

    // ===== DISPUTES ENDPOINTS =====
    if (route === '/disputes' && method === 'GET') {
      return handleCORS(NextResponse.json({ disputes: seedDisputes }))
    }

    if (route === '/disputes' && method === 'POST') {
      const body = await request.json()
      const newDispute = {
        id: uuidv4(),
        ...body,
        status: 'pending_review',
        createdAt: new Date().toISOString()
      }
      return handleCORS(NextResponse.json({ success: true, dispute: newDispute }))
    }

    // ===== DELIVERIES ENDPOINTS =====
    if (route === '/deliveries' && method === 'GET') {
      return handleCORS(NextResponse.json({ deliveries: seedDeliveries }))
    }

    // ===== ADMIN ENDPOINTS =====
    if (route === '/admin/kpis' && method === 'GET') {
      return handleCORS(NextResponse.json({ kpis: platformKPIs }))
    }

    if (route === '/admin/districts' && method === 'GET') {
      return handleCORS(NextResponse.json({ districts: districtData }))
    }

    if (route === '/admin/fraud-alerts' && method === 'GET') {
      const fraudAlerts = [
        {
          id: 'fa1',
          type: 'weight_mismatch',
          severity: 'high',
          farmerId: 'f4',
          farmerCode: 'KA-BLR-001',
          description: 'Weight discrepancy of 8% detected in last delivery',
          timestamp: '2025-06-24T12:00:00Z',
          status: 'investigating'
        },
        {
          id: 'fa2',
          type: 'suspicious_bidding',
          severity: 'medium',
          buyerId: 'b2',
          description: 'Unusual bidding pattern - same buyer winning >80% of farmer f3 auctions',
          timestamp: '2025-06-27T15:30:00Z',
          status: 'flagged'
        }
      ]
      return handleCORS(NextResponse.json({ alerts: fraudAlerts }))
    }

    // ===== QUALITY ENDPOINTS =====
    if (route === '/quality/analyze' && method === 'POST') {
      // Simulated AI quality analysis
      const body = await request.json()
      const qualityResult = {
        id: uuidv4(),
        imageUrl: body.imageUrl,
        produce: body.produce || 'Tomatoes',
        qualityIndex: Math.floor(70 + Math.random() * 30),
        freshness: Math.floor(75 + Math.random() * 25),
        surfaceDamage: Math.floor(Math.random() * 20),
        colorUniformity: Math.floor(75 + Math.random() * 25),
        grade: 'Premium',
        confidence: Math.floor(85 + Math.random() * 15),
        analyzedAt: new Date().toISOString(),
        blockchainHash: '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')
      }
      if (qualityResult.qualityIndex < 80) qualityResult.grade = 'Standard'
      if (qualityResult.qualityIndex < 65) qualityResult.grade = 'At Risk'
      return handleCORS(NextResponse.json({ success: true, result: qualityResult }))
    }

    // ===== PRODUCE TYPES =====
    if (route === '/produce-types' && method === 'GET') {
      return handleCORS(NextResponse.json({ produceTypes }))
    }

    // ===== WALLET ENDPOINTS =====
    if (route === '/wallet/balance' && method === 'GET') {
      const buyerId = url.searchParams.get('buyerId') || 'b1'
      const buyer = seedBuyers.find(b => b.id === buyerId)
      return handleCORS(NextResponse.json({ 
        balance: buyer?.walletBalance || 50000,
        locked: 18400,
        available: (buyer?.walletBalance || 50000) - 18400
      }))
    }

    if (route === '/wallet/topup' && method === 'POST') {
      const body = await request.json()
      return handleCORS(NextResponse.json({ 
        success: true,
        newBalance: (body.currentBalance || 50000) + body.amount,
        transactionId: uuidv4()
      }))
    }

    // ===== ORDERS ENDPOINTS =====
    if (route === '/orders' && method === 'GET') {
      const buyerId = url.searchParams.get('buyerId')
      let orders = seedCompletedAuctions.map(a => ({
        ...a,
        delivery: seedDeliveries.find(d => d.auctionId === a.id)
      }))
      if (buyerId) {
        orders = orders.filter(o => o.buyerId === buyerId)
      }
      return handleCORS(NextResponse.json({ orders }))
    }

    // Route not found
    return handleCORS(NextResponse.json(
      { error: `Route ${route} not found` }, 
      { status: 404 }
    ))

  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json(
      { error: 'Internal server error', details: error.message }, 
      { status: 500 }
    ))
  }
}

// Export all HTTP methods
export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
