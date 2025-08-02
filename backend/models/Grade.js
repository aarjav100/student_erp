import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  score: {
    type: Number,
    min: 0,
  },
  maxScore: {
    type: Number,
    default: 100,
    min: 1,
  },
  gradeLetter: {
    type: String,
    trim: true,
  },
  feedback: {
    type: String,
    trim: true,
  },
  gradedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Ensure unique grade per student per assignment
gradeSchema.index({ studentId: 1, assignmentId: 1 }, { unique: true });

const Grade = mongoose.model('Grade', gradeSchema);

export default Grade; 