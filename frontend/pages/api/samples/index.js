import connectDB from '../../../lib/db';
import Sample from '../../../models/Sample';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const samples = await Sample.find({}).sort({ createdAt: -1 });
      res.status(200).json(samples);
    } catch (error) {
      console.error('Error fetching samples:', error);
      res.status(500).json({ error: 'Failed to fetch samples' });
    }
  } else if (req.method === 'POST') {
    try {
      const { samples } = req.body;

      // Handle bulk import
      if (samples && Array.isArray(samples)) {
        const results = {
          total: samples.length,
          created: 0,
          skipped: 0,
          errors: []
        };

        for (let i = 0; i < samples.length; i++) {
          const sampleData = samples[i];
          try {
            // Check if sample already exists
            const existingSample = await Sample.findOne({
              merchant: sampleData.merchant,
              designNo: sampleData.designNo
            });

            if (existingSample) {
              results.skipped++;
              continue;
            }

            // Generate QR code ID
            const qrCodeId = uuidv4();

            // Create QR data
            const qrData = {
              merchant: sampleData.merchant,
              productionSampleType: sampleData.productionSampleType,
              designNo: sampleData.designNo,
              qrCodeId: qrCodeId
            };

            // Create new sample
            const newSample = new Sample({
              ...sampleData,
              qrCodeId: qrCodeId
            });

            await newSample.save();
            results.created++;
          } catch (error) {
            console.error(`Error processing sample ${i + 1}:`, error);
            results.errors.push({
              index: i + 1,
              error: error.message
            });
          }
        }

        res.status(201).json({
          message: 'Bulk import completed',
          results: results
        });
      } else {
        // Handle single sample creation
        const { merchant, productionSampleType, designNo, pieces } = req.body;

        if (!merchant || !productionSampleType || !designNo || !pieces) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if sample already exists
        const existingSample = await Sample.findOne({
          merchant,
          designNo
        });

        if (existingSample) {
          return res.status(400).json({ error: 'Sample already exists' });
        }

        // Generate QR code ID
        const qrCodeId = uuidv4();

        const newSample = new Sample({
          merchant,
          productionSampleType,
          designNo,
          pieces,
          qrCodeId
        });

        await newSample.save();

        res.status(201).json({
          message: 'Sample created successfully',
          sample: newSample
        });
      }
    } catch (error) {
      console.error('Error creating sample:', error);
      res.status(500).json({ error: 'Failed to create sample' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
