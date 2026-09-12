import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Tag,
  PlusCircle,
  Store,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Clock,
  Sparkles,
  CreditCard,
} from 'lucide-react';

export const BusinessLayout = () => {
  const { user, business, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/business/dashboard', icon: LayoutDashboard },
    { name: 'Showcase & Ads', path: '/business/showcase', icon: Sparkles },
    { name: 'Payment History', path: '/business/payments', icon: CreditCard },
    { name: 'My Offers', path: '/business/offers', icon: Tag },
    { name: 'Create Offer', path: '/business/offers/new', icon: PlusCircle },
    { name: 'Store Profile', path: '/business/profile', icon: Store },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* 1. DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-[#E2E8F0] sticky top-0 h-screen z-30">
        {/* Brand Header */}
        <div className="p-6 border-b border-[#E2E8F0]">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#10B981] text-white flex items-center justify-center font-black text-base shadow-xs">
              P
            </div>
            <div>
              <span className="text-base font-bold text-[#0F172A] tracking-tight">PMNA</span>
              <span className="block text-[11px] font-semibold text-[#64748B]">Merchant Portal</span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
            Management
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/business/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#ECFDF5] text-[#047857]'
                    : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                }`
              }
            >
              {({ isActive }) => {
                const Icon = item.icon;
                return (
                  <>
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#059669]' : 'text-[#64748B]'}`} />
                    <span>{item.name}</span>
                  </>
                );
              }}
            </NavLink>
          ))}

          <div className="pt-6 px-3 pb-2 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
            Shortcuts
          </div>
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-[#64748B]" />
            <span>View Public Platform</span>
          </Link>
        </nav>

        {/* User / Merchant Footer Card */}
        <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {business?.name ? business.name[0] : 'M'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-[#0F172A] truncate">{business?.name || user?.name}</p>
                <div className="flex items-center gap-1">
                  {business?.isVerified ? (
                    <span className="text-[10px] text-[#047857] flex items-center gap-0.5 font-medium">
                      <ShieldCheck className="w-3 h-3 text-[#10B981]" /> Verified
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#B45309] flex items-center gap-0.5 font-medium">
                      <Clock className="w-3 h-3 text-[#F59E0B]" /> Pending
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#EF4444] hover:bg-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MOBILE DRAWER */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setMobileOpen(false)}></div>
          <div className="relative w-64 bg-white h-full flex flex-col z-10 border-r border-[#E2E8F0]">
            <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#10B981] text-white flex items-center justify-center font-black text-sm">
                  P
                </div>
                <span className="font-bold text-sm text-[#0F172A]">Merchant Portal</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1 rounded-lg text-[#64748B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                      isActive ? 'bg-[#ECFDF5] text-[#047857]' : 'text-[#64748B] hover:bg-[#F8FAFC]'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>

            <div className="p-4 border-t border-[#E2E8F0]">
              <button
                onClick={handleLogout}
                className="w-full btn-secondary text-xs flex items-center justify-center gap-2 text-[#EF4444]"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN DASHBOARD CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-[#E2E8F0] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[#64748B] hover:bg-[#F8FAFC]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs font-semibold text-[#64748B]">Merchant Area</span>
              <h2 className="text-sm font-bold text-[#0F172A]">{business?.name || 'Store Operations'}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/business/offers/new" className="btn-primary text-xs !py-2 !px-3.5">
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Offer</span>
            </Link>
          </div>
        </header>

        {/* Outlet Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
