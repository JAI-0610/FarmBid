const express = require('express');
const router = express.Router();
const Auction = require('../models/Auction');
const Delivery = require('../models/Delivery');

// GET /api/orders - Get orders for a buyer (completed auctions with delivery info)
router.get('/', async (req, res, next) => {
  try {
    const { buyerId } = req.query;

    const query = buyerId ? { buyerId } : {};

    const orders = await Auction.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Attach delivery information
    const auctionIds = orders.map(o => o._id);
    const deliveries = await Delivery.find({ auctionId: { $in: auctionIds } }).lean();
    const deliveryMap = {};
    deliveries.forEach(d => { deliveryMap[d.auctionId.toString()] = d; });

    const ordersWithDelivery = orders.map(order => ({
      ...order,
      delivery: deliveryMap[order._id.toString()] || null,
      orderDate: order.createdAt,
      status: order.status,
      totalAmount: order.totalValue
    }));

    res.json({
      success: true,
      orders: ordersWithDelivery.map(o => ({ id: o._id, ...o }))
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/:id - Get order details
router.get('/:id', async (req, res, next) => {
  try {
    const order = await Auction.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const delivery = await Delivery.findOne({ auctionId: order._id });
    const listing = await require('../models/Listing').findById(order.listingId);

    res.json({
      success: true,
      order: {
        id: order._id,
        ...order.toObject(),
        delivery: delivery ? { id: delivery._id, ...delivery.toObject() } : null,
        listing: listing ? {
          id: listing._id,
          qualityIndex: listing.qualityIndex,
          qualityGrade: listing.qualityGrade,
          images: listing.images
        } : null
      }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid order ID'
      });
    }
    next(error);
  }
});

module.exports = router;
