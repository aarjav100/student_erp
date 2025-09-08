import mongoose from 'mongoose';

const mealFeedbackSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comments: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

mealFeedbackSchema.index({ student: 1, date: -1 });

const MealFeedback = mongoose.model('MealFeedback', mealFeedbackSchema);

export default MealFeedback;


