import mongoose from 'mongoose';

const showcaseSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Showcase title is required'],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, 'Showcase description is required'],
      trim: true,
      maxlength: 300,
    },
    imageUrl: {
      type: String,
      required: [true, 'Promotional banner image is required'],
    },
    cloudinaryPublicId: {
      type: String,
      default: '',
    },
    discount: {
      type: String,
      trim: true,
      default: '', // e.g. "30% OFF", "BUY 1 GET 1", "FLAT ₹500 OFF"
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    adminDisabled: {
      type: Boolean,
      default: false,
    },
    targetOfferId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer',
      default: null,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    clicksCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for fast public feed queries
showcaseSchema.index({ isActive: 1, adminDisabled: 1, expiryDate: 1 });

export const Showcase = mongoose.model('Showcase', showcaseSchema);
