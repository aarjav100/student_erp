import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    index: true,
  },
  description: {
    type: String,
    trim: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 6,
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8,
  },
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 4,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
  }],
  objectives: [{
    type: String,
    trim: true,
  }],
  outcomes: [{
    type: String,
    trim: true,
  }],
  syllabus: {
    type: String,
    trim: true,
  },
  textbooks: [{
    title: String,
    author: String,
    edition: String,
    publisher: String,
    isbn: String,
  }],
  references: [{
    title: String,
    author: String,
    url: String,
  }],
  assessment: {
    internal: {
      type: Number,
      default: 40,
      min: 0,
      max: 100,
    },
    external: {
      type: Number,
      default: 60,
      min: 0,
      max: 100,
    },
    total: {
      type: Number,
      default: 100,
    },
  },
  schedule: {
    lectures: {
      type: Number,
      default: 0,
    },
    tutorials: {
      type: Number,
      default: 0,
    },
    practicals: {
      type: Number,
      default: 0,
    },
    totalHours: {
      type: Number,
      default: 0,
    },
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active',
  },
  isElective: {
    type: Boolean,
    default: false,
  },
  maxStudents: {
    type: Number,
    default: 60,
  },
  minStudents: {
    type: Number,
    default: 5,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
subjectSchema.index({ courseId: 1, semester: 1, year: 1 });
subjectSchema.index({ instructor: 1 });
subjectSchema.index({ status: 1 });
subjectSchema.index({ isElective: 1 });

// Virtual for full subject name
subjectSchema.virtual('fullName').get(function() {
  return `${this.name} (${this.code})`;
});

// Ensure virtual fields are serialized
subjectSchema.set('toJSON', { virtuals: true });

const Subject = mongoose.model('Subject', subjectSchema);

export default Subject;
