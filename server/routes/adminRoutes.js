import express from 'express';
import {
  getAdminStats,
  getAdminBusinesses,
  updateBusinessStatus,
  getAdminOffers,
  updateOfferStatus,
  getAdminReports,
  updateReportStatus,
  createCategory,
  createLocation,
  getAdminSubscriptionsOverview,
  updateSubscriptionPrice,
  getAdminShowcases,
  toggleAdminShowcase,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Admin protection for all routes
router.use(protect, authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/businesses', getAdminBusinesses);
router.patch('/businesses/:id/status', updateBusinessStatus);
router.get('/offers', getAdminOffers);
router.patch('/offers/:id/status', updateOfferStatus);
router.get('/reports', getAdminReports);
router.patch('/reports/:id', updateReportStatus);
router.post('/categories', createCategory);
router.post('/locations', createLocation);

// Showcase & Subscription admin routes
router.get('/subscriptions/overview', getAdminSubscriptionsOverview);
router.put('/subscriptions/price', updateSubscriptionPrice);
router.get('/showcases', getAdminShowcases);
router.patch('/showcases/:id/toggle', toggleAdminShowcase);

export default router;
