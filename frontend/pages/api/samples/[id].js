import connectDB from '../../../lib/db';
import Sample from '../../../models/Sample';

export default async function handler(req, res) {
  await connectDB();

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const sample = await Sample.findById(id);
      if (!sample) {
        return res.status(404).json({ error: 'Sample not found' });
      }
      res.status(200).json(sample);
    } catch (error) {
      console.error('Error fetching sample:', error);
      res.status(500).json({ error: 'Failed to fetch sample' });
    }
  } else if (req.method === 'PUT') {
    try {
      const updatedSample = await Sample.findByIdAndUpdate(id, req.body, { new: true });
      if (!updatedSample) {
        return res.status(404).json({ error: 'Sample not found' });
      }
      res.status(200).json(updatedSample);
    } catch (error) {
      console.error('Error updating sample:', error);
      res.status(500).json({ error: 'Failed to update sample' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const deletedSample = await Sample.findByIdAndDelete(id);
      if (!deletedSample) {
        return res.status(404).json({ error: 'Sample not found' });
      }
      res.status(200).json({ message: 'Sample deleted successfully' });
    } catch (error) {
      console.error('Error deleting sample:', error);
      res.status(500).json({ error: 'Failed to delete sample' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
