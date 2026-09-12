import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
    },
    ownerName: {
      type: String,
      required: [true, 'Owner name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: [true, 'Location is required'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    openingHours: {
      type: String,
      default: '9:30 AM - 9:00 PM',
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    logoUrl: {
      type: String,
      default: '',
    },
    coverUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    subscriptionStatus: {
      type: String,
      enum: ['not_subscribed', 'active', 'expiring_soon', 'expired', 'cancelled'],
      default: 'not_subscribed',
    },
    subscriptionExpiresAt: {
      type: Date,
      default: null,
    },
    activeShowcaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Showcase',
      default: null,
    },
  },
  { timestamps: true }
);

export const Business = mongoose.model('Business', businessSchema);
