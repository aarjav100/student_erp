import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
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
  questions: [{
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    questionType: {
      type: String,
      enum: ['multiple-choice', 'true-false', 'short-answer', 'essay'],
      required: true,
    },
    options: [{
      text: String,
      isCorrect: Boolean,
    }],
    correctAnswer: {
      type: String,
      trim: true,
    },
    points: {
      type: Number,
      default: 1,
      min: 1,
    },
    explanation: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
    },
  }],
  totalPoints: {
    type: Number,
    default: 0,
  },
  timeLimit: {
    type: Number, // in minutes
    default: 60,
  },
  attemptsAllowed: {
    type: Number,
    default: 1,
    min: 1,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  showResults: {
    type: Boolean,
    default: true,
  },
  showCorrectAnswers: {
    type: Boolean,
    default: true,
  },
  randomizeQuestions: {
    type: Boolean,
    default: false,
  },
  randomizeOptions: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  settings: {
    allowBacktracking: {
      type: Boolean,
      default: true,
    },
    autoSubmit: {
      type: Boolean,
      default: false,
    },
    requirePassword: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      trim: true,
    },
  },
}, {
  timestamps: true,
});

// Calculate total points before saving
quizSchema.pre('save', function(next) {
  if (this.questions && this.questions.length > 0) {
    this.totalPoints = this.questions.reduce((total, question) => total + question.points, 0);
  }
  next();
});

// Index for efficient queries
quizSchema.index({ courseId: 1, isActive: 1 });
quizSchema.index({ createdBy: 1 });
quizSchema.index({ startDate: 1, endDate: 1 });

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;
