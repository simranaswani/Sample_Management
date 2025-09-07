import connectDB from '../../../../lib/db';
import Sample from '../../../../models/Sample';

export default async function handler(req, res) {
  await connectDB();

  const { date } = req.query;

  if (req.method === 'GET') {
    try {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      const samples = await Sample.find({
        dateCreated: {
          $gte: startDate,
          $lt: endDate
        }
      });

      res.status(200).json(samples);
    } catch (error) {
      console.error('Error fetching samples by date:', error);
      res.status(500).json({ error: 'Failed to fetch samples' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
