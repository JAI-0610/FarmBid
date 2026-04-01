const { v4: uuidv4 } = require('uuid');

// TODO: Replace these mock implementations with real backend APIs.

const verifyAadhaar = async (aadhaarNumber) => {
  // Mock Aadhaar verification logic
  const isValid = /^\d{12}$/.test(aadhaarNumber);
  if (!isValid) {
    return { success: false };
  }

  // Simulate failed lookups for numbers ending in 0
  if (aadhaarNumber.endsWith('0')) {
    return { success: false };
  }

  return {
    success: true,
    name: `Farmer ${aadhaarNumber.slice(-4)}`
  };
};

const verifyOTP = async (phone, otp) => {
  // TODO: Replace with real OTP service integration
  if (!/^\d{6}$/.test(otp)) {
    return { success: false };
  }

  const success = otp === '123456';
  return { success };
};

const verifyUPI = async (upiId) => {
  const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
  if (!upiRegex.test(upiId)) {
    return { success: false };
  }

  // Simulate a real UPI validation service
  if (upiId.toLowerCase().includes('invalid')) {
    return { success: false };
  }

  return { success: true };
};

const createListing = async ({ phone, images, weight, minPrice, harvestDate, trustScore }) => {
  const listingId = uuidv4();
  const auctionClosesAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const qualityIndex = Math.floor(70 + Math.random() * 30);

  return {
    listingId,
    images: images || [],
    auctionClosesAt: auctionClosesAt.toISOString(),
    qualityIndex,
    status: 'active'
  };
};

module.exports = {
  verifyAadhaar,
  verifyOTP,
  verifyUPI,
  createListing
};
