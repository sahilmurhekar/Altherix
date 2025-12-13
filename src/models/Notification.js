// ============ models/Notification.js ============

import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  // Recipient of the notification
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Type of notification
  type: {
    type: String,
    enum: [
      'appointment_booked',
      'appointment_confirmed',
      'appointment_cancelled',
      'appointment_reminder',
      'medical_record_uploaded',
      'prescription_issued',
      'payment_received',
      'review_received',
      'system_message',
      'video_call_request'
    ],
    required: true
  },

  // Title and message
  title: {
    type: String,
    required: true,
    trim: true
  },

  message: {
    type: String,
    required: true,
    trim: true
  },

  // Related data (optional)
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel'
  },

  relatedModel: {
    type: String,
    enum: ['Appointment', 'MedicalRecord', 'User', 'Payment']
  },

  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },

  // Read status
  isRead: {
    type: Boolean,
    default: false
  },

  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // Delivery channels
  channels: {
    inApp: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    sms: { type: Boolean, default: false }
  },

  // Email/SMS delivery status
  deliveryStatus: {
    email: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending'
    },
    sms: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending'
    }
  },

  // Scheduled delivery (for reminders)
  scheduledFor: {
    type: Date
  },

  // Expiration date
  expiresAt: {
    type: Date
  },

  // Audit fields
  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound indexes for efficient queries
notificationSchema.index({ recipientId: 1, isRead: 1 });
notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ scheduledFor: 1, 'deliveryStatus.email': 1 });

// TTL index for automatic cleanup of expired notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save middleware
notificationSchema.pre('save', function(next) {
  this.updatedAt = new Date();

  // Set default expiration (30 days from creation if not set)
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  }

  next();
});

// Static methods
notificationSchema.statics.createNotification = async function(data) {
  const notification = new this(data);
  return notification.save();
};

notificationSchema.statics.getUnreadCount = async function(recipientId) {
  return this.countDocuments({ recipientId, isRead: false });
};

notificationSchema.statics.markAsRead = async function(notificationId, recipientId) {
  return this.findOneAndUpdate(
    { _id: notificationId, recipientId },
    { isRead: true, updatedAt: new Date() },
    { new: true }
  );
};

notificationSchema.statics.markAllAsRead = async function(recipientId) {
  return this.updateMany(
    { recipientId, isRead: false },
    { isRead: true, updatedAt: new Date() }
  );
};

export default mongoose.model('Notification', notificationSchema);