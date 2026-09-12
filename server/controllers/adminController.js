import { User } from '../models/User.js';
import { Business } from '../models/Business.js';
import { Offer } from '../models/Offer.js';
import { Report } from '../models/Report.js';
import { Category } from '../models/Category.js';
import { Location } from '../models/Location.js';
import { Subscription } from '../models/Subscription.js';
import { Payment } from '../models/Payment.js';
import { Setting } from '../models/Setting.js';
import { Showcase } from '../models/Showcase.js';

// @desc    Get admin overview statistics
// @route   GET /api/admin/stats
export const getAdminStats = async (req, res, next) => {
  try {
    const now = new Date();
    const [
      totalBusinesses,
      pendingBusinesses,
      activeOffers,
      pendingOffers,
      totalUsers,
      pendingReports,
    ] = await Promise.all([
      Business.countDocuments(),
      Business.countDocuments({ status: 'pending' }),
      Offer.countDocuments({ status: 'active', endDate: { $gte: now } }),
      Offer.countDocuments({ status: 'pending' }),
      User.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalBusinesses,
        pendingBusinesses,
        activeOffers,
        pendingOffers,
        totalUsers,
        pendingReports,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all businesses for admin
// @route   GET /api/admin/businesses
export const getAdminBusinesses = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;

    const businesses = await Business.find(query)
      .populate('categoryId', 'name')
      .populate('locationId', 'name')
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: businesses.length, data: businesses });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve / Reject / Suspend a business
// @route   PATCH /api/admin/businesses/:id/status
export const updateBusinessStatus = async (req, res, next) => {
  try {
    const { status, isVerified } = req.body;
    const updateData = {};

    if (status) updateData.status = status;
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (status === 'approved') updateData.isVerified = true;

    const business = await Business.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true })
      .populate('categoryId', 'name')
      .populate('locationId', 'name');

    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    res.status(200).json({ success: true, data: business });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all offers for admin
// @route   GET /api/admin/offers
export const getAdminOffers = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;

    const offers = await Offer.find(query)
      .populate('businessId', 'name isVerified phone address')
      .populate('categoryId', 'name')
      .populate('locationId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: offers.length, data: offers });
  } catch (err) {
    next(err);
  }
};

// @desc    Update offer status (approve, reject, remove)
// @route   PATCH /api/admin/offers/:id/status
export const updateOfferStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const offer = await Offer.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true })
      .populate('businessId', 'name')
      .populate('categoryId', 'name')
      .populate('locationId', 'name');

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    res.status(200).json({ success: true, data: offer });
  } catch (err) {
    next(err);
  }
};

// @desc    Get customer reports
// @route   GET /api/admin/reports
export const getAdminReports = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;

    const reports = await Report.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reports.length, data: reports });
  } catch (err) {
    next(err);
  }
};

// @desc    Update report status (reviewed, resolved)
// @route   PATCH /api/admin/reports/:id
export const updateReportStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { $set: { status, adminNotes } },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.status(200).json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin category management
// @route   POST /api/admin/categories
export const createCategory = async (req, res, next) => {
  try {
    const { name, icon, description, isFoodRelated, displayOrder } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const category = await Category.create({ name, slug, icon, description, isFoodRelated, displayOrder });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin location management
// @route   POST /api/admin/locations
export const createLocation = async (req, res, next) => {
  try {
    const { name, district, state, pincode } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const location = await Location.create({ name, slug, district, state, pincode });
    res.status(201).json({ success: true, data: location });
  } catch (err) {
    next(err);
  }
};

// @desc    Get subscription metrics, pricing, subscribed shops, and transaction logs
// @route   GET /api/admin/subscriptions/overview
export const getAdminSubscriptionsOverview = async (req, res, next) => {
  try {
    const now = new Date();

    // Get current price
    const priceSetting = await Setting.findOne({ key: 'subscriptionMonthlyPrice' });
    const currentPrice = priceSetting && Number(priceSetting.value) > 0 ? Number(priceSetting.value) : 99;

    // Stats
    const [
      activeSubscribedCount,
      expiredSubscribedCount,
      payments,
      businesses,
    ] = await Promise.all([
      Business.countDocuments({
        subscriptionStatus: 'active',
        subscriptionExpiresAt: { $gt: now },
      }),
      Business.countDocuments({
        $or: [
          { subscriptionStatus: 'expired' },
          { subscriptionStatus: 'active', subscriptionExpiresAt: { $lte: now } },
        ],
      }),
      Payment.find({ status: 'successful' }).populate('businessId', 'name email phone').sort({ createdAt: -1 }),
      Business.find()
        .select('name email phone subscriptionStatus subscriptionExpiresAt isVerified createdAt')
        .populate('categoryId', 'name')
        .populate('locationId', 'name')
        .sort({ subscriptionExpiresAt: -1 }),
    ]);

    const totalRevenue = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyRevenue = payments
      .filter((p) => new Date(p.createdAt) >= startOfMonth)
      .reduce((acc, p) => acc + (p.amount || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        currentPrice,
        metrics: {
          activeSubscribedCount,
          expiredSubscribedCount,
          totalRevenue,
          monthlyRevenue,
          totalTransactions: payments.length,
        },
        businesses,
        recentPayments: payments.slice(0, 50),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update showcase subscription monthly price
// @route   PUT /api/admin/subscriptions/price
export const updateSubscriptionPrice = async (req, res, next) => {
  try {
    const { price } = req.body;
    const numPrice = Number(price);
    if (!numPrice || numPrice <= 0) {
      return res.status(400).json({ success: false, message: 'Valid subscription price is required' });
    }

    const setting = await Setting.findOneAndUpdate(
      { key: 'subscriptionMonthlyPrice' },
      {
        key: 'subscriptionMonthlyPrice',
        value: numPrice,
        description: 'Monthly showcase promotional space subscription fee in INR',
        updatedBy: req.user._id,
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: `Promotional showcase subscription price updated to ₹${numPrice}/month`,
      data: { price: Number(setting.value) },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all showcases for admin moderation
// @route   GET /api/admin/showcases
export const getAdminShowcases = async (req, res, next) => {
  try {
    const showcases = await Showcase.find()
      .populate('businessId', 'name phone email subscriptionStatus subscriptionExpiresAt')
      .populate('targetOfferId', 'title discount')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, count: showcases.length, data: showcases });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle showcase admin moderation (enable/disable inappropriate ads)
// @route   PATCH /api/admin/showcases/:id/toggle
export const toggleAdminShowcase = async (req, res, next) => {
  try {
    const showcase = await Showcase.findById(req.params.id).populate('businessId', 'name');
    if (!showcase) {
      return res.status(404).json({ success: false, message: 'Showcase ad space not found' });
    }

    showcase.adminDisabled = !showcase.adminDisabled;
    await showcase.save();

    res.status(200).json({
      success: true,
      message: showcase.adminDisabled
        ? `Showcase ad for "${showcase.businessId?.name}" has been disabled by Admin.`
        : `Showcase ad for "${showcase.businessId?.name}" is now enabled.`,
      data: showcase,
    });
  } catch (err) {
    next(err);
  }
};
