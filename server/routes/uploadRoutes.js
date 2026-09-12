import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { protect, authorize } from '../middleware/auth.js';
import { uploadImageToCloudinary } from '../services/cloudinaryService.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../uploads');

// Ensure uploads folder exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer in-memory storage config
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image format. Allowed formats: JPEG, PNG, WEBP, GIF.'));
    }
  },
});

/**
 * Upload helper that attempts Cloudinary first, falling back to local disk storage
 */
const processImageUpload = async (req, file, folder = 'pmnaperks/general') => {
  try {
    // Attempt Cloudinary
    const cloudinaryResult = await uploadImageToCloudinary(file.buffer, folder);
    if (cloudinaryResult && cloudinaryResult.secure_url && !cloudinaryResult.secure_url.startsWith('data:image')) {
      return {
        url: cloudinaryResult.secure_url,
        imageUrl: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id,
        storage: 'cloudinary',
      };
    }
  } catch (cloudErr) {
    console.warn('[Upload] Cloudinary upload notice:', cloudErr.message);
  }

  // Fallback: Local disk storage
  const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const filePath = path.join(uploadsDir, filename);

  await fs.promises.writeFile(filePath, file.buffer);

  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const localUrl = `${baseUrl}/uploads/${filename}`;

  return {
    url: localUrl,
    imageUrl: localUrl,
    publicId: filename,
    storage: 'local',
  };
};

// Middleware to handle multer file error gracefully
const handleUpload = (fieldName = 'image') => (req, res, next) => {
  const single = upload.single(fieldName);
  single(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'Image size exceeds 5MB limit.' });
      }
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// 1. POST /api/upload/offer - Upload promotional offer image
router.post(
  '/offer',
  protect,
  authorize('business', 'admin'),
  handleUpload('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please select an image file to upload.' });
      }

      const result = await processImageUpload(req, req.file, 'pmnaperks/offers');

      res.status(200).json({
        success: true,
        message: 'Offer promotion image uploaded successfully!',
        data: result,
      });
    } catch (err) {
      console.error('[Upload Route /offer Error]:', err);
      res.status(500).json({ success: false, message: err.message || 'Image upload failed.' });
    }
  }
);

// 2. POST /api/upload/business - Upload store logo or cover photo
router.post(
  '/business',
  protect,
  authorize('business', 'admin'),
  handleUpload('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please select an image file to upload.' });
      }

      const result = await processImageUpload(req, req.file, 'pmnaperks/businesses');

      res.status(200).json({
        success: true,
        message: 'Business photo uploaded successfully!',
        data: result,
      });
    } catch (err) {
      console.error('[Upload Route /business Error]:', err);
      res.status(500).json({ success: false, message: err.message || 'Image upload failed.' });
    }
  }
);

// 3. POST /api/upload/showcase - Upload promotional showcase banner
router.post(
  '/showcase',
  protect,
  authorize('business', 'admin'),
  handleUpload('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please select an image file to upload.' });
      }

      const result = await processImageUpload(req, req.file, 'pmnaperks/showcases');

      res.status(200).json({
        success: true,
        message: 'Promotional banner uploaded successfully!',
        data: result,
      });
    } catch (err) {
      console.error('[Upload Route /showcase Error]:', err);
      res.status(500).json({ success: false, message: err.message || 'Image upload failed.' });
    }
  }
);

// 4. POST /api/upload - Generic image upload endpoint
router.post(
  '/',
  protect,
  handleUpload('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please select an image file to upload.' });
      }

      const result = await processImageUpload(req, req.file, 'pmnaperks/general');

      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully!',
        data: result,
      });
    } catch (err) {
      console.error('[Upload Route / Error]:', err);
      res.status(500).json({ success: false, message: err.message || 'Image upload failed.' });
    }
  }
);

export default router;
