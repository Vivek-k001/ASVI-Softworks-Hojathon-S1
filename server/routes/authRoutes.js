import express from 'express';
import { registerCustomer, registerBusiness, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerCustomer);
router.post('/business/register', registerBusiness);
router.post('/login', login);
router.get('/me', protect, getMe);

export default router;
