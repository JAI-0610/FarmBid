const express = require('express');
const router = express.Router();
const { anchorToBlockchain, createBlockchainEvent } = require('../utils/blockchain');

// POST /api/quality/analyze - AI quality analysis
router.post('/analyze', async (req, res, next) => {
  try {
    const { imageUrl, produce } = req.body;

    // In production, this would:
    // 1. Receive image upload
    // 2. Call AI/ML model for quality analysis (Computer Vision)
    // 3. Store analysis results
    // 4. Anchor to blockchain

    // Simulation: Generate random but consistent quality metrics based on produce
    const produceWeights = {
      'Tomatoes': { base: 88, variance: 10 },
      'Onions': { base: 85, variance: 8 },
      'Green Chilies': { base: 90, variance: 7 },
      'Potatoes': { base: 82, variance: 12 },
      'Grapes': { base: 92, variance: 6 },
      'Capsicum': { base: 87, variance: 9 }
    };

    const weights = produceWeights[produce] || { base: 85, variance: 10 };
    const qualityIndex = Math.floor(weights.base + (Math.random() - 0.5) * weights.variance);
    const freshness = Math.max(70, Math.min(100, qualityIndex + (Math.random() - 0.5) * 10));
    const surfaceDamage = Math.max(0, Math.min(20, 15 - qualityIndex / 10));
    const colorUniformity = Math.max(70, qualityIndex - 5);

    let grade = 'Standard';
    if (qualityIndex >= 90) grade = 'Premium';
    else if (qualityIndex < 65) grade = 'At Risk';

    const confidence = Math.floor(85 + Math.random() * 15);

    const result = {
      id: `qa_${Date.now()}`,
      imageUrl: imageUrl || '',
      produce: produce || 'Unknown',
      qualityIndex,
      freshness: Math.floor(freshness),
      surfaceDamage: Math.floor(surfaceDamage),
      colorUniformity: Math.floor(colorUniformity),
      grade,
      confidence,
      analyzedAt: new Date().toISOString(),
      blockchainHash: '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')
    };

    // Anchor quality analysis to blockchain
    try {
      const blockchainData = await anchorToBlockchain({
        type: 'quality_anchored',
        produce,
        qualityIndex,
        grade
      }, 'quality_anchored');

      result.blockchainHash = blockchainData.txHash;

      await createBlockchainEvent(require('../models/BlockchainEvent'), {
        type: 'quality_anchored',
        entityId: result.id,
        entityType: 'quality_analysis',
        description: `AI Quality Score anchored - Index: ${qualityIndex} (${grade})`,
        txHash: blockchainData.txHash,
        blockNumber: blockchainData.blockNumber,
        timestamp: blockchainData.timestamp,
        qualityIndex,
        network: blockchainData.network
      });
    } catch (err) {
      console.warn('Could not anchor to blockchain:', err.message);
    }

    res.json({
      success: true,
      result
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/quality/manual-score - Manual quality scoring (admin/farmer)
router.post('/manual-score', async (req, res, next) => {
  try {
    const { listingId, qualityIndex, grade, inspectorNotes, inspectorId } = req.body;

    const Listing = require('../models/Listing');
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found'
      });
    }

    // Update listing quality data
    listing.qualityIndex = qualityIndex;
    listing.qualityGrade = grade;
    listing.inspectorNotes = inspectorNotes;
    listing.inspectedAt = new Date();
    listing.inspectedBy = inspectorId;

    await listing.save();

    res.json({
      success: true,
      listing,
      message: 'Quality score updated'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
