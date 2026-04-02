const express = require('express');
const router = express.Router();
const Dispute = require('../models/Dispute');
const Auction = require('../models/Auction');
const Listing = require('../models/Listing');
const Bid = require('../models/Bid');
const { disputeValidation, handleValidationErrors } = require('../middleware/validation');
const { anchorToBlockchain, createBlockchainEvent } = require('../utils/blockchain');

// GET /api/disputes - Get all disputes
router.get('/', async (req, res, next) => {
  try {
    const disputesResult = await Dispute.find()
      .sort({ createdAt: -1 })
      .lean();
    
    const disputes = disputesResult.map(d => ({ id: d._id, ...d }));

    res.json({
      success: true,
      disputes
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/disputes - Create new dispute
router.post('/', handleValidationErrors, disputeValidation, async (req, res, next) => {
  try {
    const { auctionId, buyerId, farmerId, reason, description, amount, evidence } = req.body;

    // Verify auction exists
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(400).json({
        success: false,
        error: 'Auction not found'
      });
    }

    // Verify farmer exists
    const Farmer = require('../models/Farmer');
    const farmer = await Farmer.findById(farmerId);
    if (!farmer) {
      return res.status(400).json({
        success: false,
        error: 'Farmer not found'
      });
    }

    // Calculate proposed refund (suggest 80% for weight mismatch, etc.)
    let proposedRefund = 0;
    if (reason === 'weight_mismatch') {
      proposedRefund = amount * 0.08; // 8% refund
    } else if (reason === 'quality_discrepancy') {
      proposedRefund = amount * 0.15;
    }

    const dispute = new Dispute({
      auctionId,
      buyerId,
      buyerName: auction.buyerName,
      farmerId: farmer._id,
      farmerCode: farmer.code,
      produce: auction.produce,
      reason,
      description,
      amount,
      proposedRefund,
      evidence: evidence || [],
      trustPenalty: reason === 'weight_mismatch' ? 12 : 5
    });

    await dispute.save();

    // Anchor dispute to blockchain
    await anchorToBlockchain({
      type: 'dispute_raised',
      disputeId: dispute._id,
      auctionId,
      reason,
      amount
    }, 'dispute_raised');

    res.status(201).json({
      success: true,
      dispute,
      message: 'Dispute filed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/disputes/:id - Update dispute status (admin)
router.put('/:id', async (req, res, next) => {
  try {
    const { status, resolutionNotes, adminId } = req.body;

    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) {
      return res.status(404).json({
        success: false,
        error: 'Dispute not found'
      });
    }

    dispute.status = status || dispute.status;
    dispute.resolutionNotes = resolutionNotes || dispute.resolutionNotes;
    dispute.adminId = adminId;

    if (status === 'resolved' || status === 'rejected') {
      dispute.resolvedAt = new Date();
    }

    await dispute.save();

    res.json({
      success: true,
      dispute: { id: dispute._id, ...dispute.toObject() },
      message: `Dispute ${status}`
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid dispute ID'
      });
    }
    next(error);
  }
});

// GET /api/disputes/:id - Get dispute details
router.get('/:id', async (req, res, next) => {
  try {
    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) {
      return res.status(404).json({
        success: false,
        error: 'Dispute not found'
      });
    }

    res.json({
      success: true,
      dispute
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid dispute ID'
      });
    }
    next(error);
  }
});

// GET /api/disputes/auction/:auctionId - Get dispute for auction
router.get('/auction/:auctionId', async (req, res, next) => {
  try {
    const dispute = await Dispute.findOne({ auctionId: req.params.auctionId });
    if (!dispute) {
      return res.status(404).json({
        success: false,
        error: 'No dispute found for this auction'
      });
    }

    res.json({
      success: true,
      dispute
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
