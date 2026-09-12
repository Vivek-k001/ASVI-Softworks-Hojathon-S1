import express from 'express';
import {
  getOffers,
  getOfferById,
  createOffer,
  getMyOffers,
  updateOffer,
  toggleOfferStatus,
  deleteOffer,
} from '../controllers/offerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getOffers);
router.get('/my-offers', protect, authorize('business'), getMyOffers);
router.post('/', protect, authorize('business'), createOffer);
router.get('/:id', getOfferById);
router.put('/:id', protect, authorize('business', 'admin'), updateOffer);
router.patch('/:id/status', protect, authorize('business', 'admin'), toggleOfferStatus);
router.delete('/:id', protect, authorize('business', 'admin'), deleteOffer);

export default router;
