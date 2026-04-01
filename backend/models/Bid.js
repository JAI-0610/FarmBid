const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  buyerId: {
    type: String,
    required: true
  },
  buyerName: {
    type: String,
    required: true
  },
  bidPerKg: {
    type: Number,
    required: true,
    min: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  blockchainHash: {
    type: String,
    default: () => '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')
  },
  isWinning: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
bidSchema.index({ listingId: 1, bidPerKg: -1 });
bidSchema.index({ buyerId: 1, timestamp: -1 });

module.exports = mongoose.model('Bid', bidSchema);
