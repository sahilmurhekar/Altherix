// ============ backend/api/index.js (UPDATED) ============

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// --- IMPORTANT: Path Change ---
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

// --- CORS Configuration ---
// List of allowed domains
const allowedOrigins = [
  "https://altherix.vercel.app",
  "http://localhost:5000"
];

const corsOptions = {
  origin: allowedOrigins
};

// Use the specific CORS options
app.use(cors(corsOptions));

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ➡️  ${req.method} ${req.path}`);
  next();
});

// --- DB Connection ---
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_ATLAS_URI, {
      dbName: 'ALTHERIX_DB',
    });
    console.log('🔌 Connected to MongoDB via Mongoose');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

connectDB();

// --- Routes ---
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

// --- Export for Vercel ---
export default app;
