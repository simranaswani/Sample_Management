import connectDB from '../../../../lib/db';
import Sample from '../../../../models/Sample';

export default async function handler(req, res) {
  await connectDB();

  const { qrCodeId } = req.query;

  if (req.method === 'GET') {
    try {
      const sample = await Sample.findOne({ qrCodeId });
      if (!sample) {
        return res.status(404).json({ error: 'Sample not found' });
      }
      res.status(200).json(sample);
    } catch (error) {
      console.error('Error fetching sample by QR code:', error);
      res.status(500).json({ error: 'Failed to fetch sample' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
