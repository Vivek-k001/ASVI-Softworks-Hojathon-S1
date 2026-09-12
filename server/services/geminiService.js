import { GoogleGenerativeAI } from '@google/generative-ai';
import { Offer } from '../models/Offer.js';
import { Business } from '../models/Business.js';
import { Category } from '../models/Category.js';
import { Location } from '../models/Location.js';
import { queryPythonChatbot, needsGeminiAugmentation } from './pythonChatService.js';

const SYSTEM_INSTRUCTION = `You are PMNA Assistant, the official AI assistant for the PMNA local discovery platform serving Perinthalmanna and Angadipuram, Kerala.
Your job is to help users discover businesses, offers, food spots, and information that exists in the PMNA platform.
The supplied PMNA database context is the strict source of truth.
Never invent a business, offer, price, discount, address, phone number, opening hour, availability, or other factual information.
If the requested information is not present in the supplied PMNA context, clearly say that PMNA does not currently have that information.
When users ask for offers, refer strictly to the supplied database results.
Be concise, friendly, and community-oriented (Kerala tone).
When multiple results are available, highlight the best matches.
Never claim an offer is active unless the supplied data confirms it.
You are an assistant for PMNA, not a general-purpose chatbot.`;

// Fallback rule-based extractor when Gemini API Key is not set or rate-limited
const extractParametersFallback = (userMessage, categories, locations) => {
  const text = userMessage.toLowerCase();
  const params = {
    intent: 'SEARCH_OFFERS',
    location: null,
    category: null,
    maxPrice: null,
    minDiscount: null,
    endingSoon: false,
    isFood: false,
    searchTerm: '',
  };

  // Detect location
  for (const loc of locations) {
    if (text.includes(loc.name.toLowerCase()) || text.includes(loc.slug)) {
      params.location = loc.name;
      break;
    }
  }

  // Detect food keywords
  const foodKeywords = ['food', 'eat', 'restaurant', 'cafe', 'biriyani', 'shawarma', 'bakery', 'juice', 'snack', 'burger', 'pizza', 'tea'];
  if (foodKeywords.some((kw) => text.includes(kw))) {
    params.isFood = true;
    params.category = 'Restaurants';
  }

  // Detect specific categories
  for (const cat of categories) {
    if (text.includes(cat.name.toLowerCase()) || text.includes(cat.slug)) {
      params.category = cat.name;
      break;
    }
  }

  // Detect shoe/footwear
  if (text.includes('shoe') || text.includes('footwear') || text.includes('sandal') || text.includes('chappal')) {
    params.category = 'Footwear';
  }

  // Detect dress/clothing/fashion
  if (text.includes('dress') || text.includes('shirt') || text.includes('cloth') || text.includes('fashion') || text.includes('saree')) {
    params.category = 'Fashion';
  }

  // Detect price: "under 200", "below 500", "< 300", "under ₹200"
  const priceMatch = text.match(/(?:under|below|less than|within|<=?|₹|\brs\.?)\s*(\d+)/i);
  if (priceMatch && priceMatch[1]) {
    params.maxPrice = parseInt(priceMatch[1], 10);
  }

  // Detect discount: "30% off", "above 40%"
  const discountMatch = text.match(/(\d+)\s*%\s*(?:off|discount)?/i);
  if (discountMatch && discountMatch[1]) {
    params.minDiscount = parseInt(discountMatch[1], 10);
  }

  // Detect ending soon / ending today
  if (text.includes('ending today') || text.includes('ends today') || text.includes('ending soon') || text.includes('last day')) {
    params.endingSoon = true;
  }

  // Detect shop info intent
  if (text.includes('shop') || text.includes('business') || text.includes('store') || text.includes('place')) {
    if (!params.category && !params.maxPrice) {
      params.intent = 'SEARCH_BUSINESSES';
    }
  }

  return params;
};

// Multi-key failover helper (automatically switches to backup key if primary is exhausted)
const callGeminiWithFailover = async (prompt) => {
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_FALLBACK,
  ].filter((k) => k && k.trim() !== '');

  if (keys.length === 0) {
    throw new Error('No Gemini API key provided');
  }

  let lastError = null;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i].trim();
    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (err) {
      lastError = err;
      console.warn(`[Gemini Key ${i + 1} Failed]: ${err.message}. Checking next key...`);
    }
  }

  throw lastError;
};

// Stage 1: Intent & Parameter Extraction using Gemini or Fallback
export const extractIntentAndParameters = async (userMessage, categories, locations) => {
  const hasKeys = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_FALLBACK;

  if (!hasKeys) {
    return extractParametersFallback(userMessage, categories, locations);
  }

  try {
    const prompt = `Analyze this user query for the PMNA local platform in Kerala (Perinthalmanna & Angadipuram).
Available Locations: ${locations.map((l) => l.name).join(', ')}.
Available Categories: ${categories.map((c) => c.name).join(', ')}.

Extract search parameters into strict JSON without markdown formatting:
{
  "intent": "SEARCH_OFFERS" | "SEARCH_BUSINESSES" | "SEARCH_FOOD" | "GENERAL_PLATFORM_HELP",
  "location": "Perinthalmanna" | "Angadipuram" | null,
  "category": string | null,
  "maxPrice": number | null,
  "minPrice": number | null,
  "minDiscount": number | null,
  "endingSoon": boolean,
  "searchTerm": string | null
}

User query: "${userMessage}"`;

    const text = await callGeminiWithFailover(prompt);
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.warn(`[Gemini Extraction] Falling back to heuristic parsing: ${err.message}`);
    return extractParametersFallback(userMessage, categories, locations);
  }
};

// Stage 2: Query MongoDB for verified active data
export const queryDatabase = async (params) => {
  const now = new Date();
  const query = { status: 'active', endDate: { $gte: now } };

  // Resolve location
  if (params.location) {
    const locDoc = await Location.findOne({
      $or: [
        { name: new RegExp(`^${params.location}$`, 'i') },
        { slug: params.location.toLowerCase() },
      ],
    });
    if (locDoc) {
      query.locationId = locDoc._id;
    }
  }

  // Resolve category
  if (params.category) {
    const catDoc = await Category.findOne({
      $or: [
        { name: new RegExp(params.category, 'i') },
        { slug: params.category.toLowerCase() },
      ],
    });
    if (catDoc) {
      query.categoryId = catDoc._id;
    }
  }

  // Price constraints
  if (params.maxPrice !== null && params.maxPrice !== undefined) {
    query.offerPrice = { ...query.offerPrice, $lte: params.maxPrice };
  }
  if (params.minPrice !== null && params.minPrice !== undefined) {
    query.offerPrice = { ...query.offerPrice, $gte: params.minPrice };
  }

  // Discount constraint
  if (params.minDiscount !== null && params.minDiscount !== undefined) {
    query.discountPercentage = { $gte: params.minDiscount };
  }

  // Ending today / soon
  if (params.endingSoon) {
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    query.endDate = { $gte: now, $lte: endOfDay };
  }

  // Execute Offer search
  const offers = await Offer.find(query)
    .populate('businessId', 'name isVerified phone address logoUrl openingHours')
    .populate('categoryId', 'name')
    .populate('locationId', 'name')
    .sort({ discountPercentage: -1, createdAt: -1 })
    .limit(8)
    .lean();

  // Execute Business search if intent is business or if offers are low
  let businesses = [];
  const bizQuery = { status: 'approved' };
  if (query.locationId) bizQuery.locationId = query.locationId;
  if (query.categoryId) bizQuery.categoryId = query.categoryId;

  if (params.intent === 'SEARCH_BUSINESSES' || offers.length === 0) {
    businesses = await Business.find(bizQuery)
      .populate('categoryId', 'name')
      .populate('locationId', 'name')
      .sort({ isVerified: -1, viewsCount: -1 })
      .limit(6)
      .lean();
  }

  return { offers, businesses };
};

// Stage 3: Grounded Synthesis with Gemini or Grounded Fallback
export const generateGroundedResponse = async (userMessage, params, dbResults) => {
  const { offers, businesses } = dbResults;
  const apiKey = process.env.GEMINI_API_KEY;

  // Format structured card results for frontend UI
  const structuredResults = [];

  offers.forEach((o) => {
    structuredResults.push({
      type: 'offer',
      id: o._id,
      title: o.title,
      businessName: o.businessId?.name || 'Local Shop',
      businessId: o.businessId?._id,
      originalPrice: o.originalPrice,
      offerPrice: o.offerPrice,
      discountPercentage: o.discountPercentage,
      location: o.locationId?.name || 'Perinthalmanna',
      category: o.categoryId?.name || 'General',
      imageUrl: o.imageUrl,
      endDate: o.endDate,
      isVerified: o.businessId?.isVerified || false,
    });
  });

  businesses.forEach((b) => {
    structuredResults.push({
      type: 'business',
      id: b._id,
      name: b.name,
      category: b.categoryId?.name || 'Shop',
      location: b.locationId?.name || 'Perinthalmanna',
      address: b.address,
      openingHours: b.openingHours,
      phone: b.phone,
      logoUrl: b.logoUrl,
      isVerified: b.isVerified,
    });
  });

  // If no results found in PMNA DB
  if (offers.length === 0 && businesses.length === 0) {
    return {
      message: `I searched PMNA for "${userMessage}", but there are currently no active offers or businesses matching those criteria in Perinthalmanna or Angadipuram. You can check back soon as local shops post new deals every day!`,
      results: [],
      params,
    };
  }

  // If Gemini API is available, generate a concise, grounded natural language answer
  const hasKeys = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_FALLBACK;
  if (hasKeys) {
    try {
      const contextText = `
Active Database Records for PMNA:
Offers (${offers.length}):
${offers.map((o) => `- ${o.title} at ${o.businessId?.name} (${o.locationId?.name}): ₹${o.offerPrice} (${o.discountPercentage}% OFF, original ₹${o.originalPrice})`).join('\n')}

Businesses (${businesses.length}):
${businesses.map((b) => `- ${b.name} (${b.categoryId?.name}, ${b.locationId?.name}): ${b.address}, Timings: ${b.openingHours}`).join('\n')}
`;

      const prompt = `${SYSTEM_INSTRUCTION}

User Query: "${userMessage}"
${contextText}

Generate a concise, helpful 1-2 sentence response summarizing these exact matches. Mention the shop name, price, and location accurately. Do not invent any extra offers.`;

      const message = await callGeminiWithFailover(prompt);

      return {
        message,
        results: structuredResults,
        params,
      };
    } catch (err) {
      console.warn(`[Gemini Synthesis] Fallback to deterministic message: ${err.message}`);
    }
  }

  // Deterministic synthesis fallback
  let message = '';
  if (offers.length > 0) {
    const top = offers[0];
    message = `I found ${offers.length} active offer${offers.length > 1 ? 's' : ''} on PMNA. Top deal: ${top.businessId?.name} is offering "${top.title}" for ₹${top.offerPrice} (${top.discountPercentage}% OFF) in ${top.locationId?.name}!`;
  } else if (businesses.length > 0) {
    message = `I found ${businesses.length} matching verified business${businesses.length > 1 ? 'es' : ''} in ${businesses[0].locationId?.name || 'the area'}.`;
  }

  return {
    message,
    results: structuredResults,
    params,
  };
};

export const processChatMessage = async (userMessage) => {
  // Stage 0: Python ML Intent Classification
  const mlResult = await queryPythonChatbot(userMessage);
  console.log(`[ChatBot] ML Intent: ${mlResult.intent} (${(mlResult.confidence * 100).toFixed(0)}% confidence)`);

  // Pure-platform intents: ML model is the authoritative source, no DB needed
  const staticIntents = ['GREETING', 'HELP', 'PLATFORM_INFO', 'MERCHANT_GUIDE', 'SHOWCASE_ADS'];
  if (mlResult.intent && staticIntents.includes(mlResult.intent) && mlResult.confidence >= 0.40) {
    return {
      message: mlResult.response,
      results: [],
      params: { intent: mlResult.intent, source: 'ml_model' },
      mlIntent: mlResult.intent,
      mlConfidence: mlResult.confidence,
    };
  }

  // For product/offer queries, continue to Gemini + DB pipeline
  const [categories, locations] = await Promise.all([
    Category.find({ isActive: true }).select('name slug').lean(),
    Location.find({ isActive: true }).select('name slug').lean(),
  ]);

  // Stage 1: Extract intent & parameters (pass ML hint to help Gemini)
  const mlHint = mlResult.intent && mlResult.confidence >= 0.30
    ? `\n[ML Hint] Likely intent: ${mlResult.intent} (${(mlResult.confidence * 100).toFixed(0)}% confidence)` : '';
  const params = await extractIntentAndParameters(userMessage + mlHint, categories, locations);

  // Stage 2: Query verified database records
  const dbResults = await queryDatabase(params);

  // Stage 3: Grounded response generation
  const geminiResult = await generateGroundedResponse(userMessage, params, dbResults);

  // If DB has results and ML had a related response, prepend ML knowledge as context
  if (mlResult.response && mlResult.confidence >= 0.35 && needsGeminiAugmentation(mlResult)) {
    return {
      ...geminiResult,
      mlIntent: mlResult.intent,
      mlConfidence: mlResult.confidence,
    };
  }

  return {
    ...geminiResult,
    mlIntent: mlResult.intent || null,
    mlConfidence: mlResult.confidence || 0,
  };
};
