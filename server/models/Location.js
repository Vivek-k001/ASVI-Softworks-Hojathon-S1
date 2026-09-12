import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Location name is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    district: {
      type: String,
      default: 'Malappuram',
      trim: true,
    },
    state: {
      type: String,
      default: 'Kerala',
      trim: true,
    },
    pincode: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Location = mongoose.model('Location', locationSchema);
