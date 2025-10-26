import connectDB from '../../../../lib/db';
import Sample from '../../../../models/Sample';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const { merchant, startDate, endDate } = req.query;
      
      let filter = {};
      
      if (merchant) {
        filter.merchant = merchant;
      }
      
      if (startDate && endDate) {
        filter.dateCreated = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const samples = await Sample.find(filter);
      
      // Aggregate by merchant and designNo
      const stockSummary = samples.reduce((acc, sample) => {
        const key = `${sample.merchant}-${sample.designNo}`;
        if (!acc[key]) {
          acc[key] = {
            _id: {
              productionSampleType: sample.productionSampleType,
              designNo: sample.designNo
            },
            merchant: sample.merchant,
            totalPieces: 0,
            qrCodes: [],
            dateCreated: sample.dateCreated,
            samples: []
          };
        }
        acc[key].totalPieces += sample.pieces;
        if (sample.qrCodeId) {
          acc[key].qrCodes.push(sample.qrCodeId);
        }
        acc[key].samples.push(sample);
        return acc;
      }, {});

      const result = Object.values(stockSummary).sort((a, b) => {
        if (a.merchant !== b.merchant) {
          return a.merchant.localeCompare(b.merchant);
        }
        return a._id.designNo.localeCompare(b._id.designNo);
      });

      res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching stock summary:', error);
      res.status(500).json({ error: 'Failed to fetch stock summary' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
