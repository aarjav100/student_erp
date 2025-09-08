import mongoose from 'mongoose';

const hostelFeeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  periodStart: {
    type: Date,
    required: true,
  },
  periodEnd: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'refunded'],
    default: 'pending',
  },
  receiptNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  paymentMethod: {
    type: String,
    enum: ['online', 'cash', 'bank_transfer', 'upi', 'card'],
  },
  paidAt: {
    type: Date,
  },
  notes: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

hostelFeeSchema.index({ student: 1, periodStart: 1, periodEnd: 1 }, { unique: true });
hostelFeeSchema.index({ status: 1 });

const HostelFee = mongoose.model('HostelFee', hostelFeeSchema);

export default HostelFee;


