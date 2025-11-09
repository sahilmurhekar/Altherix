// Create a file: /backend/seeds/dummyData.js
// Run with: node backend/seeds/dummyData.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Connection string
const ATLAS_URI = process.env.MONGO_ATLAS_URI;
const DB_NAME = process.env.DB_NAME;
const mongoURI = `mongodb+srv://sahilmurhekar2004:sahilmurhekar@firstinstance.lend0.mongodb.net/?appName=FirstInstance/${DB_NAME}?retryWrites=true&w=majority`;

// User Schema (same as your model)
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: String,
  phone: String,
  userType: { type: String, enum: ['patient', 'doctor'], required: true },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: String
  },
  dateOfBirth: String,
  bloodType: String,
  allergies: String,
  specialization: String,
  licenseNumber: String,
  experience: String,
  clinicAddress: String,
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
  createdAt: { type: Date, default: Date.now }
});

userSchema.index({ 'location': '2dsphere' });
userSchema.index({ 'clinicLocation': '2dsphere' });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model('User', userSchema);

// Dummy Patients Data - NO clinicLocation
const dummyPatients = [
  {
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@example.com',
    password: 'password123',
    phone: '9876543210',
    userType: 'patient',
    dateOfBirth: '1990-05-15',
    bloodType: 'O+',
    allergies: 'Penicillin',
    location: {
      type: 'Point',
      coordinates: [77.5946, 12.9716], // Indiranagar, Bangalore
      address: 'Indiranagar, Bangalore'
    }
  },
  {
    name: 'Priya Singh',
    email: 'priya.singh@example.com',
    password: 'password123',
    phone: '9876543211',
    userType: 'patient',
    dateOfBirth: '1995-08-22',
    bloodType: 'A+',
    allergies: 'None',
    location: {
      type: 'Point',
      coordinates: [77.6245, 12.9352], // Whitefield, Bangalore
      address: 'Whitefield, Bangalore'
    }
  },
  {
    name: 'Amit Patel',
    email: 'amit.patel@example.com',
    password: 'password123',
    phone: '9876543212',
    userType: 'patient',
    dateOfBirth: '1988-12-10',
    bloodType: 'B+',
    allergies: 'Aspirin, Peanuts',
    location: {
      type: 'Point',
      coordinates: [77.5700, 12.9789], // Koramangala, Bangalore
      address: 'Koramangala, Bangalore'
    }
  },
  {
    name: 'Neha Sharma',
    email: 'neha.sharma@example.com',
    password: 'password123',
    phone: '9876543213',
    userType: 'patient',
    dateOfBirth: '1992-03-18',
    bloodType: 'AB+',
    allergies: 'None',
    location: {
      type: 'Point',
      coordinates: [77.6412, 12.9698], // JP Nagar, Bangalore
      address: 'JP Nagar, Bangalore'
    }
  },
  {
    name: 'Vikram Singh',
    email: 'vikram.singh@example.com',
    password: 'password123',
    phone: '9876543214',
    userType: 'patient',
    dateOfBirth: '1987-07-30',
    bloodType: 'O-',
    allergies: 'Ibuprofen',
    location: {
      type: 'Point',
      coordinates: [77.6033, 12.9352], // MG Road, Bangalore
      address: 'MG Road, Bangalore'
    }
  }
];

// Dummy Doctors Data - WITH clinicLocation
const dummyDoctors = [
  {
    name: 'Dr. Rajesh Kumar',
    email: 'dr.rajesh@example.com',
    password: 'password123',
    phone: '9111111111',
    userType: 'doctor',
    specialization: 'Cardiology',
    licenseNumber: 'MCI-001',
    experience: '12 years',
    consultationFee: 500,
    location: {
      type: 'Point',
      coordinates: [77.6245, 12.9352],
      address: '123 MG Road, Bangalore'
    },
    clinicAddress: 'Heart Care Clinic, 123 MG Road, Bangalore',
    clinicLocation: {
      type: 'Point',
      coordinates: [77.6245, 12.9352],
      address: 'Heart Care Clinic, 123 MG Road, Bangalore'
    }
  },
  {
    name: 'Dr. Priya Singh',
    email: 'dr.priya@example.com',
    password: 'password123',
    phone: '9111111112',
    userType: 'doctor',
    specialization: 'General Medicine',
    licenseNumber: 'MCI-002',
    experience: '8 years',
    consultationFee: 300,
    location: {
      type: 'Point',
      coordinates: [77.6412, 12.9698],
      address: '456 Whitefield, Bangalore'
    },
    clinicAddress: 'Health Plus Hospital, 456 Whitefield, Bangalore',
    clinicLocation: {
      type: 'Point',
      coordinates: [77.6412, 12.9698],
      address: 'Health Plus Hospital, 456 Whitefield, Bangalore'
    }
  },
  {
    name: 'Dr. Arjun Patel',
    email: 'dr.arjun@example.com',
    password: 'password123',
    phone: '9111111113',
    userType: 'doctor',
    specialization: 'Orthopedics',
    licenseNumber: 'MCI-003',
    experience: '15 years',
    consultationFee: 600,
    location: {
      type: 'Point',
      coordinates: [77.5700, 12.9789],
      address: '789 Koramangala, Bangalore'
    },
    clinicAddress: 'Bone & Joint Center, 789 Koramangala, Bangalore',
    clinicLocation: {
      type: 'Point',
      coordinates: [77.5700, 12.9789],
      address: 'Bone & Joint Center, 789 Koramangala, Bangalore'
    }
  },
  {
    name: 'Dr. Neha Sharma',
    email: 'dr.neha@example.com',
    password: 'password123',
    phone: '9111111114',
    userType: 'doctor',
    specialization: 'Dermatology',
    licenseNumber: 'MCI-004',
    experience: '10 years',
    consultationFee: 400,
    location: {
      type: 'Point',
      coordinates: [77.6033, 12.9352],
      address: '321 Indiranagar, Bangalore'
    },
    clinicAddress: 'Skin Wellness Clinic, 321 Indiranagar, Bangalore',
    clinicLocation: {
      type: 'Point',
      coordinates: [77.6033, 12.9352],
      address: 'Skin Wellness Clinic, 321 Indiranagar, Bangalore'
    }
  },
  {
    name: 'Dr. Vikram Desai',
    email: 'dr.vikram@example.com',
    password: 'password123',
    phone: '9111111115',
    userType: 'doctor',
    specialization: 'Pediatrics',
    licenseNumber: 'MCI-005',
    experience: '9 years',
    consultationFee: 350,
    location: {
      type: 'Point',
      coordinates: [77.5946, 12.9716],
      address: '654 JP Nagar, Bangalore'
    },
    clinicAddress: 'Child Care Clinic, 654 JP Nagar, Bangalore',
    clinicLocation: {
      type: 'Point',
      coordinates: [77.5946, 12.9716],
      address: 'Child Care Clinic, 654 JP Nagar, Bangalore'
    }
  },
  {
    name: 'Dr. Meera Gupta',
    email: 'dr.meera@example.com',
    password: 'password123',
    phone: '9111111116',
    userType: 'doctor',
    specialization: 'Neurology',
    licenseNumber: 'MCI-006',
    experience: '11 years',
    consultationFee: 550,
    location: {
      type: 'Point',
      coordinates: [77.6500, 12.9500],
      address: '987 Malleswaram, Bangalore'
    },
    clinicAddress: 'Neuro Care Center, 987 Malleswaram, Bangalore',
    clinicLocation: {
      type: 'Point',
      coordinates: [77.6500, 12.9500],
      address: 'Neuro Care Center, 987 Malleswaram, Bangalore'
    }
  },
  {
    name: 'Dr. Suresh Kumar',
    email: 'dr.suresh@example.com',
    password: 'password123',
    phone: '9111111117',
    userType: 'doctor',
    specialization: 'Psychiatry',
    licenseNumber: 'MCI-007',
    experience: '13 years',
    consultationFee: 450,
    location: {
      type: 'Point',
      coordinates: [77.5800, 12.9600],
      address: '111 HSR Layout, Bangalore'
    },
    clinicAddress: 'Mental Health Clinic, 111 HSR Layout, Bangalore',
    clinicLocation: {
      type: 'Point',
      coordinates: [77.5800, 12.9600],
      address: 'Mental Health Clinic, 111 HSR Layout, Bangalore'
    }
  }
];

// Seed function
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Insert patients
    const insertedPatients = await User.insertMany(dummyPatients);
    console.log(`✅ Inserted ${insertedPatients.length} dummy patients`);

    // Insert doctors
    const insertedDoctors = await User.insertMany(dummyDoctors);
    console.log(`✅ Inserted ${insertedDoctors.length} dummy doctors`);

    // Display inserted data
    console.log('\n📊 DUMMY DATA SUMMARY:\n');

    console.log('👥 PATIENTS:');
    insertedPatients.forEach((patient, idx) => {
      console.log(`  ${idx + 1}. ${patient.name} (${patient.email})`);
      console.log(`     Blood Type: ${patient.bloodType} | Allergies: ${patient.allergies}`);
      console.log(`     Location: ${patient.location.address}`);
    });

    console.log('\n👨‍⚕️  DOCTORS:');
    insertedDoctors.forEach((doctor, idx) => {
      console.log(`  ${idx + 1}. ${doctor.name} (${doctor.email})`);
      console.log(`     ${doctor.specialization} | ${doctor.experience} | ₹${doctor.consultationFee}`);
      console.log(`     License: ${doctor.licenseNumber} | Clinic: ${doctor.clinicAddress}`);
    });

    console.log('\n🔐 LOGIN CREDENTIALS:');
    console.log('   Password for all users: password123\n');

    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

// Run seeder
seedDatabase();
