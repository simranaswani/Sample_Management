const express = require('express');
const router = express.Router();
const Sample = require('../models/Sample');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

// Create new sample(s)
router.post('/', async (req, res) => {
  try {
    const { samples } = req.body;
    
    if (!Array.isArray(samples) || samples.length === 0) {
      return res.status(400).json({ error: 'Samples array is required' });
    }

    const createdSamples = [];
    
    for (const sampleData of samples) {
      const qrCodeId = uuidv4();
      const qrData = {
        productionSampleType: sampleData.productionSampleType,
        designNo: sampleData.designNo,
        qrCodeId: qrCodeId
      };

      const sample = new Sample({
        ...sampleData,
        qrCodeId: qrCodeId
      });

      const savedSample = await sample.save();
      createdSamples.push({
        ...savedSample.toObject(),
        qrCode: await QRCode.toDataURL(JSON.stringify(qrData))
      });
    }

    res.status(201).json(createdSamples);
  } catch (error) {
    console.error('Error creating samples:', error);
    res.status(500).json({ error: 'Failed to create samples' });
  }
});

// Get all samples
router.get('/', async (req, res) => {
  try {
    const samples = await Sample.find().sort({ dateCreated: -1 });
    res.json(samples);
  } catch (error) {
    console.error('Error fetching samples:', error);
    res.status(500).json({ error: 'Failed to fetch samples' });
  }
});

// Get sample by ID
router.get('/:id', async (req, res) => {
  try {
    const sample = await Sample.findById(req.params.id);
    if (!sample) {
      return res.status(404).json({ error: 'Sample not found' });
    }
    res.json(sample);
  } catch (error) {
    console.error('Error fetching sample:', error);
    res.status(500).json({ error: 'Failed to fetch sample' });
  }
});

// Get sample by QR code ID
router.get('/qr/:qrCodeId', async (req, res) => {
  try {
    const sample = await Sample.findOne({ qrCodeId: req.params.qrCodeId });
    if (!sample) {
      return res.status(404).json({ error: 'Sample not found' });
    }
    res.json(sample);
  } catch (error) {
    console.error('Error fetching sample by QR:', error);
    res.status(500).json({ error: 'Failed to fetch sample' });
  }
});

// Get samples by date
router.get('/by-date/:date', async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const samples = await Sample.find({
      dateCreated: {
        $gte: date,
        $lt: nextDay
      }
    }).sort({ dateCreated: -1 });
    
    res.json(samples);
  } catch (error) {
    console.error('Error fetching samples by date:', error);
    res.status(500).json({ error: 'Failed to fetch samples by date' });
  }
});

// Get aggregated stock summary
router.get('/aggregate/stock', async (req, res) => {
  try {
    const { merchant, startDate, endDate } = req.query;
    
    let matchQuery = {};
    
    if (merchant) {
      matchQuery.merchant = merchant;
    }
    
    if (startDate && endDate) {
      matchQuery.dateCreated = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const aggregation = await Sample.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            productionSampleType: '$productionSampleType',
            designNo: '$designNo'
          },
          totalPieces: { $sum: '$pieces' },
          qrCodes: { $push: '$qrCodeId' },
          dateCreated: { $first: '$dateCreated' },
          merchant: { $first: '$merchant' }
        }
      },
      {
        $sort: { '_id.productionSampleType': 1, '_id.designNo': 1 }
      }
    ]);
    
    res.json(aggregation);
  } catch (error) {
    console.error('Error fetching aggregated stock:', error);
    res.status(500).json({ error: 'Failed to fetch stock summary' });
  }
});

// Update sample
router.put('/:id', async (req, res) => {
  try {
    const sample = await Sample.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!sample) {
      return res.status(404).json({ error: 'Sample not found' });
    }
    
    res.json(sample);
  } catch (error) {
    console.error('Error updating sample:', error);
    res.status(500).json({ error: 'Failed to update sample' });
  }
});

// Delete sample
router.delete('/:id', async (req, res) => {
  try {
    const sample = await Sample.findByIdAndDelete(req.params.id);
    
    if (!sample) {
      return res.status(404).json({ error: 'Sample not found' });
    }
    
    res.json({ message: 'Sample deleted successfully' });
  } catch (error) {
    console.error('Error deleting sample:', error);
    res.status(500).json({ error: 'Failed to delete sample' });
  }
});

module.exports = router;

