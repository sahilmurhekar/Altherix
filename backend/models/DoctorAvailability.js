// ============ models/DoctorAvailability.js ============
import mongoose from 'mongoose';

const doctorAvailabilitySchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  schedule: [
    {
      dayOfWeek: {
        type: Number, // 0=Sunday, 1=Monday, ..., 6=Saturday
        required: true,
        min: 0,
        max: 6
      },
      startTime: {
        type: String, // Format: "HH:MM" e.g., "09:00"
        required: true
      },
      endTime: {
        type: String, // Format: "HH:MM" e.g., "17:00"
        required: true
      },
      isActive: {
        type: Boolean,
        default: true // true = working, false = day off
      }
    }
  ],

  slotDuration: {
    type: Number, // In minutes, e.g., 30 or 60
    default: 30,
    required: true
  },

  holidays: {
    type: [String], // Array of dates in "YYYY-MM-DD" format
    default: []
  },

  skipSlots: [
    {
      date: {
        type: String, // "YYYY-MM-DD" format
        required: true
      },
      time: {
        type: String, // "HH:MM" format
        required: true
      },
      reason: {
        type: String,
        default: 'Personal break'
      }
    }
  ],

  breakTime: [
    {
      startTime: String, // e.g., "12:00" - lunch break
      endTime: String,   // e.g., "13:00"
      dayOfWeek: Number  // Optional: specific day, or applies to all days if not specified
    }
  ],

  isBookingOpen: {
    type: Boolean,
    default: true
  },

  maxPatientsPerDay: {
    type: Number,
    default: null // null means unlimited
  },

  updatedAt: {
    type: Date,
    default: Date.now
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for quick doctor lookups
doctorAvailabilitySchema.index({ doctorId: 1 });

export default mongoose.model('DoctorAvailability', doctorAvailabilitySchema);
