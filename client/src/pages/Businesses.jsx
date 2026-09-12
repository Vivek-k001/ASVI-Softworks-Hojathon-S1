import React, { useState, useEffect } from 'react';
import { useLocation } from '../context/LocationContext';
import api from '../services/api';
import { BusinessCard } from '../components/business/BusinessCard';
import { Store, Search, Filter } from 'lucide-react';

export const Businesses = () => {
  const { locations, selectedLocation, changeLocation, getSelectedLocationName } = useLocation();
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

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
    const fetchBusinesses = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (selectedLocation && selectedLocation !== 'all') queryParams.append('location', selectedLocation);
        if (category && category !== 'all') queryParams.append('category', category);
        if (search) queryParams.append('search', search);

        const res = await api.get(`/businesses?${queryParams.toString()}`);
        if (res.data?.success) {
          setBusinesses(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load businesses', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBusinesses();
  }, [selectedLocation, category, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
            <Store className="w-6 h-6 text-[#10B981]" />
            <span>Local Shops & Businesses</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Verified local merchants in <strong className="text-[#0F172A]">{getSelectedLocationName()}</strong>
          </p>
        </div>

        {/* Search */}
        <div className="relative sm:w-72">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shops by name, address..."
            className="w-full text-xs rounded-lg border border-[#E2E8F0] pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#D1FAE5] bg-white transition-all"
          />
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        <button
          onClick={() => changeLocation('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            selectedLocation === 'all'
              ? 'bg-[#10B981] text-white border-[#10B981] shadow-xs'
              : 'bg-white text-[#334155] border-[#E2E8F0] hover:bg-[#F8FAFC]'
          }`}
        >
          All Locations
        </button>
        {locations.map((loc) => (
          <button
            key={loc._id}
            onClick={() => changeLocation(loc._id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              selectedLocation === loc._id
                ? 'bg-[#10B981] text-white border-[#10B981] shadow-xs'
                : 'bg-white text-[#334155] border-[#E2E8F0] hover:bg-[#F8FAFC]'
            }`}
          >
            📍 {loc.name}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#64748B]" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="text-xs rounded-lg border border-[#E2E8F0] px-3 py-1.5 bg-white focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#D1FAE5] text-[#334155]"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-72 rounded-xl bg-[#F1F5F9] animate-pulse border border-[#E2E8F0]"></div>
          ))}
        </div>
      ) : businesses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {businesses.map((biz) => (
            <BusinessCard key={biz._id} business={biz} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 card space-y-2">
          <Store className="w-10 h-10 text-[#94A3B8] mx-auto" />
          <h3 className="text-sm font-bold text-[#0F172A]">No businesses found in this area</h3>
          <p className="text-xs text-[#64748B]">Try switching your category or location filters.</p>
        </div>
      )}
    </div>
  );
};
