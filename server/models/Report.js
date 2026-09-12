import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      enum: ['offer', 'business'],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reporterName: {
      type: String,
      default: 'Anonymous',
    },
    reporterContact: {
      type: String,
    },
    reason: {
      type: String,
      enum: [
        'fake_offer',
        'wrong_price',
        'wrong_business_info',
        'expired_offer',
        'inappropriate_content',
        'other',
      ],
      required: true,
    },
    details: {
      type: String,
      required: [true, 'Details are required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved'],
      default: 'pending',
    },
    adminNotes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Report = mongoose.model('Report', reportSchema);
