import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing MongoDB connection...');
console.log('URI:', process.env.MONGO_ATLAS_URI.substring(0, 20) + '...');

try {
  await mongoose.connect(process.env.MONGO_ATLAS_URI, {
    dbName: 'ALTHERIX_DB',
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    socketTimeoutMS: 5000,
  });
  console.log('Connected successfully');
  await mongoose.disconnect();
} catch (error) {
  console.error('Connection failed:', error.message);
  console.error('Full error:', error);
}