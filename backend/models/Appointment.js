// ============ models/Appointment.js ============
import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  appointmentDate: {
    type: String, // Format: "YYYY-MM-DD"
    required: true
  },

  appointmentTime: {
    type: String, // Format: "HH:MM"
    required: true
  },

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'],
    default: 'pending'
  },

  reasonForVisit: {
    type: String,
    default: ''
  },

  consultationMode: {
    type: String,
    enum: ['online', 'in-person'],
    default: 'in-person'
  },

  isRated: {
    type: Boolean,
    default: false
  },
  
  consultationFee: {
    type: Number,
    required: true
  },

  notes: {
    type: String,
    default: ''
  },

  cancelledBy: {
    type: String, // 'patient' or 'doctor'
    default: null
  },

  cancellationReason: {
    type: String,
    default: null
  },

  rescheduledFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to prevent double booking (same doctor, same date/time)
appointmentSchema.index({ doctorId: 1, appointmentDate: 1, appointmentTime: 1 }, { unique: true });

// Index for patient appointments
appointmentSchema.index({ patientId: 1, appointmentDate: 1 });

// Index for doctor schedule
appointmentSchema.index({ doctorId: 1, status: 1 });

export default mongoose.model('Appointment', appointmentSchema);
