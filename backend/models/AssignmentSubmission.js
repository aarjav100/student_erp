import mongoose from 'mongoose';

const assignmentSubmissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
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
  submissionText: {
    type: String,
    trim: true,
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  submissionNumber: {
    type: Number,
    required: true,
    min: 1,
  },
  submittedAt: {
    type: Date,
    required: true,
  },
  isLate: {
    type: Boolean,
    default: false,
  },
  latePenalty: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['submitted', 'graded', 'returned', 'resubmitted'],
    default: 'submitted',
  },
  grade: {
    type: String,
    trim: true,
  },
  score: {
    type: Number,
    min: 0,
  },
  maxScore: {
    type: Number,
    required: true,
  },
  feedback: {
    type: String,
    trim: true,
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  gradedAt: {
    type: Date,
  },
  rubricScores: [{
    criterion: String,
    score: Number,
    maxScore: Number,
    feedback: String,
  }],
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isInstructor: {
      type: Boolean,
      default: false,
    },
  }],
  version: {
    type: Number,
    default: 1,
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

// Calculate if submission is late
assignmentSubmissionSchema.pre('save', async function(next) {
  if (this.isNew) {
    const Assignment = mongoose.model('Assignment');
    const assignment = await Assignment.findById(this.assignmentId);
    
    if (assignment && this.submittedAt > assignment.dueDate) {
      this.isLate = true;
      this.latePenalty = assignment.latePenalty || 0;
    }
  }
  next();
});

// Ensure unique submission per student per assignment per submission number
assignmentSubmissionSchema.index({ assignmentId: 1, studentId: 1, submissionNumber: 1 }, { unique: true });
assignmentSubmissionSchema.index({ studentId: 1, courseId: 1 });
assignmentSubmissionSchema.index({ status: 1 });
assignmentSubmissionSchema.index({ submittedAt: -1 });

const AssignmentSubmission = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);

export default AssignmentSubmission;
