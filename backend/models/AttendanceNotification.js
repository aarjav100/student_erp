import mongoose from 'mongoose';

const attendanceNotificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['daily_reminder', 'attendance_marked', 'low_attendance_alert', 'attendance_report'],
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
  },
  date: {
    type: Date,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
attendanceNotificationSchema.index({ recipientId: 1, isRead: 1 });
attendanceNotificationSchema.index({ type: 1 });
attendanceNotificationSchema.index({ date: 1 });
attendanceNotificationSchema.index({ priority: 1 });
attendanceNotificationSchema.index({ isActive: 1 });

const AttendanceNotification = mongoose.model('AttendanceNotification', attendanceNotificationSchema);

export default AttendanceNotification;
