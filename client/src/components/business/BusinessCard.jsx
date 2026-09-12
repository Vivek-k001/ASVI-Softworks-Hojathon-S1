import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ShieldCheck, Tag, Clock, ArrowRight } from 'lucide-react';

export const BusinessCard = ({ business }) => {
  if (!business) return null;

  return (
    <div className="group bg-white rounded-xl border border-[#E2E8F0] hover:border-[#10B981]/50 shadow-card hover:shadow-elevated transition-all duration-200 overflow-hidden flex flex-col">
      {/* Cover Image */}
      <div className="relative aspect-[16/9] w-full bg-[#F1F5F9] overflow-hidden">
        <img
          src={business.coverUrl || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=350&fit=crop'}
          alt={business.name}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          loading="lazy"
        />

        {/* Category Pill */}
        <div className="absolute top-3 left-3 bg-[#0F172A]/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
          {business.categoryId?.name || 'Shop'}
        </div>

        {/* Verified Badge */}
        {business.isVerified && (
          <div className="absolute top-3 right-3 bg-[#D1FAE5] text-[#047857] text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs border border-[#10B981]/20">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Verified</span>
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-[#0F172A] text-base group-hover:text-[#10B981] transition-colors line-clamp-1">
              {business.name}
            </h3>
          </div>

          <p className="text-xs text-[#64748B] line-clamp-2 mb-3 leading-relaxed">
            {business.description || 'Local merchant serving quality products in Perinthalmanna & Angadipuram.'}
          </p>

          <div className="space-y-1.5 text-xs text-[#64748B] mb-4">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
              <span className="truncate">{business.address || business.locationId?.name}</span>
            </div>
            {business.openingHours && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
                <span>{business.openingHours}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Active Deals row */}
        <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            {business.activeOffersCount > 0 ? (
              <span className="text-[#047857] bg-[#ECFDF5] px-2 py-0.5 rounded-md flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#10B981]" />
                {business.activeOffersCount} Active Deal{business.activeOffersCount > 1 ? 's' : ''}
              </span>
            ) : (
              <span className="text-[#94A3B8] text-[11px]">No active offers today</span>
            )}
          </div>

          <Link
            to={`/businesses/${business._id}`}
            className="btn-secondary text-xs !py-1.5 !px-3"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
