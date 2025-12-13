// ============ routes/dashboard.js ============

import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  getDoctorDashboardStats,
  getPatientDashboardStats,
  getDoctorTodaySchedule,
  getPatientRecentActivity
} from '../controllers/dashboardController.js';

const router = express.Router();

// All dashboard routes require authentication
router.use(verifyToken);

// Doctor dashboard routes
router.get('/doctor/stats', getDoctorDashboardStats);
router.get('/doctor/today-schedule', getDoctorTodaySchedule);

// Patient dashboard routes
router.get('/patient/stats', getPatientDashboardStats);
router.get('/patient/recent-activity', getPatientRecentActivity);

export default router;