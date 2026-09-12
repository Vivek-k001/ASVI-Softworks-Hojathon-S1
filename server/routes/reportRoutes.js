import express from 'express';
import { createReport } from '../controllers/reportController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', optionalAuth, createReport);

export default router;
