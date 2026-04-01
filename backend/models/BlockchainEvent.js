const mongoose = require('mongoose');

const blockchainEventSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'listing_created',
      'bid_placed',
      'quality_anchored',
      'escrow_locked',
      'settlement_released',
      'dispute_raised',
      'delivery_confirmed',
      'wallet_topup',
      'farmer_verified',
      'buyer_verified'
    ],
    required: true
  },
  entityId: {
    type: String,
    required: true
  },
  entityType: {
    type: String,
    enum: ['listing', 'bid', 'auction', 'farmer', 'buyer', 'dispute'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  txHash: {
    type: String,
    required: true,
    unique: true
  },
  blockNumber: {
    type: Number
  },
  network: {
    type: String,
    default: 'Polygon Mainnet'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  // Optional fields depending on event type
  farmer: {
    type: String
  },
  buyer: {
    type: String
  },
  qualityIndex: {
    type: Number
  },
  amount: {
    type: Number
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for blockchain event queries
blockchainEventSchema.index({ type: 1, timestamp: -1 });
blockchainEventSchema.index({ entityId: 1, entityType: 1 });
blockchainEventSchema.index({ txHash: 1 }, { unique: true });

module.exports = mongoose.model('BlockchainEvent', blockchainEventSchema);
