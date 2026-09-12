import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLocation } from '../context/LocationContext';
import api from '../services/api';
import { OfferCard } from '../components/offers/OfferCard';
import {
  Filter,
  Search,
  RotateCcw,
  SlidersHorizontal,
  Percent,
  Clock,
  Tag,
  X,
} from 'lucide-react';

export const Deals = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { locations, selectedLocation, changeLocation } = useLocation();

  const [offers, setOffers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [offerType, setOfferType] = useState(searchParams.get('offerType') || 'all');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minDiscount, setMinDiscount] = useState(searchParams.get('minDiscount') || '');
  const [endingSoon, setEndingSoon] = useState(searchParams.get('endingSoon') === 'true');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data?.success) setCategories(res.data.data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (selectedLocation && selectedLocation !== 'all') queryParams.append('location', selectedLocation);
        if (category && category !== 'all') queryParams.append('category', category);
        if (offerType && offerType !== 'all') queryParams.append('offerType', offerType);
        if (minPrice) queryParams.append('minPrice', minPrice);
        if (maxPrice) queryParams.append('maxPrice', maxPrice);
        if (minDiscount) queryParams.append('minDiscount', minDiscount);
        if (endingSoon) queryParams.append('endingSoon', 'true');
        if (search) queryParams.append('search', search);
        if (sort) queryParams.append('sort', sort);

        const res = await api.get(`/offers?${queryParams.toString()}`);
        if (res.data?.success) {
          setOffers(res.data.data);
          setTotalCount(res.data.total || res.data.count);
        }
      } catch (err) {
        console.error('Failed to load offers', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [selectedLocation, category, offerType, minPrice, maxPrice, minDiscount, endingSoon, search, sort]);

  const resetFilters = () => {
    setSearch('');
    setCategory('all');
    setOfferType('all');
    setMinPrice('');
    setMaxPrice('');
    setMinDiscount('');
    setEndingSoon(false);
    setSort('newest');
    changeLocation('all');
    setSearchParams({});
  };

  const hasActiveFilters =
    selectedLocation !== 'all' ||
    category !== 'all' ||
    offerType !== 'all' ||
    minPrice !== '' ||
    maxPrice !== '' ||
    minDiscount !== '' ||
    endingSoon ||
    search !== '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
            <Tag className="w-6 h-6 text-[#10B981]" />
            <span>Discover Local Deals</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Found <strong className="text-[#0F172A] font-semibold">{totalCount}</strong> verified promotions in Perinthalmanna & Angadipuram
          </p>
        </div>

        {/* Search Bar & Mobile filter trigger */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search deals..."
              className="w-full text-xs rounded-lg border border-[#E2E8F0] pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#D1FAE5] bg-white transition-all"
            />
          </div>

          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="md:hidden btn-secondary !py-2 !px-3 text-xs"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-6">
        
        {/* Sidebar Filters */}
        <aside className={`${mobileFiltersOpen ? 'block' : 'hidden'} md:block md:col-span-1 space-y-5 card !p-5 h-fit`}>
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-1.5 font-bold text-xs text-[#0F172A] uppercase tracking-wider">
              <Filter className="w-4 h-4 text-[#10B981]" />
              <span>Filters</span>
            </div>
            <button
              onClick={resetFilters}
              className="text-[11px] font-semibold text-[#64748B] hover:text-[#EF4444] flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-2">Town / Location</label>
            <div className="space-y-1">
              <button
                onClick={() => changeLocation('all')}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  selectedLocation === 'all' ? 'bg-[#ECFDF5] text-[#047857]' : 'text-[#64748B] hover:bg-[#F8FAFC]'
                }`}
              >
                All Locations
              </button>
              {locations.map((loc) => (
                <button
                  key={loc._id}
                  onClick={() => changeLocation(loc._id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    selectedLocation === loc._id ? 'bg-[#ECFDF5] text-[#047857]' : 'text-[#64748B] hover:bg-[#F8FAFC]'
                  }`}
                >
                  📍 {loc.name}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-input text-xs"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Offer Type */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-2">Deal Type</label>
            <select
              value={offerType}
              onChange={(e) => setOfferType(e.target.value)}
              className="form-input text-xs"
            >
              <option value="all">All Deal Types</option>
              <option value="daily">Daily Offers</option>
              <option value="weekly">Weekly Offers</option>
              <option value="flash">Flash Deals</option>
              <option value="festival">Festival Offers</option>
              <option value="weekend">Weekend Offers</option>
              <option value="clearance">Clearance</option>
              <option value="bogo">Buy One Get One</option>
              <option value="percentage">Percentage Discount</option>
              <option value="special_price">Special Price</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-2">Price Range (₹)</label>
            <div className="flex items-center gap-2 mb-2">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-2.5 text-xs text-[#94A3B8]">₹</span>
                <input
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  className="w-full text-xs rounded-lg border border-[#E2E8F0] pl-6 pr-2 py-2 bg-white focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#D1FAE5]"
                />
              </div>
              <span className="text-xs text-[#94A3B8]">to</span>
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-2.5 text-xs text-[#94A3B8]">₹</span>
                <input
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  className="w-full text-xs rounded-lg border border-[#E2E8F0] pl-6 pr-2 py-2 bg-white focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#D1FAE5]"
                />
              </div>
            </div>

            {/* Quick Price Presets */}
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                onClick={() => { setMinPrice(''); setMaxPrice(maxPrice === '200' ? '' : '200'); }}
                className={`py-1.5 px-2 rounded-lg border text-center font-medium transition-colors ${
                  maxPrice === '200' && !minPrice ? 'bg-[#10B981] text-white border-[#10B981] font-semibold' : 'border-[#E2E8F0] text-[#334155] hover:bg-[#F8FAFC]'
                }`}
              >
                Under ₹200
              </button>
              <button
                onClick={() => { setMinPrice(''); setMaxPrice(maxPrice === '500' ? '' : '500'); }}
                className={`py-1.5 px-2 rounded-lg border text-center font-medium transition-colors ${
                  maxPrice === '500' && !minPrice ? 'bg-[#10B981] text-white border-[#10B981] font-semibold' : 'border-[#E2E8F0] text-[#334155] hover:bg-[#F8FAFC]'
                }`}
              >
                Under ₹500
              </button>
              <button
                onClick={() => { setMinPrice(''); setMaxPrice(maxPrice === '1000' ? '' : '1000'); }}
                className={`py-1.5 px-2 rounded-lg border text-center font-medium transition-colors ${
                  maxPrice === '1000' && !minPrice ? 'bg-[#10B981] text-white border-[#10B981] font-semibold' : 'border-[#E2E8F0] text-[#334155] hover:bg-[#F8FAFC]'
                }`}
              >
                Under ₹1,000
              </button>
              <button
                onClick={() => { setMinPrice(''); setMaxPrice(maxPrice === '2000' ? '' : '2000'); }}
                className={`py-1.5 px-2 rounded-lg border text-center font-medium transition-colors ${
                  maxPrice === '2000' && !minPrice ? 'bg-[#10B981] text-white border-[#10B981] font-semibold' : 'border-[#E2E8F0] text-[#334155] hover:bg-[#F8FAFC]'
                }`}
              >
                Under ₹2,000
              </button>
            </div>
          </div>

          {/* Discount Percentage */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-2">Minimum Discount</label>
            <div className="grid grid-cols-4 gap-1.5 text-xs">
              {['10', '20', '30', '50'].map((disc) => (
                <button
                  key={disc}
                  onClick={() => setMinDiscount(minDiscount === disc ? '' : disc)}
                  className={`py-1 px-1 rounded-lg border font-semibold text-center transition-colors ${
                    minDiscount === disc ? 'bg-[#0EA5E9] text-white border-[#0EA5E9]' : 'border-[#E2E8F0] text-[#334155] hover:bg-[#F8FAFC]'
                  }`}
                >
                  {disc}%+
                </button>
              ))}
            </div>
          </div>

          {/* Ending Soon Toggle */}
          <div className="pt-2 border-t border-[#E2E8F0]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={endingSoon}
                onChange={(e) => setEndingSoon(e.target.checked)}
                className="rounded border-[#E2E8F0] text-[#10B981] focus:ring-[#D1FAE5]"
              />
              <span className="text-xs font-semibold text-[#0F172A] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                Ending Today / Soon
              </span>
            </label>
          </div>

          {/* Sorting */}
          <div className="pt-2 border-t border-[#E2E8F0]">
            <label className="block text-xs font-semibold text-[#0F172A] mb-2">Sort By</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="form-input text-xs"
            >
              <option value="newest">Newest First</option>
              <option value="discount">Biggest Discount %</option>
              <option value="popular">Most Popular</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="endingSoon">Ending Soonest</option>
            </select>
          </div>
        </aside>

        {/* Offers Grid */}
        <main className="md:col-span-3 space-y-4">
          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-[#ECFDF5] border border-[#10B981]/20 rounded-xl">
              <span className="text-xs font-bold text-[#047857]">Active Filters:</span>

              {selectedLocation !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#E2E8F0] text-[#047857] text-xs font-semibold shadow-xs">
                  📍 {locations.find((l) => l._id === selectedLocation || l.slug === selectedLocation)?.name || selectedLocation}
                  <button onClick={() => changeLocation('all')} className="hover:text-[#EF4444]">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {category !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#E2E8F0] text-[#047857] text-xs font-semibold shadow-xs">
                  🏷️ {categories.find((c) => c._id === category)?.name || 'Category'}
                  <button onClick={() => setCategory('all')} className="hover:text-[#EF4444]">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {offerType !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#E2E8F0] text-[#047857] text-xs font-semibold shadow-xs">
                  ⚡ {offerType}
                  <button onClick={() => setOfferType('all')} className="hover:text-[#EF4444]">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {(minPrice || maxPrice) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#E2E8F0] text-[#047857] text-xs font-semibold shadow-xs">
                  💰 {minPrice ? `₹${minPrice}` : '₹0'} - {maxPrice ? `₹${maxPrice}` : 'Any'}
                  <button onClick={() => { setMinPrice(''); setMaxPrice(''); }} className="hover:text-[#EF4444]">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {minDiscount && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#0EA5E9]/30 text-[#0369A1] text-xs font-semibold shadow-xs">
                  💥 {minDiscount}%+ OFF
                  <button onClick={() => setMinDiscount('')} className="hover:text-[#EF4444]">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {endingSoon && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#F59E0B]/30 text-[#B45309] text-xs font-semibold shadow-xs">
                  ⏳ Ending Today
                  <button onClick={() => setEndingSoon(false)} className="hover:text-[#EF4444]">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#E2E8F0] text-[#0F172A] text-xs font-semibold shadow-xs">
                  🔍 "{search}"
                  <button onClick={() => setSearch('')} className="hover:text-[#EF4444]">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                onClick={resetFilters}
                className="text-[11px] font-bold text-[#EF4444] hover:underline ml-auto"
              >
                Clear All
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-72 rounded-xl bg-[#F1F5F9] animate-pulse border border-[#E2E8F0]"></div>
              ))}
            </div>
          ) : offers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map((offer) => (
                <OfferCard key={offer._id} offer={offer} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 card space-y-3">
              <Percent className="w-12 h-12 text-[#94A3B8] mx-auto" />
              <h3 className="text-base font-bold text-[#0F172A]">No active offers match these filters</h3>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                Try clearing some filters or changing your town to find more deals.
              </p>
              <button
                onClick={resetFilters}
                className="btn-primary text-xs !py-2 !px-4"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
