# Hojathon

Build agents that don't just respond — they act.

Hojathon is an agentic AI hackathon. Teams build systems that can reason, plan, call tools or APIs, and carry out multi-step tasks on their own — not just chatbots that answer a single prompt. This repository is the official starter and submission template: fork it, build your project inside your fork, and submit your final work back here through a Pull Request.

There's no required stack. Build your agent with any language, any framework, any model provider or orchestration approach — LangChain, a custom agent loop, raw API calls, whatever gets the job done. This repo itself contains no code. It's just the structure and docs every team needs so judges can actually run and evaluate what you built.

---

## Getting Started

1. **Fork this repository** — click "Fork" at the top of this page, then click the green **"Create fork"** button on the page that follows to confirm.
2. **Clone your fork** to your computer:
   ```bash
   git clone https://github.com/<your-username>/<your-fork>.git
   ```
3. **Read through this README and the [`docs/`](docs/) folder in full** before you write any code, so you understand the rules, the workflow, and what your final submission needs to include.
4. **Add your teammates as collaborators** on your fork (GitHub → Settings → Collaborators) so everyone can push directly.
5. **Build your project** inside your fork, using whatever stack fits your idea.
6. **Commit and push regularly** — don't wait until the deadline to save your work.
7. **Fill in the project documentation** (see [Project Documentation](#project-documentation) below and the [`docs/`](docs/) folder).
8. **Open your final Pull Request** back to this repository before the deadline.

---

## Team Information

**Team Name:** ASVI Softworks

**Team Members:**

1. Vivek K
2. Aswathi P

**Project Name:** PmnaPerks

---

## Project Documentation

### Project Name
**PMNA** (PMNA Perks)

### Team
**ASVI Softworks**  
* Vivek K
* Aswathi P

### Problem Statement
In tier-2 and tier-3 towns like **Perinthalmanna and Angadipuram, Kerala**, local businesses run incredible daily promotions, flash discounts, festival offers, and clearance sales, but communicate them through ephemeral WhatsApp status updates, physical banners, or unindexed Instagram stories. Local residents and visitors struggle to know what deals are currently active around them, where to eat on a budget, or which shops have authentic discounts today. 

Existing mega-apps (like Zomato or Amazon) either don't cater to local retail shops (footwear, clothing, electronics, bakeries) or charge prohibitive commissions. Static listing directories (like JustDial) show outdated phone numbers without real-time offers or verified status. 

This problem calls for an **Agentic AI Hyperlocal Discovery Platform**:
1. It maintains a live, database-grounded inventory of real offers with strict expiry dates.
2. It features **PMNA Assistant** (powered by Google Gemini), an AI shopping and discovery agent that extracts user intent, executes deterministic queries against real MongoDB records, and provides grounded recommendations without hallucinating prices, deals, or shop locations.

### Proposed Solution
**PMNA** is a production-quality hyperlocal web platform built specifically for Perinthalmanna and Angadipuram:
* **Location-Aware Feed**: Instant switching between Perinthalmanna and Angadipuram alters all discovery feeds, deals, shops, and food spots.
* **Verified Deals Engine**: Comprehensive offer taxonomy (Flash Deals, BOGO, Percentage Discounts, Daily/Weekly Offers) with automatic discount calculation, start/end dates, and expiry states ("Ends today", "2 days left").
* **Food & Business Directory**: Verified badges for approved local merchants, operating hours, addresses, contact details, and live offer counters.
* **Merchant & Admin Portals**: Self-serve registration for local shopkeepers (with admin verification workflow), offer lifecycle management (Draft, Pending, Active, Paused, Expired), and customer report handling.
* **PMNA Assistant (Gemini AI)**: A strictly grounded conversational assistant that allows natural language queries like *"Find food under ₹200 near Angadipuram"* or *"Any shoe offers ending today?"*, searching actual MongoDB records and returning interactive cards.

### Key Features

* 📍 **Hyperlocal Location-Aware Discovery**:
  * **Dynamic Town Switching**: Toggle between **Perinthalmanna** and **Angadipuram** (or view "All Locations") seamlessly from the header, hero section, or filter sidebars.
  * **Persistent Town Context**: Selection is stored across customer sessions and reactively filters Deals, Food, Shops, and Gemini Assistant prompts.
  * **Database-Driven Locations**: Backed by a dedicated MongoDB `Location` schema with slug and name lookups — scalable to adjacent municipalities (e.g. Pattambi, Melattur, Mankada) without schema redesign.
  * **Zero Hardcoding**: Locations, categories, and business relations are cleanly decoupled and normalized.

* 💰 **Advanced Price & Discount Filtering Engine**:
  * **Custom Price Range**: Dual Min (₹) and Max (₹) numeric inputs for pinpoint budget control.
  * **Quick Budget Presets**: Instant one-click presets (`Under ₹200`, `Under ₹500`, `Under ₹1,000`, `Under ₹2,000`).
  * **Minimum Discount % Tiers**: High-visibility discount filters (`10%+`, `20%+`, `30%+`, `50%+ OFF`).
  * **Diverse Offer Types**: Supports Daily Deals, Weekly Specials, Flash Offers, Festival Deals, Weekend Promos, Clearance, BOGO, Percentage Off, and Fixed Discounts.
  * **Urgency & Expiry Filtering**: Filter by deals "Ending Today / Soon" to capitalize on flash promotions before midnight.
  * **Multi-Criteria Sorting**: Sort by Newest First, Biggest Discount %, Price: Low to High, Price: High to Low, Most Popular (real view counter), or Ending Soonest.
  * **Interactive Active Filter Badges**: Real-time chips bar above the feed showing every active filter with 1-click removal (`X`) and a single-click `Clear All` reset.

* 🍔 **Food & Dining Discovery Guide**:
  * Specialized culinary portal featuring Malabar biriyani centers, bakeries, cafes, fast food, and juice bars.
  * Dish-level search filter (e.g., "Biriyani", "Burger", "Juice") paired with dining budget pills (`Under ₹150`, `Under ₹250`, `Under ₹500`).
  * Tabbed browsing between **Active Food Deals** and verified **Restaurant & Cafe Profiles** with opening hours and contact numbers.

* 🤖 **Grounded Gemini AI Assistant**:
  * Two-stage architecture: Stage 1 extracts user intent, town, category, and budget (`maxPrice`, `minDiscount`); Stage 2 executes deterministic MongoDB queries; Stage 3 synthesizes grounded recommendations.
  * **Strict Anti-Hallucination**: NEVER fabricates non-existent shops, deals, prices, or ratings. If data is absent, cleanly reports that PMNA does not currently track that information.
  * Interactive structured cards rendered directly inside chat bubbles with 1-click navigation to full deal and merchant profiles.
  * Available both as a floating widget on every page and as a dedicated `/assistant` portal with responsive mobile view.

* 🏪 **Merchant Hub & Lifecycle Management**:
  * Self-serve shopkeeper onboarding with category and town assignment.
  * Initial merchant status set to `PENDING APPROVAL` — unverified merchants cannot publish public offers.
  * Comprehensive offer creator with automated discount percentage calculation and price sanity validation (offer price cannot exceed original price).
  * Lifecycle state machine: `Draft` → `Pending` → `Active` → `Paused` → `Expired`.

* 🛡️ **Admin Governance & Citizen Fraud Protection**:
  * Centralized management dashboard for platform overseers.
  * One-click merchant approvals, rejections, and suspensions.
  * Offer moderation and removal workflows.
  * Citizen reporting modal on every deal page: report fake discounts, price mismatches, expired banners, or wrong information directly to the admin queue.

* 📱 **Anti-Slop Community Design**:
  * Designed specifically for the local Kerala community aesthetic with rich emerald green, slate, and amber accents.
  * High-contrast typography (Plus Jakarta Sans) with prominent price savings (`₹999` → **`₹699`** **30% OFF**).
  * 100% mobile-responsive with custom drawers, mobile bottom navigation, and clean touch-friendly tap targets.

### Technology Stack

| Category | Technology |
| -------- | ---------- |
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide React |
| **Backend**  | Node.js, Express.js, REST API, JWT Authentication, bcryptjs, Multer |
| **Database** | MongoDB & Mongoose (supports MongoDB Atlas SRV URI + automated in-memory dev fallback) |
| **AI / LLM** | Google Gemini API (Strict System Grounding, Intent Detection, Parameter Extraction) |
| **Storage**  | Cloudinary (with local static fallback) |
| **Design**   | Tailwind CSS, Plus Jakarta Sans, Kerala Hyperlocal Minimalist Aesthetic |

### How It Works

#### Architectural Workflow:
```
[ Customer Query: "Find shoe offers in Angadipuram under ₹700" ]
                          │
                          ▼
            [ POST /api/assistant/chat ]
                          │
                          ▼
    [ Stage 1: Gemini Intent & Parameter Extraction ]
    { intent: "SEARCH_OFFERS", category: "Footwear", location: "Angadipuram", maxPrice: 700 }
                          │
                          ▼
        [ Stage 2: MongoDB Deterministic Query ]
        db.offers.find({ status: "active", locationId: angadipuramId, offerPrice: { $lte: 700 } })
                          │
                          ▼
   [ Stage 3: Grounded Gemini Synthesis with DB Context ]
   "Found 2 active shoe offers in Angadipuram under ₹700..."
                          │
                          ▼
       [ Frontend: Natural Text + Rich Interactive Cards ]
```

### Setup & Installation

#### 1. Prerequisites
* Node.js (v18+ or v20+)
* npm (v9+)
* (Optional) MongoDB connection URI (or runs automatically on local dev fallback)
* (Optional) Google Gemini API Key

#### 2. Clone & Install
```bash
git clone https://github.com/Vivek-k001/ASVI-Softworks-Hojathon-S1.git
cd ASVI-Softworks-Hojathon-S1

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

#### 3. Environment Variables

Create `server/.env` (reference `server/.env.example`):
```env
PORT=5000

# MongoDB Database Connection:
# Option A: Connect your cloud MongoDB Atlas Cluster (SRV)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/pmna?retryWrites=true&w=majority

# Option B: Zero-Config Evaluator Mode:
# If MONGODB_URI is left empty or omitted, PMNA automatically launches an embedded in-memory MongoDB instance
# and auto-seeds verified Perinthalmanna & Angadipuram merchants, deals, and categories.

JWT_SECRET=pmna_secure_jwt_secret_key_2026
GEMINI_API_KEY=your_google_gemini_api_key
CLIENT_URL=http://localhost:5173
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

#### 4. Seed Database
```bash
cd server
node seed/seedRunner.js
```

### Running the Project

#### 1. Start the Backend Server:
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

#### 2. Start the Frontend Client:
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

#### 3. Test Credentials:
* **Admin**: `admin@pmna.local` / `Admin@123`
* **Business (Approved)**: `walkzone@pmna.local` / `Shop@123`
* **Customer**: `customer@pmna.local` / `Customer@123`

---

## Participant Rules

* Teams must contain **1–3 members**.
* Teams may use **any technology stack**.
* Teams should commit their work regularly.
* Do **not** commit passwords, API keys, tokens, or other secrets.
* The final state of the repository at the submission deadline will be considered for judging.
* The final Pull Request must be submitted before the official deadline.
* Participants are responsible for ensuring their project can be evaluated.

---

## GitHub Workflow

```
Official Hojathon Repository
        ↓
      Fork
        ↓
   Team's Fork
        ↓
  Build Project
        ↓
  Commit & Push
        ↓
 Complete README
        ↓
   Final PR
        ↓
   Organizers
        ↓
    Judges
```

Don't open a Pull Request for every change. Work normally inside your own fork, committing and pushing as often as you like — only open a Pull Request to the official repository when you're ready to make your **final submission**.

---

## Final Pull Request

When your project is ready, open a Pull Request from your fork's default branch into the official Hojathon repository.

**PR title format:**

```
[TEAM-ID] Project Name
```

**Example:**

```
[TEAM-042] Smart Campus Assistant
```

**The PR description must contain:**

* Team ID
* Team name
* Team members
* Project name
* Problem statement
* Solution
* Technology stack
* Demo URL
* Demo video
* Special instructions for judges

See [`docs/SUBMISSION.md`](docs/SUBMISSION.md) for the full submission checklist and process, and use the [Pull Request template](.github/PULL_REQUEST_TEMPLATE.md) when you open your final PR.
