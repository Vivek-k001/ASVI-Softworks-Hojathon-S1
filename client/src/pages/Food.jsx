import React, { useState, useEffect } from 'react';
import { useLocation } from '../context/LocationContext';
import api from '../services/api';
import { OfferCard } from '../components/offers/OfferCard';
import { BusinessCard } from '../components/business/BusinessCard';
import { UtensilsCrossed, MapPin, Store, Tag, Search } from 'lucide-react';

export const Food = () => {
  const { locations, selectedLocation, changeLocation, getSelectedLocationName } = useLocation();
  const [foodOffers, setFoodOffers] = useState([]);
  const [foodBusinesses, setFoodBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('offers'); // 'offers' | 'spots'
  const [foodSearch, setFoodSearch] = useState('');
  const [foodMaxPrice, setFoodMaxPrice] = useState('');

  useEffect(() => {
    const fetchFoodData = async () => {
      setLoading(true);
      try {
        const locParam = selectedLocation !== 'all' ? `?location=${selectedLocation}` : '';

        // Fetch categories to identify food category IDs
        const catRes = await api.get('/categories');
        const foodCats = catRes.data?.data?.filter((c) => c.isFoodRelated) || [];
        const foodCatIds = foodCats.map((c) => c._id);

        const [offersRes, bizRes] = await Promise.all([
          api.get(`/offers${locParam}`),
          api.get(`/businesses${locParam}`),
        ]);

        if (offersRes.data?.success) {
          const filteredOffers = offersRes.data.data.filter((o) =>
            foodCatIds.includes(o.categoryId?._id || o.categoryId)
          );
          setFoodOffers(filteredOffers);
        }

        if (bizRes.data?.success) {
          const filteredBiz = bizRes.data.data.filter((b) =>
            foodCatIds.includes(b.categoryId?._id || b.categoryId)
          );
          setFoodBusinesses(filteredBiz);
        }
      } catch (err) {
        console.error('Failed to load food section', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFoodData();
  }, [selectedLocation]);

  // Derived filtered items based on search and price
  const displayedOffers = foodOffers.filter((offer) => {
    const matchesSearch =
      !foodSearch ||
      offer.title?.toLowerCase().includes(foodSearch.toLowerCase()) ||
      offer.businessId?.name?.toLowerCase().includes(foodSearch.toLowerCase()) ||
      offer.description?.toLowerCase().includes(foodSearch.toLowerCase());
    const matchesPrice = !foodMaxPrice || offer.offerPrice <= Number(foodMaxPrice);
    return matchesSearch && matchesPrice;
  });

  const displayedBusinesses = foodBusinesses.filter((biz) => {
    return (
      !foodSearch ||
      biz.name?.toLowerCase().includes(foodSearch.toLowerCase()) ||
      biz.description?.toLowerCase().includes(foodSearch.toLowerCase()) ||
      biz.address?.toLowerCase().includes(foodSearch.toLowerCase())
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Clean SaaS Hero Header */}
      <div className="card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] text-[#047857] text-xs font-semibold">
            <UtensilsCrossed className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Culinary & Dining Guide</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            Food Spots & Dining Deals
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
            Discover authentic Malabar biriyani, artisan bakeries, juice bars, and cafes in{' '}
            <strong className="text-[#0F172A] font-semibold">{getSelectedLocationName()}</strong>.
          </p>
        </div>

        {/* Location selector pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => changeLocation('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              selectedLocation === 'all'
                ? 'bg-[#10B981] text-white border-[#10B981] shadow-xs'
                : 'bg-white text-[#334155] border-[#E2E8F0] hover:bg-[#F8FAFC]'
            }`}
          >
            All Towns
          </button>
          {locations.map((loc) => (
            <button
              key={loc._id}
              onClick={() => changeLocation(loc._id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                selectedLocation === loc._id
                  ? 'bg-[#10B981] text-white border-[#10B981] shadow-xs'
                  : 'bg-white text-[#334155] border-[#E2E8F0] hover:bg-[#F8FAFC]'
              }`}
            >
              📍 {loc.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0] self-start">
          <button
            onClick={() => setActiveTab('offers')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'offers'
                ? 'bg-white text-[#0F172A] shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Dining Deals ({displayedOffers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('spots')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'spots'
                ? 'bg-white text-[#0F172A] shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-[#0EA5E9]" />
            <span>Restaurants & Cafes ({displayedBusinesses.length})</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
            <input
              type="text"
              value={foodSearch}
              onChange={(e) => setFoodSearch(e.target.value)}
              placeholder="Search biriyani, cafe..."
              className="text-xs rounded-lg border border-[#E2E8F0] pl-9 pr-3 py-2 bg-white focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#D1FAE5] transition-all"
            />
          </div>

          {activeTab === 'offers' && (
            <select
              value={foodMaxPrice}
              onChange={(e) => setFoodMaxPrice(e.target.value)}
              className="text-xs rounded-lg border border-[#E2E8F0] px-3 py-2 bg-white focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#D1FAE5] text-[#334155]"
            >
              <option value="">Any Budget</option>
              <option value="150">Under ₹150</option>
              <option value="250">Under ₹250</option>
              <option value="400">Under ₹400</option>
              <option value="800">Under ₹800</option>
            </select>
          )}
        </div>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 rounded-xl bg-[#F1F5F9] animate-pulse border border-[#E2E8F0]"></div>
          ))}
        </div>
      ) : activeTab === 'offers' ? (
        displayedOffers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedOffers.map((offer) => (
              <OfferCard key={offer._id} offer={offer} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 card space-y-2">
            <UtensilsCrossed className="w-10 h-10 text-[#94A3B8] mx-auto" />
            <h3 className="font-bold text-sm text-[#0F172A]">No food offers match this search</h3>
            <p className="text-xs text-[#64748B]">Try expanding your price range or switching town filter.</p>
          </div>
        )
      ) : displayedBusinesses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedBusinesses.map((biz) => (
            <BusinessCard key={biz._id} business={biz} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 card space-y-2">
          <Store className="w-10 h-10 text-[#94A3B8] mx-auto" />
          <h3 className="font-bold text-sm text-[#0F172A]">No restaurants found</h3>
          <p className="text-xs text-[#64748B]">Try clearing your search query.</p>
        </div>
      )}

    </div>
  );
};
