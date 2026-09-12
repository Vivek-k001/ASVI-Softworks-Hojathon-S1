import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ReportModal } from '../components/common/ReportModal';
import {
  MapPin,
  Clock,
  ShieldCheck,
  Tag,
  Phone,
  Store,
  AlertTriangle,
  ArrowLeft,
  Share2,
  Calendar,
} from 'lucide-react';

export const OfferDetail = () => {
  const { id } = useParams();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchOffer = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/offers/${id}`);
        if (res.data?.success) {
          setOffer(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load offer details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOffer();
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: offer?.title,
        text: `Check out this deal in PMNA: ${offer?.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="h-96 rounded-xl bg-[#F1F5F9] animate-pulse border border-[#E2E8F0]"></div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#0F172A]">Offer not found or has expired</h2>
        <p className="text-xs text-[#64748B]">This deal is no longer active in our database.</p>
        <Link
          to="/deals"
          className="btn-primary text-xs inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Deals</span>
        </Link>
      </div>
    );
  }

  const business = offer.businessId || {};
  const location = offer.locationId?.name || 'Perinthalmanna';
  const category = offer.categoryId?.name || 'General';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back Button */}
      <Link
        to="/deals"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#047857] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to all deals
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Image & Offer Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Main Cover Image */}
          <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-[#F1F5F9] shadow-card border border-[#E2E8F0]">
            <img
              src={offer.imageUrl || business.coverUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&h=600&fit=crop'}
              alt={offer.title}
              className="w-full h-full object-cover"
            />
            {offer.discountPercentage > 0 && (
              <div className="absolute top-4 left-4 bg-[#EF4444] text-white font-bold text-sm px-3.5 py-1.5 rounded-full shadow-sm tracking-wider">
                {offer.discountPercentage}% OFF
              </div>
            )}
            <button
              onClick={handleShare}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur-xs text-[#334155] hover:text-[#047857] shadow-sm transition-colors"
              title="Share deal"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {copied && (
              <div className="absolute top-16 right-4 text-[11px] font-bold bg-[#0F172A] text-white px-2.5 py-1 rounded-md shadow">
                Link copied!
              </div>
            )}
          </div>

          {/* Offer Title & Summary */}
          <div className="card space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge-draft">
                {category}
              </span>
              <span className="badge-confirmed">
                📍 {location}
              </span>
              {offer.offerType && (
                <span className="badge-pending uppercase">
                  {offer.offerType.replace('_', ' ')}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight leading-snug">
              {offer.title}
            </h1>

            {/* Pricing Callout */}
            <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-baseline gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#64748B] block">Offer Price</span>
                <span className="text-3xl font-bold text-[#0F172A]">₹{offer.offerPrice}</span>
              </div>
              {offer.originalPrice && offer.originalPrice > offer.offerPrice && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">Original</span>
                  <span className="text-lg text-[#94A3B8] line-through">₹{offer.originalPrice}</span>
                </div>
              )}
              {offer.discountPercentage > 0 && (
                <div className="ml-auto">
                  <span className="text-xs font-semibold text-[#047857] bg-[#ECFDF5] px-2.5 py-1 rounded-md">
                    You Save ₹{offer.originalPrice - offer.offerPrice}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2">Details</h3>
              <p className="text-sm text-[#334155] leading-relaxed whitespace-pre-line">
                {offer.description || 'No additional description provided.'}
              </p>
            </div>

            {/* Terms & Conditions */}
            {offer.terms && (
              <div className="pt-4 border-t border-[#E2E8F0]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">Terms & Conditions</h3>
                <p className="text-xs text-[#64748B] leading-relaxed italic">{offer.terms}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Merchant & Validity Card */}
        <div className="space-y-6">
          
          {/* Validity Box */}
          <div className="card space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Offer Validity</h3>
            
            <div className="flex items-center gap-2.5 text-xs text-[#334155] font-semibold">
              <Calendar className="w-4 h-4 text-[#10B981] shrink-0" />
              <span>
                Valid until {new Date(offer.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            {offer.startTime && offer.endTime && (
              <div className="flex items-center gap-2.5 text-xs text-[#334155] font-semibold">
                <Clock className="w-4 h-4 text-[#F59E0B] shrink-0" />
                <span>Daily: {offer.startTime} – {offer.endTime}</span>
              </div>
            )}

            <div className="text-[11px] text-[#64748B] pt-2 border-t border-[#E2E8F0]">
              * Show this listing at the merchant billing counter to redeem.
            </div>
          </div>

          {/* Merchant Profile Box */}
          <div className="card space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Merchant Information</h3>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-[#F1F5F9] overflow-hidden shrink-0 border border-[#E2E8F0]">
                <img
                  src={business.logoUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop'}
                  alt={business.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 font-bold text-sm text-[#0F172A] truncate">
                  <span className="truncate">{business.name}</span>
                  {business.isVerified && <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />}
                </div>
                <div className="text-xs text-[#64748B] truncate">{location}</div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-[#64748B] pt-2 border-t border-[#E2E8F0]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#94A3B8] shrink-0 mt-0.5" />
                <span>{business.address}</span>
              </div>
              {business.openingHours && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#94A3B8] shrink-0" />
                  <span>{business.openingHours}</span>
                </div>
              )}
              {business.phone && (
                <div className="flex items-center gap-2 font-medium text-[#0F172A]">
                  <Phone className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>{business.phone}</span>
                </div>
              )}
            </div>

            <Link
              to={`/businesses/${business._id}`}
              className="w-full btn-outline text-xs !py-2.5 flex items-center justify-center gap-1.5"
            >
              <Store className="w-4 h-4" />
              <span>View Full Shop Profile</span>
            </Link>
          </div>

          {/* Report Button */}
          <button
            onClick={() => setReportModalOpen(true)}
            className="w-full py-2 rounded-lg text-[#64748B] hover:text-[#EF4444] hover:bg-[#FEE2E2] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Report inaccurate offer</span>
          </button>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="offer"
        targetId={offer._id}
        targetTitle={offer.title}
      />
    </div>
  );
};
