const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  auctionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    required: true
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  buyerId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_transit', 'delivered', 'failed', 'cancelled'],
    default: 'scheduled'
  },
  pickupWeight: {
    type: Number,
    required: true
  },
  deliveredWeight: {
    type: Number,
    required: true
  },
  weightDiscrepancy: {
    type: Number,
    min: 0,
    max: 100
  },
  pickupPhoto: {
    type: Boolean,
    default: false
  },
  deliveryPhoto: {
    type: Boolean,
    default: false
  },
  deliveryAgent: {
    type: String
  },
  deliveryAgentPhone: {
    type: String
  },
  pickupTime: {
    type: Date
  },
  deliveryTime: {
    type: Date
  },
  geotagPickup: {
    lat: Number,
    lng: Number
  },
  geotagDelivery: {
    lat: Number,
    lng: Number
  },
  notes: {
    type: String
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Delivery', deliverySchema);
