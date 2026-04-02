const express = require('express');
const router = express.Router();
const BlockchainEvent = require('../models/BlockchainEvent');

// GET /api/blockchain/events - Get blockchain events
router.get('/events', async (req, res, next) => {
  try {
    const { type, entityId, entityType, limit = 100 } = req.query;

    const query = {};
    if (type) query.type = type;
    if (entityId) query.entityId = entityId;
    if (entityType) query.entityType = entityType;

    const events = await BlockchainEvent.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .lean();

    const transformedEvents = events.map(e => ({ id: e._id, ...e }));

    res.json({
      success: true,
      events: transformedEvents
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/blockchain/events/:txHash - Get event by transaction hash
router.get('/events/tx/:txHash', async (req, res, next) => {
  try {
    const event = await BlockchainEvent.findOne({ txHash: req.params.txHash });
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      event: { id: event._id, ...event.toObject() }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/blockchain/verify - Verify transaction
router.post('/verify', async (req, res, next) => {
  try {
    const { txHash } = req.body;

    if (!txHash) {
      return res.status(400).json({
        success: false,
        error: 'Transaction hash is required'
      });
    }

    const event = await BlockchainEvent.findOne({ txHash });
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found in our records'
      });
    }

    res.json({
      success: true,
      verified: true,
      transaction: event
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/blockchain/stats - Get blockchain statistics
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await BlockchainEvent.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          latest: { $max: '$timestamp' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const totalEvents = await BlockchainEvent.countDocuments();
    const latestEvent = await BlockchainEvent.findOne().sort({ timestamp: -1 });

    res.json({
      success: true,
      stats: {
        totalEvents,
        byType: stats,
        latestTx: latestEvent ? latestEvent.txHash : null,
        lastUpdated: latestEvent ? latestEvent.timestamp : null
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
