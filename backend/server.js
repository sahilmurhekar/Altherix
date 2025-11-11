// ============ server.js ============

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import appointmentRoutes from './routes/appointment.js';

dotenv.config();

// --- DEBUG STEP 1: Check if .env variables are loaded ---
console.log('--- Loading Environment Variables ---');
if (!process.env.MONGO_ATLAS_URI) {
  console.error('🔥 FATAL ERROR: MONGO_ATLAS_URI is not defined.');
  process.exit(1); // Stop the server if DB connection string is missing
}
if (!process.env.JWT_SECRET) {
  console.error('🔥 FATAL ERROR: JWT_SECRET is not defined.');
  process.exit(1);
}
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  console.warn('⚠️ WARNING: CLOUDINARY_CLOUD_NAME is not defined. Image uploads will fail.');
}
console.log('✅ Environment variables loaded.');
// ----------------------------------------------------

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- DEBUG STEP 2: Request Logger ---
// This will log every request to your console
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ➡️  ${req.method} ${req.path}`);
  next();
});
// --------------------------------------

// MongoDB connection using Mongoose
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_ATLAS_URI, {
      dbName: 'ALTHERIX_DB',
    });
    console.log('🔗 Connected to MongoDB via Mongoose');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);

// --- DEBUG STEP 3: Global Error Handler ---
// This will catch any unhandled errors from your routes
// and print a detailed stack trace.
app.use((err, req, res, next) => {
  console.error('🔥🔥🔥 UNHANDLED ERROR 🔥🔥🔥');
  console.error(err.stack); // This prints the full error details
  res.status(500).send({
    message: 'An internal server error occurred!',
    error: err.message
  });
});
// ------------------------------------------

// Start Server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
