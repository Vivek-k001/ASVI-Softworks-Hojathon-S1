import { Report } from '../models/Report.js';

// @desc    Submit a report for an offer or business
// @route   POST /api/reports
export const createReport = async (req, res, next) => {
  try {
    const { targetType, targetId, reason, details, reporterName, reporterContact } = req.body;

    if (!targetType || !targetId || !reason || !details) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const report = await Report.create({
      targetType,
      targetId,
      reason,
      details,
      reporterName: reporterName || req.user?.name || 'Anonymous',
      reporterContact: reporterContact || req.user?.email || '',
      reportedBy: req.user?._id || undefined,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your report. Our community team will review it shortly.',
      data: report,
    });
  } catch (err) {
    next(err);
  }
};
