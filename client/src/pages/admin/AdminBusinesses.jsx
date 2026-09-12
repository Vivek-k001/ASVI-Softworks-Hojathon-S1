import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Store, CheckCircle, XCircle, Ban, ArrowLeft, ShieldCheck } from 'lucide-react';

export const AdminBusinesses = () => {
  const [businesses, setBusinesses] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/businesses?status=${statusFilter}`);
      if (res.data?.success) setBusinesses(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [statusFilter]);

  const handleUpdate = async (id, status, isVerified) => {
    try {
      await api.patch(`/admin/businesses/${id}/status`, { status, isVerified });
      fetchBusinesses();
    } catch (err) {
      alert('Failed to update business');
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
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Manage Registered Merchants</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Filter, verify, or suspend shops on PMNA platform</p>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0]">
          {['all', 'pending', 'approved', 'suspended'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {st}
            </button>
          ))}
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
                  <th className="p-4">Business</th>
                  <th className="p-4">Category & Town</th>
                  <th className="p-4">Owner Contact</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {businesses.map((b) => (
                  <tr key={b._id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-[#0F172A] flex items-center gap-1.5">
                        <span>{b.name}</span>
                        {b.isVerified && <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />}
                      </div>
                      <div className="text-[11px] text-[#64748B] truncate max-w-xs">{b.address}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-[#0F172A]">{b.categoryId?.name}</div>
                      <div className="text-[11px] text-[#64748B]">📍 {b.locationId?.name}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-[#0F172A]">{b.ownerName}</div>
                      <div className="text-[#64748B] text-[11px]">{b.phone}</div>
                    </td>
                    <td className="p-4">
                      <span
                        className={
                          b.status === 'approved'
                            ? 'badge-confirmed'
                            : b.status === 'pending'
                            ? 'badge-pending'
                            : 'badge-cancelled'
                        }
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1.5">
                      {b.status !== 'approved' && (
                        <button
                          onClick={() => handleUpdate(b._id, 'approved', true)}
                          className="btn-primary text-xs !py-1 !px-2.5"
                        >
                          Approve
                        </button>
                      )}
                      {b.status !== 'suspended' && (
                        <button
                          onClick={() => handleUpdate(b._id, 'suspended', false)}
                          className="btn-secondary text-xs !py-1 !px-2.5 text-[#EF4444] hover:bg-[#FEE2E2]"
                        >
                          Suspend
                        </button>
                      )}
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
