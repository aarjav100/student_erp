import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    index: true,
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
  department: {
    type: String,
    required: true,
    trim: true,
    enum: ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'MCA', 'MBA', 'BBA', 'BCA'],
  },
  degree: {
    type: String,
    required: true,
    trim: true,
    enum: ['BTech', 'MTech', 'MCA', 'MBA', 'BBA', 'BCA', 'BE', 'ME'],
  },
  duration: {
    type: Number,
    required: true,
    default: 4, // years
    min: 1,
    max: 6,
  },
  totalCredits: {
    type: Number,
    required: true,
    default: 160,
    min: 120,
    max: 200,
  },
  semesterCredits: {
    type: Number,
    default: 20,
    min: 15,
    max: 30,
  },
  maxStudents: {
    type: Number,
    default: 60,
    min: 10,
  },
  currentEnrollment: {
    type: Number,
    default: 0,
    min: 0,
  },
  hod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  coordinator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  objectives: [{
    type: String,
    trim: true,
  }],
  outcomes: [{
    type: String,
    trim: true,
  }],
  eligibility: {
    type: String,
    trim: true,
  },
  admissionProcess: {
    type: String,
    trim: true,
  },
  feeStructure: {
    tuitionFee: {
      type: Number,
      default: 0,
    },
    otherFees: {
      type: Number,
      default: 0,
    },
    totalFee: {
      type: Number,
      default: 0,
    },
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active',
  },
  isActive: {
    type: Boolean,
    default: true,
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
courseSchema.index({ department: 1 });
courseSchema.index({ degree: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ isActive: 1 });

// Virtual for full course name
courseSchema.virtual('fullName').get(function() {
  return `${this.title} (${this.courseCode})`;
});

// Ensure virtual fields are serialized
courseSchema.set('toJSON', { virtuals: true });

const Course = mongoose.model('Course', courseSchema);

export default Course; 