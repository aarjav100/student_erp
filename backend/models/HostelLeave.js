import mongoose from 'mongoose';

const hostelLeaveSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fromDate: {
    type: Date,
    required: true,
  },
  toDate: {
    type: Date,
    required: true,
  },
  reason: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: {
    type: Date,
  },
  notes: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

hostelLeaveSchema.index({ student: 1, status: 1 });
hostelLeaveSchema.index({ fromDate: 1, toDate: 1 });

const HostelLeave = mongoose.model('HostelLeave', hostelLeaveSchema);

export default HostelLeave;


