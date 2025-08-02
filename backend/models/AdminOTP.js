import mongoose from 'mongoose';

const adminOTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
adminOTPSchema.index({ email: 1, otp: 1 });
adminOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const AdminOTP = mongoose.model('AdminOTP', adminOTPSchema);

export default AdminOTP; 