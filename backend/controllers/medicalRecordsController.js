// /backend/controllers/medicalRecordsController.js

import MedicalRecord from '../models/MedicalRecord.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import { v2 as cloudinary } from 'cloudinary';
import blockchainService from '../services/blockchainService.js';

// ========== SEARCH PATIENTS WITH APPOINTMENTS ==========
export const searchPatients = async (req, res) => {
  try {
    const doctorId = req.userId; // From JWT
    const { patientName, patientId } = req.query;

    // Validate input
    if (!patientName && !patientId) {
      return res.status(400).json({
        message: 'Either patientName or patientId is required'
      });
    }

    // Build filter for appointments where this doctor is involved
    const appointmentFilter = {
      doctorId: doctorId,
      status: { $in: ['pending', 'confirmed', 'completed'] }
    };

    // Get all appointments for this doctor
    const appointments = await Appointment.find(appointmentFilter)
      .select('patientId')
      .distinct('patientId');

    if (appointments.length === 0) {
      return res.json({
        patients: [],
        message: 'No appointments found'
      });
    }

    // Build filter for patient search
    const patientFilter = {
      _id: { $in: appointments }
    };

    // Add name search if provided
    if (patientName) {
      patientFilter.name = { $regex: patientName, $options: 'i' }; // Case-insensitive
    }

    // Add ID search if provided
    if (patientId) {
      patientFilter._id = patientId;
    }

    // Find patients matching criteria
    const patients = await User.find(patientFilter)
      .select('_id name email phone bloodType allergies')
      .lean();

    // For each patient, get their appointment count and last appointment date
    const enrichedPatients = await Promise.all(
      patients.map(async (patient) => {
        const appointments = await Appointment.find({
          patientId: patient._id,
          doctorId: doctorId
        })
          .sort({ appointmentDate: -1 })
          .limit(1)
          .select('appointmentDate status');

        return {
          ...patient,
          appointmentCount: appointments.length,
          lastAppointmentDate: appointments[0]?.appointmentDate || null,
          lastAppointmentStatus: appointments[0]?.status || null
        };
      })
    );

    res.json({
      patients: enrichedPatients,
      totalCount: enrichedPatients.length
    });

  } catch (err) {
    console.error('Search patients error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ========== UPLOAD MEDICAL RECORD (FIXED) ==========
export const uploadMedicalRecord = async (req, res) => {
  try {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    const doctorId = req.userId; // From JWT
    const { patientId, type, description } = req.body;

    // ========== VALIDATIONS ==========

    // 1. Check if file exists
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // 2. Validate record type
    if (!['test-analysis', 'doctor-analysis'].includes(type)) {
      return res.status(400).json({
        message: 'Invalid record type. Must be test-analysis or doctor-analysis'
      });
    }

    // 3. Validate patientId format
    if (!patientId || patientId.length !== 24) {
      return res.status(400).json({ message: 'Invalid patientId' });
    }

    // 4. Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(400).json({ message: 'Patient not found' });
    }

    if (patient.userType !== 'patient') {
      return res.status(400).json({ message: 'User is not a patient' });
    }

    // 5. Verify doctor-patient relationship (must have appointment)
    const appointment = await Appointment.findOne({
      doctorId: doctorId,
      patientId: patientId,
      status: { $in: ['pending', 'confirmed', 'completed'] }
    });

    if (!appointment) {
      return res.status(403).json({
        message: 'Unauthorized. You do not have an appointment with this patient'
      });
    }

    // 6. Validate file size (max 5MB)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        message: 'File size exceeds 5MB limit'
      });
    }

    // 7. Validate file type
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ];

    if (!allowedMimes.includes(req.file.mimetype)) {
      return res.status(400).json({
        message: 'Invalid file type. Allowed: PDF, DOC, DOCX, JPG, PNG'
      });
    }

    // ========== UPLOAD TO CLOUDINARY ==========

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `healthcare-app/medical-records/${doctorId}`,
          resource_type: 'auto',
          use_filename: true,
          unique_filename: true,
          access_type: 'token'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(req.file.buffer);
    });

    // ========== SEND TO BLOCKCHAIN ==========
    let blockchainTxData = null;
    let blockchainStatus = 'pending';
    let blockchainHash = null;

    try {
      await blockchainService.initialize();

      // Get doctor's blockchain address for transaction
      const doctorBalance = await blockchainService.getDoctorBalance();
      const doctorEthAddress = doctorBalance.address;

      // Send to blockchain
      const txResult = await blockchainService.storeMedicalRecord(
        doctorEthAddress, // Use doctor's Ethereum address
        {
          type: type,
          description: description || '',
          originalFileName: req.file.originalname,
          fileUrl: uploadResult.secure_url,
          cloudinaryPublicId: uploadResult.public_id
        }
      );

      blockchainHash = txResult.transactionHash;
      blockchainStatus = 'confirmed';

      // Create blockchain transaction record
      blockchainTxData = {
        transactionHash: txResult.transactionHash,
        blockNumber: txResult.blockNumber,
        gasUsed: txResult.gasUsed,
        status: 'success',
        confirmedAt: new Date()
      };

      console.log(`✅ Medical record stored on blockchain: ${blockchainHash}`);

    } catch (blockchainErr) {
      console.error('⚠️ Blockchain storage failed:', blockchainErr.message);
      // Don't fail the upload, just mark as pending/failed
      blockchainStatus = 'failed';
      blockchainHash = null;
    }

    // ========== CREATE DATABASE RECORD ==========

    const medicalRecord = new MedicalRecord({
      patientId: patientId,
      doctorId: doctorId,
      appointmentId: appointment._id,
      type: type,
      originalFileName: req.file.originalname,
      fileUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      description: description || '',
      fileSize: req.file.size,
      blockchainHash: blockchainHash,
      blockchainStatus: blockchainStatus,
      blockchainTx: blockchainTxData,
      verified: false
    });

    await medicalRecord.save();

    // ========== CREATE BLOCKCHAIN TRANSACTION LOG (if successful) ==========
    if (blockchainHash) {
      try {
        const BlockchainTransaction = (await import('../models/BlockchainTransaction.js')).default;

        const bcTx = new BlockchainTransaction({
          transactionHash: blockchainHash,
          recordId: medicalRecord._id,
          patientId: patientId,
          doctorId: doctorId,
          documentType: type,
          blockNumber: blockchainTxData.blockNumber,
          gasUsed: blockchainTxData.gasUsed,
          transactionFee: blockchainTxData.transactionFee || '0',
          status: 'success',
          confirmedAt: blockchainTxData.confirmedAt,
          network: 'sepolia'
        });

        await bcTx.save();
      } catch (logErr) {
        console.error('Failed to log blockchain transaction:', logErr.message);
      }
    }

    // ========== RESPONSE ==========

    res.status(201).json({
      message: 'Medical record uploaded successfully',
      record: {
        id: medicalRecord._id,
        patientId: medicalRecord.patientId,
        type: medicalRecord.type,
        fileName: medicalRecord.originalFileName,
        description: medicalRecord.description,
        fileUrl: medicalRecord.fileUrl,
        blockchainHash: medicalRecord.blockchainHash,
        blockchainStatus: medicalRecord.blockchainStatus,
        createdAt: medicalRecord.createdAt,
        verified: medicalRecord.verified,
        blockchain: blockchainTxData ? {
          status: 'confirmed',
          transactionHash: blockchainHash,
          blockNumber: blockchainTxData.blockNumber,
          gasUsed: blockchainTxData.gasUsed,
          explorerLink: `https://sepolia.etherscan.io/tx/${blockchainHash}`
        } : {
          status: 'failed',
          message: 'File saved but blockchain storage failed. Try again later.'
        }
      }
    });

  } catch (err) {
    console.error('Upload medical record error:', err);
    res.status(500).json({ message: err.message });
  }
};
// ========== GET MEDICAL RECORDS FOR A PATIENT ==========
export const getPatientMedicalRecords = async (req, res) => {
  try {
    const { patientId } = req.query;
    const userId = req.userId; // From JWT

    // Validate patientId
    if (!patientId || patientId.length !== 24) {
      return res.status(400).json({ message: 'Invalid patientId' });
    }

    // Verify requester is the patient or a doctor with appointment
    if (userId !== patientId) {
      // If not the patient, verify doctor-patient relationship
      const appointment = await Appointment.findOne({
        doctorId: userId,
        patientId: patientId
      });

      if (!appointment) {
        return res.status(403).json({
          message: 'Unauthorized. You do not have access to this patient\'s records'
        });
      }
    }

    // Get all medical records for this patient
    const records = await MedicalRecord.find({ patientId: patientId })
      .populate('doctorId', 'name specialization phone')
      .sort({ createdAt: -1 });

    // Group by type for frontend convenience
    const groupedRecords = {
      'test-analysis': records.filter(r => r.type === 'test-analysis'),
      'doctor-analysis': records.filter(r => r.type === 'doctor-analysis')
    };

    res.json({
      totalRecords: records.length,
      records: records,
      grouped: groupedRecords
    });

  } catch (err) {
    console.error('Get patient records error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ========== GET DOCTOR'S UPLOADED RECORDS ==========
export const getDoctorUploadedRecords = async (req, res) => {
  try {
    const doctorId = req.userId; // From JWT
    const { patientId } = req.query;

    const filter = { doctorId: doctorId };

    if (patientId) {
      filter.patientId = patientId;
    }

    const records = await MedicalRecord.find(filter)
      .populate('patientId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      totalRecords: records.length,
      records: records
    });

  } catch (err) {
    console.error('Get doctor records error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ========== DELETE MEDICAL RECORD ==========
export const deleteMedicalRecord = async (req, res) => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    const { recordId } = req.body;
    const doctorId = req.userId; // From JWT

    // Validate recordId
    if (!recordId || recordId.length !== 24) {
      return res.status(400).json({ message: 'Invalid recordId' });
    }

    // Find the record
    const record = await MedicalRecord.findById(recordId);
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // Verify only the uploading doctor can delete
    if (record.doctorId.toString() !== doctorId) {
      return res.status(403).json({
        message: 'Unauthorized. Only the uploading doctor can delete this record'
      });
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(record.cloudinaryPublicId);
    } catch (cloudErr) {
      console.error('Cloudinary deletion error:', cloudErr);
      // Don't fail if Cloudinary deletion fails, continue with DB deletion
    }

    // Delete from database
    await MedicalRecord.findByIdAndDelete(recordId);

    res.json({
      message: 'Medical record deleted successfully',
      recordId: recordId
    });

  } catch (err) {
    console.error('Delete medical record error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ========== VERIFY RECORD (ADMIN OR DOCTOR) ==========
export const verifyMedicalRecord = async (req, res) => {
  try {
    const { recordId } = req.body;
    const userId = req.userId; // From JWT

    // Validate recordId
    if (!recordId || recordId.length !== 24) {
      return res.status(400).json({ message: 'Invalid recordId' });
    }

    // Find the record
    const record = await MedicalRecord.findById(recordId);
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // Verify only the doctor who uploaded can verify (for now)
    // Future: Could add admin verification
    if (record.doctorId.toString() !== userId) {
      return res.status(403).json({
        message: 'Unauthorized. Only the uploading doctor can verify this record'
      });
    }

    // Update verification status
    record.verified = true;
    record.blockchainStatus = 'confirmed'; // Mark as ready for blockchain
    await record.save();

    res.json({
      message: 'Record verified successfully',
      record: {
        id: record._id,
        verified: record.verified,
        blockchainStatus: record.blockchainStatus
      }
    });

  } catch (err) {
    console.error('Verify record error:', err);
    res.status(500).json({ message: err.message });
  }
};
