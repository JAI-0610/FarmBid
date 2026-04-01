const { body, param, query, validationResult } = require('express-validator');

// Validation rules for listings
const listingValidation = [
  body('farmerId').isMongoId().withMessage('Invalid farmer ID'),
  body('produce').notEmpty().withMessage('Produce is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be positive'),
  body('minPricePerKg').isFloat({ min: 0 }).withMessage('Minimum price must be positive'),
  body('unit').isIn(['kg', 'quintal', 'ton']).withMessage('Invalid unit'),
  body('harvestDate').notEmpty().withMessage('Harvest date is required'),
  body('expiryDate').notEmpty().withMessage('Expiry date is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('pincode').notEmpty().withMessage('Pincode is required')
];

// Validation rules for bids
const bidValidation = [
  body('listingId').isMongoId().withMessage('Invalid listing ID'),
  body('buyerId').notEmpty().withMessage('Buyer ID is required'),
  body('bidPerKg').isFloat({ min: 0 }).withMessage('Bid amount must be positive')
];

// Validation rules for disputes
const disputeValidation = [
  body('auctionId').isMongoId().withMessage('Invalid auction ID'),
  body('buyerId').notEmpty().withMessage('Buyer ID is required'),
  body('farmerId').isMongoId().withMessage('Invalid farmer ID'),
  body('reason').isIn(['weight_mismatch', 'quality_discrepancy', 'late_delivery', 'damaged_produce', 'other'])
    .withMessage('Invalid dispute reason'),
  body('description').notEmpty().withMessage('Description is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be positive')
];

// Validation for wallet topup
const walletTopupValidation = [
  body('amount').isFloat({ min: 100 }).withMessage('Minimum topup amount is 100'),
  body('paymentMethod').isIn(['upi', 'bank_transfer', 'crypto']).withMessage('Invalid payment method')
];

// Validation for quality analysis
const qualityAnalysisValidation = [
  body('imageUrl').optional().isURL().withMessage('Invalid image URL'),
  body('produce').optional().isString().withMessage('Produce must be string')
];

// Common validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Query param validation
const queryValidation = {
  listingId: param('id').isMongoId().withMessage('Invalid listing ID'),
  farmerId: param('id').isMongoId().withMessage('Invalid farmer ID'),
  buyerId: param('id').isMongoId().withMessage('Invalid buyer ID'),
  page: query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
  limit: query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  status: query('status').optional().isIn(['live', 'ended', 'ending_soon', 'cancelled', 'all'])
};

module.exports = {
  listingValidation,
  bidValidation,
  disputeValidation,
  walletTopupValidation,
  qualityAnalysisValidation,
  queryValidation,
  handleValidationErrors
};
