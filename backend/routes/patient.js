// ADD THIS FILE: /backend/routes/patient.js

import express from 'express';
import {
  getDoctorPatientStats
} from '../controllers/patientController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', verifyToken, getDoctorPatientStats);

export default router;
