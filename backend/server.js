// ============ server.js (UPDATED) ============

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import appointmentRoutes from './routes/appointment.js';
import medicalRecordsRoutes from './routes/medicalRecords.js';
import patientMedicalRecordsRoutes from './routes/patientMedicalRecords.js'; // NEW

dotenv.config();

console.log('--- Loading Environment Variables ---');
if (!process.env.MONGO_ATLAS_URI) {
  console.error('ðŸ"¥ FATAL ERROR: MONGO_ATLAS_URI is not defined.');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('ðŸ"¥ FATAL ERROR: JWT_SECRET is not defined.');
  process.exit(1);
}
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  console.warn('âš ï¸ WARNING: CLOUDINARY_CLOUD_NAME is not defined. Image uploads will fail.');
}
console.log('âœ… Environment variables loaded.');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] âž¡ï¸  ${req.method} ${req.path}`);
  next();
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_ATLAS_URI, {
      dbName: 'ALTHERIX_DB',
    });
    console.log('ðŸ"— Connected to MongoDB via Mongoose');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-records', medicalRecordsRoutes);          // Doctor uploads
app.use('/api/patient/medical-records', patientMedicalRecordsRoutes); // Patient views

app.use((err, req, res, next) => {
  console.error('ðŸ"¥ðŸ"¥ðŸ"¥ UNHANDLED ERROR ðŸ"¥ðŸ"¥ðŸ"¥');
  console.error(err.stack);
  res.status(500).send({
    message: 'An internal server error occurred!',
    error: err.message
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`ðŸš€ Server running on http://localhost:${PORT}`);
  });
});
