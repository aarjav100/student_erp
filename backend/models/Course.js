import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
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
  credits: {
    type: Number,
    required: true,
    default: 3,
    min: 1,
    max: 6,
  },
  prerequisites: [{
    type: String,
    trim: true,
  }],
  instructor: {
    type: String,
    trim: true,
  },
  semester: {
    type: String,
    trim: true,
  },
  year: {
    type: Number,
    min: 2020,
  },
  schedule: {
    type: String,
    trim: true,
  },
  room: {
    type: String,
    trim: true,
  },
  maxStudents: {
    type: Number,
    default: 30,
    min: 1,
  },
  currentEnrollment: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true,
});

const Course = mongoose.model('Course', courseSchema);

export default Course; 