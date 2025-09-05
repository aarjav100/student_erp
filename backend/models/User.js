import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  studentId: {
    type: String,
    unique: true,
    sparse: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  dateOfBirth: {
    type: Date,
  },
  enrollmentDate: {
    type: Date,
    default: Date.now,
  },
  program: {
    type: String,
    trim: true,
  },
  yearLevel: {
    type: Number,
    default: 1,
    min: 1,
    max: 6,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  },
  role: {
    type: String,
    enum: ['student', 'faculty', 'hod', 'admin', 'staff'],
    default: 'student',
  },
  course: {
    type: String,
    trim: true,
    required: function() {
      return ['student', 'faculty', 'hod'].includes(this.role);
    }
  },
  branch: {
    type: String,
    trim: true,
    required: function() {
      return ['student', 'faculty', 'hod'].includes(this.role);
    }
  },
  avatarUrl: {
    type: String,
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordChangeHistory: [{
    changedAt: {
      type: Date,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
  }],
  lastLoginIP: {
    type: String,
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Add password change tracking
userSchema.methods.trackPasswordChange = async function() {
  this.passwordChangedAt = Date.now();
  this.passwordChangeHistory = this.passwordChangeHistory || [];
  
  // Keep only last 5 password changes for security
  if (this.passwordChangeHistory.length >= 5) {
    this.passwordChangeHistory.shift();
  }
  
  this.passwordChangeHistory.push({
    changedAt: new Date(),
    ipAddress: this.lastLoginIP || 'unknown'
  });
  
  await this.save();
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    return ret;
  }
});

const User = mongoose.model('User', userSchema);

export default User; 