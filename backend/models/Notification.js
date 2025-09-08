import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
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
  type: {
    type: String,
    enum: [
      'assignment-due',
      'assignment-graded',
      'quiz-available',
      'quiz-graded',
      'announcement',
      'discussion-reply',
      'course-material',
      'enrollment-approved',
      'enrollment-rejected',
      'deadline-reminder',
      'grade-update',
      'attendance-alert',
      'payment-due',
      'system',
      'general'
    ],
    required: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
  actionUrl: {
    type: String,
    trim: true,
  },
  actionText: {
    type: String,
    trim: true,
  },
  metadata: {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
    },
    discussionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Discussion',
    },
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CourseMaterial',
    },
    gradeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Grade',
    },
    dueDate: Date,
    score: Number,
    maxScore: Number,
  },
  scheduledFor: {
    type: Date,
  },
  isScheduled: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  expiresAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ scheduledFor: 1, isScheduled: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Mark as read method
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Mark as unread method
notificationSchema.methods.markAsUnread = function() {
  this.isRead = false;
  this.readAt = undefined;
  return this.save();
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
