export default function handler(req, res) {
  res.status(200).json({ 
    message: 'Textile Sample Management API is running!',
    timestamp: new Date().toISOString()
  });
}
