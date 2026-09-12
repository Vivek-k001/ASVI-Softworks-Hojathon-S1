import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export const ResultCard = ({ item }) => {
  if (!item) return null;

  if (item.type === 'offer') {
    return (
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-3 shadow-card hover:shadow-elevated transition-shadow flex items-center gap-3 my-1.5">
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-14 h-14 rounded-lg object-cover bg-[#F1F5F9] shrink-0 border border-[#E2E8F0]"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 text-[10px] font-semibold text-[#64748B] truncate">
            <span>{item.businessName}</span>
            {item.isVerified && <ShieldCheck className="w-3 h-3 text-[#10B981] inline" />}
            <span>•</span>
            <span className="text-[#047857]">{item.location}</span>
          </div>

          <div className="text-xs font-bold text-[#0F172A] truncate">{item.title}</div>

          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm font-bold text-[#0F172A]">₹{item.offerPrice}</span>
            {item.originalPrice && item.originalPrice > item.offerPrice && (
              <span className="text-[10px] text-[#94A3B8] line-through">₹{item.originalPrice}</span>
            )}
            {item.discountPercentage > 0 && (
              <span className="text-[10px] font-semibold bg-[#ECFDF5] text-[#047857] px-1.5 py-0.5 rounded">
                {item.discountPercentage}% OFF
              </span>
            )}
          </div>
        </div>

        <Link
          to={`/offers/${item.id}`}
          className="p-2 rounded-lg bg-[#ECFDF5] hover:bg-[#10B981] text-[#047857] hover:text-white shrink-0 transition-colors"
          title="View Offer Details"
        >
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // Business Card result
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-3 shadow-card flex items-center gap-3 my-1.5">
      <div className="w-10 h-10 rounded-lg bg-[#ECFDF5] text-[#047857] flex items-center justify-center font-bold text-sm shrink-0">
        {item.name ? item.name[0] : 'S'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <div className="text-xs font-bold text-[#0F172A] truncate">{item.name}</div>
          {item.isVerified && <ShieldCheck className="w-3 h-3 text-[#10B981] inline shrink-0" />}
        </div>
        <div className="text-[11px] text-[#64748B] truncate">{item.category} • {item.location}</div>
        {item.openingHours && (
          <div className="text-[10px] text-[#94A3B8] truncate">{item.openingHours}</div>
        )}
      </div>

      <Link
        to={`/businesses/${item.id}`}
        className="p-1.5 rounded-lg bg-[#F8FAFC] hover:bg-[#10B981] hover:text-white text-[#64748B] shrink-0 transition-colors"
      >
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
};
