import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  ExternalLink,
  Store,
  Navigation,
  Phone,
  ShieldCheck,
  Tag,
  ArrowRight,
  Clock,
} from 'lucide-react';

export const ShopShowcaseCard = ({ showcase }) => {
  if (!showcase) return null;

  const {
    title,
    description,
    imageUrl,
    discount,
    expiryDate,
    businessId: business,
    targetOfferId,
  } = showcase;

  const businessName = business?.name || 'Local Verified Shop';
  const businessAddress = business?.address || 'Perinthalmanna, Kerala';
  const locationName = business?.locationId?.name || (typeof business?.locationId === 'string' ? business.locationId : 'Perinthalmanna');
  const logoUrl = business?.logoUrl || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=100&h=100&fit=crop';
  const phone = business?.phone;

  // Format Expiry Date
  let expiryText = 'Limited Time Offer';
  let daysLeft = null;
  if (expiryDate) {
    const exp = new Date(expiryDate);
    const now = new Date();
    const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
    daysLeft = diffDays;
    const dateFormatted = exp.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    expiryText = diffDays > 0 ? `Valid till ${dateFormatted} (${diffDays} days left)` : `Expired on ${dateFormatted}`;
  }

  // Google Maps Directions link
  const directionsQuery = encodeURIComponent(`${businessName}, ${businessAddress}`);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${directionsQuery}`;

  return (
    <article className="group relative bg-white rounded-2xl border-2 border-[#E2E8F0] hover:border-[#10B981] shadow-card hover:shadow-card-elevated transition-all duration-300 flex flex-col overflow-hidden">
      
      {/* Top Newspaper Ad Masthead Header */}
      <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-extrabold uppercase tracking-wider text-[11px] px-2 py-0.5 rounded bg-[#10B981] text-white shadow-xs">
            <Tag className="w-3 h-3" />
            Daily Showcase
          </span>
          <span className="hidden sm:inline text-[#64748B] font-medium text-[11px]">
            Verified Merchant Space
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#047857] bg-[#ECFDF5] px-2.5 py-0.5 rounded-full border border-[#D1FAE5]">
          <Clock className="w-3 h-3 text-[#10B981]" />
          <span>{daysLeft !== null && daysLeft <= 3 ? `Hurry! ${expiryText}` : expiryText}</span>
        </div>
      </div>

      {/* Shop Identity Bar */}
      <div className="p-4 pb-3 flex items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={logoUrl}
            alt={businessName}
            className="w-12 h-12 rounded-xl object-cover border border-[#E2E8F0] shadow-xs shrink-0"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=100&h=100&fit=crop';
            }}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-bold text-[#0F172A] truncate group-hover:text-[#047857] transition-colors">
                {businessName}
              </h3>
              <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" title="PMNA Verified Local Business" />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#64748B] mt-0.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
              <span className="truncate">{locationName} • {businessAddress}</span>
            </div>
          </div>
        </div>

        {phone && (
          <a
            href={`tel:${phone}`}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#334155] hover:border-[#10B981] hover:text-[#047857] hover:bg-[#F0FDF4] transition-colors shrink-0"
            title={`Call ${businessName}`}
          >
            <Phone className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Call Shop</span>
          </a>
        )}
      </div>

      {/* Centerpiece: Large Promotional Display Banner Image */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] bg-[#0F172A] overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&h=600&fit=crop';
          }}
        />

        {/* Subtle Dark Gradient Overlay for readability of floating badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>

        {/* Floating High-Contrast Discount Badge */}
        {discount && (
          <div className="absolute top-3 left-3 bg-[#10B981] text-white px-3.5 py-1.5 rounded-lg font-black text-xs sm:text-sm tracking-wide shadow-md flex items-center gap-1.5 border border-white/20">
            <Tag className="w-4 h-4 text-white" />
            <span>{discount}</span>
          </div>
        )}

        {/* Quick Town Pill */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs text-[#0F172A] text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs border border-white/40 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-[#10B981]" />
          <span>{locationName}</span>
        </div>

        {/* Floating Headline Ribbon at bottom of banner */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h4 className="text-base sm:text-lg font-extrabold drop-shadow-md leading-snug line-clamp-2">
            {title}
          </h4>
        </div>
      </div>

      {/* Ad Details Description Copy */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-white">
        <p className="text-xs sm:text-sm text-[#475569] leading-relaxed line-clamp-3">
          {description || 'Exclusive local promotional offer available now at this registered shop. Visit in person or contact the store for direct availability.'}
        </p>

        {/* Action Buttons Footer (Manorama Ad Box actions) */}
        <div className="pt-3 border-t border-[#F1F5F9] grid grid-cols-2 sm:grid-cols-3 gap-2">
          
          {/* 1. View Offer CTA */}
          {targetOfferId ? (
            <Link
              to={`/deals/${targetOfferId?._id || targetOfferId}`}
              className="btn-primary col-span-2 sm:col-span-1 !py-2 !px-3 text-xs flex items-center justify-center gap-1.5 text-center font-bold"
            >
              <span>View Offer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <Link
              to={business?._id ? `/shops/${business._id}` : '/deals'}
              className="btn-primary col-span-2 sm:col-span-1 !py-2 !px-3 text-xs flex items-center justify-center gap-1.5 text-center font-bold"
            >
              <span>View Deal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {/* 2. View Shop CTA */}
          <Link
            to={business?._id ? `/shops/${business._id}` : '/shops'}
            className="btn-secondary !py-2 !px-3 text-xs flex items-center justify-center gap-1.5 text-center font-semibold !text-[#0F172A] hover:!border-[#10B981]"
          >
            <Store className="w-3.5 h-3.5 text-[#10B981]" />
            <span>View Shop</span>
          </Link>

          {/* 3. Get Directions CTA */}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary !py-2 !px-3 text-xs flex items-center justify-center gap-1.5 text-center font-semibold !text-[#0369A1] !border-[#BAE6FD] hover:!bg-[#F0F9FF]"
            title="Open Google Maps Directions"
          >
            <Navigation className="w-3.5 h-3.5 text-[#0EA5E9]" />
            <span>Directions</span>
          </a>
        </div>
      </div>
    </article>
  );
};
