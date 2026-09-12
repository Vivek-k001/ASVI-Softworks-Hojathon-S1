#!/usr/bin/env python3
"""
PMNA Perks Chatbot Training Pipeline
=====================================
Trains an intent classifier + knowledge retrieval engine for the PMNA
local commerce platform serving Perinthalmanna and Angadipuram, Kerala.

Products covered:
  - Bakery & Cafes: pastries, cakes, truffle boxes, celebration pass
  - Restaurants: Malabar biriyani, beef fry, porotta combos, family feast
  - Footwear: running sneakers, heel sandals, stock clearance footwear
  - Fashion: cotton wear, silk wedding sarees, stock liquidation
  - Mobile / Electronics: Type-C chargers, gadgets
  - Jewellery: Gold jewellery (Malabar Gold)
  - All verified PMNA merchants and their offers
"""

import json
import os
import pickle
import sys
from pathlib import Path

# --- Dependency check ---
try:
    import numpy as np
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.linear_model import LogisticRegression
    from sklearn.calibration import CalibratedClassifierCV
    from sklearn.pipeline import Pipeline
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import classification_report
    from sklearn.metrics.pairwise import cosine_similarity
except ImportError as e:
    print(f"[ERROR] Missing package: {e}. Run: pip install scikit-learn numpy")
    sys.exit(1)

OUTPUT_DIR = Path(__file__).parent
MODEL_PATH = OUTPUT_DIR / "pmna_chatbot_model.pkl"
KB_PATH = OUTPUT_DIR / "pmna_knowledge_base.json"

# ===========================================================================
#  TRAINING DATA — intent samples covering all platform features & products
# ===========================================================================

TRAINING_DATA = [

    # -------------------------------------------------------------------------
    #  GREETING
    # -------------------------------------------------------------------------
    ("GREETING", "hi"),
    ("GREETING", "hello"),
    ("GREETING", "hey"),
    ("GREETING", "good morning"),
    ("GREETING", "good evening"),
    ("GREETING", "hi there"),
    ("GREETING", "namaskaram"),
    ("GREETING", "hii pmna"),
    ("GREETING", "hello assistant"),
    ("GREETING", "vanakkam"),
    ("GREETING", "hai"),

    # -------------------------------------------------------------------------
    #  HELP / WHAT CAN YOU DO
    # -------------------------------------------------------------------------
    ("HELP", "what can you do"),
    ("HELP", "help me"),
    ("HELP", "what do you know"),
    ("HELP", "how can you help"),
    ("HELP", "what is this"),
    ("HELP", "tell me what you can do"),
    ("HELP", "what are the features"),
    ("HELP", "how to use pmna assistant"),
    ("HELP", "show me options"),
    ("HELP", "what questions can i ask"),

    # -------------------------------------------------------------------------
    #  PLATFORM INFO — How PMNA works
    # -------------------------------------------------------------------------
    ("PLATFORM_INFO", "what is pmna perks"),
    ("PLATFORM_INFO", "how does pmna work"),
    ("PLATFORM_INFO", "tell me about pmna"),
    ("PLATFORM_INFO", "what is this app"),
    ("PLATFORM_INFO", "explain pmna to me"),
    ("PLATFORM_INFO", "what is pmna perks platform"),
    ("PLATFORM_INFO", "what does pmna do"),
    ("PLATFORM_INFO", "is pmna free for customers"),
    ("PLATFORM_INFO", "what cities does pmna serve"),
    ("PLATFORM_INFO", "is pmna available in perinthalmanna"),
    ("PLATFORM_INFO", "is pmna available in angadipuram"),
    ("PLATFORM_INFO", "pmna malayalam"),
    ("PLATFORM_INFO", "pmna perks details"),
    ("PLATFORM_INFO", "how do i use pmna as a customer"),
    ("PLATFORM_INFO", "where does pmna operate"),
    ("PLATFORM_INFO", "is this a local app"),
    ("PLATFORM_INFO", "pmna info"),
    ("PLATFORM_INFO", "what kind of deals does pmna have"),
    ("PLATFORM_INFO", "why should i use pmna"),
    ("PLATFORM_INFO", "pmna benefits"),
    ("PLATFORM_INFO", "perinthalmanna local offers app"),

    # -------------------------------------------------------------------------
    #  MERCHANT GUIDE — Registration, profile, creating deals
    # -------------------------------------------------------------------------
    ("MERCHANT_GUIDE", "how to register my shop on pmna"),
    ("MERCHANT_GUIDE", "how can a business join pmna"),
    ("MERCHANT_GUIDE", "how do merchants register"),
    ("MERCHANT_GUIDE", "how to create an offer on pmna"),
    ("MERCHANT_GUIDE", "how to add my store"),
    ("MERCHANT_GUIDE", "how to publish a deal"),
    ("MERCHANT_GUIDE", "how to upload a photo for my offer"),
    ("MERCHANT_GUIDE", "how to upload store logo"),
    ("MERCHANT_GUIDE", "how to add cover photo"),
    ("MERCHANT_GUIDE", "how to upload image for promotion"),
    ("MERCHANT_GUIDE", "how to set offer price"),
    ("MERCHANT_GUIDE", "what is merchant portal"),
    ("MERCHANT_GUIDE", "business login"),
    ("MERCHANT_GUIDE", "how to register as merchant"),
    ("MERCHANT_GUIDE", "shop registration steps"),
    ("MERCHANT_GUIDE", "add my bakery to pmna"),
    ("MERCHANT_GUIDE", "add restaurant to pmna"),
    ("MERCHANT_GUIDE", "how to get verified on pmna"),
    ("MERCHANT_GUIDE", "merchant approval process"),
    ("MERCHANT_GUIDE", "how long to get approved"),
    ("MERCHANT_GUIDE", "create promotion"),
    ("MERCHANT_GUIDE", "publish deal on pmna"),
    ("MERCHANT_GUIDE", "how to manage my offers"),
    ("MERCHANT_GUIDE", "how to pause an offer"),
    ("MERCHANT_GUIDE", "how to delete an offer"),
    ("MERCHANT_GUIDE", "shop engane register cheyyam"),
    ("MERCHANT_GUIDE", "store pmna il add cheyyunnathenganeyanu"),
    ("MERCHANT_GUIDE", "merchant registration malayalam"),

    # -------------------------------------------------------------------------
    #  SHOWCASE ADS — Promotional banners, subscriptions, payment
    # -------------------------------------------------------------------------
    ("SHOWCASE_ADS", "what is showcase"),
    ("SHOWCASE_ADS", "what is pmna showcase"),
    ("SHOWCASE_ADS", "how to advertise on pmna"),
    ("SHOWCASE_ADS", "how to promote my store on pmna"),
    ("SHOWCASE_ADS", "showcase subscription"),
    ("SHOWCASE_ADS", "how much to advertise"),
    ("SHOWCASE_ADS", "how to buy showcase spot"),
    ("SHOWCASE_ADS", "showcase pricing"),
    ("SHOWCASE_ADS", "promotional banner upload"),
    ("SHOWCASE_ADS", "how to pay for showcase"),
    ("SHOWCASE_ADS", "upi payment for showcase"),
    ("SHOWCASE_ADS", "card payment for showcase"),
    ("SHOWCASE_ADS", "pay for advertising"),
    ("SHOWCASE_ADS", "how to upload showcase banner"),
    ("SHOWCASE_ADS", "how to activate showcase"),
    ("SHOWCASE_ADS", "pmna showcase ads cost"),
    ("SHOWCASE_ADS", "pmna ads"),

    # -------------------------------------------------------------------------
    #  OFFERS SEARCH — generic offer browsing
    # -------------------------------------------------------------------------
    ("OFFERS_SEARCH", "what offers are available"),
    ("OFFERS_SEARCH", "show me all deals"),
    ("OFFERS_SEARCH", "best offers in perinthalmanna"),
    ("OFFERS_SEARCH", "best deals today"),
    ("OFFERS_SEARCH", "show me discounts"),
    ("OFFERS_SEARCH", "what discounts are available"),
    ("OFFERS_SEARCH", "today deals"),
    ("OFFERS_SEARCH", "best offers angadipuram"),
    ("OFFERS_SEARCH", "show me latest offers"),
    ("OFFERS_SEARCH", "deals ending today"),
    ("OFFERS_SEARCH", "flash deals"),
    ("OFFERS_SEARCH", "offers ending soon"),
    ("OFFERS_SEARCH", "top deals this week"),
    ("OFFERS_SEARCH", "special offers perinthalmanna"),
    ("OFFERS_SEARCH", "offers ending today"),
    ("OFFERS_SEARCH", "festival offers"),
    ("OFFERS_SEARCH", "clearance sale"),
    ("OFFERS_SEARCH", "biggest discounts"),
    ("OFFERS_SEARCH", "50 percent off offers"),
    ("OFFERS_SEARCH", "offers under 500 rupees"),
    ("OFFERS_SEARCH", "deals under 300"),
    ("OFFERS_SEARCH", "offers under 1000"),
    ("OFFERS_SEARCH", "cheap deals"),
    ("OFFERS_SEARCH", "offers below 200"),
    ("OFFERS_SEARCH", "what is on sale"),

    # -------------------------------------------------------------------------
    #  FOOD — Restaurant, biriyani, bakery, cafe queries
    # -------------------------------------------------------------------------
    ("FOOD_INQUIRY", "biriyani offers"),
    ("FOOD_INQUIRY", "malabar biriyani deal"),
    ("FOOD_INQUIRY", "chicken biriyani perinthalmanna"),
    ("FOOD_INQUIRY", "where to eat in perinthalmanna"),
    ("FOOD_INQUIRY", "restaurants near me"),
    ("FOOD_INQUIRY", "food offers perinthalmanna"),
    ("FOOD_INQUIRY", "beef fry combo"),
    ("FOOD_INQUIRY", "porotta combo offer"),
    ("FOOD_INQUIRY", "family dining combo"),
    ("FOOD_INQUIRY", "family feast deal"),
    ("FOOD_INQUIRY", "4 biriyani combo offer"),
    ("FOOD_INQUIRY", "kozhikode biriyani"),
    ("FOOD_INQUIRY", "kozhikode star biriyani offers"),
    ("FOOD_INQUIRY", "best biriyani shop perinthalmanna"),
    ("FOOD_INQUIRY", "dum biriyani"),
    ("FOOD_INQUIRY", "cafe offers"),
    ("FOOD_INQUIRY", "bakery deals"),
    ("FOOD_INQUIRY", "cake offers"),
    ("FOOD_INQUIRY", "pastry box offer"),
    ("FOOD_INQUIRY", "chocolate pastry"),
    ("FOOD_INQUIRY", "truffle pastry offer"),
    ("FOOD_INQUIRY", "pastry discount"),
    ("FOOD_INQUIRY", "dutch truffle cake"),
    ("FOOD_INQUIRY", "birthday cake offer"),
    ("FOOD_INQUIRY", "celebration cake"),
    ("FOOD_INQUIRY", "top in town bakery"),
    ("FOOD_INQUIRY", "bakery perinthalmanna"),
    ("FOOD_INQUIRY", "aswathy bakes offers"),
    ("FOOD_INQUIRY", "aswathy bakery deals"),
    ("FOOD_INQUIRY", "cake privilege pass"),
    ("FOOD_INQUIRY", "monthly cake pass"),
    ("FOOD_INQUIRY", "food evide kittum"),
    ("FOOD_INQUIRY", "biriyani evide kittum"),
    ("FOOD_INQUIRY", "cake evide kittum"),
    ("FOOD_INQUIRY", "food offer undo"),
    ("FOOD_INQUIRY", "restaurant angadipuram"),
    ("FOOD_INQUIRY", "food shops angadipuram"),

    # -------------------------------------------------------------------------
    #  FOOTWEAR — Shoes, sandals, sneakers
    # -------------------------------------------------------------------------
    ("FOOTWEAR_INQUIRY", "shoe offers"),
    ("FOOTWEAR_INQUIRY", "footwear deals"),
    ("FOOTWEAR_INQUIRY", "sneaker offers"),
    ("FOOTWEAR_INQUIRY", "running shoes offer"),
    ("FOOTWEAR_INQUIRY", "casual sneakers deal"),
    ("FOOTWEAR_INQUIRY", "men shoes angadipuram"),
    ("FOOTWEAR_INQUIRY", "ladies sandals offer"),
    ("FOOTWEAR_INQUIRY", "heel sandals deal"),
    ("FOOTWEAR_INQUIRY", "party wear sandals"),
    ("FOOTWEAR_INQUIRY", "footwear clearance sale"),
    ("FOOTWEAR_INQUIRY", "walkzone offers"),
    ("FOOTWEAR_INQUIRY", "walkzone footwear angadipuram"),
    ("FOOTWEAR_INQUIRY", "shoe sale angadipuram"),
    ("FOOTWEAR_INQUIRY", "footwear under 700"),
    ("FOOTWEAR_INQUIRY", "shoes under 600"),
    ("FOOTWEAR_INQUIRY", "footwear liquidation 55 percent off"),
    ("FOOTWEAR_INQUIRY", "chappal offer"),
    ("FOOTWEAR_INQUIRY", "sandal discount"),
    ("FOOTWEAR_INQUIRY", "shoes evide kittum"),
    ("FOOTWEAR_INQUIRY", "shoe offer undo"),
    ("FOOTWEAR_INQUIRY", "shoes angadipuram"),
    ("FOOTWEAR_INQUIRY", "show me shoe deals"),
    ("FOOTWEAR_INQUIRY", "show me footwear deals"),
    ("FOOTWEAR_INQUIRY", "show shoe offers"),
    ("FOOTWEAR_INQUIRY", "best shoe offers"),
    ("FOOTWEAR_INQUIRY", "shoe discount offers"),
    ("FOOTWEAR_INQUIRY", "men footwear offers"),
    ("FOOTWEAR_INQUIRY", "women footwear deals"),
    ("FOOTWEAR_INQUIRY", "sandals angadipuram deals"),

    # -------------------------------------------------------------------------
    #  FASHION — Clothes, textiles, sarees
    # -------------------------------------------------------------------------
    ("FASHION_INQUIRY", "saree offers"),
    ("FASHION_INQUIRY", "silk saree deal"),
    ("FASHION_INQUIRY", "wedding saree offer"),
    ("FASHION_INQUIRY", "kanchipuram silk saree"),
    ("FASHION_INQUIRY", "cotton dress offer"),
    ("FASHION_INQUIRY", "ladies cotton wear"),
    ("FASHION_INQUIRY", "gents cotton wear"),
    ("FASHION_INQUIRY", "fashion sale perinthalmanna"),
    ("FASHION_INQUIRY", "clothing clearance sale"),
    ("FASHION_INQUIRY", "stock liquidation fashion"),
    ("FASHION_INQUIRY", "textiles sale"),
    ("FASHION_INQUIRY", "modern textiles"),
    ("FASHION_INQUIRY", "modern textiles sarees perinthalmanna"),
    ("FASHION_INQUIRY", "60 percent off fashion"),
    ("FASHION_INQUIRY", "clothes under 500"),
    ("FASHION_INQUIRY", "saree offer perinthalmanna"),
    ("FASHION_INQUIRY", "saree evide kittum"),
    ("FASHION_INQUIRY", "dress offer undo"),
    ("FASHION_INQUIRY", "fashion offers"),
    ("FASHION_INQUIRY", "festival saree offer"),

    # -------------------------------------------------------------------------
    #  MOBILE / ELECTRONICS — Chargers, gadgets
    # -------------------------------------------------------------------------
    ("ELECTRONICS_INQUIRY", "mobile accessories offers"),
    ("ELECTRONICS_INQUIRY", "charger deal"),
    ("ELECTRONICS_INQUIRY", "type c charger offer"),
    ("ELECTRONICS_INQUIRY", "fast charger discount"),
    ("ELECTRONICS_INQUIRY", "braided cable offer"),
    ("ELECTRONICS_INQUIRY", "20w charger angadipuram"),
    ("ELECTRONICS_INQUIRY", "mobile hub angadipuram"),
    ("ELECTRONICS_INQUIRY", "gadgets offer"),
    ("ELECTRONICS_INQUIRY", "electronics deals angadipuram"),
    ("ELECTRONICS_INQUIRY", "mobile accessories angadipuram"),
    ("ELECTRONICS_INQUIRY", "phone accessories offer"),
    ("ELECTRONICS_INQUIRY", "charger offer"),
    ("ELECTRONICS_INQUIRY", "50 percent off mobile accessories"),

    # -------------------------------------------------------------------------
    #  JEWELLERY — Gold, diamond
    # -------------------------------------------------------------------------
    ("JEWELLERY_INQUIRY", "jewellery offers"),
    ("JEWELLERY_INQUIRY", "gold offers"),
    ("JEWELLERY_INQUIRY", "diamond jewellery deal"),
    ("JEWELLERY_INQUIRY", "malabar gold offers"),
    ("JEWELLERY_INQUIRY", "gold shop perinthalmanna"),
    ("JEWELLERY_INQUIRY", "gold jewellery discount"),
    ("JEWELLERY_INQUIRY", "malabar gold and diamonds"),
    ("JEWELLERY_INQUIRY", "gold offer perinthalmanna"),

    # -------------------------------------------------------------------------
    #  STORE INQUIRY — Specific shops, timings, addresses
    # -------------------------------------------------------------------------
    ("STORE_INQUIRY", "what is the address of top in town bakery"),
    ("STORE_INQUIRY", "when does kozhikode star biriyani open"),
    ("STORE_INQUIRY", "walkzone footwear timings"),
    ("STORE_INQUIRY", "modern textiles opening hours"),
    ("STORE_INQUIRY", "mobile hub contact number"),
    ("STORE_INQUIRY", "malabar gold phone number"),
    ("STORE_INQUIRY", "top in town bakery opening hours"),
    ("STORE_INQUIRY", "kozhikode star biriyani address"),
    ("STORE_INQUIRY", "shop timings perinthalmanna"),
    ("STORE_INQUIRY", "store info angadipuram"),
    ("STORE_INQUIRY", "contact information of shop"),
    ("STORE_INQUIRY", "what time does the shop open"),
    ("STORE_INQUIRY", "shop location"),
    ("STORE_INQUIRY", "shop address"),
    ("STORE_INQUIRY", "verified shops in perinthalmanna"),
    ("STORE_INQUIRY", "verified shops in angadipuram"),
    ("STORE_INQUIRY", "shop list pmna"),
    ("STORE_INQUIRY", "how many shops on pmna"),
    ("STORE_INQUIRY", "aswathy bakes location"),
    ("STORE_INQUIRY", "shop evide anu"),
]

# ===========================================================================
#  KNOWLEDGE BASE — rich grounded answers for every intent
# ===========================================================================

KNOWLEDGE_BASE = {

    "GREETING": {
        "response": "👋 Salam! I'm PMNA Assistant — your hyperlocal deal-finder for Perinthalmanna and Angadipuram.\n\nI can help you with:\n🛍️ Deals & offers from local shops\n🍛 Food spots and restaurant combos\n👟 Footwear, fashion, and gadget deals\n🏪 Store info, timings, and contact\n📋 Merchant registration and platform guide\n\nWhat are you looking for today?",
    },

    "HELP": {
        "response": "Here's what I can help you with on PMNA Perks:\n\n🔍 **Find Deals**: Ask for offers in Bakery, Restaurants, Fashion, Footwear, Electronics, Jewellery.\n🏪 **Store Info**: Ask about any shop's address, timings, or contact.\n📍 **Locations**: Filter deals by Perinthalmanna or Angadipuram.\n💰 **Price Filters**: Ask for deals under ₹300, ₹500, or ₹1000.\n🛒 **Merchant Guide**: Ask how to register your shop or create promotions.\n\nTry: \"Show me biriyani offers\" or \"Best deals under ₹500\"",
    },

    "PLATFORM_INFO": {
        "response": "**PMNA Perks** is a hyperlocal commerce and offer discovery platform serving **Perinthalmanna** and **Angadipuram** in Kerala.\n\n🌟 **For Customers (Free)**:\n• Discover verified deals from local shops\n• Browse offers by category, price, and location\n• Chat with AI Assistant to find the best deals\n• View shop timings, addresses, and contact info\n\n🏪 **For Merchants**:\n• Register your store and create promotions\n• Upload offer photos using our Multer image uploader\n• Boost visibility with Showcase Ads\n• Manage all offers from the Merchant Portal\n\n📍 Active in: Perinthalmanna & Angadipuram\n🏷️ Categories: Food, Bakery, Fashion, Footwear, Electronics, Jewellery, Grocery, and more!",
    },

    "MERCHANT_GUIDE": {
        "response": "**How to Register & Sell on PMNA Perks** 🏪\n\n**Step 1: Register Your Business**\n• Go to `/business/register`\n• Fill in: Business Name, Owner Name, Category, Location, Phone, Address\n• Submit for admin review (approved within 24 hours)\n\n**Step 2: Create Your First Offer**\n• Go to Merchant Portal → Create Offer\n• Fill in Promotion Title, Description, Category, Deal Type, Price\n• 📸 **Upload Your Photo**: Drag-and-drop or click \"Browse Device\" to upload from your phone/laptop (PNG, JPG, WEBP, max 5MB). Photos are auto-uploaded via Multer to our servers.\n• Set Start & End Dates, Terms & Conditions\n• Click **Publish Promotion**\n\n**Step 3: Boost with Showcase Ads**\n• Go to Showcase & Ads section\n• Pay via UPI (Google Pay, PhonePe, Paytm) or Credit/Debit Card\n• Your promotional banner appears on the PMNA home screen to thousands of local customers!\n\n✅ All merchants go through admin verification to ensure platform authenticity.",
    },

    "SHOWCASE_ADS": {
        "response": "**PMNA Showcase Advertising** 📣\n\nThe Showcase is PMNA's **premium promotional banner spot** that displays your store's ad to all customers browsing the platform home screen.\n\n💡 **What you get:**\n• Large promotional banner on the PMNA home feed\n• Your offer title, description, discount badge, and photo\n• One-click link to your store page\n• Targeted to local customers in Perinthalmanna & Angadipuram\n\n💳 **How to Pay:**\n• Go to Merchant Portal → Showcase & Ads\n• Choose payment method: **UPI QR** (scan with GPay/PhonePe/Paytm) or **Card/Netbanking** (3D secure gateway)\n• Complete payment and your showcase activates instantly!\n\n📸 **Uploading Your Banner:**\n• Upload directly from your device using our Multer image uploader\n• Or paste an image URL\n• Recommended size: 1200×600px",
    },

    "OFFERS_SEARCH": {
        "response": "Here are the active deals on PMNA Perks right now:\n\n🍛 **Food & Restaurants**\n• Kerala Beef Fry + 2 Porotta Combo — ₹150 at Kozhikode Star Biriyani\n• Authentic Malabar Chicken Dum Biriyani — ₹180 at Kozhikode Star Biriyani\n• Family Feast (4 Biriyani + Sulaimani + Halwa) — ₹799 (27% OFF)\n\n🎂 **Bakery & Cafe**\n• Dutch Truffle Chocolate Pastry Box (Set of 4) — ₹270 (25% OFF)\n• Birthday & Celebration Cake Privilege Pass — ₹680 (20% OFF)\n\n👟 **Footwear**\n• Men's Casual Running Sneakers — ₹599 (40% OFF) at WalkZone\n• Ladies Party Wear Heel Sandals — ₹649 (28% OFF) at WalkZone\n• Stock Liquidation — 55% OFF at WalkZone Angadipuram!\n\n👗 **Fashion**\n• Festival Kanchipuram Silk Wedding Saree — ₹1999 (33% OFF)\n• Annual Stock Clearance Cotton Wear — ₹399 (60% OFF)\n\n📱 **Electronics**\n• 20W PD Fast Type-C Charger — ₹399 (50% OFF) at Mobile Hub\n\nAsk me to filter by category, price, or location!",
    },

    "FOOD_INQUIRY": {
        "response": "🍛 **Food & Restaurant Deals on PMNA**\n\n**🏆 Kozhikode Star Biriyani — Perinthalmanna**\n✅ Verified | Open: 11:00 AM – 10:30 PM\n• Authentic Malabar Chicken Dum Biriyani — ₹180 (20% OFF)\n• Kerala Beef Fry (Kuttanad Style) + 2 Porotta Combo — ₹150 (25% OFF)\n• Monthly Family Dining Feast (4 Biriyani + 4 Sulaimani + Halwa) — ₹799 (27% OFF)\n\n**🎂 Top In Town Bakery & Cafe — Perinthalmanna**\n✅ Verified | Open: 8:00 AM – 9:30 PM\n• Dutch Truffle Chocolate Pastry Box (Set of 4) — ₹270 (25% OFF)\n• Birthday & Celebration Cake Privilege Pass (Monthly) — ₹680 (20% OFF)\n\n**🍰 aswathy bakes — Perinthalmanna**\n• Fresh custom cakes & baked goods\n• (Check latest offers for current deals)\n\n👉 Visit `/deals` or ask \"biriyani offers\" or \"birthday cake deal\" for more details!",
    },

    "FOOTWEAR_INQUIRY": {
        "response": "👟 **Footwear Deals on PMNA**\n\n**🏆 WalkZone Footwear — Angadipuram** ✅ Verified\nOpen: 9:30 AM – 9:00 PM\n\n• **Men's Casual Running Sneakers** — ₹599 (was ₹999, **40% OFF**)\n• **Ladies Party Wear Heel Sandals** — ₹649 (was ₹899, **28% OFF**)\n• **⚡ Stock Liquidation: End-of-Stock Clearance** — ₹674 (was ₹1499, **55% OFF**!) — Hurry, limited stock!\n\nAll WalkZone deals are in **Angadipuram**.\nAsk me for specific sizes or styles if needed!",
    },

    "FASHION_INQUIRY": {
        "response": "👗 **Fashion & Textiles Deals on PMNA**\n\n**🏆 Modern Textiles & Sarees — Perinthalmanna** ✅ Verified\nOpen: 9:00 AM – 8:30 PM\n\n• **Festival Kanchipuram Soft Silk Wedding Saree** — ₹1999 (was ₹2999, **33% OFF**)\n• **⚡ Annual Stock Liquidation — Cotton Gents & Ladies Wear** — ₹399 (was ₹999, **60% OFF**!) — Clearance sale!\n\nAll fashion deals are in **Perinthalmanna**.\nAsk me for specific styles (cotton, silk, saree, gents wear, ladies wear)!",
    },

    "ELECTRONICS_INQUIRY": {
        "response": "📱 **Electronics & Mobile Accessories on PMNA**\n\n**🏆 Mobile Hub & Gadgets — Angadipuram** ✅ Verified\nOpen: 10:00 AM – 9:00 PM\n\n• **20W PD Fast Type-C Charger with Braided Cable** — ₹399 (was ₹799, **50% OFF**)\n  Premium fast charging, braided cable, PD 20W — great deal!\n\n💡 Flash deal — ends today! Don't miss it.\nLocation: Angadipuram",
    },

    "JEWELLERY_INQUIRY": {
        "response": "💍 **Jewellery on PMNA**\n\n**🏆 Malabar Gold & Diamonds — Perinthalmanna** ✅ Verified\nOpen: 9:30 AM – 9:00 PM\n\nMalabar Gold is one of India's most trusted jewellery brands. Check their PMNA profile for current gold jewellery offers, diamond deals, and festival collections.\n\n📍 Location: Perinthalmanna\nVisit the platform for their latest offers!",
    },

    "STORE_INQUIRY": {
        "response": "🏪 **Verified Shops on PMNA Perks**\n\n**Perinthalmanna:**\n1. 🍛 Kozhikode Star Biriyani — Open 11:00 AM – 10:30 PM\n2. 🎂 Top In Town Bakery & Cafe — Open 8:00 AM – 9:30 PM\n3. 👗 Modern Textiles & Sarees — Open 9:00 AM – 8:30 PM\n4. 💍 Malabar Gold & Diamonds — Open 9:30 AM – 9:00 PM\n5. 🍰 aswathy bakes — Baker's fresh items\n\n**Angadipuram:**\n1. 👟 WalkZone Footwear — Open 9:30 AM – 9:00 PM\n2. 📱 Mobile Hub & Gadgets — Open 10:00 AM – 9:00 PM\n\nAsk about a specific shop for its contact number, address, or latest offers!",
    },
}


# ===========================================================================
#  TRAIN MODEL
# ===========================================================================

def train():
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    print("\n[START] PMNA Chatbot Training Pipeline Starting...\n")

    # Prepare data
    labels, texts = zip(*TRAINING_DATA)

    # TF-IDF features — character n-grams + word n-grams for Manglish support
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 3),
        analyzer="word",
        min_df=1,
        max_df=0.95,
        sublinear_tf=True,
    )

    # Intent classifier: logistic regression with calibration for probabilities
    clf = LogisticRegression(
        max_iter=1000,
        C=3.0,
        solver="lbfgs",
        class_weight="balanced",
    )

    pipeline = Pipeline([
        ("tfidf", vectorizer),
        ("clf", clf),
    ])

    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        texts, labels, test_size=0.15, random_state=42, stratify=labels
    )

    print(f"[DATA] Training samples: {len(X_train)} | Validation samples: {len(X_test)}")
    print(f"[DATA] Intents: {sorted(set(labels))}\n")

    pipeline.fit(X_train, y_train)

    # Evaluate
    y_pred = pipeline.predict(X_test)
    print("[EVAL] Validation Classification Report:")
    print(classification_report(y_test, y_pred, zero_division=0))

    train_acc = pipeline.score(X_train, y_train)
    val_acc = pipeline.score(X_test, y_test)
    print(f"[OK] Training Accuracy: {train_acc:.2%}")
    print(f"[OK] Validation Accuracy: {val_acc:.2%}\n")

    # Save model
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(pipeline, f)
    print(f"[SAVED] Model saved -> {MODEL_PATH}")

    # Build TF-IDF similarity index for knowledge retrieval
    kb_texts = {intent: kb["response"] for intent, kb in KNOWLEDGE_BASE.items()}
    kb_vectorizer = TfidfVectorizer(ngram_range=(1, 3), analyzer="word", sublinear_tf=True)
    all_kb_text = list(kb_texts.values())
    all_kb_keys = list(kb_texts.keys())
    kb_matrix = kb_vectorizer.fit_transform(all_kb_text)

    # Save knowledge base
    with open(KB_PATH, "w", encoding="utf-8") as f:
        json.dump({
            "knowledge_base": KNOWLEDGE_BASE,
            "intents": sorted(set(labels)),
            "version": "2.0",
            "coverage": {
                "locations": ["Perinthalmanna", "Angadipuram"],
                "categories": [
                    "Bakery", "Cafes", "Restaurants", "Footwear", "Fashion",
                    "Mobile", "Electronics", "Jewellery", "Grocery",
                    "Beauty", "Salon", "Furniture", "Pharmacy"
                ],
                "shops": [
                    "Kozhikode Star Biriyani",
                    "Top In Town Bakery & Cafe",
                    "WalkZone Footwear",
                    "Modern Textiles & Sarees",
                    "Mobile Hub & Gadgets",
                    "Malabar Gold & Diamonds",
                    "aswathy bakes"
                ],
                "products": [
                    "Authentic Malabar Chicken Dum Biriyani",
                    "Kerala Beef Fry + 2 Porotta Combo",
                    "Family Dining Feast (4 Biriyani + 4 Sulaimani + Halwa)",
                    "Dutch Truffle Chocolate Pastry Box (Set of 4)",
                    "Birthday & Celebration Cake Privilege Pass",
                    "WalkZone Men's Casual Running Sneakers",
                    "Ladies Party Wear Heel Sandals",
                    "Stock Liquidation: Footwear 55% OFF",
                    "Festival Kanchipuram Soft Silk Wedding Saree",
                    "Annual Stock Liquidation Cotton Wear 60% OFF",
                    "20W PD Fast Type-C Charger with Braided Cable",
                    "Malabar Gold & Diamonds Jewellery"
                ]
            }
        }, f, ensure_ascii=False, indent=2)
    print(f"[SAVED] Knowledge base saved -> {KB_PATH}\n")

    # Quick self-test
    test_queries = [
        ("what is pmna", "PLATFORM_INFO"),
        ("biriyani offer", "FOOD_INQUIRY"),
        ("show me shoe deals", "FOOTWEAR_INQUIRY"),
        ("how to register shop", "MERCHANT_GUIDE"),
        ("type c charger angadipuram", "ELECTRONICS_INQUIRY"),
        ("saree offers", "FASHION_INQUIRY"),
        ("food evide kittum", "FOOD_INQUIRY"),
        ("showcase payment", "SHOWCASE_ADS"),
        ("hi there", "GREETING"),
    ]

    print("[TEST] Self-Test Results:")
    print("-" * 60)
    all_pass = True
    for query, expected in test_queries:
        predicted = pipeline.predict([query])[0]
        proba = max(pipeline.predict_proba([query])[0])
        status = "PASS" if predicted == expected else "FAIL"
        if predicted != expected:
            all_pass = False
        print(f"  [{status}] [{proba:.0%}] \"{query}\" -> {predicted} (expected: {expected})")

    print("-" * 60)
    if all_pass:
        print("\n[SUCCESS] All self-tests passed! PMNA Chatbot is fully trained and ready.\n")
    else:
        print("\n[WARNING] Some tests failed - review training data coverage.\n")

    return pipeline


if __name__ == "__main__":
    train()
