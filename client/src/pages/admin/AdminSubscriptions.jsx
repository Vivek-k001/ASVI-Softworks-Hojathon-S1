import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Settings,
  DollarSign,
  Building2,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Eye,
  EyeOff,
  Search,
  ExternalLink,
} from 'lucide-react';

export const AdminSubscriptions = () => {
  const [data, setData] = useState(null);
  const [showcases, setShowcases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPrice, setNewPrice] = useState(99);
  const [updatingPrice, setUpdatingPrice] = useState(false);
  const [priceMessage, setPriceMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // overview, showcases, transactions
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const [overviewRes, showcaseRes] = await Promise.all([
        api.get('/admin/subscriptions/overview'),
        api.get('/admin/showcases').catch(() => ({ data: { success: false, data: [] } })),
      ]);

      if (overviewRes.data?.success) {
        setData(overviewRes.data.data);
        setNewPrice(overviewRes.data.data.currentPrice || 99);
      }

      if (showcaseRes.data?.success) {
        setShowcases(showcaseRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin subscription overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleUpdatePrice = async (e) => {
    e.preventDefault();
    setUpdatingPrice(true);
    setPriceMessage('');

    try {
      const res = await api.put('/admin/subscriptions/price', { price: Number(newPrice) });
      if (res.data?.success) {
        setPriceMessage(`Showcase monthly fee updated to ₹${newPrice}/month successfully.`);
        setTimeout(() => setPriceMessage(''), 4000);
      }
    } catch (err) {
      console.error('Price update error:', err);
      setPriceMessage(err.response?.data?.message || 'Failed to update price.');
    } finally {
      setUpdatingPrice(false);
    }
  };

  const handleToggleShowcase = async (showcaseId) => {
    try {
      const res = await api.patch(`/admin/showcases/${showcaseId}/toggle`);
      if (res.data?.success) {
        setShowcases((prev) =>
          prev.map((s) => (s._id === showcaseId ? { ...s, adminDisabled: !s.adminDisabled } : s))
        );
      }
    } catch (err) {
      console.error('Showcase toggle error:', err);
    }
  };

  const metrics = data?.metrics || {
    activeSubscribedCount: 0,
    expiredSubscribedCount: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalTransactions: 0,
  };

  const businesses = data?.businesses || [];
  const filteredBusinesses = businesses.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-8 pb-16">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Shop Subscriptions & Revenue</h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Manage merchant showcase subscription pricing, recurring monthly revenue, and ad space moderation.
          </p>
        </div>

        <button
          onClick={fetchOverview}
          className="btn-secondary inline-flex items-center gap-2 self-start sm:self-auto text-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 1. KEY REVENUE & SUBSCRIPTION METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <span className="text-xs font-semibold text-[#64748B]">Total Platform Revenue</span>
          <div className="text-2xl font-black text-[#047857] mt-1">₹{metrics.totalRevenue}</div>
          <span className="text-[11px] text-[#10B981] font-semibold mt-0.5 block">{metrics.totalTransactions} paid transactions</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <span className="text-xs font-semibold text-[#64748B]">This Month Revenue</span>
          <div className="text-2xl font-black text-[#0EA5E9] mt-1">₹{metrics.monthlyRevenue}</div>
          <span className="text-[11px] text-[#64748B] mt-0.5 block">Recurring monthly cashflow</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <span className="text-xs font-semibold text-[#64748B]">Active Subscribed Shops</span>
          <div className="text-2xl font-black text-[#0F172A] mt-1">{metrics.activeSubscribedCount}</div>
          <span className="text-[11px] text-[#10B981] font-semibold mt-0.5 block">Visible in Home Showcase</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <span className="text-xs font-semibold text-[#64748B]">Expired Subscriptions</span>
          <div className="text-2xl font-black text-[#F59E0B] mt-1">{metrics.expiredSubscribedCount}</div>
          <span className="text-[11px] text-[#64748B] mt-0.5 block">Automatically hidden from Home</span>
        </div>
      </div>

      {/* 2. PRICE CONFIGURATOR CARD */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#10B981]" />
              <h2 className="text-base font-bold text-[#0F172A]">Showcase Monthly Subscription Pricing</h2>
            </div>
            <p className="text-xs text-[#64748B]">
              Configure the monthly fee charged to local shopkeepers to appear in the Home Screen "Daily Deals & Offers" grid.
            </p>
          </div>

          <form onSubmit={handleUpdatePrice} className="flex items-center gap-3">
            <div className="relative w-36">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#64748B]">₹</span>
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                min="1"
                required
                className="form-input pl-7 text-sm font-bold text-[#0F172A]"
              />
            </div>
            <button
              type="submit"
              disabled={updatingPrice}
              className="btn-primary !py-2.5 !px-4 text-xs font-bold shrink-0"
            >
              {updatingPrice ? 'Saving...' : 'Update Price'}
            </button>
          </form>
        </div>

        {priceMessage && (
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <span>{priceMessage}</span>
          </div>
        )}
      </div>

      {/* 3. TABS: Subscribed Shops / Showcase Moderation / Transaction Logs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'overview'
                ? 'bg-[#10B981] text-white shadow-xs'
                : 'text-[#64748B] hover:bg-slate-100'
            }`}
          >
            Subscribed Shops ({businesses.length})
          </button>
          <button
            onClick={() => setActiveTab('showcases')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'showcases'
                ? 'bg-[#10B981] text-white shadow-xs'
                : 'text-[#64748B] hover:bg-slate-100'
            }`}
          >
            Showcase Ad Moderation ({showcases.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'transactions'
                ? 'bg-[#10B981] text-white shadow-xs'
                : 'text-[#64748B] hover:bg-slate-100'
            }`}
          >
            Payment Logs ({data?.recentPayments?.length || 0})
          </button>
        </div>

        {/* TAB 1: Subscribed Shops Table */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card overflow-hidden">
            <div className="p-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by shop name, phone..."
                  className="form-input pl-9 text-xs"
                />
              </div>
              <span className="text-xs text-[#64748B]">Showing {filteredBusinesses.length} shops</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3.5 px-4">Shop Name</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Subscription Status</th>
                    <th className="py-3.5 px-4">Expires On</th>
                    <th className="py-3.5 px-4">Home Visibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {filteredBusinesses.map((b) => {
                    const isSubActive = b.subscriptionStatus === 'active' && b.subscriptionExpiresAt && new Date(b.subscriptionExpiresAt) > new Date();
                    return (
                      <tr key={b._id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[#0F172A]">
                          {b.name}
                        </td>
                        <td className="py-3.5 px-4 text-[#64748B]">
                          {b.locationId?.name || 'Perinthalmanna'}
                        </td>
                        <td className="py-3.5 px-4 text-[#64748B]">
                          {b.phone}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isSubActive
                              ? 'bg-[#ECFDF5] text-[#047857] border border-[#D1FAE5]'
                              : b.subscriptionStatus === 'expired'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {isSubActive ? <CheckCircle2 className="w-3 h-3 text-[#10B981]" /> : <AlertTriangle className="w-3 h-3 text-amber-500" />}
                            <span>{isSubActive ? 'ACTIVE' : b.subscriptionStatus === 'expired' ? 'EXPIRED' : 'NOT SUBSCRIBED'}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[#64748B]">
                          {b.subscriptionExpiresAt ? (
                            new Date(b.subscriptionExpiresAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[11px] font-bold ${isSubActive ? 'text-[#047857]' : 'text-[#94A3B8]'}`}>
                            {isSubActive ? '🟢 Visible on Home' : '⚪ Hidden'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Showcase Ad Moderation */}
        {activeTab === 'showcases' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {showcases.map((sc) => (
              <div key={sc._id} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card overflow-hidden flex flex-col">
                <div className="relative aspect-[21/9] bg-slate-900">
                  <img
                    src={sc.imageUrl}
                    alt={sc.title}
                    className="w-full h-full object-cover"
                  />
                  {sc.adminDisabled && (
                    <div className="absolute inset-0 bg-red-950/75 backdrop-blur-xs flex items-center justify-center text-white font-bold text-sm">
                      DISABLED BY ADMIN (Hidden from public)
                    </div>
                  )}
                  {sc.discount && (
                    <span className="absolute top-2 left-2 bg-[#10B981] text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow">
                      {sc.discount}
                    </span>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[11px] font-bold text-[#64748B] block">
                      {sc.businessId?.name || 'Local Shop'}
                    </span>
                    <h3 className="text-sm font-bold text-[#0F172A] mt-0.5 line-clamp-2">
                      {sc.title}
                    </h3>
                    <p className="text-xs text-[#475569] mt-1 line-clamp-2">
                      {sc.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
                    <span className="text-[11px] text-[#64748B]">
                      Valid till: {new Date(sc.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleShowcase(sc._id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        sc.adminDisabled
                          ? 'bg-[#ECFDF5] text-[#047857] hover:bg-[#D1FAE5]'
                          : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                      }`}
                    >
                      {sc.adminDisabled ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Re-Enable Ad</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Disable Ad (Moderate)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: Payment Logs */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3.5 px-4">Receipt #</th>
                    <th className="py-3.5 px-4">Shop</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Method</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {(data?.recentPayments || []).map((p) => (
                    <tr key={p._id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0F172A]">
                        {p.receiptNumber}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#334155]">
                        {p.businessId?.name || 'Merchant'}
                      </td>
                      <td className="py-3.5 px-4 text-[#64748B]">
                        {new Date(p.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#047857]">
                        ₹{p.amount}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#047857]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>SUCCESS</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
