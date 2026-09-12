import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Business } from '../models/Business.js';
import { Location } from '../models/Location.js';
import { Category } from '../models/Category.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'pmna_super_secret_jwt_key_perinthalmanna_2026', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Register a Customer
// @route   POST /api/auth/register
export const registerCustomer = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'customer',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Register a Business
// @route   POST /api/auth/business/register
export const registerBusiness = async (req, res, next) => {
  try {
    const {
      name,
      ownerName,
      email,
      password,
      phone,
      categoryId,
      locationId,
      address,
      description,
      openingHours,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // Verify category and location exist
    const [category, location] = await Promise.all([
      Category.findById(categoryId),
      Location.findById(locationId),
    ]);

    if (!category || !location) {
      return res.status(400).json({ success: false, message: 'Invalid category or location selected' });
    }

    // Create user with business role
    const user = await User.create({
      name: ownerName,
      email,
      password,
      phone,
      role: 'business',
    });

    // Create business profile with 'pending' status
    const business = await Business.create({
      userId: user._id,
      name,
      ownerName,
      phone,
      email,
      categoryId,
      locationId,
      address,
      description: description || '',
      openingHours: openingHours || '9:30 AM - 9:00 PM',
      status: 'pending',
      isVerified: false,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      message: 'Business registered successfully! Your account is pending admin approval.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      business: {
        id: business._id,
        name: business.name,
        status: business.status,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login User (Customer, Business, or Admin)
// @route   POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    let businessData = null;
    if (user.role === 'business') {
      businessData = await Business.findOne({ userId: user._id })
        .populate('categoryId', 'name')
        .populate('locationId', 'name');
    }

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      business: businessData,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Current Logged in User Profile
// @route   GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let business = null;

    if (user.role === 'business') {
      business = await Business.findOne({ userId: user._id })
        .populate('categoryId', 'name')
        .populate('locationId', 'name');
    }

    res.status(200).json({
      success: true,
      user,
      business,
    });
  } catch (err) {
    next(err);
  }
};
