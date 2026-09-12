import React, { useState } from 'react';
import { Link, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useAssistant } from '../../context/AssistantContext';
import {
  MapPin,
  Sparkles,
  Search,
  Menu,
  X,
  Store,
  ShieldAlert,
  User,
  LogOut,
  ChevronDown,
  Tag,
  UtensilsCrossed,
} from 'lucide-react';

export const Navbar = () => {
  const { user, business, logout, isAuthenticated, isBusiness, isAdmin } = useAuth();
  const { locations, selectedLocation, changeLocation, getSelectedLocationName } = useLocation();
  const { openAssistant } = useAssistant();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locDropdownOpen, setLocDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const routerLocation = useRouterLocation();
  const navigate = useNavigate();

  const isActive = (path) => routerLocation.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-lg bg-[#10B981] flex items-center justify-center text-white font-black text-xl shadow-sm group-hover:bg-[#059669] transition-all">
                P
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xl tracking-tight text-[#0F172A]">PMNA</span>
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#047857] -mt-1">
                  Perks
                </span>
              </div>
            </Link>

            {/* Location Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLocDropdownOpen(!locDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-[#F1F5F9] hover:bg-[#ECFDF5] hover:text-[#047857] text-[#334155] border border-[#E2E8F0] transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                <span className="truncate max-w-[130px]">{getSelectedLocationName()}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
              </button>

              {locDropdownOpen && (
                <div
                  className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-elevated border border-[#E2E8F0] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setLocDropdownOpen(false)}
                >
                  <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                    Select Town
                  </div>
                  <button
                    onClick={() => {
                      changeLocation('all');
                      setLocDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#F8FAFC] transition-colors ${
                      selectedLocation === 'all' ? 'font-bold text-[#047857] bg-[#ECFDF5]' : 'text-[#334155]'
                    }`}
                  >
                    All Locations
                    {selectedLocation === 'all' && <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>}
                  </button>
                  {locations.map((loc) => (
                    <button
                      key={loc._id}
                      onClick={() => {
                        changeLocation(loc._id);
                        setLocDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#F8FAFC] transition-colors ${
                        selectedLocation === loc._id ? 'font-bold text-[#047857] bg-[#ECFDF5]' : 'text-[#334155]'
                      }`}
                    >
                      {loc.name}
                      {selectedLocation === loc._id && <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/') ? 'text-[#047857] bg-[#ECFDF5]' : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
              }`}
            >
              Home
            </Link>
            <Link
              to="/deals"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive('/deals') ? 'text-[#047857] bg-[#ECFDF5]' : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
              }`}
            >
              <Tag className="w-4 h-4 text-[#10B981]" />
              Deals
            </Link>
            <Link
              to="/food"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive('/food') ? 'text-[#047857] bg-[#ECFDF5]' : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4 text-[#F59E0B]" />
              Food Spots
            </Link>
            <Link
              to="/businesses"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive('/businesses') ? 'text-[#047857] bg-[#ECFDF5]' : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
              }`}
            >
              <Store className="w-4 h-4 text-[#64748B]" />
              Shops
            </Link>
            <Link
              to="/assistant"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive('/assistant') ? 'text-[#047857] bg-[#ECFDF5]' : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#0EA5E9]" />
              PMNA Assistant
            </Link>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-3">
            {/* Quick Ask Assistant CTA Button */}
            <button
              onClick={openAssistant}
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-[#10B981] to-[#0EA5E9] hover:opacity-90 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI</span>
            </button>

            {/* Auth & Portal Actions */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors text-xs font-semibold text-[#0F172A]"
                >
                  <div className="w-6 h-6 rounded-full bg-[#D1FAE5] text-[#047857] flex items-center justify-center font-bold text-xs">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">{user?.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-elevated border border-[#E2E8F0] py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-[#E2E8F0]">
                      <div className="text-xs font-bold text-[#0F172A]">{user?.name}</div>
                      <div className="text-[11px] text-[#64748B] truncate">{user?.email}</div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F1F5F9] text-[#475569]">
                        {user?.role}
                      </span>
                    </div>

                    {isBusiness && (
                      <Link
                        to="/business/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#334155] hover:bg-[#ECFDF5] hover:text-[#047857]"
                      >
                        <Store className="w-3.5 h-3.5 text-[#10B981]" />
                        Merchant Dashboard
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#334155] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-[#0EA5E9]" />
                        Admin Control Panel
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#EF4444] hover:bg-[#FEE2E2] text-left border-t border-[#E2E8F0] mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-[#334155] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/business/register"
                  className="hidden sm:flex items-center gap-1.5 btn-secondary !py-2 !px-3.5 !text-xs"
                >
                  <Store className="w-3.5 h-3.5 text-[#10B981]" />
                  List Your Business
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E2E8F0] bg-white px-4 pt-3 pb-6 space-y-2 shadow-card animate-in slide-in-from-top-2 duration-150">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#0F172A] hover:bg-[#F8FAFC]"
          >
            Home
          </Link>
          <Link
            to="/deals"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#334155] hover:bg-[#F8FAFC]"
          >
            🏷️ All Deals & Offers
          </Link>
          <Link
            to="/food"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#334155] hover:bg-[#F8FAFC]"
          >
            🍔 Food & Dining
          </Link>
          <Link
            to="/businesses"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#334155] hover:bg-[#F8FAFC]"
          >
            🏪 Local Shops Directory
          </Link>
          <Link
            to="/assistant"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#047857] bg-[#ECFDF5]"
          >
            ✨ PMNA Assistant (AI Chat)
          </Link>

          <div className="pt-3 border-t border-[#E2E8F0] flex flex-col gap-2">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-xs font-semibold rounded-lg bg-[#F1F5F9] text-[#0F172A] hover:bg-[#E2E8F0] transition-colors"
                >
                  Customer Login
                </Link>
                <Link
                  to="/business/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-xs font-semibold rounded-lg btn-primary"
                >
                  Merchant Portal
                </Link>
              </>
            ) : (
              <>
                {isBusiness && (
                  <Link
                    to="/business/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-xs font-semibold rounded-lg btn-primary"
                  >
                    Open Merchant Dashboard
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-xs font-semibold rounded-lg btn-secondary"
                  >
                    Open Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate('/');
                  }}
                  className="w-full text-center py-2.5 text-xs font-semibold rounded-lg bg-[#FEE2E2] text-[#B91C1C] hover:bg-[#EF4444] hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
