import connectDB from '../../../lib/db';
import PackingSlip from '../../../models/PackingSlip';

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    const packingSlip = await PackingSlip.findById(id);
    if (!packingSlip) {
      return res.status(404).json({ error: 'Packing slip not found' });
    }

    // For now, return the packing slip data
    // In a real implementation, you would generate a PDF here
    res.status(200).json({
      message: 'PDF generation endpoint',
      packingSlip: packingSlip
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
}
