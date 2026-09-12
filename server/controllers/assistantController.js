import { processChatMessage } from '../services/geminiService.js';

// @desc    Process natural language discovery query via PMNA Gemini Assistant
// @route   POST /api/assistant/chat
export const chatWithAssistant = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please provide a message' });
    }

    const response = await processChatMessage(message.trim());

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (err) {
    next(err);
  }
};
