
// ============ models/MedicalRecord.js (UPDATED) ============

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

  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: false
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
    required: true
  },

  cloudinaryPublicId: {
    type: String,
    required: true
  },

  description: {
    type: String,
    default: ''
  },

  fileSize: {
    type: Number,
    required: true
  },

  // ========== BLOCKCHAIN FIELDS (ENHANCED) ==========
  blockchainHash: {
    type: String,
    default: null,
    sparse: true,
    index: true
  },

  blockchainStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending',
    index: true
  },

  // Real blockchain transaction details
  blockchainTx: {
    transactionHash: String,
    blockNumber: Number,
    gasUsed: String,
    gasPrice: String,        // in Gwei
    transactionFee: String,  // in ETH
    confirmations: Number,
    confirmedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending'
    },
    explorerLink: String     // Etherscan link
  },

  metadataHash: {
    type: String,
    default: null,
    sparse: true
  },

  // Verification status
  verified: {
    type: Boolean,
    default: false,
    index: true
  },

  doctorNotes: {
    type: String,
    default: null
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
  }
});

// Compound indexes for efficient queries
medicalRecordSchema.index({ patientId: 1, doctorId: 1 });
medicalRecordSchema.index({ doctorId: 1, createdAt: -1 });
medicalRecordSchema.index({ patientId: 1, createdAt: -1 });
medicalRecordSchema.index({ patientId: 1, blockchainStatus: 1 });
medicalRecordSchema.index({ type: 1, verified: 1 });
medicalRecordSchema.index({ 'blockchainTx.transactionHash': 1 });

medicalRecordSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('MedicalRecord', medicalRecordSchema);

