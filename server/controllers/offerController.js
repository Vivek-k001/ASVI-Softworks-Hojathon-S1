import mongoose from 'mongoose';
import { Offer } from '../models/Offer.js';
import { Business } from '../models/Business.js';
import { Location } from '../models/Location.js';
import { Category } from '../models/Category.js';

// @desc    Get all active offers with filters and search
// @route   GET /api/offers
export const getOffers = async (req, res, next) => {
  try {
    const {
      location,
      category,
      offerType,
      minPrice,
      maxPrice,
      minDiscount,
      endingSoon,
      search,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    const now = new Date();
    const query = { status: 'active', endDate: { $gte: now } };

    if (location && location !== 'all') {
      if (mongoose.Types.ObjectId.isValid(location) && location.length === 24) {
        query.locationId = location;
      } else {
        const locDoc = await Location.findOne({
          $or: [
            { slug: location.toLowerCase() },
            { name: { $regex: new RegExp(`^${location}$`, 'i') } },
          ],
        });
        if (locDoc) {
          query.locationId = locDoc._id;
        }
      }
    }

    if (category && category !== 'all') {
      if (mongoose.Types.ObjectId.isValid(category) && category.length === 24) {
        query.categoryId = category;
      } else {
        const catDoc = await Category.findOne({
          $or: [
            { slug: category.toLowerCase() },
            { name: { $regex: new RegExp(`^${category}$`, 'i') } },
          ],
        });
        if (catDoc) {
          query.categoryId = catDoc._id;
        }
      }
    }

    if (offerType && offerType !== 'all') {
      query.offerType = offerType;
    }

    if (minPrice || maxPrice) {
      query.offerPrice = {};
      if (minPrice) query.offerPrice.$gte = Number(minPrice);
      if (maxPrice) query.offerPrice.$lte = Number(maxPrice);
    }

    if (minDiscount) {
      query.discountPercentage = { $gte: Number(minDiscount) };
    }

    if (endingSoon === 'true') {
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      query.endDate = { $gte: now, $lte: endOfDay };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Sorting
    let sortObj = { createdAt: -1 };
    if (sort === 'discount') sortObj = { discountPercentage: -1 };
    if (sort === 'popular') sortObj = { viewsCount: -1 };
    if (sort === 'priceAsc') sortObj = { offerPrice: 1 };
    if (sort === 'priceDesc') sortObj = { offerPrice: -1 };
    if (sort === 'endingSoon') sortObj = { endDate: 1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Offer.countDocuments(query);

    const offers = await Offer.find(query)
      .populate({
        path: 'businessId',
        select: 'name isVerified logoUrl phone address status',
        match: { status: 'approved' },
      })
      .populate('categoryId', 'name icon isFoodRelated')
      .populate('locationId', 'name district')
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Filter out offers where business is not approved
    const validOffers = offers.filter((o) => o.businessId !== null);

    res.status(200).json({
      success: true,
      count: validOffers.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: validOffers,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single offer details by ID
// @route   GET /api/offers/:id
export const getOfferById = async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.id)
      .populate('businessId', 'name isVerified logoUrl coverUrl phone email address openingHours description')
      .populate('categoryId', 'name icon')
      .populate('locationId', 'name district');

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    // Increment view count
    offer.viewsCount += 1;
    await offer.save();

    res.status(200).json({ success: true, data: offer });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new offer (Business only)
// @route   POST /api/offers
export const createOffer = async (req, res, next) => {
  try {
    const business = await Business.findOne({ userId: req.user.id });
    if (!business) {
      return res.status(403).json({ success: false, message: 'You must have an active business profile to create offers' });
    }

    if (business.status !== 'approved' && process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Your business profile is pending admin approval. You can create offers once approved.',
      });
    }

    const {
      title,
      description,
      categoryId,
      locationId,
      offerType,
      originalPrice,
      offerPrice,
      imageUrl,
      startDate,
      endDate,
      startTime,
      endTime,
      terms,
    } = req.body;

    // Validation: prices
    if (originalPrice && Number(offerPrice) > Number(originalPrice)) {
      return res.status(400).json({
        success: false,
        message: 'Offer price cannot be greater than the original price.',
      });
    }

    // Validation: dates
    const start = new Date(startDate || Date.now());
    const end = new Date(endDate);
    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'Offer end date must be after start date.',
      });
    }

    // Auto-compute discount %
    let discountPercentage = 0;
    if (originalPrice && Number(originalPrice) > 0) {
      discountPercentage = Math.round(((Number(originalPrice) - Number(offerPrice)) / Number(originalPrice)) * 100);
    }

    const offer = await Offer.create({
      businessId: business._id,
      title,
      description,
      categoryId: categoryId || business.categoryId,
      locationId: locationId || business.locationId,
      offerType: offerType || 'percentage',
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      offerPrice: Number(offerPrice),
      discountPercentage,
      imageUrl: imageUrl || business.coverUrl || '',
      startDate: start,
      endDate: end,
      startTime: startTime || '',
      endTime: endTime || '',
      terms: terms || 'Valid while stocks last. Standard terms apply.',
      status: 'active',
    });

    res.status(201).json({ success: true, data: offer });
  } catch (err) {
    next(err);
  }
};

// @desc    Get offers belonging to logged in business
// @route   GET /api/offers/my-offers
export const getMyOffers = async (req, res, next) => {
  try {
    const business = await Business.findOne({ userId: req.user.id });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    const offers = await Offer.find({ businessId: business._id })
      .populate('categoryId', 'name')
      .populate('locationId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: offers.length, data: offers });
  } catch (err) {
    next(err);
  }
};

// @desc    Update an offer (Business only)
// @route   PUT /api/offers/:id
export const updateOffer = async (req, res, next) => {
  try {
    const business = await Business.findOne({ userId: req.user.id });
    let offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    // Ensure offer belongs to this business
    if (offer.businessId.toString() !== business._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this offer' });
    }

    const updates = req.body;
    if (updates.originalPrice && updates.offerPrice) {
      if (Number(updates.offerPrice) > Number(updates.originalPrice)) {
        return res.status(400).json({ success: false, message: 'Offer price cannot be greater than original price.' });
      }
      updates.discountPercentage = Math.round(
        ((Number(updates.originalPrice) - Number(updates.offerPrice)) / Number(updates.originalPrice)) * 100
      );
    }

    offer = await Offer.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });

    res.status(200).json({ success: true, data: offer });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle offer status (pause / activate)
// @route   PATCH /api/offers/:id/status
export const toggleOfferStatus = async (req, res, next) => {
  try {
    const business = await Business.findOne({ userId: req.user.id });
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    if (offer.businessId.toString() !== business._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { status } = req.body;
    if (!['active', 'paused', 'expired'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    offer.status = status;
    await offer.save();

    res.status(200).json({ success: true, data: offer });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete an offer
// @route   DELETE /api/offers/:id
export const deleteOffer = async (req, res, next) => {
  try {
    const business = await Business.findOne({ userId: req.user.id });
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    if (offer.businessId.toString() !== business._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Offer.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Offer deleted successfully' });
  } catch (err) {
    next(err);
  }
};
