import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Offer title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
    },
    offerType: {
      type: String,
      enum: [
        'daily',
        'weekly',
        'flash',
        'festival',
        'weekend',
        'clearance',
        'bogo',
        'percentage',
        'fixed',
        'special_price',
      ],
      default: 'percentage',
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    offerPrice: {
      type: Number,
      required: [true, 'Offer price is required'],
      min: 0,
    },
    discountPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    startTime: {
      type: String,
      trim: true,
    },
    endTime: {
      type: String,
      trim: true,
    },
    terms: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'active', 'paused', 'expired', 'rejected'],
      default: 'active',
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Pre-save hook to calculate discount percentage and validate pricing
offerSchema.pre('save', function (next) {
  if (this.originalPrice && this.originalPrice > 0 && this.offerPrice < this.originalPrice) {
    this.discountPercentage = Math.round(
      ((this.originalPrice - this.offerPrice) / this.originalPrice) * 100
    );
  }
  // Check if already expired
  const now = new Date();
  if (this.endDate < now && this.status === 'active') {
    this.status = 'expired';
  }
  next();
});

export const Offer = mongoose.model('Offer', offerSchema);
