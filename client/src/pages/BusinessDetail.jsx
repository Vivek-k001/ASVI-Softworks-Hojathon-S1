import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { OfferCard } from '../components/offers/OfferCard';
import { ReportModal } from '../components/common/ReportModal';
import {
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  Tag,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';

export const BusinessDetail = () => {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    const fetchBusiness = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/businesses/${id}`);
        if (res.data?.success) {
          setBusiness(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load business profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBusiness();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="h-96 rounded-xl bg-[#F1F5F9] animate-pulse border border-[#E2E8F0]"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#0F172A]">Shop profile not found</h2>
        <Link
          to="/businesses"
          className="btn-primary text-xs inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shops Directory</span>
        </Link>
      </div>
    );
  }

  const offers = business.offers || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link */}
      <Link
        to="/businesses"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#047857] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to shops directory
      </Link>

      {/* Hero Cover Card */}
      <div className="card !p-0 overflow-hidden">
        <div className="relative h-48 sm:h-64 w-full bg-[#F1F5F9]">
          <img
            src={business.coverUrl || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&h=500&fit=crop'}
            alt={business.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        </div>

        <div className="p-6 sm:p-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-white p-1 shadow-elevated border border-[#E2E8F0] overflow-hidden shrink-0">
                <img
                  src={business.logoUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop'}
                  alt={business.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">{business.name}</h1>
                  {business.isVerified && (
                    <span className="badge-confirmed text-xs">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#64748B]">{business.categoryId?.name} • {business.locationId?.name}</p>
              </div>
            </div>

            <button
              onClick={() => setReportModalOpen(true)}
              className="text-xs text-[#64748B] hover:text-[#EF4444] flex items-center gap-1 self-start sm:self-auto transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Report Shop</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm text-[#334155] leading-relaxed max-w-3xl mb-6">
            {business.description || 'Welcome to our local store in Perinthalmanna & Angadipuram.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#E2E8F0] text-xs text-[#64748B]">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#10B981] shrink-0" />
              <span className="truncate">{business.address}</span>
            </div>
            {business.openingHours && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#F59E0B] shrink-0" />
                <span>{business.openingHours}</span>
              </div>
            )}
            {business.phone && (
              <div className="flex items-center gap-2 font-semibold text-[#0F172A]">
                <Phone className="w-4 h-4 text-[#10B981] shrink-0" />
                <span>{business.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Deals Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#10B981]" />
            <h2 className="text-lg font-bold text-[#0F172A]">Active Deals from {business.name}</h2>
          </div>
          <span className="text-xs font-semibold text-[#64748B]">
            {offers.length} deal{offers.length !== 1 ? 's' : ''} available
          </span>
        </div>

        {offers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <OfferCard
                key={offer._id}
                offer={{
                  ...offer,
                  businessId: {
                    _id: business._id,
                    name: business.name,
                    isVerified: business.isVerified,
                  },
                  locationId: business.locationId,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 card space-y-2">
            <Tag className="w-8 h-8 text-[#94A3B8] mx-auto" />
            <p className="text-xs font-semibold text-[#0F172A]">No active offers from this merchant at the moment.</p>
            <p className="text-xs text-[#64748B]">Check back soon for new promotions!</p>
          </div>
        )}
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="business"
        targetId={business._id}
        targetTitle={business.name}
      />
    </div>
  );
};
