const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Clear any existing connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sample_management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Increase timeout to 10 seconds
      socketTimeoutMS: 45000,
      maxPoolSize: 10, // Maintain up to 10 socket connections
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;

