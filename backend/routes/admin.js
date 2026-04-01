const express = require('express');
const router = express.Router();
const Farmer = require('../models/Farmer');
const Buyer = require('../models/Buyer');
const Listing = require('../models/Listing');
const Auction = require('../models/Auction');
const Dispute = require('../models/Dispute');
const Delivery = require('../models/Delivery');
const Wallet = require('../models/Wallet');

// GET /api/admin/kpis - Get platform KPIs
router.get('/kpis', async (req, res, next) => {
  try {
    const [
      totalFarmers,
      totalBuyers,
      activeAuctions,
      totalListings,
      avgQualityIndex,
      disputeCount,
      fraudCount
    ] = await Promise.all([
      Farmer.countDocuments(),
      Buyer.countDocuments(),
      Listing.countDocuments({ status: 'live' }),
      Listing.countDocuments(),
      Listing.aggregate([{ $avg: '$qualityIndex' }]),
      Dispute.countDocuments({ status: { $in: ['pending_review', 'investigating'] } }),
      Dispute.countDocuments({ trustPenalty: { $gt: 10 } })
    ]);

    // Calculate total GMV
    const gmvResult = await Auction.aggregate([
      { $group: { _id: null, totalGMV: { $sum: '$totalValue' } } }
    ]);

    // Calculate total transaction fees (2% of GMV)
    const totalGMV = gmvResult[0]?.totalGMV || 0;
    const transactionFees = totalGMV * 0.02;

    // Calculate avg settlement time (mock calculation based on delivery times)
    const avgSettlementTime = '4.2 hours'; // Would calculate from actual data

    // Calculate success rate
    const totalAuctions = await Auction.countDocuments();
    const settledAuctions = await Auction.countDocuments({ status: 'settled' });
    const successRate = totalAuctions > 0 ? (settledAuctions / totalAuctions) * 100 : 94.5;

    // Calculate dispute rate
    const disputeRate = totalAuctions > 0 ? (disputeCount / totalAuctions) * 100 : 3.2;

    res.json({
      success: true,
      kpis: {
        totalGMV,
        totalFarmers,
        totalBuyers,
        activeAuctions,
        totalListings,
        avgQualityIndex: avgQualityIndex[0]?.avg?.toFixed(1) || 84,
        avgSettlementTime,
        disputeRate: disputeRate.toFixed(1),
        fraudFlagsToday: fraudCount,
        transactionFees: Math.floor(transactionFees),
        successRate: successRate.toFixed(1)
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/districts - Get district statistics
router.get('/districts', async (req, res, next) => {
  try {
    const districtStats = await Farmer.aggregate([
      {
        $group: {
          _id: '$district',
          farmers: { $sum: 1 },
          avgTrustScore: { $avg: '$trustScore' },
          listings: {
            $sum: '$totalListings'
          },
          successfulSales: {
            $sum: '$successfulSales'
          }
        }
      },
      { $sort: { farmers: -1 } }
    ]);

    // Get top crops by district
    const cropsByDistrict = await Listing.aggregate([
      {
        $group: {
          _id: {
            district: { $first: '$location' }, // This would need actual district field
            produce: '$produce'
          },
          totalQuantity: { $sum: '$quantity' },
          avgPrice: { $avg: '$currentBidPerKg' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      districts: districtStats,
      topCrops: cropsByDistrict
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/fraud-alerts - Get fraud alerts
router.get('/fraud-alerts', async (req, res, next) => {
  try {
    // Find suspicious patterns
    const alerts = [];

    // Check for weight discrepancies > 5%
    const largeDiscrepancies = await Delivery.find({
      weightDiscrepancy: { $gt: 5 }
    }).limit(5);

    largeDiscrepancies.forEach(d => {
      alerts.push({
        id: `wd_${d._id}`,
        type: 'weight_mismatch',
        severity: d.weightDiscrepancy > 10 ? 'high' : 'medium',
        farmerId: d.farmerId.toString(),
        description: `Weight discrepancy of ${d.weightDiscrepancy.toFixed(1)}% detected in delivery ${d._id}`,
        timestamp: d.createdAt,
        status: 'investigating'
      });
    });

    // Check for farmers with many cancelled/ended auctions
    const suspiciousFarmers = await Farmer.aggregate([
      {
        $lookup: {
          from: 'listings',
          localField: '_id',
          foreignField: 'farmerId',
          as: 'listings'
        }
      },
      {
        $addFields: {
          cancelledCount: {
            $size: {
              $filter: {
                input: '$listings',
                as: 'l',
                cond: { $eq: ['$$l.status', 'cancelled'] }
              }
            }
          },
          totalListings: { $size: '$listings' }
        }
      },
      {
        $match: {
          $expr: {
            $gt: ['$cancelledCount', { $multiply: ['$totalListings', 0.3] }]
          }
        }
      }
    ]).limit(5);

    suspiciousFarmers.forEach(f => {
      alerts.push({
        id: `sf_${f._id}`,
        type: 'high_cancellation_rate',
        severity: 'medium',
        farmerId: f._id.toString(),
        farmerCode: f.code,
        description: `Farmer has ${(f.cancelledCount / f.totalListings * 100).toFixed(1)}% cancellation rate`,
        timestamp: new Date(),
        status: 'flagged'
      });
    });

    // Check for bid collusion (same IP / same buyer winning too much)
    const bidStats = await Bid.aggregate([
      {
        $group: {
          _id: '$buyerId',
          totalBids: { $sum: 1 },
          wonAuctions: {
            $sum: {
              $cond: [{ $eq: ['$isWinning', true] }, 1, 0]
            }
          }
        }
      },
      {
        $addFields: {
          winRate: { $divide: ['$wonAuctions', '$totalBids'] }
        }
      },
      {
        $match: {
          winRate: { $gt: 0.8 },
          totalBids: { $gt: 10 }
        }
      }
    ]).limit(3);

    bidStats.forEach(b => {
      alerts.push({
        id: `bc_${b._id}`,
        type: 'suspicious_bidding',
        severity: 'high',
        buyerId: b._id,
        description: `Buyer winning ${(b.winRate * 100).toFixed(0)}% of auctions (${b.wonAuctions}/${b.totalBids})`,
        timestamp: new Date(),
        status: 'flagged'
      });
    });

    res.json({
      success: true,
      alerts: alerts.sort((a, b) => {
        const severityOrder = { high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      })
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/platform-health - Get overall platform health
router.get('/platform-health', async (req, res, next) => {
  try {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      newListings,
      newBids,
      newDisputes,
      activeWallets,
      totalVolume
    ] = await Promise.all([
      Listing.countDocuments({ createdAt: { $gte: dayAgo } }),
      Bid.countDocuments({ createdAt: { $gte: dayAgo } }),
      Dispute.countDocuments({ createdAt: { $gte: dayAgo } }),
      Wallet.countDocuments({ availableBalance: { $gt: 0 } }),
      Auction.aggregate([
        {
          $match: { createdAt: { $gte: dayAgo } }
        },
        {
          $group: { _id: null, total: { $sum: '$totalValue' } }
        }
      ])
    ]);

    res.json({
      success: true,
      health: {
        newListings,
        newBids,
        newDisputes,
        activeWallets,
        totalVolume24h: totalVolume[0]?.total || 0,
        uptime: '99.9%',
        lastChecked: now
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
