// /backend/routes/medicalRecords.js

import express from 'express';
import multer from 'multer';
import {
  searchPatients,
  uploadMedicalRecord,
  getPatientMedicalRecords,
  getDoctorUploadedRecords,
  deleteMedicalRecord
} from '../controllers/medicalRecordsController.js';
import {
  checkRecordBlockchainStatus,
  getDoctorBlockchainInfo,
  verifyRecordOnBlockchain,
  getPatientBlockchainRecords,
  getTestnetFaucetInfo
} from '../controllers/blockchainController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// ========== MULTER CONFIG ==========
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, JPG, PNG files allowed'));
    }
  }
});

// ========== MEDICAL RECORDS ENDPOINTS ==========

/**
 * @route   GET /api/medical-records/search-patients
 * @desc    Search patients that doctor has appointments with
 * @access  Private (Doctor only)
 * @query   { patientName?: string, patientId?: string }
 */
router.get('/search-patients', verifyToken, searchPatients);

/**
 * @route   POST /api/medical-records/upload
 * @desc    Upload medical record for a patient
 * @access  Private (Doctor only)
 * @body    { patientId, type, description, file }
 */
router.post(
  '/upload',
  verifyToken,
  upload.single('file'),
  uploadMedicalRecord
);

/**
 * @route   GET /api/medical-records/patient
 * @desc    Get all medical records for a patient
 * @access  Private (Patient or their doctor)
 * @query   { patientId }
 */
router.get('/patient', verifyToken, getPatientMedicalRecords);

/**
 * @route   GET /api/medical-records/my-uploads
 * @desc    Get all records uploaded by doctor
 * @access  Private (Doctor only)
 * @query   { patientId?: string }
 */
router.get('/my-uploads', verifyToken, getDoctorUploadedRecords);

/**
 * @route   DELETE /api/medical-records/delete
 * @desc    Delete a medical record
 * @access  Private (Only uploading doctor)
 * @body    { recordId }
 */
router.delete('/delete', verifyToken, deleteMedicalRecord);

// ========== BLOCKCHAIN ENDPOINTS ==========

/**
 * @route   GET /api/medical-records/blockchain/status
 * @desc    Check blockchain confirmation status of a record
 * @access  Private
 * @query   { recordId }
 */
router.get('/blockchain/status', verifyToken, checkRecordBlockchainStatus);

/**
 * @route   GET /api/medical-records/blockchain/doctor-info
 * @desc    Get doctor's blockchain account information
 * @access  Private (Doctor only)
 */
router.get('/blockchain/doctor-info', verifyToken, getDoctorBlockchainInfo);

/**
 * @route   POST /api/medical-records/blockchain/verify
 * @desc    Verify a record on blockchain
 * @access  Private
 * @body    { recordId }
 */
router.post('/blockchain/verify', verifyToken, verifyRecordOnBlockchain);

/**
 * @route   GET /api/medical-records/blockchain/patient-records
 * @desc    Get blockchain-verified records for a patient
 * @access  Private (Patient or their doctor)
 * @query   { patientId }
 */
router.get(
  '/blockchain/patient-records',
  verifyToken,
  getPatientBlockchainRecords
);

/**
 * @route   GET /api/medical-records/blockchain/faucet-info
 * @desc    Get testnet faucet information for doctor
 * @access  Private (Doctor only)
 */
router.get('/blockchain/faucet-info', verifyToken, getTestnetFaucetInfo);

export default router;
