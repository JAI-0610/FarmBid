/**
 * Auction Timer Utility
 * Updates auction status based on remaining time
 */

const updateAuctionStatus = (auctionEndsAt) => {
  const now = new Date();
  const endTime = new Date(auctionEndsAt);
  const diff = endTime - now;

  if (diff <= 0) {
    return {
      status: 'ended',
      timeRemaining: 0,
      ended: true
    };
  }

  if (diff <= 60 * 60 * 1000) { // Less than 1 hour
    return {
      status: 'ending_soon',
      timeRemaining: diff,
      ended: false,
      formatted: formatTime(diff)
    };
  }

  return {
    status: 'live',
    timeRemaining: diff,
    ended: false,
    formatted: formatTime(diff)
  };
};

// Format milliseconds to human readable time
const formatTime = (ms) => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};

// Bulk update auction statuses
const updateAuctionsStatus = async (Listing) => {
  try {
    const now = new Date();

    // Update ended auctions
    const endedResult = await Listing.updateMany(
      {
        auctionEndsAt: { $lte: now },
        status: { $ne: 'ended' }
      },
      { $set: { status: 'ended' } }
    );

    // Update ending soon auctions (less than 1 hour)
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const endingSoonResult = await Listing.updateMany(
      {
        auctionEndsAt: { $gt: now, $lte: oneHourFromNow },
        status: { $ne: 'ending_soon' }
      },
      { $set: { status: 'ending_soon' } }
    );

    // Update live auctions (more than 1 hour remaining)
    const liveResult = await Listing.updateMany(
      {
        auctionEndsAt: { $gt: oneHourFromNow },
        status: { $in: ['ending_soon', 'ended'] }
      },
      { $set: { status: 'live' } }
    );

    return {
      ended: endedResult.modifiedCount,
      endingSoon: endingSoonResult.modifiedCount,
      live: liveResult.modifiedCount
    };
  } catch (error) {
    console.error('Error updating auction statuses:', error);
    throw error;
  }
};

const getTimeRemaining = (auctionEndsAt) => {
  return updateAuctionStatus(auctionEndsAt).timeRemaining;
};

module.exports = {
  updateAuctionStatus,
  formatTime,
  updateAuctionsStatus,
  getTimeRemaining
};
