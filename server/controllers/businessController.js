import mongoose from 'mongoose';
import { Business } from '../models/Business.js';
import { Offer } from '../models/Offer.js';
import { Location } from '../models/Location.js';
import { Category } from '../models/Category.js';

// @desc    Get all approved businesses with filters & active offer counts
// @route   GET /api/businesses
export const getBusinesses = async (req, res, next) => {
  try {
    const { location, category, search, page = 1, limit = 12 } = req.query;
    const query = { status: 'approved' };

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

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Business.countDocuments(query);

    const businesses = await Business.find(query)
      .populate('categoryId', 'name icon isFoodRelated')
      .populate('locationId', 'name district')
      .sort({ isVerified: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Attach active offers count for each business
    const now = new Date();
    const businessesWithCounts = await Promise.all(
      businesses.map(async (b) => {
        const activeOffersCount = await Offer.countDocuments({
          businessId: b._id,
          status: 'active',
          endDate: { $gte: now },
        });
        return { ...b, activeOffersCount };
      })
    );

    res.status(200).json({
      success: true,
      count: businessesWithCounts.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: businessesWithCounts,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single business by ID + active offers
// @route   GET /api/businesses/:id
export const getBusinessById = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id)
      .populate('categoryId', 'name icon isFoodRelated')
      .populate('locationId', 'name district');

    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    // Increment view count
    business.viewsCount += 1;
    await business.save();

    // Fetch active offers
    const now = new Date();
    const offers = await Offer.find({
      businessId: business._id,
      status: 'active',
      endDate: { $gte: now },
    }).populate('categoryId', 'name').sort({ discountPercentage: -1 });

    res.status(200).json({
      success: true,
      data: {
        ...business.toObject(),
        offers,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current business profile for authenticated merchant
// @route   GET /api/businesses/me
export const getMyBusiness = async (req, res, next) => {
  try {
    const business = await Business.findOne({ userId: req.user.id })
      .populate('categoryId', 'name')
      .populate('locationId', 'name');

    if (!business) {
      return res.status(404).json({ success: false, message: 'No business profile associated with this account' });
    }

    res.status(200).json({ success: true, data: business });
  } catch (err) {
    next(err);
  }
};

// @desc    Update current business profile
// @route   PUT /api/businesses/me
export const updateMyBusiness = async (req, res, next) => {
  try {
    const updates = req.body;
    // Disallow overriding status or verification directly
    delete updates.status;
    delete updates.isVerified;
    delete updates.userId;

    const business = await Business.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate('categoryId', 'name')
      .populate('locationId', 'name');

    if (!business) {
      return res.status(404).json({ success: false, message: 'Business profile not found' });
    }

    res.status(200).json({ success: true, data: business });
  } catch (err) {
    next(err);
  }
};

// @desc    Get business dashboard analytics/stats
// @route   GET /api/businesses/stats
export const getBusinessStats = async (req, res, next) => {
  try {
    const business = await Business.findOne({ userId: req.user.id });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    const now = new Date();
    const [activeOffers, expiredOffers, totalOffers] = await Promise.all([
      Offer.countDocuments({ businessId: business._id, status: 'active', endDate: { $gte: now } }),
      Offer.countDocuments({
        businessId: business._id,
        $or: [{ status: 'expired' }, { endDate: { $lt: now } }],
      }),
      Offer.countDocuments({ businessId: business._id }),
    ]);

    // Aggregate total views across all business offers
    const offerViews = await Offer.aggregate([
      { $match: { businessId: business._id } },
      { $group: { _id: null, totalViews: { $sum: '$viewsCount' } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        activeOffers,
        expiredOffers,
        totalOffers,
        profileViews: business.viewsCount,
        offerViews: offerViews[0]?.totalViews || 0,
        status: business.status,
        isVerified: business.isVerified,
      },
    });
  } catch (err) {
    next(err);
  }
};
