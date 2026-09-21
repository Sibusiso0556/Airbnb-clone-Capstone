const mongoose = require('mongoose');
const dns = require('node:dns');

dns.setServers(['1.1.1.1', '8.8.8.8']);

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set in the environment.');
  }
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}

module.exports = connectDB;
