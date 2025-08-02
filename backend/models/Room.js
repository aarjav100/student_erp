import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  pricePerNight: {
    type: Number,
    required: true,
    min: 0,
  },
  roomType: {
    type: String,
    enum: ['single', 'double', 'suite', 'deluxe', 'presidential'],
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  amenities: [{
    type: String,
    trim: true,
  }],
  floor: {
    type: Number,
    min: 1,
  },
  view: {
    type: String,
    enum: ['city', 'mountain', 'ocean', 'garden', 'pool'],
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'reserved'],
    default: 'available',
  },
  checkInTime: {
    type: String,
    default: '3:00 PM',
  },
  checkOutTime: {
    type: String,
    default: '11:00 AM',
  },
  images: [{
    type: String,
    trim: true,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
roomSchema.index({ roomNumber: 1 });
roomSchema.index({ status: 1 });
roomSchema.index({ roomType: 1 });
roomSchema.index({ pricePerNight: 1 });

const Room = mongoose.model('Room', roomSchema);

export default Room; 