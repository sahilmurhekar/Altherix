// ============ models/User.js ============

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: String,
  phone: String,
  userType: { type: String, enum: ['patient', 'doctor'], required: true },

  // Profile picture
  profilePicture: {
    type: String,
    default: null
  },

  // Location fields (for all users)
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: String
  },

  // Patient fields
  dateOfBirth: String,
  bloodType: String,
  allergies: String,

  // Doctor fields
  specialization: String,
  licenseNumber: String,
  experience: String,
  qualifications: String,
  clinicAddress: String,
  city: String,
  bio: String,

  clinicLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      sparse: true
    },
    address: String
  },

  consultationFee: Number,

  // Doctor ratings
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },

  reviews: {
    type: Number,
    default: 0
  },

  createdAt: { type: Date, default: Date.now }
});

// Create geospatial index for location
userSchema.index({ 'location': '2dsphere' });
userSchema.index({ 'clinicLocation': '2dsphere' });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(pwd) {
  return await bcrypt.compare(pwd, this.password);
};

export default mongoose.model('User', userSchema);
