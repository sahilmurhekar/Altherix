// /backend/models/MedicalRecord.js

import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
  // Core references
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Appointment reference (for validation that doctor has seen this patient)
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: false // Optional, but helpful for tracking
  },

  // Document type
  type: {
    type: String,
    enum: ['test-analysis', 'doctor-analysis'],
    required: true,
    index: true
  },

  // File information
  originalFileName: {
    type: String,
    required: true
  },

  fileUrl: {
    type: String,
    required: true // Cloudinary secure URL
  },

  cloudinaryPublicId: {
    type: String,
    required: true // For deletion purposes
  },

  // Metadata
  description: {
    type: String,
    default: ''
  },

  fileSize: {
    type: Number, // In bytes
    required: true
  },

  // Blockchain related (dummy for now)
  blockchainHash: {
    type: String,
    default: null, // Will be populated when actually stored on blockchain
    sparse: true
  },

  blockchainStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  },

  // Verification status
  verified: {
    type: Boolean,
    default: false,
    index: true
  },

  // Audit trail
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  updatedAt: {
    type: Date,
    default: Date.now
  },

  // For future use - doctor can add notes when viewing/verifying
  doctorNotes: {
    type: String,
    default: null
  }
});

// Compound index for quick lookups
medicalRecordSchema.index({ patientId: 1, doctorId: 1 });
medicalRecordSchema.index({ doctorId: 1, createdAt: -1 });
medicalRecordSchema.index({ patientId: 1, createdAt: -1 });
medicalRecordSchema.index({ type: 1, verified: 1 });

// Middleware to update updatedAt on save
medicalRecordSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('MedicalRecord', medicalRecordSchema);
