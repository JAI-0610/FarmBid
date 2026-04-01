const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  auctionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
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
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  farmerCode: {
    type: String,
    required: true
  },
  produce: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    enum: ['weight_mismatch', 'quality_discrepancy', 'late_delivery', 'damaged_produce', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  evidence: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['pending_review', 'investigating', 'resolved', 'rejected'],
    default: 'pending_review'
  },
  amount: {
    type: Number,
    required: true
  },
  proposedRefund: {
    type: Number
  },
  resolutionNotes: {
    type: String
  },
  resolvedAt: {
    type: Date
  },
  trustPenalty: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  adminId: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Dispute', disputeSchema);
