import { Location } from '../models/Location.js';

// @desc    Get all active locations
// @route   GET /api/locations
export const getLocations = async (req, res, next) => {
  try {
    const locations = await Location.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ success: true, count: locations.length, data: locations });
  } catch (err) {
    next(err);
  }
};
