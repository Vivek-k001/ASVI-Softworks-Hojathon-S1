import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Tag,
  Eye,
  PlusCircle,
  Clock,
  ShieldCheck,
  AlertCircle,
  Store,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export const Dashboard = () => {
  const { user, business } = useAuth();
  const [stats, setStats] = useState({
    activeOffers: 0,
    expiredOffers: 0,
    totalOffers: 0,
    profileViews: 0,
    offerViews: 0,
    status: 'pending',
    isVerified: false,
  });
  const [recentOffers, setRecentOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const [statsRes, offersRes] = await Promise.all([
          api.get('/businesses/stats'),
          api.get('/offers/my-offers'),
        ]);

        if (statsRes.data?.success) setStats(statsRes.data.data);
        if (offersRes.data?.success) setRecentOffers(offersRes.data.data.slice(0, 4));
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#10B981] text-white flex items-center justify-center font-bold text-xl shadow-xs">
            {business?.name ? business.name[0] : 'M'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">{business?.name || 'Merchant Dashboard'}</h1>
              {stats.isVerified ? (
                <span className="badge-confirmed">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified
                </span>
              ) : (
                <span className="badge-pending">
                  <Clock className="w-3.5 h-3.5" />
                  Pending Verification
                </span>
              )}
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Welcome back, {user?.name}. Manage your business and live promotions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/business/offers/new"
            className="btn-primary text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Offer</span>
          </Link>
        </div>
      </div>

      {/* Pending Warning Callout */}
      {stats.status === 'pending' && (
        <div className="p-4 rounded-lg bg-[#FEF3C7] border border-[#F59E0B]/30 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" />
          <div className="text-xs text-[#B45309] space-y-1">
            <h4 className="font-bold">Business Account Pending Admin Approval</h4>
            <p>
              Your shop registration is under review by our community team. You can draft your offers now, and they will become publicly visible once your account is verified.
            </p>
          </div>
        </div>
      )}

      {/* Real Statistics KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card space-y-1.5">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Deals</span>
            <Tag className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A]">{stats.activeOffers}</div>
          <span className="text-[11px] text-[#047857] font-medium">Live in PMNA feed</span>
        </div>

        <div className="card space-y-1.5">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Offers</span>
            <Store className="w-4 h-4 text-[#64748B]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A]">{stats.totalOffers}</div>
          <span className="text-[11px] text-[#64748B] font-medium">All-time promotions</span>
        </div>

        <div className="card space-y-1.5">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-semibold uppercase tracking-wider">Shop Views</span>
            <Eye className="w-4 h-4 text-[#0EA5E9]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A]">{stats.profileViews}</div>
          <span className="text-[11px] text-[#64748B] font-medium">Profile impressions</span>
        </div>

        <div className="card space-y-1.5">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-semibold uppercase tracking-wider">Deal Clicks</span>
            <TrendingUp className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A]">{stats.offerViews}</div>
          <span className="text-[11px] text-[#64748B] font-medium">Customer interactions</span>
        </div>
      </div>

      {/* Recent Offers Table */}
      <div className="card overflow-hidden space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-[#0F172A]">Your Recent Promotions</h3>
          <Link to="/business/offers" className="text-xs font-semibold text-[#10B981] hover:text-[#059669] flex items-center gap-1 transition-colors">
            <span>Manage All ({stats.totalOffers})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOffers.length > 0 ? (
          <div className="divide-y divide-[#E2E8F0]">
            {recentOffers.map((o) => (
              <div key={o._id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-lg bg-[#F1F5F9] overflow-hidden shrink-0">
                    <img
                      src={o.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#0F172A] truncate">{o.title}</div>
                    <div className="text-[11px] text-[#64748B]">
                      ₹{o.offerPrice}{' '}
                      {o.originalPrice && <span className="line-through text-[#94A3B8]">₹{o.originalPrice}</span>} •{' '}
                      <span className="text-[#047857] font-semibold">{o.discountPercentage}% OFF</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={
                      o.status === 'active'
                        ? 'badge-confirmed'
                        : o.status === 'pending'
                        ? 'badge-pending'
                        : 'badge-draft'
                    }
                  >
                    {o.status}
                  </span>

                  <Link
                    to={`/offers/${o._id}`}
                    target="_blank"
                    className="btn-secondary text-xs !py-1 !px-2.5"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-[#64748B] space-y-2">
            <Tag className="w-8 h-8 text-[#94A3B8] mx-auto" />
            <p className="text-sm font-semibold">No promotions created yet</p>
            <Link to="/business/offers/new" className="btn-primary text-xs inline-flex">
              Create Your First Deal
            </Link>
          </div>
        )}
      </div>

    </div>
  );
};
