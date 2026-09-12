import express from 'express';
import {
  getSubscriptionStatus,
  createPaymentOrder,
  verifyAndActivateSubscription,
  getPaymentHistory,
} from '../controllers/subscriptionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Merchant routes for subscriptions
router.get('/status', protect, authorize('business'), getSubscriptionStatus);
router.post('/create-order', protect, authorize('business'), createPaymentOrder);
router.post('/verify-payment', protect, authorize('business'), verifyAndActivateSubscription);
router.get('/payments', protect, authorize('business'), getPaymentHistory);

export default router;
