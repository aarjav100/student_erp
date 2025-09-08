import mongoose from 'mongoose';

const hostelComplaintSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    enum: ['electricity', 'water', 'cleaning', 'maintenance', 'other'],
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open',
  },
  assignedTo: {
    type: String,
    trim: true,
  },
  resolvedAt: {
    type: Date,
  },
  resolutionNotes: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

hostelComplaintSchema.index({ student: 1, status: 1 });
hostelComplaintSchema.index({ category: 1 });

const HostelComplaint = mongoose.model('HostelComplaint', hostelComplaintSchema);

export default HostelComplaint;


