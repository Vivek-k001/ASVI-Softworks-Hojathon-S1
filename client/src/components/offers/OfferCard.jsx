import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, ShieldCheck, Tag, ArrowRight } from 'lucide-react';

export const OfferCard = ({ offer }) => {
  if (!offer) return null;

  const business = offer.businessId || {};
  const location = offer.locationId?.name || 'Perinthalmanna';
  const category = offer.categoryId?.name || 'Offer';

  // Compute Expiry Label
  const getExpiryLabel = (endDateStr) => {
    if (!endDateStr) return null;
    const now = new Date();
    const end = new Date(endDateStr);
    const diffMs = end - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs <= 0) return { text: 'Expired', color: 'bg-red-50 text-red-700 border-red-200' };
    if (diffDays <= 1) return { text: 'Ends today', color: 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' };
    if (diffDays === 2) return { text: '2 days left', color: 'bg-amber-50 text-amber-800 border-amber-200' };
    return { text: `${diffDays} days left`, color: 'bg-slate-100 text-slate-700 border-slate-200' };
  };

  const expiry = getExpiryLabel(offer.endDate);

  return (
    <div className="group bg-white rounded-xl border border-[#E2E8F0] hover:border-[#10B981]/50 shadow-card hover:shadow-elevated transition-all duration-200 flex flex-col overflow-hidden">
      {/* Top Image Banner */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#F1F5F9]">
        <img
          src={offer.imageUrl || business.coverUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop'}
          alt={offer.title}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=400&fit=crop';
          }}
        />

        {/* Discount Badge */}
        {offer.discountPercentage > 0 && (
          <div className="absolute top-3 left-3 bg-[#EF4444] text-white font-bold text-xs px-2.5 py-0.5 rounded-full shadow-xs tracking-wider uppercase">
            {offer.discountPercentage}% OFF
          </div>
        )}

        {/* Expiry Pill */}
        {expiry && (
          <div className={`absolute top-3 right-3 text-[11px] font-semibold px-2 py-0.5 rounded-full border shadow-2xs ${expiry.color}`}>
            <Clock className="w-3 h-3 inline mr-1 -mt-0.5" />
            {expiry.text}
          </div>
        )}

        {/* Offer Type Badge */}
        {offer.offerType && offer.offerType !== 'percentage' && (
          <div className="absolute bottom-2 left-3 bg-[#0F172A]/80 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">
            {offer.offerType.replace('_', ' ')}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Business Row */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <Link
              to={`/businesses/${business._id || ''}`}
              className="text-xs font-semibold text-[#64748B] hover:text-[#10B981] flex items-center gap-1 truncate transition-colors"
            >
              <span className="truncate">{business.name || 'Local Merchant'}</span>
              {business.isVerified && (
                <ShieldCheck className="w-3.5 h-3.5 text-[#10B981] shrink-0 inline" title="Verified Business" />
              )}
            </Link>

            <span className="text-[11px] font-medium text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-sm shrink-0">
              {category}
            </span>
          </div>

          {/* Offer Title */}
          <h3 className="font-bold text-[#0F172A] text-sm leading-snug line-clamp-2 group-hover:text-[#10B981] transition-colors mb-2">
            {offer.title}
          </h3>

          {/* Location */}
          <div className="flex items-center text-xs text-[#64748B] gap-1 mb-3">
            <MapPin className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-[#E2E8F0] flex items-end justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#94A3B8] block -mb-0.5">Offer Price</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-[#0F172A]">
                ₹{offer.offerPrice}
              </span>
              {offer.originalPrice && offer.originalPrice > offer.offerPrice && (
                <span className="text-xs text-[#94A3B8] line-through">
                  ₹{offer.originalPrice}
                </span>
              )}
            </div>
          </div>

          <Link
            to={`/offers/${offer._id}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white text-xs font-semibold transition-all shadow-xs"
          >
            <span>View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
