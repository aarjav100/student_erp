import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  instructions: {
    type: String,
    trim: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  points: {
    type: Number,
    default: 100,
    min: 1,
  },
  type: {
    type: String,
    enum: ['assignment', 'quiz', 'exam', 'project', 'homework', 'lab'],
    default: 'assignment',
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    mimeType: String,
  }],
  allowedFileTypes: [{
    type: String,
    trim: true,
  }],
  maxFileSize: {
    type: Number, // in MB
    default: 10,
  },
  maxSubmissions: {
    type: Number,
    default: 1,
    min: 1,
  },
  lateSubmissionAllowed: {
    type: Boolean,
    default: true,
  },
  latePenalty: {
    type: Number,
    default: 0, // percentage penalty
    min: 0,
    max: 100,
  },
  isGroupAssignment: {
    type: Boolean,
    default: false,
  },
  maxGroupSize: {
    type: Number,
    default: 1,
    min: 1,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  publishedAt: {
    type: Date,
  },
  tags: [{
    type: String,
    trim: true,
  }],
}, {
  timestamps: true,
});

// Index for efficient queries
assignmentSchema.index({ courseId: 1, isActive: 1 });
assignmentSchema.index({ createdBy: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ type: 1 });

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment; 