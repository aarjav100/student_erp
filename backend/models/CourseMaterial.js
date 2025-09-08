import mongoose from 'mongoose';

const courseMaterialSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['lecture', 'notes', 'ppt', 'ebook', 'video', 'document', 'assignment', 'quiz'],
    required: true,
  },
  fileUrl: {
    type: String,
    required: function() {
      return this.type !== 'assignment' && this.type !== 'quiz';
    },
  },
  fileSize: {
    type: Number, // in bytes
  },
  fileName: {
    type: String,
    trim: true,
  },
  mimeType: {
    type: String,
    trim: true,
  },
  duration: {
    type: Number, // in seconds for videos
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  downloadCount: {
    type: Number,
    default: 0,
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
courseMaterialSchema.index({ courseId: 1, type: 1 });
courseMaterialSchema.index({ uploadedBy: 1 });
courseMaterialSchema.index({ isActive: 1 });

const CourseMaterial = mongoose.model('CourseMaterial', courseMaterialSchema);

export default CourseMaterial;
