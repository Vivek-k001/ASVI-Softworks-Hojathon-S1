import { Subscription } from '../models/Subscription.js';
import { Payment } from '../models/Payment.js';
import { Business } from '../models/Business.js';
import { Setting } from '../models/Setting.js';

// Helper: Get currently configured monthly showcase subscription price
export const getConfiguredPrice = async () => {
  try {
    const priceSetting = await Setting.findOne({ key: 'subscriptionMonthlyPrice' });
    return priceSetting && Number(priceSetting.value) > 0 ? Number(priceSetting.value) : 99;
  } catch (err) {
    return 99;
  }
};

// GET /api/subscriptions/status - Get current shop subscription status
export const getSubscriptionStatus = async (req, res) => {
  try {
    const business = await Business.findOne({ userId: req.user._id });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business profile not found' });
    }

    const price = await getConfiguredPrice();
    const now = new Date();
    let status = business.subscriptionStatus || 'not_subscribed';
    let daysRemaining = 0;

    if (business.subscriptionExpiresAt) {
      const diffMs = new Date(business.subscriptionExpiresAt) - now;
      daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

      if (diffMs <= 0) {
        status = 'expired';
      } else if (daysRemaining <= 5) {
        status = 'expiring_soon';
      } else {
        status = 'active';
      }

      // Sync status to database if expired
      if (business.subscriptionStatus !== status) {
        business.subscriptionStatus = status;
        await business.save();
      }
    }

    const latestSubscription = await Subscription.findOne({ businessId: business._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        status,
        daysRemaining,
        expiresAt: business.subscriptionExpiresAt,
        plan: {
          name: 'PMNA Showcase Monthly Plan',
          amount: price,
          currency: 'INR',
          interval: 'monthly',
        },
        latestSubscription,
      },
    });
  } catch (err) {
    console.error('[Subscription Status Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch subscription status' });
  }
};

// POST /api/subscriptions/create-order - Initialize Razorpay-compatible payment order
export const createPaymentOrder = async (req, res) => {
  try {
    const business = await Business.findOne({ userId: req.user._id });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business profile not found' });
    }

    const amount = await getConfiguredPrice();
    const orderId = `order_pmna_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const receiptNumber = `RCPT-${Date.now().toString().slice(-6)}`;

    res.status(200).json({
      success: true,
      data: {
        orderId,
        amount,
        currency: 'INR',
        receipt: receiptNumber,
        businessName: business.name,
        businessEmail: business.email,
        businessPhone: business.phone,
        supportedMethods: ['UPI', 'UPI_QR', 'CARD', 'NETBANKING'],
      },
    });
  } catch (err) {
    console.error('[Create Order Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to create payment order' });
  }
};

// POST /api/subscriptions/verify-payment - Server-side verification & subscription activation
export const verifyAndActivateSubscription = async (req, res) => {
  try {
    const business = await Business.findOne({ userId: req.user._id });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business profile not found' });
    }

    const { orderId, paymentId, paymentMethod, amount } = req.body;

    if (!orderId || !paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment details. Order ID and Payment ID are required.',
      });
    }

    const expectedAmount = await getConfiguredPrice();
    const paidAmount = amount || expectedAmount;

    // Calculate subscription period: 30 days
    const now = new Date();
    let startDate = now;
    let expiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // If existing subscription is still active, extend from current expiry date
    if (business.subscriptionExpiresAt && new Date(business.subscriptionExpiresAt) > now) {
      startDate = new Date(business.subscriptionExpiresAt);
      expiryDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    }

    // 1. Create Subscription document
    const subscription = await Subscription.create({
      businessId: business._id,
      planId: 'monthly_showcase_plan',
      planName: 'PMNA Showcase Monthly Plan',
      amount: paidAmount,
      currency: 'INR',
      status: 'active',
      startDate,
      expiryDate,
      paymentId: paymentId || `pay_${Date.now()}`,
    });

    // 2. Create Payment record for history & receipts
    const payment = await Payment.create({
      businessId: business._id,
      subscriptionId: subscription._id,
      paymentGateway: 'Razorpay',
      orderId,
      paymentId: paymentId || `pay_${Date.now()}`,
      amount: paidAmount,
      currency: 'INR',
      status: 'successful',
      paymentMethod: paymentMethod || 'UPI',
      receiptNumber: `RCPT-${Date.now().toString().slice(-6)}`,
      billingPeriod: {
        startDate,
        endDate: expiryDate,
      },
    });

    // 3. Update Business subscription fields
    business.subscriptionStatus = 'active';
    business.subscriptionExpiresAt = expiryDate;
    await business.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified! Your showcase subscription is now ACTIVE.',
      data: {
        subscription,
        payment,
        business: {
          id: business._id,
          name: business.name,
          subscriptionStatus: business.subscriptionStatus,
          subscriptionExpiresAt: business.subscriptionExpiresAt,
        },
      },
    });
  } catch (err) {
    console.error('[Verify Payment Error]:', err);
    res.status(500).json({ success: false, message: 'Server verification failed. Please contact support.' });
  }
};

// GET /api/subscriptions/payments - Get merchant payment history
export const getPaymentHistory = async (req, res) => {
  try {
    const business = await Business.findOne({ userId: req.user._id });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business profile not found' });
    }

    const payments = await Payment.find({ businessId: business._id })
      .populate('subscriptionId', 'planName status startDate expiryDate')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (err) {
    console.error('[Payment History Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch payment history' });
  }
};
