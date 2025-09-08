import mongoose from 'mongoose';

const mealMenuSchema = new mongoose.Schema({
  weekStart: { type: Date, required: true },
  weekEnd: { type: Date, required: true },
  // days: mon..sun each with breakfast/lunch/dinner items
  days: {
    type: Object,
    required: true,
    // Example shape: { mon: { breakfast: [], lunch: [], dinner: [] }, ... }
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

mealMenuSchema.index({ weekStart: 1 }, { unique: true });

const MealMenu = mongoose.model('MealMenu', mealMenuSchema);

export default MealMenu;


