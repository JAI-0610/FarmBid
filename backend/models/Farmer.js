const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  village: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  landSize: {
    type: String,
    required: true
  },
  trustScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  totalListings: {
    type: Number,
    default: 0
  },
  successfulSales: {
    type: Number,
    default: 0
  },
  joinedDate: {
    type: String,
    required: true
  },
  aadhaarVerified: {
    type: Boolean,
    default: false
  },
  upiVerified: {
    type: Boolean,
    default: false
  },
  landVerified: {
    type: Boolean,
    default: false
  },
  language: {
    type: String,
    enum: ['Kannada', 'Hindi', 'Telugu', 'English', 'Tamil', 'Malayalam'],
    default: 'Kannada'
  },
  crops: [{
    type: String
  }],
  profileImage: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Farmer', farmerSchema);
