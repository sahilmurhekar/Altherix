// ============ routes/patientMedicalRecords.js (NEW) ============

import express from 'express';
import {
  getPatientMedicalRecords,
  getRecordDetails,
  getRecordBlockchainStatus,
  downloadMedicalRecord,
  getPatientBlockchainStats
} from '../controllers/patientMedicalRecordsController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/patient/medical-records
 * @desc    Get all medical records for patient
 * @access  Private (Patient only)
 * @query   { status?: 'pending'|'confirmed'|'failed', type?: 'test-analysis'|'doctor-analysis', sortBy?: 'newest'|'oldest'|'alphabetical' }
 */
router.get(
  '/',
  verifyToken,
  getPatientMedicalRecords
);

/**
 * @route   GET /api/patient/medical-records/:recordId
 * @desc    Get detailed information about a specific record
 * @access  Private (Patient only)
 */
router.get(
  '/:recordId',
  verifyToken,
  getRecordDetails
);

/**
 * @route   GET /api/patient/medical-records/:recordId/blockchain-status
 * @desc    Get blockchain status and transaction details for a record
 * @access  Private (Patient only)
 */
router.get(
  '/:recordId/blockchain-status',
  verifyToken,
  getRecordBlockchainStatus
);

/**
 * @route   GET /api/patient/medical-records/:recordId/download
 * @desc    Get download link for medical record
 * @access  Private (Patient only)
 */
router.get(
  '/:recordId/download',
  verifyToken,
  downloadMedicalRecord
);

/**
 * @route   GET /api/patient/medical-records/blockchain/statistics
 * @desc    Get blockchain statistics for patient's records
 * @access  Private (Patient only)
 */
router.get(
  '/blockchain/statistics',
  verifyToken,
  getPatientBlockchainStats
);

export default router;
