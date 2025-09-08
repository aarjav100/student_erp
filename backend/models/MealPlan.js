import mongoose from 'mongoose';

const mealPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  pricePerMonth: {
    type: Number,
    required: true,
    min: 0,
  },
  mealsPerDay: {
    type: Number,
    required: true,
    min: 1,
    max: 4,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

mealPlanSchema.index({ name: 1 }, { unique: true });

const MealPlan = mongoose.model('MealPlan', mealPlanSchema);

export default MealPlan;


