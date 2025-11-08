// ============ server.js ============
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Atlas Connection
const ATLAS_URI = process.env.MONGO_ATLAS_URI;
const DB_NAME = process.env.DB_NAME;

const mongoURI = `${ATLAS_URI}/${DB_NAME}?retryWrites=true&w=majority`;

mongoose.connect(mongoURI).then(() => {
  console.log(`MongoDB Atlas connected to ${DB_NAME}`);
}).catch(err => console.log(err));

// Routes
app.use('/api/auth', authRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
