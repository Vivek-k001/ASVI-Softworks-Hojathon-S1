import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { PlusCircle, Tag, Trash2, Pause, Play, Edit2, ExternalLink, ArrowLeft } from 'lucide-react';

export const OffersList = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyOffers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/offers/my-offers');
      if (res.data?.success) {
        setOffers(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOffers();
  }, []);

  const handleToggleStatus = async (offerId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      await api.patch(`/offers/${offerId}/status`, { status: nextStatus });
      fetchMyOffers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to change status');
    }
  };

  const handleDelete = async (offerId) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;
    try {
      await api.delete(`/offers/${offerId}`);
      setOffers(offers.filter((o) => o._id !== offerId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete offer');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
        <div>
          <Link to="/business/dashboard" className="inline-flex items-center gap-1 text-xs text-[#64748B] hover:text-[#047857] mb-2 font-medium">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Manage Your Offers</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Track, pause, or update your live promotions across PMNA</p>
        </div>

        <Link
          to="/business/offers/new"
          className="btn-primary text-xs self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Offer</span>
        </Link>
      </div>

      {/* Offers List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 bg-[#F1F5F9] rounded-xl animate-pulse border border-[#E2E8F0]"></div>
          ))}
        </div>
      ) : offers.length > 0 ? (
        <div className="space-y-3">
          {offers.map((offer) => (
            <div
              key={offer._id}
              className="card !p-4 sm:!p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-16 h-16 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] overflow-hidden shrink-0">
                  <img
                    src={offer.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&h=120&fit=crop'}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={offer.status === 'active' ? 'badge-confirmed' : 'badge-pending'}
                    >
                      {offer.status}
                    </span>
                    <span className="text-xs font-semibold text-[#047857]">
                      {offer.discountPercentage}% OFF
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#0F172A] truncate">{offer.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-[#64748B] mt-0.5">
                    <span>Deal Price: <strong className="text-[#0F172A]">₹{offer.offerPrice}</strong></span>
                    {offer.originalPrice && <span className="line-through">₹{offer.originalPrice}</span>}
                    <span>• Expires {new Date(offer.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => handleToggleStatus(offer._id, offer.status)}
                  className={`btn-secondary text-xs !py-1.5 !px-3 ${
                    offer.status === 'active' ? 'text-[#B45309]' : 'text-[#047857]'
                  }`}
                  title={offer.status === 'active' ? 'Pause Offer' : 'Resume Offer'}
                >
                  {offer.status === 'active' ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Activate</span>
                    </>
                  )}
                </button>

                <Link
                  to={`/offers/${offer._id}`}
                  className="btn-secondary text-xs !py-1.5 !px-3"
                  title="View Public Link"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>View</span>
                </Link>

                <button
                  onClick={() => handleDelete(offer._id)}
                  className="p-2 rounded-lg text-[#64748B] hover:text-[#EF4444] hover:bg-[#FEE2E2] transition-colors"
                  title="Delete offer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 card space-y-3">
          <Tag className="w-10 h-10 text-[#94A3B8] mx-auto" />
          <h3 className="font-bold text-sm text-[#0F172A]">No offers created yet</h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            Create your first verified promotion to attract shoppers and diners in Perinthalmanna & Angadipuram.
          </p>
          <Link
            to="/business/offers/new"
            className="inline-flex items-center gap-1.5 btn-primary text-xs !py-2 !px-4"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Offer Now</span>
          </Link>
        </div>
      )}
    </div>
  );
};
