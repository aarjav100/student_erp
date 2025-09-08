import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
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
  materialProgress: [{
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CourseMaterial',
      required: true,
    },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed'],
      default: 'not-started',
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0,
    },
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  }],
  assignmentProgress: [{
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
    },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'submitted', 'graded'],
      default: 'not-started',
    },
    submittedAt: {
      type: Date,
    },
    grade: {
      type: String,
      trim: true,
    },
    score: {
      type: Number,
    },
    maxScore: {
      type: Number,
    },
    feedback: {
      type: String,
      trim: true,
    },
  }],
  quizProgress: [{
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    bestScore: {
      type: Number,
      default: 0,
    },
    bestPercentage: {
      type: Number,
      default: 0,
    },
    lastAttempt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed'],
      default: 'not-started',
    },
  }],
  overallProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  totalTimeSpent: {
    type: Number, // in seconds
    default: 0,
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
  streak: {
    type: Number,
    default: 0,
  },
  badges: [{
    name: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now,
    },
    icon: String,
  }],
  achievements: [{
    name: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now,
    },
    points: {
      type: Number,
      default: 0,
    },
  }],
}, {
  timestamps: true,
});

// Calculate overall progress before saving
progressSchema.pre('save', function(next) {
  let totalProgress = 0;
  let totalItems = 0;
  
  // Calculate material progress
  if (this.materialProgress && this.materialProgress.length > 0) {
    const materialProgress = this.materialProgress.reduce((sum, material) => {
      return sum + material.progressPercentage;
    }, 0);
    totalProgress += materialProgress;
    totalItems += this.materialProgress.length;
  }
  
  // Calculate assignment progress
  if (this.assignmentProgress && this.assignmentProgress.length > 0) {
    const assignmentProgress = this.assignmentProgress.reduce((sum, assignment) => {
      let progress = 0;
      if (assignment.status === 'submitted') progress = 50;
      if (assignment.status === 'graded') progress = 100;
      return sum + progress;
    }, 0);
    totalProgress += assignmentProgress;
    totalItems += this.assignmentProgress.length;
  }
  
  // Calculate quiz progress
  if (this.quizProgress && this.quizProgress.length > 0) {
    const quizProgress = this.quizProgress.reduce((sum, quiz) => {
      return sum + quiz.bestPercentage;
    }, 0);
    totalProgress += quizProgress;
    totalItems += this.quizProgress.length;
  }
  
  if (totalItems > 0) {
    this.overallProgress = Math.round(totalProgress / totalItems);
  }
  
  next();
});

// Ensure unique progress per student per course
progressSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
progressSchema.index({ studentId: 1 });
progressSchema.index({ courseId: 1 });

const Progress = mongoose.model('Progress', progressSchema);

export default Progress;
