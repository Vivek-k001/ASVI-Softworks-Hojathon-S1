import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { AlertTriangle, ArrowLeft, CheckCircle } from 'lucide-react';

export const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/reports');
      if (res.data?.success) setReports(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (id) => {
    try {
      await api.patch(`/admin/reports/${id}`, { status: 'resolved' });
      fetchReports();
    } catch (err) {
      alert('Failed to update report');
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
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-[#EF4444]" />
            <span>Customer Safety & Fraud Reports</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Resolve consumer-reported fake discounts, closed shops, or price mismatches
          </p>
        </div>
      </div>

      {loading ? (
        <div className="h-64 bg-[#F1F5F9] rounded-xl animate-pulse border border-[#E2E8F0]"></div>
      ) : reports.length > 0 ? (
        <div className="card !p-0 overflow-hidden divide-y divide-[#E2E8F0]">
          {reports.map((r) => (
            <div key={r._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8FAFC] transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="badge-cancelled">
                    {r.reason.replace('_', ' ')}
                  </span>
                  <span className={r.status === 'resolved' ? 'badge-confirmed' : 'badge-pending'}>
                    {r.status}
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#0F172A]">{r.details}</p>
                <p className="text-[11px] text-[#64748B]">
                  Target: {r.targetType} (ID: {r.targetId}) • Reporter: {r.reporterName} ({r.reporterContact || 'N/A'})
                </p>
              </div>

              {r.status !== 'resolved' && (
                <button
                  onClick={() => handleResolve(r._id)}
                  className="btn-primary text-xs !py-1.5 !px-3.5 self-start sm:self-auto"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Mark Resolved</span>
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 card space-y-2">
          <CheckCircle className="w-10 h-10 text-[#10B981] mx-auto" />
          <h3 className="font-bold text-sm text-[#0F172A]">No active customer reports</h3>
          <p className="text-xs text-[#64748B]">All community flags have been reviewed and resolved.</p>
        </div>
      )}
    </div>
  );
};
