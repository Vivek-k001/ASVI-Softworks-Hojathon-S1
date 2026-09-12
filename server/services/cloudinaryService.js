import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
    api_key: process.env.CLOUDINARY_API_KEY.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
    secure: true,
  });
}

/**
 * Upload a buffer directly to Cloudinary
 * @param {Buffer} buffer - File buffer from multer
 * @param {String} folder - Cloudinary destination folder
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
export const uploadImageToCloudinary = async (buffer, folder = 'pmnaperks/showcases') => {
  const isConfigured = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

  if (!isConfigured) {
    console.warn('[Cloudinary] Missing credentials. Returning data URI fallback.');
    const base64 = buffer.toString('base64');
    return {
      secure_url: `data:image/jpeg;base64,${base64}`,
      public_id: `fallback_${Date.now()}`,
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
          { width: 1200, crop: 'limit' },
        ],
      },
      (error, result) => {
        if (error) {
          console.error('[Cloudinary Upload Error]:', error);
          reject(new Error(error.message || 'Cloudinary upload failed'));
        } else {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        }
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Delete an image from Cloudinary by public ID
 * @param {String} publicId
 */
export const deleteImageFromCloudinary = async (publicId) => {
  if (!publicId || publicId.startsWith('fallback_')) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn('[Cloudinary Destroy Error]:', err.message);
  }
};
