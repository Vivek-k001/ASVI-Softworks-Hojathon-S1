import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
    },
    paymentGateway: {
      type: String,
      default: 'Razorpay',
    },
    orderId: {
      type: String,
      required: true,
    },
    paymentId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['successful', 'failed', 'pending', 'refunded'],
      default: 'successful',
    },
    paymentMethod: {
      type: String,
      default: 'UPI', // 'UPI', 'UPI QR', 'Credit Card', 'Debit Card', 'Netbanking'
    },
    receiptNumber: {
      type: String,
      default: '',
    },
    billingPeriod: {
      startDate: Date,
      endDate: Date,
    },
  },
  { timestamps: true }
);

paymentSchema.index({ businessId: 1, createdAt: -1 });

export const Payment = mongoose.model('Payment', paymentSchema);
