import { Showcase } from '../models/Showcase.js';
import { Business } from '../models/Business.js';
import { deleteImageFromCloudinary } from '../services/cloudinaryService.js';

// GET /api/showcases/public - Get all active showcases from subscribed shops for Home Screen
export const getPublicShowcases = async (req, res) => {
  try {
    const now = new Date();
    const { location } = req.query;

    // Find active showcases that are not expired and not disabled by admin
    const showcases = await Showcase.find({
      isActive: true,
      adminDisabled: false,
      expiryDate: { $gte: now },
    })
      .populate({
        path: 'businessId',
        select: 'name logoUrl coverUrl phone address locationId isVerified subscriptionStatus subscriptionExpiresAt description',
        populate: {
          path: 'locationId',
          select: 'name slug',
        },
      })
      .populate('targetOfferId', 'title offerPrice originalPrice discountPercentage endDate')
      .sort({ updatedAt: -1 });

    // Strictly filter out businesses that are NOT currently subscribed or whose subscription has expired!
    const activeSubscribedShowcases = showcases.filter((sc) => {
      const biz = sc.businessId;
      if (!biz) return false;
      const isSubscribed = biz.subscriptionStatus === 'active';
      const notExpired = biz.subscriptionExpiresAt && new Date(biz.subscriptionExpiresAt) >= now;
      return isSubscribed && notExpired;
    });

    // Filter by location if specified
    const filteredShowcases = location && location !== 'all'
      ? activeSubscribedShowcases.filter((sc) => {
          const loc = sc.businessId?.locationId;
          return loc?._id?.toString() === location || loc?.slug === location;
        })
      : activeSubscribedShowcases;

    res.status(200).json({
      success: true,
      count: filteredShowcases.length,
      data: filteredShowcases,
    });
  } catch (err) {
    console.error('[Get Public Showcases Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch showcases' });
  }
};

// GET /api/showcases/me - Get current shopkeeper's showcase & subscription status
export const getMyShowcase = async (req, res) => {
  try {
    const business = await Business.findOne({ userId: req.user._id })
      .populate('locationId', 'name slug')
      .populate('categoryId', 'name slug');

    if (!business) {
      return res.status(404).json({ success: false, message: 'Business profile not found' });
    }

    const showcase = await Showcase.findOne({ businessId: business._id });

    // Calculate subscription status dynamically
    const now = new Date();
    let computedStatus = business.subscriptionStatus || 'not_subscribed';
    let daysRemaining = 0;

    if (business.subscriptionExpiresAt) {
      const diffMs = new Date(business.subscriptionExpiresAt) - now;
      daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

      if (diffMs <= 0) {
        computedStatus = 'expired';
      } else if (daysRemaining <= 5) {
        computedStatus = 'expiring_soon';
      } else {
        computedStatus = 'active';
      }
    } else {
      computedStatus = 'not_subscribed';
    }

    res.status(200).json({
      success: true,
      data: {
        business,
        showcase,
        subscription: {
          status: computedStatus,
          expiresAt: business.subscriptionExpiresAt,
          daysRemaining,
        },
      },
    });
  } catch (err) {
    console.error('[Get My Showcase Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch your showcase' });
  }
};

// POST /api/showcases/me - Create or update shop showcase
export const upsertMyShowcase = async (req, res) => {
  try {
    const business = await Business.findOne({ userId: req.user._id });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business profile not found' });
    }

    const {
      title,
      description,
      imageUrl,
      cloudinaryPublicId,
      discount,
      startDate,
      expiryDate,
      targetOfferId,
      isActive,
    } = req.body;

    if (!title || !description || !imageUrl || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Title, Description, Promotional Image, and Expiry Date.',
      });
    }

    let showcase = await Showcase.findOne({ businessId: business._id });

    if (showcase) {
      // If replacing image, delete previous from Cloudinary if exists
      if (cloudinaryPublicId && showcase.cloudinaryPublicId && showcase.cloudinaryPublicId !== cloudinaryPublicId) {
        await deleteImageFromCloudinary(showcase.cloudinaryPublicId);
      }

      showcase.title = title;
      showcase.description = description;
      showcase.imageUrl = imageUrl;
      if (cloudinaryPublicId) showcase.cloudinaryPublicId = cloudinaryPublicId;
      showcase.discount = discount || '';
      if (startDate) showcase.startDate = startDate;
      showcase.expiryDate = expiryDate;
      if (targetOfferId !== undefined) showcase.targetOfferId = targetOfferId || null;
      if (isActive !== undefined) showcase.isActive = isActive;

      await showcase.save();
    } else {
      showcase = await Showcase.create({
        businessId: business._id,
        title,
        description,
        imageUrl,
        cloudinaryPublicId: cloudinaryPublicId || '',
        discount: discount || '',
        startDate: startDate || new Date(),
        expiryDate,
        targetOfferId: targetOfferId || null,
        isActive: isActive !== undefined ? isActive : true,
      });

      business.activeShowcaseId = showcase._id;
      await business.save();
    }

    res.status(200).json({
      success: true,
      message: 'Showcase saved successfully!',
      data: showcase,
    });
  } catch (err) {
    console.error('[Upsert Showcase Error]:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to save showcase' });
  }
};

// PATCH /api/showcases/me/toggle - Toggle showcase active/inactive
export const toggleMyShowcase = async (req, res) => {
  try {
    const business = await Business.findOne({ userId: req.user._id });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business profile not found' });
    }

    const showcase = await Showcase.findOne({ businessId: business._id });
    if (!showcase) {
      return res.status(404).json({ success: false, message: 'Showcase not found. Create one first.' });
    }

    showcase.isActive = !showcase.isActive;
    await showcase.save();

    res.status(200).json({
      success: true,
      message: `Showcase ${showcase.isActive ? 'activated' : 'deactivated'} successfully!`,
      data: showcase,
    });
  } catch (err) {
    console.error('[Toggle Showcase Error]:', err);
    res.status(500).json({ success: false, message: 'Failed to toggle showcase state' });
  }
};
