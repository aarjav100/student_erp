import mongoose from 'mongoose';

const mealSubscriptionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  mealPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MealPlan',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled', 'expired'],
    default: 'active',
  },
}, { timestamps: true });

mealSubscriptionSchema.index({ student: 1, status: 1 });

const MealSubscription = mongoose.model('MealSubscription', mealSubscriptionSchema);

export default MealSubscription;


