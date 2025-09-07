const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'Test server is running!' });
});

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
