import express from 'express';
import {
  getBusinesses,
  getBusinessById,
  getMyBusiness,
  updateMyBusiness,
  getBusinessStats,
} from '../controllers/businessController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getBusinesses);
router.get('/me', protect, authorize('business'), getMyBusiness);
router.put('/me', protect, authorize('business'), updateMyBusiness);
router.get('/stats', protect, authorize('business'), getBusinessStats);
router.get('/:id', getBusinessById);

export default router;
