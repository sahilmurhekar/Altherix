// ============ routes/appointment.js ============
import express from 'express';
import {
  getAvailableSlots,
  getAvailableDatesForMonth,
  bookAppointment,
  updateDoctorAvailability,
  getDoctorAvailability,
  getPatientAppointments,
  getDoctorAppointments,
  submitRating
} from '../controllers/appointmentController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// ========== PATIENT ROUTES ==========

// Get available dates for a doctor (next 30 days)
router.get('/available-dates', getAvailableDatesForMonth);

// Get available time slots for a specific date
router.get('/available-slots', getAvailableSlots);

// Book an appointment (requires authentication)
router.post('/book', verifyToken, bookAppointment);

// Submit rating for doctor (requires authentication)
router.post('/submit-rating', verifyToken, submitRating);

// Get patient's appointments (requires authentication)
router.get('/my-appointments', verifyToken, getPatientAppointments);

// ========== DOCTOR ROUTES ==========

// Set/update doctor's availability (requires authentication)
router.post('/availability/update', verifyToken, updateDoctorAvailability);

// Get doctor's own availability (requires authentication)
router.get('/availability/me', verifyToken, getDoctorAvailability);

// Get doctor's appointments (requires authentication)
router.get('/doctor-appointments', verifyToken, getDoctorAppointments);

export default router;
