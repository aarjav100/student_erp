import mongoose from 'mongoose';

const hostelRoomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  roomType: {
    type: String,
    enum: ['single', 'double', 'triple'],
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 3,
  },
  occupants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  floor: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'reserved'],
    default: 'available',
  },
  notes: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

hostelRoomSchema.index({ roomNumber: 1 }, { unique: true });
hostelRoomSchema.index({ status: 1 });
hostelRoomSchema.index({ roomType: 1 });

const HostelRoom = mongoose.model('HostelRoom', hostelRoomSchema);

export default HostelRoom;


