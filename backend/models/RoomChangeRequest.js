import mongoose from 'mongoose';

const roomChangeRequestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  currentRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HostelRoom',
  },
  preferredRoomType: {
    type: String,
    enum: ['single', 'double', 'triple'],
  },
  preferredBlock: {
    type: String,
    trim: true,
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
  reviewedAt: Date,
  notes: String,
}, { timestamps: true });

roomChangeRequestSchema.index({ student: 1, status: 1 });

const RoomChangeRequest = mongoose.model('RoomChangeRequest', roomChangeRequestSchema);

export default RoomChangeRequest;


