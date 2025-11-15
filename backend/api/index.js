// ============ backend/api/index.js ============

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// --- IMPORTANT: Path Change ---
// We are now one folder deeper (in 'api'), so we go 'up' one level.
import authRoutes from '../routes/auth.js';
import appointmentRoutes from '../routes/appointment.js';
import medicalRecordsRoutes from '../routes/medicalRecords.js';
import patientMedicalRecordsRoutes from '../routes/patientMedicalRecords.js';

dotenv.config();

console.log('--- Loading Environment Variables ---');
if (!process.env.MONGO_ATLAS_URI) {
  console.error('🔥 FATAL ERROR: MONGO_ATLAS_URI is not defined.');
  process.exit(1);
}
// ... (other env checks)
console.log('✅ Environment variables loaded.');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ➡️  ${req.method} ${req.path}`);
  next();
});

const connectDB = async () => {
  try {
    // Mongoose connections are cached, so this is efficient
    await mongoose.connect(process.env.MONGO_ATLAS_URI, {
      dbName: 'ALTHERIX_DB',
    });
    console.log('🔌 Connected to MongoDB via Mongoose');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// --- DB Connection ---
// We run this at the top level. Vercel will re-use the connection
// for "warm" function invocations.
connectDB();

// --- Routes ---
// These paths are the same, as Vercel rewrites the full path to the app.
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-records', medicalRecordsRoutes);
app.use('/api/patient/medical-records', patientMedicalRecordsRoutes);

// --- Error Handler ---
app.use((err, req, res, next) => {
  console.error('🔥🔥🔥 UNHANDLED ERROR 🔥🔥🔥');
  console.error(err.stack);
  res.status(500).send({
    message: 'An internal server error occurred!',
    error: err.message
  });
});

// --- CRITICAL CHANGE ---
// DO NOT use app.listen(). Instead, export the 'app' for Vercel.
// Vercel will handle the incoming request and pass it to 'app'.
export default app;
