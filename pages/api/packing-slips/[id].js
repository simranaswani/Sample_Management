import connectDB from '../../../lib/db';
import PackingSlip from '../../../models/PackingSlip';

export default async function handler(req, res) {
  await connectDB();

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const packingSlip = await PackingSlip.findById(id);
      if (!packingSlip) {
        return res.status(404).json({ error: 'Packing slip not found' });
      }
      res.status(200).json(packingSlip);
    } catch (error) {
      console.error('Error fetching packing slip:', error);
      res.status(500).json({ error: 'Failed to fetch packing slip' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { courier, docNo } = req.body;

      const updatedPackingSlip = await PackingSlip.findByIdAndUpdate(
        id,
        { courier, docNo },
        { new: true }
      );

      if (!updatedPackingSlip) {
        return res.status(404).json({ error: 'Packing slip not found' });
      }

      res.status(200).json({
        message: 'Packing slip updated successfully',
        packingSlip: updatedPackingSlip
      });
    } catch (error) {
      console.error('Error updating packing slip:', error);
      res.status(500).json({ error: 'Failed to update packing slip' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const deletedPackingSlip = await PackingSlip.findByIdAndDelete(id);
      if (!deletedPackingSlip) {
        return res.status(404).json({ error: 'Packing slip not found' });
      }
      res.status(200).json({ message: 'Packing slip deleted successfully' });
    } catch (error) {
      console.error('Error deleting packing slip:', error);
      res.status(500).json({ error: 'Failed to delete packing slip' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
