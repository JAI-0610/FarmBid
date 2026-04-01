const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URL || 'mongodb://localhost:27017/farmbid_db';

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ MongoDB Connected Successfully...');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB Connection Error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB Disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB Reconnected');
    });

  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    console.log('⚠️  Continuing without MongoDB - some features may be limited');
    // Don't exit, continue without database for development/testing
  }
};

module.exports = connectDB;
