// ============ server.js (CLEANED) ============
// Trigger restart

import express from 'express';
import { createServer } from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import appointmentRoutes from './routes/appointment.js';
import medicalRecordsRoutes from './routes/medicalRecords.js';
import patientMedicalRecordsRoutes from './routes/patientMedicalRecords.js'; // NEW
import patientRoutes from './routes/patient.js';
import dashboardRoutes from './routes/dashboard.js'; // NEW
import notificationRoutes from './routes/notification.js'; // NEW
import Notification from './models/Notification.js';
import Appointment from './models/Appointment.js';
dotenv.config();

console.log('--- Loading Environment Variables ---');
if (!process.env.MONGO_ATLAS_URI) {
  console.error('🔥 FATAL ERROR: MONGO_ATLAS_URI is not defined.');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('🔥 FATAL ERROR: JWT_SECRET is not defined.');
  process.exit(1);
}
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  console.warn('⚠️ WARNING: CLOUDINARY_CLOUD_NAME is not defined. Image uploads will fail.');
}
console.log('✅ Environment variables loaded.');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "https://altherix.vercel.app",
      "https://altherix-frontend.vercel.app"
    ], // Frontend URLs
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store pending video calls
const pendingCalls = new Map();

// Store user-socket mappings
const userSockets = new Map();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ➡️  ${req.method} ${req.path}`);
  next();
});

const connectDB = async () => {
  try {
    console.log('🔍 Attempting MongoDB connection to Atlas...');
    console.log('🔍 MongoDB URI starts with:', process.env.MONGO_ATLAS_URI.substring(0, 20) + '...');
    console.log('🔍 Starting mongoose.connect...');
    await mongoose.connect(process.env.MONGO_ATLAS_URI, {
      dbName: 'ALTHERIX_DB',
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });
    console.log('🔌 Connected to MongoDB via Mongoose');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('❌ Full error details:', error);
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-records', medicalRecordsRoutes);          // Doctor uploads
app.use('/api/patient', patientRoutes); // ADD THIS (after medical-records route)
app.use('/api/patient/medical-records', patientMedicalRecordsRoutes); // Patient views
app.use('/api/dashboard', dashboardRoutes); // NEW
app.use('/api/notifications', notificationRoutes); // NEW

app.use((err, req, res, next) => {
  console.error('🔥🔥🔥 UNHANDLED ERROR 🔥🔥🔥');
  console.error(err.stack);

  // Don't expose sensitive error details in production
  const isDevelopment = process.env.NODE_ENV !== 'production';

  res.status(err.status || 500).json({
    message: isDevelopment ? err.message : 'An internal server error occurred!',
    error: isDevelopment ? err : undefined
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  console.log(`🔍 Attempting to start server on port ${PORT}...`);
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});

// Socket.IO logic
io.on('connection', (socket) => {
  console.log('[Socket.IO] User connected:', socket.id);

  // Register user with socket
  socket.on('register-user', (userId) => {
    userSockets.set(userId, socket.id);
    console.log(`[Socket.IO] User ${userId} registered with socket ${socket.id}`);
  });

  // Join room for appointment
  socket.on('join-appointment', (appointmentId) => {
    const appointmentIdStr = String(appointmentId);
    try {
      socket.join(appointmentIdStr);
      console.log(`[Socket.IO] User ${socket.id} joined appointment ${appointmentIdStr}`);
    } catch (error) {
      console.error('[Socket.IO] Error joining appointment:', error);
    }

    // Check if there's a pending call for this appointment
    if (pendingCalls.has(appointmentIdStr)) {
      const pendingCall = pendingCalls.get(appointmentIdStr);
      console.log(`[Socket.IO] Found pending call for ${appointmentIdStr}, emitting to ${socket.id}`);
      // Emit the pending call to the newly joined user
      socket.emit('call-made', {
        offer: pendingCall.offer,
        socket: pendingCall.socketId,
        appointmentId: appointmentIdStr
      });
      // Remove the pending call after emitting
      pendingCalls.delete(appointmentIdStr);
    } else {
      console.log(`[Socket.IO] No pending call for ${appointmentIdStr}`);
    }
  });

  // Handle video call signaling
  socket.on('call-user', async (data) => {
    console.log(`[Socket.IO] Received call-user from ${socket.id} for appointment ${data.appointmentId}`);
    try {
      if (!data || !data.appointmentId) {
        console.error('[Socket.IO] Invalid call-user data:', data);
        return;
      }

      // Convert appointmentId to string for room operations
      const appointmentIdStr = String(data.appointmentId);

      // Fetch appointment to get doctor ID
      const appointment = await Appointment.findById(appointmentIdStr).populate('patientId', 'name');
      if (!appointment) {
        console.error(`[Socket.IO] Appointment ${data.appointmentId} not found`);
        return;
      }

      // Create notification for doctor

      const notification = await Notification.createNotification({
        recipientId: appointment.doctorId,
        type: 'video_call_request',
        title: 'Incoming Video Call',
        message: `${appointment.patientId.name} is calling for your appointment`,
        relatedId: data.appointmentId._id || data.appointmentId,
        relatedModel: 'Appointment',
        priority: 'urgent'
      });
console.log(`[Socket.IO] Created video call notification for doctor ${appointment.doctorId}, appointment: ${appointmentIdStr}`);


      // Emit real-time notification to doctor
      const doctorSocketId = userSockets.get(appointment.doctorId.toString());
      if (doctorSocketId) {
        io.to(doctorSocketId).emit('new-notification', {
          _id: notification._id,
          type: 'video_call_request',
          title: 'Incoming Video Call',
          message: `${appointment.patientId.name} is calling for your appointment`,
          relatedId: data.appointmentId._id || data.appointmentId,
          relatedModel: 'Appointment',
          priority: 'urgent',
          createdAt: notification.createdAt
        });
        console.log(`[Socket.IO] Emitted new-notification to doctor socket ${doctorSocketId}`);
      } else {
        console.log(`[Socket.IO] Doctor ${appointment.doctorId} not connected, notification saved only`);
      }

      // Store the call offer in case the other user isn't connected yet
      pendingCalls.set(appointmentIdStr, {
        offer: data.offer,
        socketId: socket.id,
        timestamp: Date.now()
      });

      // Emit to all users in the room except the caller
      console.log(`[Socket.IO] Broadcasting call-made to room ${appointmentIdStr}`);
      socket.to(appointmentIdStr).emit('call-made', {
        offer: data.offer,
        socket: socket.id,
        appointmentId: appointmentIdStr
      });
    } catch (error) {
      console.error('[Socket.IO] Error creating video call notification:', error);
    }
  });

  socket.on('make-answer', (data) => {
    console.log(`[Socket.IO] Received make-answer from ${socket.id} for appointment ${data.appointmentId}`);
    try {
      if (!data || !data.appointmentId) {
        console.error('[Socket.IO] Invalid make-answer data:', data);
        return;
      }
      
      const appointmentIdStr = String(data.appointmentId);
      console.log(`[Socket.IO] Broadcasting answer-made to room ${appointmentIdStr}`);
      socket.to(appointmentIdStr).emit('answer-made', {
        answer: data.answer,
        socket: socket.id,
        appointmentId: appointmentIdStr
      });
    } catch (error) {
      console.error('[Socket.IO] Error handling make-answer:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Clean up user-socket mapping
    for (const [userId, sockId] of userSockets.entries()) {
      if (sockId === socket.id) {
        userSockets.delete(userId);
        console.log(`[Socket.IO] Removed user ${userId} from socket mapping`);
        break;
      }
    }
    // Clean up any pending calls from this socket
    for (const [appointmentId, call] of pendingCalls.entries()) {
      if (call.socketId === socket.id) {
        pendingCalls.delete(appointmentId);
      }
    }
  });
});
