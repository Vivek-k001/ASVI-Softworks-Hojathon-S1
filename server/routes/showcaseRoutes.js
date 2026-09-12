import express from 'express';
import {
  getPublicShowcases,
  getMyShowcase,
  upsertMyShowcase,
  toggleMyShowcase,
} from '../controllers/showcaseController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public route for Home Screen Daily Deals & Offers
router.get('/public', getPublicShowcases);

// Protected Merchant routes
router.get('/me', protect, authorize('business'), getMyShowcase);
router.post('/me', protect, authorize('business'), upsertMyShowcase);
router.put('/me', protect, authorize('business'), upsertMyShowcase);
router.patch('/me/toggle', protect, authorize('business'), toggleMyShowcase);

export default router;
