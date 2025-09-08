import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  enrollmentDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'enrolled', 'dropped', 'completed', 'suspended'],
    default: 'pending',
  },
  grade: {
    type: String,
    trim: true,
  },
  semester: {
    type: String,
    required: true,
    trim: true,
  },
  year: {
    type: Number,
    required: true,
    min: 2020,
    max: 2030,
  },
  enrolledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvalDate: {
    type: Date,
  },
  dropDate: {
    type: Date,
  },
  dropReason: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
enrollmentSchema.index({ courseId: 1, status: 1 });
enrollmentSchema.index({ studentId: 1, status: 1 });
enrollmentSchema.index({ semester: 1, year: 1 });
enrollmentSchema.index({ enrolledBy: 1 });
enrollmentSchema.index({ approvedBy: 1 });
enrollmentSchema.index({ isActive: 1 });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

export default Enrollment; 