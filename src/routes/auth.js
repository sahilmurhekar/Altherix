// ============ routes/auth.js ============

import express from 'express';
import multer from 'multer';
import {
  registerPatient,
  registerDoctor,
  login,
  verify,
  getNearbyDoctors,
  getAddressFromCoords,
  getProfile,
  updateProfile,
  uploadProfilePicture,
  deleteAccount,
  updatePatientLocation
} from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Multer config for file upload (in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'));
    }
  }
});

router.post('/register-patient', registerPatient);
router.post('/register-doctor', registerDoctor);
router.post('/login', login);
router.get('/verify', verifyToken, verify);
router.get('/nearby-doctors', getNearbyDoctors);
router.get('/address-from-coords', getAddressFromCoords);
router.patch('/update-location', verifyToken, updatePatientLocation);

// New routes for profile
router.delete('/profile', verifyToken, deleteAccount);
router.get('/profile', verifyToken, getProfile);
router.patch('/profile', verifyToken, updateProfile);
router.post('/profile/upload-picture', verifyToken, upload.single('profilePicture'), uploadProfilePicture);

export default router;
