import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLocation } from '../context/LocationContext';
import { useAssistant } from '../context/AssistantContext';
import api from '../services/api';
import { OfferCard } from '../components/offers/OfferCard';
import { BusinessCard } from '../components/business/BusinessCard';
import { ShopShowcaseCard } from '../components/showcase/ShopShowcaseCard';
import {
  Search,
  Sparkles,
  MapPin,
  Tag,
  UtensilsCrossed,
  Store,
  ChevronRight,
  ShieldCheck,
  Percent,
} from 'lucide-react';

export const Home = () => {
  const { selectedLocation, changeLocation, getSelectedLocationName } = useLocation();
  const { openAssistant, sendMessage } = useAssistant();
  const [searchQuery, setSearchQuery] = useState('');
  const [showcases, setShowcases] = useState([]);
  const [dailyOffers, setDailyOffers] = useState([]);
  const [monthlyOffers, setMonthlyOffers] = useState([]);
  const [clearanceOffers, setClearanceOffers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredFood, setFeaturedFood] = useState([]);
  const [verifiedShops, setVerifiedShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const locParam = selectedLocation !== 'all' ? `?location=${selectedLocation}` : '';

        const [showcaseRes, catRes, allOffersRes, foodRes, bizRes] = await Promise.all([
          api.get(`/showcases/public${locParam}`),
          api.get('/categories'),
          api.get(`/offers${locParam ? locParam + '&limit=20' : '?limit=20'}`),
          api.get(`/offers${locParam ? locParam + '&category=Restaurants&limit=4' : '?category=Restaurants&limit=4'}`),
          api.get(`/businesses${locParam ? locParam + '&limit=4' : '?limit=4'}`),
        ]);

        if (showcaseRes.data?.success) setShowcases(showcaseRes.data.data);
        if (catRes.data?.success) setCategories(catRes.data.data);
        if (foodRes.data?.success) setFeaturedFood(foodRes.data.data);
        if (bizRes.data?.success) setVerifiedShops(bizRes.data.data);

        if (allOffersRes.data?.success && allOffersRes.data.data) {
          const offersList = allOffersRes.data.data;
          const now = new Date();

          // 1. Daily Deals: daily, flash, weekend, or ending in <= 3 days
          const daily = offersList.filter((o) => {
            if (o.offerType === 'clearance') return false;
            const diffDays = Math.ceil((new Date(o.endDate) - now) / (1000 * 60 * 60 * 24));
            return ['daily', 'flash', 'weekend'].includes(o.offerType) || diffDays <= 3;
          });
          setDailyOffers(daily.slice(0, 6));

          // 2. Monthly Deals: festival, special_price, or validity > 7 days
          const monthly = offersList.filter((o) => {
            if (o.offerType === 'clearance') return false;
            const diffDays = Math.ceil((new Date(o.endDate) - now) / (1000 * 60 * 60 * 24));
            return diffDays > 7 || ['festival', 'special_price', 'percentage'].includes(o.offerType);
          });
          setMonthlyOffers(monthly.slice(0, 4));

          // 3. Clearance Deals: offerType is clearance
          const clearance = offersList.filter((o) => o.offerType === 'clearance');
          setClearanceOffers(clearance.slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching homepage data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [selectedLocation]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/deals?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      
      {/* 1. HERO SECTION (Light, spacious, clean SaaS style) */}
      <section className="relative overflow-hidden bg-[#F8FAFC] border-b border-[#E2E8F0] pt-14 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Subtle background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
          <div className="absolute -top-24 left-1/4 w-96 h-96 bg-[#D1FAE5]/40 rounded-full blur-3xl"></div>
          <div className="absolute -top-24 right-1/4 w-96 h-96 bg-[#E0F2FE]/40 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E2E8F0] text-[#047857] text-xs font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            <MapPin className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Hyperlocal Discovery in Perinthalmanna & Angadipuram</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0F172A] leading-tight">
            What’s happening{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#0EA5E9]">
              around you today?
            </span>
          </h1>

          <p className="text-[#334155] text-sm sm:text-base max-w-2xl mx-auto font-normal leading-relaxed">
            Discover verified local discounts, trending food spots, fashion sales, and neighborhood shops in{' '}
            <strong className="text-[#0F172A] font-semibold">{getSelectedLocationName()}</strong> with zero generic noise.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto pt-2">
            <div className="flex flex-col sm:flex-row items-center gap-2 bg-white p-2 rounded-xl border border-[#E2E8F0] shadow-card">
              <div className="flex items-center gap-2.5 px-3 flex-1 w-full">
                <Search className="w-4 h-4 text-[#94A3B8] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search shops, biriyani, shoes, discounts..."
                  className="w-full bg-transparent text-[#0F172A] placeholder-[#94A3B8] text-sm focus:outline-none py-2"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="submit"
                  className="w-full sm:w-auto btn-primary !py-2.5 !px-6 text-xs"
                >
                  Search
                </button>
              </div>
            </div>
          </form>

          {/* Location Fast Toggles */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
            <span className="text-[#64748B] font-medium">Quick Town:</span>
            <button
              onClick={() => changeLocation('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedLocation === 'all'
                  ? 'bg-[#10B981] text-white shadow-xs'
                  : 'bg-white text-[#334155] border border-[#E2E8F0] hover:bg-[#F1F5F9]'
              }`}
            >
              All Locations
            </button>
            <button
              onClick={() => changeLocation('perinthalmanna')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedLocation === 'perinthalmanna'
                  ? 'bg-[#10B981] text-white shadow-xs'
                  : 'bg-white text-[#334155] border border-[#E2E8F0] hover:bg-[#F1F5F9]'
              }`}
            >
              📍 Perinthalmanna
            </button>
            <button
              onClick={() => changeLocation('angadipuram')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedLocation === 'angadipuram'
                  ? 'bg-[#10B981] text-white shadow-xs'
                  : 'bg-white text-[#334155] border border-[#E2E8F0] hover:bg-[#F1F5F9]'
              }`}
            >
              📍 Angadipuram
            </button>
          </div>

          {/* Hero CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <Link
              to="/deals"
              className="btn-primary flex items-center gap-2"
            >
              <Tag className="w-4 h-4" />
              <span>Explore All Deals</span>
            </Link>

            <button
              onClick={openAssistant}
              className="btn-secondary flex items-center gap-2 !border-[#10B981]/40 !text-[#047857] hover:!bg-[#ECFDF5]"
            >
              <Sparkles className="w-4 h-4 text-[#0EA5E9]" />
              <span>Ask PMNA Assistant</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 1. DAILY DEALS — Offers Available Today & Dedicated Subscribed Showcases   */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse"></span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                1. Daily Deals & Offers
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              Offers available today, limited-time flash sales, and dedicated shop showcases in{' '}
              <strong className="text-[#0F172A] font-semibold">{getSelectedLocationName()}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/business/showcase"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#047857] hover:text-[#10B981] bg-[#ECFDF5] hover:bg-[#D1FAE5] px-3.5 py-2 rounded-xl transition-all border border-[#A7F3D0] shadow-xs"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Promote Your Shop Space</span>
            </Link>
          </div>
        </div>

        {/* Subscribed Merchant Showcase Cards */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((n) => (
              <div key={n} className="h-96 rounded-2xl bg-[#F1F5F9] animate-pulse border border-[#E2E8F0]"></div>
            ))}
          </div>
        ) : showcases.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {showcases.map((sc) => (
              <ShopShowcaseCard key={sc._id} showcase={sc} />
            ))}
          </div>
        ) : null}

        {/* Limited-Time / Flash Today's Deals Grid */}
        {dailyOffers.length > 0 && (
          <div className="pt-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#10B981]" />
                <h3 className="text-base font-bold text-[#0F172A]">Limited-Time Store Deals Ending Soon</h3>
              </div>
              <Link to="/deals" className="text-xs font-semibold text-[#047857] hover:text-[#10B981] flex items-center gap-1">
                <span>View All Daily Deals</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {dailyOffers.map((offer) => (
                <OfferCard key={offer._id} offer={offer} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 2. MONTHLY DEALS — Offers Valid for a Longer Period                        */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9]"></span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                2. Monthly Deals & Long-Term Offers
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              Offers valid for an extended period — month-long savings, festive packages, and seasonal celebration passes
            </p>
          </div>

          <Link
            to="/deals"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#0369A1] hover:text-[#0EA5E9] bg-[#E0F2FE] hover:bg-[#BAE6FD] px-3.5 py-1.5 rounded-lg transition-colors shrink-0"
          >
            <span>All Monthly Deals</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-64 rounded-xl bg-[#F1F5F9] animate-pulse border border-[#E2E8F0]"></div>
            ))}
          </div>
        ) : monthlyOffers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {monthlyOffers.map((offer) => (
              <OfferCard key={offer._id} offer={offer} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white rounded-xl border border-[#E2E8F0]">
            <p className="text-xs text-[#64748B]">No active monthly campaigns right now in this town.</p>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 3. OTHER HOME CONTENT — Existing PMNA Features (Categories, AI, Food, etc)*/}
      {/* ========================================================================= */}
      
      {/* 3A. CATEGORIES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#0F172A]">Explore by Category</h2>
            <p className="text-xs text-[#64748B]">Find shops and offers tailored to your shopping needs</p>
          </div>
          <Link to="/deals" className="text-xs font-semibold text-[#047857] hover:text-[#10B981] flex items-center gap-1">
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {categories.slice(0, 8).map((cat) => (
            <Link
              key={cat._id}
              to={`/deals?category=${cat._id}`}
              className="group p-3 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#10B981] hover:shadow-card transition-all text-center flex flex-col items-center justify-center gap-2"
            >
              <div className="w-10 h-10 rounded-lg bg-[#ECFDF5] text-[#047857] group-hover:bg-[#10B981] group-hover:text-white flex items-center justify-center font-bold text-sm transition-colors">
                {cat.name[0]}
              </div>
              <span className="text-xs font-semibold text-[#334155] group-hover:text-[#047857] transition-colors truncate w-full">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3B. PMNA ASSISTANT BRAND PROMOTIONAL BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#10B981] to-[#0EA5E9] text-white p-6 sm:p-10 shadow-elevated">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Grounded Local AI Discovery</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Looking for something specific? Ask PMNA Assistant.
            </h2>

            <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
              Our AI assistant is connected live to PMNA’s database of verified shops and active promotions. It never hallucinates fake stores or expired deals.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => sendMessage('🍔 Find food under ₹200')}
                className="text-xs font-semibold bg-white/15 hover:bg-white text-white hover:text-[#0F172A] px-3 py-1.5 rounded-full border border-white/30 transition-colors"
              >
                "Find food under ₹200"
              </button>
              <button
                onClick={() => sendMessage('👟 Any shoe offers today?')}
                className="text-xs font-semibold bg-white/15 hover:bg-white text-white hover:text-[#0F172A] px-3 py-1.5 rounded-full border border-white/30 transition-colors"
              >
                "Any shoe offers today?"
              </button>
              <button
                onClick={() => sendMessage('📍 What deals are available in Angadipuram?')}
                className="text-xs font-semibold bg-white/15 hover:bg-white text-white hover:text-[#0F172A] px-3 py-1.5 rounded-full border border-white/30 transition-colors"
              >
                "What's in Angadipuram?"
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3C. POPULAR FOOD & DINING SPOTS */}
      {featuredFood.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-[#F59E0B]" />
                <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">Popular Food & Dining</h2>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">Top culinary spots and biriyani deals in {getSelectedLocationName()}</p>
            </div>
            <Link
              to="/food"
              className="text-xs font-semibold text-[#047857] hover:text-[#10B981] flex items-center gap-1"
            >
              <span>Explore Food</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredFood.map((foodOffer) => (
              <OfferCard key={foodOffer._id} offer={foodOffer} />
            ))}
          </div>
        </section>
      )}

      {/* 3D. VERIFIED SHOPS DIRECTORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-[#10B981]" />
              <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">Verified Neighborhood Shops</h2>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">Approved local merchants serving Perinthalmanna & Angadipuram</p>
          </div>
          <Link
            to="/businesses"
            className="text-xs font-semibold text-[#047857] hover:text-[#10B981] flex items-center gap-1"
          >
            <span>All Shops</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {verifiedShops.map((biz) => (
            <BusinessCard key={biz._id} business={biz} />
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* LAST SECTION: SHOP CLEARANCE — End-of-Stock & Liquidation Offers          */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#FFFBEB] to-[#FEF3C7] rounded-3xl p-6 sm:p-8 border-2 border-[#FDE68A] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#FCD34D]/60">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#DC2626] text-white shadow-xs">
                  Steep Discounts
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#78350F] tracking-tight">
                  Shop Clearance & End-of-Stock
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#92400E] mt-1">
                Verified shops in <strong className="font-bold">{getSelectedLocationName()}</strong> clearing out seasonal inventory, warehouse liquidation, and last-piece bargains.
              </p>
            </div>

            <Link
              to="/deals?offerType=clearance"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#78350F] bg-white hover:bg-[#FEF9C3] px-4 py-2 rounded-xl transition-all border border-[#FDE68A] shadow-xs self-start sm:self-auto"
            >
              <span>Browse All Clearance</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {clearanceOffers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {clearanceOffers.map((offer) => (
                <OfferCard key={offer._id} offer={offer} />
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white/70 border border-[#FDE68A] text-center space-y-2">
              <Percent className="w-8 h-8 text-[#D97706] mx-auto" />
              <h3 className="text-sm font-bold text-[#78350F]">No Active Clearance Sales Today</h3>
              <p className="text-xs text-[#92400E]">Local shops list their seasonal stock liquidations periodically. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
};
