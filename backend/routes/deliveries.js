const express = require('express');
const router = express.Router();
const Delivery = require('../models/Delivery');
const Auction = require('../models/Auction');

// GET /api/deliveries - Get all deliveries
router.get('/', async (req, res, next) => {
  try {
    const { status, auctionId } = req.query;

    const query = {};
    if (status) query.status = status;
    if (auctionId) query.auctionId = auctionId;

    const deliveriesResult = await Delivery.find(query)
      .sort({ pickupTime: -1 })
      .lean();
    
    const deliveries = deliveriesResult.map(d => ({ id: d._id, ...d }));

    res.json({
      success: true,
      deliveries
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/deliveries/:id - Get delivery details
router.get('/:id', async (req, res, next) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({
        success: false,
        error: 'Delivery not found'
      });
    }

    // Attach auction info
    const auction = await Auction.findById(delivery.auctionId);
    if (auction) {
      delivery.auction = {
        id: auction._id,
        produce: auction.produce,
        quantity: auction.quantity,
        farmerName: auction.farmerName,
        buyerName: auction.buyerName
      };
    }

    res.json({
      success: true,
      delivery
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid delivery ID'
      });
    }
    next(error);
  }
});

// POST /api/deliveries - Create delivery record
router.post('/', async (req, res, next) => {
  try {
    const {
      auctionId,
      pickupWeight,
      deliveredWeight,
      deliveryAgent,
      deliveryAgentPhone,
      geotagPickup,
      geotagDelivery,
      pickupPhoto,
      deliveryPhoto,
      notes
    } = req.body;

    // Verify auction exists
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(400).json({
        success: false,
        error: 'Auction not found'
      });
    }

    // Calculate weight discrepancy
    const weightDiscrepancy = ((pickupWeight - deliveredWeight) / pickupWeight) * 100;

    const delivery = new Delivery({
      auctionId,
      farmerId: auction.farmerId,
      buyerId: auction.buyerId,
      status: 'in_transit',
      pickupWeight,
      deliveredWeight,
      weightDiscrepancy: Math.abs(weightDiscrepancy),
      deliveryAgent,
      deliveryAgentPhone,
      geotagPickup,
      geotagDelivery,
      pickupPhoto: pickupPhoto || false,
      deliveryPhoto: deliveryPhoto || false,
      notes,
      pickupTime: new Date()
    });

    await delivery.save();

    res.status(201).json({
      success: true,
      delivery: { id: delivery._id, ...delivery.toObject() },
      message: 'Delivery scheduled successfully'
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/deliveries/:id - Update delivery status
router.put('/:id', async (req, res, next) => {
  try {
    const { status, deliveredWeight, deliveryPhoto, notes, rating } = req.body;

    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({
        success: false,
        error: 'Delivery not found'
      });
    }

    delivery.status = status || delivery.status;
    delivery.notes = notes || delivery.notes;

    if (deliveredWeight) {
      delivery.deliveredWeight = deliveredWeight;
      delivery.weightDiscrepancy = Math.abs(
        ((delivery.pickupWeight - deliveredWeight) / delivery.pickupWeight) * 100
      );
    }

    if (deliveryPhoto) {
      delivery.deliveryPhoto = deliveryPhoto;
    }

    if (rating) {
      delivery.rating = rating;
    }

    // If delivered, set delivery time
    if (status === 'delivered') {
      delivery.deliveryTime = new Date();
      // Update auction delivery status
      await Auction.findByIdAndUpdate(delivery.auctionId, {
        deliveryStatus: 'delivered'
      });
    }

    await delivery.save();

    res.json({
      success: true,
      delivery: { id: delivery._id, ...delivery.toObject() },
      message: `Delivery ${status}`
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid delivery ID'
      });
    }
    next(error);
  }
});

// GET /api/deliveries/auction/:auctionId - Get delivery for auction
router.get('/auction/:auctionId', async (req, res, next) => {
  try {
    const delivery = await Delivery.findOne({ auctionId: req.params.auctionId });
    if (!delivery) {
      return res.status(404).json({
        success: false,
        error: 'No delivery found for this auction'
      });
    }

    res.json({
      success: true,
      delivery
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
