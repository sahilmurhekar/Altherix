// ============ routes/auth.js ============
import express from 'express';
import { registerPatient, registerDoctor, login, verify, getNearbyDoctors, getAddressFromCoords } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register-patient', registerPatient);
router.post('/register-doctor', registerDoctor);
router.post('/login', login);
router.get('/verify', verifyToken, verify);
router.get('/nearby-doctors', getNearbyDoctors);
router.get('/address-from-coords', getAddressFromCoords);

export default router;
