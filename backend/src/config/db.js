const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/task_management_db';

    // Use TLS options only for Atlas (mongodb+srv) connections
    const options = {};
    if (uri.startsWith('mongodb+srv')) {
      options.tls = true;
      options.tlsAllowInvalidCertificates = true;
    }

    const conn = await mongoose.connect(uri, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Do not exit process during testing
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;
