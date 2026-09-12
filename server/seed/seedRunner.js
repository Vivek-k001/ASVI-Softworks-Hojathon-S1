import dotenv from 'dotenv';
import { connectDB, closeDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Location } from '../models/Location.js';
import { Category } from '../models/Category.js';
import { Business } from '../models/Business.js';
import { Offer } from '../models/Offer.js';
import { Setting } from '../models/Setting.js';
import { Subscription } from '../models/Subscription.js';
import { Payment } from '../models/Payment.js';
import { Showcase } from '../models/Showcase.js';

dotenv.config();

export const seedDatabase = async () => {
  console.log('[Seed] Starting database seeding for PMNA...');

  // 1. Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Location.deleteMany({}),
    Category.deleteMany({}),
    Business.deleteMany({}),
    Offer.deleteMany({}),
    Setting.deleteMany({}),
    Subscription.deleteMany({}),
    Payment.deleteMany({}),
    Showcase.deleteMany({}),
  ]);

  // 2. Locations
  const locations = await Location.create([
    {
      name: 'Perinthalmanna',
      slug: 'perinthalmanna',
      district: 'Malappuram',
      state: 'Kerala',
      pincode: '679322',
      isActive: true,
    },
    {
      name: 'Angadipuram',
      slug: 'angadipuram',
      district: 'Malappuram',
      state: 'Kerala',
      pincode: '679321',
      isActive: true,
    },
  ]);
  const [pmnaLoc, angLoc] = locations;

  // 3. Categories
  const categoryDefs = [
    { name: 'Fashion', slug: 'fashion', icon: 'Shirt', isFoodRelated: false, displayOrder: 1 },
    { name: 'Electronics', slug: 'electronics', icon: 'Tv', isFoodRelated: false, displayOrder: 2 },
    { name: 'Mobile', slug: 'mobile', icon: 'Smartphone', isFoodRelated: false, displayOrder: 3 },
    { name: 'Grocery', slug: 'grocery', icon: 'ShoppingBag', isFoodRelated: false, displayOrder: 4 },
    { name: 'Restaurants', slug: 'restaurants', icon: 'Utensils', isFoodRelated: true, displayOrder: 5 },
    { name: 'Cafes', slug: 'cafes', icon: 'Coffee', isFoodRelated: true, displayOrder: 6 },
    { name: 'Bakery', slug: 'bakery', icon: 'Cake', isFoodRelated: true, displayOrder: 7 },
    { name: 'Footwear', slug: 'footwear', icon: 'Footprints', isFoodRelated: false, displayOrder: 8 },
    { name: 'Beauty', slug: 'beauty', icon: 'Sparkles', isFoodRelated: false, displayOrder: 9 },
    { name: 'Salon', slug: 'salon', icon: 'Scissors', isFoodRelated: false, displayOrder: 10 },
    { name: 'Furniture', slug: 'furniture', icon: 'Armchair', isFoodRelated: false, displayOrder: 11 },
    { name: 'Jewellery', slug: 'jewellery', icon: 'Gem', isFoodRelated: false, displayOrder: 12 },
    { name: 'Pharmacy', slug: 'pharmacy', icon: 'Pill', isFoodRelated: false, displayOrder: 13 },
    { name: 'Services', slug: 'services', icon: 'Wrench', isFoodRelated: false, displayOrder: 14 },
    { name: 'Education', slug: 'education', icon: 'GraduationCap', isFoodRelated: false, displayOrder: 15 },
    { name: 'Automobile', slug: 'automobile', icon: 'Car', isFoodRelated: false, displayOrder: 16 },
    { name: 'Other', slug: 'other', icon: 'Tag', isFoodRelated: false, displayOrder: 17 },
  ];
  const categories = await Category.create(categoryDefs);
  const catMap = {};
  categories.forEach((c) => {
    catMap[c.name] = c._id;
  });

  // 4. Users (Admin, Merchants, Customers)
  const adminUser = await User.create({
    name: 'PMNA Admin',
    email: 'admin@pmna.local',
    phone: '+91 94470 00001',
    password: 'Admin@123',
    role: 'admin',
  });

  const customerUser = await User.create({
    name: 'Aswathi Vijay',
    email: 'customer@pmna.local',
    phone: '+91 98470 99887',
    password: 'Customer@123',
    role: 'customer',
  });

  const merchantUsers = await Promise.all([
    User.create({
      name: 'Mohammed Rafi',
      email: 'walkzone@pmna.local',
      phone: '+91 98471 23456',
      password: 'Shop@123',
      role: 'business',
    }),
    User.create({
      name: 'Abdul Niyas',
      email: 'starbiriyani@pmna.local',
      phone: '+91 94472 88990',
      password: 'Shop@123',
      role: 'business',
    }),
    User.create({
      name: 'Shaji Varghese',
      email: 'topintown@pmna.local',
      phone: '+91 97450 11223',
      password: 'Shop@123',
      role: 'business',
    }),
    User.create({
      name: 'Vishnu Prasad',
      email: 'mobilehub@pmna.local',
      phone: '+91 96560 44556',
      password: 'Shop@123',
      role: 'business',
    }),
    User.create({
      name: 'Suresh Kumar',
      email: 'moderntextiles@pmna.local',
      phone: '+91 94460 77889',
      password: 'Shop@123',
      role: 'business',
    }),
    User.create({
      name: 'K. P. Hameed',
      email: 'malabargold@pmna.local',
      phone: '+91 98460 33445',
      password: 'Shop@123',
      role: 'business',
    }),
  ]);

  // 5. Businesses (Approved & Verified)
  const businesses = await Business.create([
    {
      userId: merchantUsers[0]._id,
      name: 'WalkZone Footwear',
      ownerName: 'Mohammed Rafi',
      phone: '+91 98471 23456',
      email: 'walkzone@pmna.local',
      categoryId: catMap['Footwear'],
      locationId: angLoc._id,
      address: 'Near Railway Overbridge, Station Road, Angadipuram',
      openingHours: '9:30 AM - 9:00 PM',
      description: 'Exclusive multi-brand footwear and leather accessories store in Angadipuram.',
      logoUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop',
      coverUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=400&fit=crop',
      status: 'approved',
      isVerified: true,
      viewsCount: 142,
    },
    {
      userId: merchantUsers[1]._id,
      name: 'Kozhikode Star Biriyani',
      ownerName: 'Abdul Niyas',
      phone: '+91 94472 88990',
      email: 'starbiriyani@pmna.local',
      categoryId: catMap['Restaurants'],
      locationId: pmnaLoc._id,
      address: 'Ooty Road, Near Town Bus Stand, Perinthalmanna',
      openingHours: '11:00 AM - 11:00 PM',
      description: 'Famous Malabar dum biriyani, tandoori treats, and authentic Kerala seafood delicacies.',
      logoUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&h=200&fit=crop',
      coverUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&h=400&fit=crop',
      status: 'approved',
      isVerified: true,
      viewsCount: 389,
    },
    {
      userId: merchantUsers[2]._id,
      name: 'Top In Town Bakery & Cafe',
      ownerName: 'Shaji Varghese',
      phone: '+91 97450 11223',
      email: 'topintown@pmna.local',
      categoryId: catMap['Bakery'],
      locationId: pmnaLoc._id,
      address: 'Calicut Road Junction, Perinthalmanna',
      openingHours: '8:00 AM - 10:30 PM',
      description: 'Fresh cakes, artisan breads, traditional Malabar snacks, and cold beverages.',
      logoUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop',
      coverUrl: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=800&h=400&fit=crop',
      status: 'approved',
      isVerified: true,
      viewsCount: 220,
    },
    {
      userId: merchantUsers[3]._id,
      name: 'Mobile Hub & Gadgets',
      ownerName: 'Vishnu Prasad',
      phone: '+91 96560 44556',
      email: 'mobilehub@pmna.local',
      categoryId: catMap['Mobile'],
      locationId: angLoc._id,
      address: 'Temple Gate Road, Near Thirumandhamkunnu, Angadipuram',
      openingHours: '9:30 AM - 8:30 PM',
      description: 'Smartphones, genuine accessories, tempered glass, fast chargers, and express repair service.',
      logoUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop',
      coverUrl: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&h=400&fit=crop',
      status: 'approved',
      isVerified: true,
      viewsCount: 175,
    },
    {
      userId: merchantUsers[4]._id,
      name: 'Modern Textiles & Sarees',
      ownerName: 'Suresh Kumar',
      phone: '+91 94460 77889',
      email: 'moderntextiles@pmna.local',
      categoryId: catMap['Fashion'],
      locationId: pmnaLoc._id,
      address: 'Main Bazaar, Near Municipal Town Hall, Perinthalmanna',
      openingHours: '9:00 AM - 9:00 PM',
      description: 'Wedding sarees, silk collections, kidswear, and contemporary gents readymades.',
      logoUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&h=200&fit=crop',
      coverUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&h=400&fit=crop',
      status: 'approved',
      isVerified: true,
      viewsCount: 290,
    },
    {
      userId: merchantUsers[5]._id,
      name: 'Malabar Gold & Diamonds',
      ownerName: 'K. P. Hameed',
      phone: '+91 98460 33445',
      email: 'malabargold@pmna.local',
      categoryId: catMap['Jewellery'],
      locationId: pmnaLoc._id,
      address: 'Bypass Road, Opposite City Center, Perinthalmanna',
      openingHours: '10:00 AM - 8:00 PM',
      description: 'BIS 916 hallmarked gold, IGI certified diamonds, and precious gemstone jewellery.',
      logoUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=200&fit=crop',
      coverUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=400&fit=crop',
      status: 'approved',
      isVerified: true,
      viewsCount: 450,
    },
  ]);

  // 6. Active Offers with Expiries
  const now = new Date();
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const inTwoDays = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  const inFiveDays = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
  const inSevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const inTwentyFiveDays = new Date(Date.now() + 25 * 24 * 60 * 60 * 1000);
  const inThirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const createdOffers = await Offer.create([
    {
      businessId: businesses[0]._id, // WalkZone Angadipuram
      title: "WalkZone Men's Casual Running Sneakers",
      description: 'Breathable mesh sneakers with cushioned sole. Available in sizes 6-10. Lightweight and durable.',
      categoryId: catMap['Footwear'],
      locationId: angLoc._id,
      offerType: 'daily',
      originalPrice: 999,
      offerPrice: 599,
      discountPercentage: 40,
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop',
      startDate: now,
      endDate: inTwoDays,
      startTime: '10:00 AM',
      endTime: '09:00 PM',
      terms: 'Offer valid on select articles. No cash exchange.',
      status: 'active',
      viewsCount: 88,
    },
    {
      businessId: businesses[0]._id, // WalkZone Angadipuram
      title: 'Ladies Party Wear Heel Sandals',
      description: 'Comfortable block heels with metallic finish. Perfect for weddings and festive functions.',
      categoryId: catMap['Footwear'],
      locationId: angLoc._id,
      offerType: 'weekly',
      originalPrice: 899,
      offerPrice: 649,
      discountPercentage: 28,
      imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&h=400&fit=crop',
      startDate: now,
      endDate: inFiveDays,
      status: 'active',
      viewsCount: 54,
    },
    {
      businessId: businesses[1]._id, // Kozhikode Star Biriyani PMNA
      title: 'Authentic Malabar Chicken Dum Biriyani',
      description: 'Khaima rice cooked with tender chicken pieces, caramelized onions, boiled egg, and spicy pickle.',
      categoryId: catMap['Restaurants'],
      locationId: pmnaLoc._id,
      offerType: 'flash',
      originalPrice: 220,
      offerPrice: 180,
      discountPercentage: 18,
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=400&fit=crop',
      startDate: now,
      endDate: endOfDay, // Ends today!
      startTime: '12:00 PM',
      endTime: '04:00 PM',
      terms: 'Dine-in only between 12:00 PM and 4:00 PM. Limited portions available.',
      status: 'active',
      viewsCount: 215,
    },
    {
      businessId: businesses[1]._id, // Kozhikode Star Biriyani PMNA
      title: 'Kerala Beef Fry (Kuttanad Style) + 2 Porotta Combo',
      description: 'Slow-roasted beef fry with roasted coconut slivers and curry leaves served with 2 flaky porottas.',
      categoryId: catMap['Restaurants'],
      locationId: pmnaLoc._id,
      offerType: 'daily',
      originalPrice: 190,
      offerPrice: 150,
      discountPercentage: 21,
      imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&h=400&fit=crop',
      startDate: now,
      endDate: endOfDay, // Ends today!
      status: 'active',
      viewsCount: 160,
    },
    {
      businessId: businesses[2]._id, // Top In Town Bakery PMNA
      title: 'Dutch Truffle Chocolate Pastry Box (Set of 4)',
      description: 'Rich Belgian dark chocolate ganache layered with moist sponge. Freshly baked every morning.',
      categoryId: catMap['Bakery'],
      locationId: pmnaLoc._id,
      offerType: 'weekend',
      originalPrice: 360,
      offerPrice: 270,
      discountPercentage: 25,
      imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=400&fit=crop',
      startDate: now,
      endDate: inTwoDays,
      status: 'active',
      viewsCount: 95,
    },
    {
      businessId: businesses[3]._id, // Mobile Hub Angadipuram
      title: '20W PD Fast Type-C Charger with Braided Cable',
      description: 'Quick charge compatible with iPhone and Android. Over-voltage protection and 6-month warranty.',
      categoryId: catMap['Mobile'],
      locationId: angLoc._id,
      offerType: 'flash',
      originalPrice: 799,
      offerPrice: 399,
      discountPercentage: 50,
      imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&h=400&fit=crop',
      startDate: now,
      endDate: endOfDay, // Ends today!
      status: 'active',
      viewsCount: 130,
    },
    {
      businessId: businesses[4]._id, // Modern Textiles PMNA
      title: 'Festival Kanchipuram Soft Silk Wedding Saree',
      description: 'Zari woven pallu with rich border in contrast colors. Includes unstitched designer blouse piece.',
      categoryId: catMap['Fashion'],
      locationId: pmnaLoc._id,
      offerType: 'festival',
      originalPrice: 2999,
      offerPrice: 1999,
      discountPercentage: 33,
      imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=400&fit=crop',
      startDate: now,
      endDate: inSevenDays,
      status: 'active',
      viewsCount: 178,
    },
    {
      businessId: businesses[5]._id, // Malabar Gold PMNA
      title: 'Zero Making Charges on Selected Lightweight Diamond Jewellery',
      description: 'Special festive showcase. 100% exchange value on gold and certified natural diamonds.',
      categoryId: catMap['Jewellery'],
      locationId: pmnaLoc._id,
      offerType: 'special_price',
      originalPrice: 15000,
      offerPrice: 12500,
      discountPercentage: 17,
      imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=400&fit=crop',
      startDate: now,
      endDate: inThirtyDays,
      status: 'active',
      viewsCount: 310,
    },
    // MONTHLY DEALS (Longer period validity)
    {
      businessId: businesses[1]._id, // Kozhikode Star Biriyani PMNA
      title: 'Monthly Family Dining Feast Combo (4 Biriyani + 4 Sulaimani + Halwa)',
      description: 'Monthly special privilege dining package for families and groups. Includes 4 Dum Biriyanis, raitha, pickle, and hot Malabar Sulaimani with authentic Kozhikode Halwa.',
      categoryId: catMap['Restaurants'],
      locationId: pmnaLoc._id,
      offerType: 'festival',
      originalPrice: 1100,
      offerPrice: 799,
      discountPercentage: 27,
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=400&fit=crop',
      startDate: now,
      endDate: inThirtyDays,
      status: 'active',
      viewsCount: 420,
    },
    {
      businessId: businesses[2]._id, // Top In Town Bakery PMNA
      title: 'Month-Long Birthday & Celebration Cake Privilege Pass',
      description: 'Book your custom theme or photo cake 24 hours in advance and enjoy a flat 20% discount all month long. Free delivery within 5km radius in Perinthalmanna.',
      categoryId: catMap['Bakery'],
      locationId: pmnaLoc._id,
      offerType: 'percentage',
      originalPrice: 850,
      offerPrice: 680,
      discountPercentage: 20,
      imageUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=600&h=400&fit=crop',
      startDate: now,
      endDate: inTwentyFiveDays,
      status: 'active',
      viewsCount: 195,
    },
    // SHOP CLEARANCE (End-of-stock / liquidation offers)
    {
      businessId: businesses[0]._id, // WalkZone Angadipuram
      title: 'Shop Clearance: End-of-Stock Footwear Liquidation — Flat 55% OFF',
      description: 'End of season clearance sale on last-remaining sizes of branded sports sneakers, casual loafers, and ladies comfort sandals. Limited quantities available in store.',
      categoryId: catMap['Footwear'],
      locationId: angLoc._id,
      offerType: 'clearance',
      originalPrice: 1499,
      offerPrice: 674,
      discountPercentage: 55,
      imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=400&fit=crop',
      startDate: now,
      endDate: inSevenDays,
      status: 'active',
      viewsCount: 380,
    },
    {
      businessId: businesses[4]._id, // Modern Textiles PMNA
      title: 'Shop Clearance: Annual Stock Liquidation on Pure Cotton Gents & Ladies Wear',
      description: 'Massive clearance on remaining festive stocks! Pure handloom cotton shirts, dhotis, and kurtis at rock bottom clearance prices. Buy 2 Get 1 FREE or direct flat discounts.',
      categoryId: catMap['Fashion'],
      locationId: pmnaLoc._id,
      offerType: 'clearance',
      originalPrice: 999,
      offerPrice: 399,
      discountPercentage: 60,
      imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&h=400&fit=crop',
      startDate: now,
      endDate: inSevenDays,
      status: 'active',
      viewsCount: 512,
    },
  ]);

  // 7. Initialize Showcase Subscription Price Setting
  await Setting.create({
    key: 'subscriptionMonthlyPrice',
    value: 99,
    description: 'Monthly showcase promotional space subscription fee in INR',
  });

  // 8. Seed Subscriptions & Payments for WalkZone and Kozhikode Star Biriyani (Active), and Modern Textiles (Expired)
  const thirtyDaysAhead = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
  const thirtyFiveDaysAgo = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000);

  // WalkZone Subscription & Payment
  businesses[0].subscriptionStatus = 'active';
  businesses[0].subscriptionExpiresAt = thirtyDaysAhead;

  const sub1 = await Subscription.create({
    businessId: businesses[0]._id,
    planId: 'monthly_showcase_plan',
    planName: 'PMNA Showcase Monthly Plan',
    amount: 99,
    currency: 'INR',
    status: 'active',
    startDate: now,
    expiryDate: thirtyDaysAhead,
    paymentId: 'pay_pmna_wz_001',
  });

  await Payment.create({
    businessId: businesses[0]._id,
    subscriptionId: sub1._id,
    paymentGateway: 'Razorpay',
    orderId: 'order_pmna_wz_001',
    paymentId: 'pay_pmna_wz_001',
    amount: 99,
    currency: 'INR',
    status: 'successful',
    paymentMethod: 'UPI',
    receiptNumber: 'RCPT-98401',
    billingPeriod: { startDate: now, endDate: thirtyDaysAhead },
  });

  // Star Biriyani Subscription & Payment
  businesses[1].subscriptionStatus = 'active';
  businesses[1].subscriptionExpiresAt = thirtyDaysAhead;

  const sub2 = await Subscription.create({
    businessId: businesses[1]._id,
    planId: 'monthly_showcase_plan',
    planName: 'PMNA Showcase Monthly Plan',
    amount: 99,
    currency: 'INR',
    status: 'active',
    startDate: now,
    expiryDate: thirtyDaysAhead,
    paymentId: 'pay_pmna_sb_002',
  });

  await Payment.create({
    businessId: businesses[1]._id,
    subscriptionId: sub2._id,
    paymentGateway: 'Razorpay',
    orderId: 'order_pmna_sb_002',
    paymentId: 'pay_pmna_sb_002',
    amount: 99,
    currency: 'INR',
    status: 'successful',
    paymentMethod: 'UPI_QR',
    receiptNumber: 'RCPT-98402',
    billingPeriod: { startDate: now, endDate: thirtyDaysAhead },
  });

  // Modern Textiles (Expired subscription - expired 5 days ago)
  businesses[4].subscriptionStatus = 'expired';
  businesses[4].subscriptionExpiresAt = fiveDaysAgo;

  const sub3 = await Subscription.create({
    businessId: businesses[4]._id,
    planId: 'monthly_showcase_plan',
    planName: 'PMNA Showcase Monthly Plan',
    amount: 99,
    currency: 'INR',
    status: 'expired',
    startDate: thirtyFiveDaysAgo,
    expiryDate: fiveDaysAgo,
    paymentId: 'pay_pmna_mt_003',
  });

  await Payment.create({
    businessId: businesses[4]._id,
    subscriptionId: sub3._id,
    paymentGateway: 'Razorpay',
    orderId: 'order_pmna_mt_003',
    paymentId: 'pay_pmna_mt_003',
    amount: 99,
    currency: 'INR',
    status: 'successful',
    paymentMethod: 'CARD',
    receiptNumber: 'RCPT-98305',
    billingPeriod: { startDate: thirtyFiveDaysAgo, endDate: fiveDaysAgo },
  });

  // 9. Seed Dedicated Shop Promotional Showcases
  const showcase1 = await Showcase.create({
    businessId: businesses[0]._id,
    title: 'Mega Monsoon Footwear Carnival — Flat 40% OFF On Branded Sneakers & Sandals!',
    description: 'Special Perinthalmanna showroom promotion. Authentic branded sneakers, sports running shoes & comfort sandals with 1-year store replacement warranty and complimentary shoe care kit on purchases above ₹1,999.',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&h=600&fit=crop',
    discount: 'FLAT 40% OFF',
    startDate: now,
    expiryDate: inSevenDays,
    isActive: true,
    adminDisabled: false,
    targetOfferId: createdOffers[0]._id,
  });
  businesses[0].activeShowcaseId = showcase1._id;
  await businesses[0].save();

  const showcase2 = await Showcase.create({
    businessId: businesses[1]._id,
    title: 'Dum Biriyani Mahotsavam — Buy 2 Dum Biriyani Get Malabar Sulaimani & Halwa FREE!',
    description: 'Authentic Thalassery wood-fired Dum Biriyani prepared with pure cow ghee, fragrant Kaima rice, and tender meat. Spacious AC family dining hall & ample car parking near Calicut Road.',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1200&h=600&fit=crop',
    discount: 'BUY 2 GET DESSERT FREE',
    startDate: now,
    expiryDate: inFiveDays,
    isActive: true,
    adminDisabled: false,
    targetOfferId: createdOffers[2]._id,
  });
  businesses[1].activeShowcaseId = showcase2._id;
  await businesses[1].save();

  // Save Modern Textiles
  await businesses[4].save();

  console.log('[Seed] PMNA database seeded successfully with 2 locations, 17 categories, 6 businesses, 8 active offers, and 2 active shop showcase spaces!');
};

// Standalone execution helper
if (process.argv[1]?.endsWith('seedRunner.js')) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      await closeDB();
      process.exit(0);
    } catch (err) {
      console.error('[Seed Error]', err);
      process.exit(1);
    }
  })();
}
