const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const Bid = require('../models/Bid');
const Auction = require('../models/Auction');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const Buyer = require('../models/Buyer');
const Farmer = require('../models/Farmer');
const { anchorToBlockchain, createBlockchainEvent } = require('../utils/blockchain');
const { sendWhatsAppMessage } = require('../utils/whatsapp');
const { v4: uuidv4 } = require('uuid');
const { bidValidation, handleValidationErrors } = require('../middleware/validation');

// POST /api/bids - Place a bid
router.post('/', handleValidationErrors, bidValidation, async (req, res, next) => {
  try {
    const { listingId, buyerId, bidPerKg } = req.body;

    // Convert listingId to ObjectId if it's a string
    const listingObjectId = typeof listingId === 'string' ? listingId : listingId._id;

    const listing = await Listing.findById(listingObjectId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found'
      });
    }

    // Check if auction has ended
    if (listing.status === 'ended') {
      return res.status(400).json({
        success: false,
        error: 'Auction has ended'
      });
    }

    // Check if bid is higher than current
    if (bidPerKg <= listing.currentBidPerKg) {
      return res.status(400).json({
        success: false,
        error: 'Bid must be higher than current bid of ₹' + listing.currentBidPerKg + '/kg'
      });
    }

    // Create bid
    const bid = new Bid({
      listingId: listing._id,
      buyerId,
      bidPerKg,
      timestamp: new Date()
    });

    await bid.save();

    // Update listing
    listing.currentBidPerKg = bidPerKg;
    listing.totalBids += 1;
    listing.highestBidderId = buyerId;
    listing.highestBidderName = buyerId; // Would fetch buyer name in production
    await listing.save();

    // Anchor bid to blockchain
    const blockchainData = await anchorToBlockchain({
      type: 'bid_placed',
      listingId: listing._id,
      buyerId,
      bidAmount: bidPerKg
    }, 'bid_placed');

    // Create blockchain event
    await createBlockchainEvent(require('../models/BlockchainEvent'), {
      type: 'bid_placed',
      entityId: listing._id.toString(),
      entityType: 'listing',
      description: `Bid placed - ₹${bidPerKg}/kg by buyer ${buyerId}`,
      txHash: blockchainData.txHash,
      blockNumber: blockchainData.blockNumber,
      timestamp: blockchainData.timestamp,
      buyer: buyerId,
      network: blockchainData.network
    });

    try {
      const buyer = await Buyer.findById(buyerId);
      const farmer = await Farmer.findById(listing.farmerId);
      const notifications = [];

      if (buyer && buyer.phone) {
        notifications.push(sendWhatsAppMessage({
          to: buyer.phone,
          body: `Hello ${buyer.name}, your bid of ₹${bidPerKg}/kg on ${listing.produce} is now the highest bid. Good luck!`
        }));
      }

      if (farmer && farmer.phone) {
        notifications.push(sendWhatsAppMessage({
          to: farmer.phone,
          body: `Hi ${farmer.name}, a new bid of ₹${bidPerKg}/kg has been placed on your ${listing.produce} listing. Current highest bid is ₹${bidPerKg}/kg.`
        }));
      }

      await Promise.allSettled(notifications);
    } catch (notificationError) {
      console.warn('WhatsApp notification failed for bid placement:', notificationError.message || notificationError);
    }

    res.status(201).json({
      success: true,
      bid: {
        id: bid._id,
        ...bid.toObject()
      },
      blockchainEvent: {
        txHash: blockchainData.txHash,
        blockNumber: blockchainData.blockNumber,
        network: blockchainData.network,
        timestamp: blockchainData.timestamp
      },
      message: 'Bid placed successfully and anchored to blockchain'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/bids - Get bids for a listing
router.get('/', async (req, res, next) => {
  try {
    const { listingId } = req.query;

    const query = listingId ? { listingId } : {};

    const bids = await Bid.find(query)
      .sort({ bidPerKg: -1, timestamp: 1 })
      .lean()
      .map(bid => ({
        id: bid._id,
        ...bid
      }));

    res.json({
      success: true,
      bids
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/bids/:id - Get bid details
router.get('/:id', async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.id);
    if (!bid) {
      return res.status(404).json({
        success: false,
        error: 'Bid not found'
      });
    }

    res.json({
      success: true,
      bid: {
        id: bid._id,
        ...bid.toObject()
      }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid bid ID'
      });
    }
    next(error);
  }
});

// GET /api/bids/buyer/:buyerId - Get bids by buyer
router.get('/buyer/:buyerId', async (req, res, next) => {
  try {
    const bids = await Bid.find({ buyerId: req.params.buyerId })
      .sort({ timestamp: -1 })
      .lean()
      .map(bid => ({
        id: bid._id,
        ...bid
      }));

    res.json({
      success: true,
      bids
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
