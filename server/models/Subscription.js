import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    planId: {
      type: String,
      default: 'monthly_showcase_plan',
    },
    planName: {
      type: String,
      default: 'Showcase Monthly Subscription',
    },
    amount: {
      type: Number,
      required: true,
      default: 99,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['active', 'expiring_soon', 'expired', 'cancelled'],
      default: 'active',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    paymentId: {
      type: String,
      default: '',
    },
    autoRenew: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

subscriptionSchema.index({ businessId: 1, status: 1 });

export const Subscription = mongoose.model('Subscription', subscriptionSchema);
