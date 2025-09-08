import mongoose from 'mongoose';

const hostelNoticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  audience: {
    type: String,
    enum: ['all', 'blockA', 'blockB', 'wardens', 'students'],
    default: 'all',
  },
  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  validFrom: {
    type: Date,
    default: Date.now,
  },
  validTill: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

hostelNoticeSchema.index({ isActive: 1, validFrom: -1 });

const HostelNotice = mongoose.model('HostelNotice', hostelNoticeSchema);

export default HostelNotice;


