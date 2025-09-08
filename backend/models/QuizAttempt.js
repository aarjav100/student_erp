import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
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
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    answer: {
      type: String,
      trim: true,
    },
    selectedOptions: [{
      type: String,
    }],
    isCorrect: {
      type: Boolean,
    },
    pointsEarned: {
      type: Number,
      default: 0,
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0,
    },
  }],
  totalScore: {
    type: Number,
    default: 0,
  },
  maxScore: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    default: 0,
  },
  grade: {
    type: String,
    trim: true,
  },
  timeStarted: {
    type: Date,
    required: true,
  },
  timeCompleted: {
    type: Date,
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0,
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned', 'timeout'],
    default: 'in-progress',
  },
  attemptNumber: {
    type: Number,
    required: true,
    min: 1,
  },
  isGraded: {
    type: Boolean,
    default: false,
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  gradedAt: {
    type: Date,
  },
  feedback: {
    type: String,
    trim: true,
  },
  ipAddress: {
    type: String,
    trim: true,
  },
  userAgent: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Calculate percentage and grade before saving
quizAttemptSchema.pre('save', function(next) {
  if (this.maxScore > 0) {
    this.percentage = Math.round((this.totalScore / this.maxScore) * 100);
    
    // Calculate grade based on percentage
    if (this.percentage >= 90) this.grade = 'A+';
    else if (this.percentage >= 85) this.grade = 'A';
    else if (this.percentage >= 80) this.grade = 'A-';
    else if (this.percentage >= 75) this.grade = 'B+';
    else if (this.percentage >= 70) this.grade = 'B';
    else if (this.percentage >= 65) this.grade = 'B-';
    else if (this.percentage >= 60) this.grade = 'C+';
    else if (this.percentage >= 55) this.grade = 'C';
    else if (this.percentage >= 50) this.grade = 'C-';
    else if (this.percentage >= 45) this.grade = 'D';
    else this.grade = 'F';
  }
  
  // Calculate time spent
  if (this.timeCompleted && this.timeStarted) {
    this.timeSpent = Math.floor((this.timeCompleted - this.timeStarted) / 1000);
  }
  
  next();
});

// Ensure unique attempt per student per quiz
quizAttemptSchema.index({ quizId: 1, studentId: 1, attemptNumber: 1 }, { unique: true });
quizAttemptSchema.index({ studentId: 1, courseId: 1 });
quizAttemptSchema.index({ status: 1 });

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);

export default QuizAttempt;
