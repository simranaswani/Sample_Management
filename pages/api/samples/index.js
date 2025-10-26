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

        const createdSamples = [];
        
        for (let i = 0; i < samples.length; i++) {
          const sampleData = samples[i];
          try {
            // Check if sample already exists with same merchant, type, and design number
            const existingSample = await Sample.findOne({
              merchant: sampleData.merchant,
              productionSampleType: sampleData.productionSampleType,
              designNo: sampleData.designNo
            });

            if (existingSample) {
              // Update the existing sample by adding the pieces
              existingSample.pieces += sampleData.pieces;
              existingSample.updatedAt = new Date();
              
              // Add to batch history to track individual batches
              if (!existingSample.batchHistory) {
                existingSample.batchHistory = [];
              }
              existingSample.batchHistory.push({
                pieces: sampleData.pieces,
                dateCreated: sampleData.dateCreated || new Date(),
                createdAt: new Date()
              });
              
              const savedSample = await existingSample.save();
              createdSamples.push(savedSample);
              results.created++;
              continue;
            }

            // Generate QR code ID
            const qrCodeId = uuidv4();

            // Create new sample with initial batch history entry
            const newSample = new Sample({
              ...sampleData,
              qrCodeId: qrCodeId,
              batchHistory: [{
                pieces: sampleData.pieces,
                dateCreated: sampleData.dateCreated || new Date(),
                createdAt: new Date()
              }]
            });

            const savedSample = await newSample.save();
            createdSamples.push(savedSample);
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
          results: results,
          data: createdSamples
        });
      } else {
        // Handle single sample creation
        const { merchant, productionSampleType, designNo, pieces } = req.body;

        if (!merchant || !productionSampleType || !designNo || !pieces) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if sample already exists with same merchant, type, and design number
        const existingSample = await Sample.findOne({
          merchant,
          productionSampleType,
          designNo
        });

        if (existingSample) {
          // Update the existing sample by adding the pieces
          existingSample.pieces += pieces;
          existingSample.updatedAt = new Date();
          
          // Add to batch history to track individual batches
          if (!existingSample.batchHistory) {
            existingSample.batchHistory = [];
          }
          existingSample.batchHistory.push({
            pieces: pieces,
            dateCreated: req.body.dateCreated || new Date(),
            createdAt: new Date()
          });
          
          await existingSample.save();
          
          return res.status(200).json({
            message: 'Sample updated successfully',
            sample: existingSample
          });
        }

        // Generate QR code ID
        const qrCodeId = uuidv4();

        // Create new sample with initial batch history entry
        const newSample = new Sample({
          merchant,
          productionSampleType,
          designNo,
          pieces,
          qrCodeId,
          batchHistory: [{
            pieces: pieces,
            dateCreated: req.body.dateCreated || new Date(),
            createdAt: new Date()
          }]
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
