import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { seedDatabase } from './seed/seedRunner.js';
import { Business } from './models/Business.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import businessRoutes from './routes/businessRoutes.js';
import offerRoutes from './routes/offerRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import assistantRoutes from './routes/assistantRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import showcaseRoutes from './routes/showcaseRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure local uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files
app.use('/uploads', express.static(uploadsDir));

// Healthcheck
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'PMNA - Hyperlocal Offers & Discovery Platform',
    locations: ['Perinthalmanna', 'Angadipuram'],
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/showcases', showcaseRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/upload', uploadRoutes);

// Error Handler Middleware
app.use(errorHandler);

// Connect DB & Start Server
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is brand new/empty
    const count = await Business.countDocuments();
    if (count === 0) {
      console.log('[Server] Database is empty. Auto-seeding initial PMNA data...');
      await seedDatabase();
    }

    app.listen(PORT, () => {
      console.log(`[PMNA Server] Running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[Server Error] Failed to start:', err);
    process.exit(1);
  }
};

startServer();
