import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  ShieldCheck,
  Store,
  Tag,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Building2,
  ExternalLink,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    pendingBusinesses: 0,
    activeOffers: 0,
    pendingOffers: 0,
    totalUsers: 0,
    pendingReports: 0,
  });

  const [pendingBusinesses, setPendingBusinesses] = useState([]);
  const [pendingReports, setPendingReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, bizRes, repRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/businesses?status=pending'),
        api.get('/admin/reports?status=pending'),
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.data);
      if (bizRes.data?.success) setPendingBusinesses(bizRes.data.data);
      if (repRes.data?.success) setPendingReports(repRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateStatus = async (businessId, status) => {
    try {
      await api.patch(`/admin/businesses/${businessId}/status`, { status });
      fetchAdminData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleResolveReport = async (reportId) => {
    try {
      await api.patch(`/admin/reports/${reportId}`, { status: 'resolved' });
      fetchAdminData();
    } catch (err) {
      alert('Failed to resolve report');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* 1. WELCOME HEADER / SUMMARY */}
      <div className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Platform Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight mt-1">
            Governance & Moderation
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Monitor merchant approvals, manage promotions, and resolve customer fraud or accuracy reports.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/businesses"
            className="btn-secondary text-xs"
          >
            <Building2 className="w-4 h-4 text-[#64748B]" />
            <span>Merchants</span>
          </Link>
          <Link
            to="/admin/reports"
            className="btn-secondary text-xs"
          >
            <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
            <span>Reports ({stats.pendingReports})</span>
          </Link>
        </div>
      </div>

      {/* 2. KPI CARDS (Clear 4-metric overview) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Pending Approvals */}
        <div className="card space-y-2">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Approvals</span>
            <Clock className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="text-3xl font-bold text-[#0F172A]">{stats.pendingBusinesses}</div>
          <div className="flex items-center gap-1.5">
            <span className="badge-pending">
              {stats.pendingBusinesses > 0 ? 'Requires action' : 'All clear'}
            </span>
            <span className="text-[11px] text-[#64748B]">Shops awaiting review</span>
          </div>
        </div>

        {/* Total Merchants */}
        <div className="card space-y-2">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Merchants</span>
            <Store className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="text-3xl font-bold text-[#0F172A]">{stats.totalBusinesses}</div>
          <div className="flex items-center gap-1.5">
            <span className="badge-confirmed">
              Verified
            </span>
            <span className="text-[11px] text-[#64748B]">Registered stores</span>
          </div>
        </div>

        {/* Active Offers */}
        <div className="card space-y-2">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Deals</span>
            <Tag className="w-4 h-4 text-[#0EA5E9]" />
          </div>
          <div className="text-3xl font-bold text-[#0F172A]">{stats.activeOffers}</div>
          <div className="flex items-center gap-1.5">
            <span className="badge-completed">
              Live
            </span>
            <span className="text-[11px] text-[#64748B]">Active promotions</span>
          </div>
        </div>

        {/* Pending Reports */}
        <div className="card space-y-2">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-semibold uppercase tracking-wider">Safety Reports</span>
            <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
          </div>
          <div className="text-3xl font-bold text-[#0F172A]">{stats.pendingReports}</div>
          <div className="flex items-center gap-1.5">
            <span className={stats.pendingReports > 0 ? 'badge-cancelled' : 'badge-draft'}>
              {stats.pendingReports > 0 ? 'Flagged' : 'Resolved'}
            </span>
            <span className="text-[11px] text-[#64748B]">Consumer flags</span>
          </div>
        </div>
      </div>

      {/* 3. PENDING BUSINESSES APPROVAL QUEUE */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#F59E0B]" />
            <h2 className="font-bold text-base text-[#0F172A]">Merchant Approval Queue</h2>
          </div>
          <span className="badge-pending">{pendingBusinesses.length} awaiting verification</span>
        </div>

        {pendingBusinesses.length > 0 ? (
          <div className="divide-y divide-[#E2E8F0]">
            {pendingBusinesses.map((biz) => (
              <div key={biz._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-[#0F172A]">{biz.name}</h3>
                    <span className="badge-draft">
                      {biz.categoryId?.name}
                    </span>
                    <span className="badge-confirmed">
                      📍 {biz.locationId?.name}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B]">
                    Owner: <strong className="text-[#334155]">{biz.ownerName}</strong> • Phone: {biz.phone} • Email: {biz.email}
                  </p>
                  <p className="text-xs text-[#334155]">{biz.address}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleUpdateStatus(biz._id, 'approved')}
                    className="btn-primary text-xs !py-1.5 !px-3"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve & Verify</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(biz._id, 'rejected')}
                    className="btn-secondary text-xs !py-1.5 !px-3 text-[#EF4444] hover:bg-[#FEE2E2]"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-[#64748B] space-y-2">
            <CheckCircle className="w-8 h-8 text-[#10B981] mx-auto" />
            <p className="font-medium text-[#0F172A]">All registered merchants have been reviewed and approved!</p>
          </div>
        )}
      </div>

      {/* 4. RECENT CONSUMER FRAUD/ACCURACY REPORTS */}
      {pendingReports.length > 0 && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
              <h2 className="font-bold text-base text-[#0F172A]">Recent Consumer Reports</h2>
            </div>
          </div>

          <div className="divide-y divide-[#E2E8F0]">
            {pendingReports.map((rep) => (
              <div key={rep._id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="badge-cancelled">
                    {rep.reason.replace('_', ' ')}
                  </span>
                  <p className="text-xs font-semibold text-[#0F172A]">{rep.details}</p>
                  <p className="text-[11px] text-[#64748B]">
                    Reported by: {rep.reporterName} ({rep.reporterContact || 'No contact provided'})
                  </p>
                </div>

                <button
                  onClick={() => handleResolveReport(rep._id)}
                  className="btn-outline text-xs !py-1.5 !px-3"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Mark Resolved</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
