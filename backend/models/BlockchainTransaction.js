// ============ models/BlockchainTransaction.js (NEW) ============

import mongoose from 'mongoose';

const blockchainTransactionSchema = new mongoose.Schema({
  // Transaction identifiers
  transactionHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // References
  recordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalRecord',
    required: true,
    index: true
  },

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

  // Document info
  documentType: {
    type: String,
    enum: ['test-analysis', 'doctor-analysis'],
    required: true
  },

  // Blockchain details
  blockNumber: {
    type: Number,
    default: null,
    sparse: true
  },

  gasUsed: {
    type: String,
    default: null
  },

  gasPrice: {
    type: String,
    default: null  // in Gwei
  },

  transactionFee: {
    type: String,
    default: null  // in ETH
  },

  confirmations: {
    type: Number,
    default: 0
  },

  // Addresses
  from: String,           // Doctor's Ethereum address
  to: String,             // Recipient address

  // Metadata hash stored on blockchain
  metadataHash: {
    type: String,
    required: true,
    index: true
  },

  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
    index: true
  },

  failureReason: {
    type: String,
    default: null
  },

  // Confirmation info
  confirmedAt: {
    type: Date,
    default: null,
    sparse: true
  },

  // Network info
  network: {
    type: String,
    default: 'sepolia',  // testnet or mainnet
    enum: ['sepolia', 'mainnet']
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

// Indexes for efficient queries
blockchainTransactionSchema.index({ recordId: 1 });
blockchainTransactionSchema.index({ patientId: 1, status: 1 });
blockchainTransactionSchema.index({ doctorId: 1, createdAt: -1 });
blockchainTransactionSchema.index({ status: 1, createdAt: -1 });

blockchainTransactionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('BlockchainTransaction', blockchainTransactionSchema);
