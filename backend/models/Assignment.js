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
    enum: ['assignment', 'quiz', 'exam', 'project'],
    default: 'assignment',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment; 