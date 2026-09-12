import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Tag, ArrowLeft, ExternalLink } from 'lucide-react';

export const AdminOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/offers');
      if (res.data?.success) setOffers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleStatus = async (id, status) => {
    try {
      await api.patch(`/admin/offers/${id}/status`, { status });
      fetchOffers();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
        <div>
          <Link to="/admin" className="inline-flex items-center gap-1 text-xs text-[#64748B] hover:text-[#047857] mb-2 font-medium">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Governance Overview
          </Link>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            All Platform Offers ({offers.length})
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">Audit live promotions, pause questionable items, or view details</p>
        </div>
      </div>

      {loading ? (
        <div className="h-64 bg-[#F1F5F9] rounded-xl animate-pulse border border-[#E2E8F0]"></div>
      ) : (
        <div className="card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Offer Title</th>
                  <th className="p-4">Shop</th>
                  <th className="p-4">Price / Discount</th>
                  <th className="p-4">Expiry</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {offers.map((o) => (
                  <tr key={o._id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-[#0F172A] truncate max-w-xs">{o.title}</div>
                      <div className="text-[11px] text-[#64748B]">{o.categoryId?.name} • 📍 {o.locationId?.name}</div>
                    </td>
                    <td className="p-4 font-medium text-[#334155]">
                      {o.businessId?.name || 'Unknown'}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-[#0F172A]">₹{o.offerPrice}</div>
                      <span className="text-[10px] font-semibold text-[#047857] bg-[#ECFDF5] px-1.5 py-0.5 rounded">
                        {o.discountPercentage}% OFF
                      </span>
                    </td>
                    <td className="p-4 text-[#64748B]">
                      {new Date(o.endDate).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className={o.status === 'active' ? 'badge-confirmed' : 'badge-pending'}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {o.status === 'active' ? (
                        <button
                          onClick={() => handleStatus(o._id, 'paused')}
                          className="btn-secondary text-xs !py-1 !px-2.5 text-[#B45309] hover:bg-[#FEF3C7]"
                        >
                          Pause
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatus(o._id, 'active')}
                          className="btn-primary text-xs !py-1 !px-2.5"
                        >
                          Activate
                        </button>
                      )}
                      <Link
                        to={`/offers/${o._id}`}
                        className="inline-flex items-center justify-center p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
                        title="View details"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
