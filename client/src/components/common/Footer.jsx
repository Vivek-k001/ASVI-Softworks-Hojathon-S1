import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Sparkles, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white text-[#334155] pt-14 pb-10 border-t border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#10B981] flex items-center justify-center text-white font-black text-base shadow-sm">
                P
              </div>
              <span className="font-bold text-xl tracking-tight text-[#0F172A]">PMNA</span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Hyperlocal discovery platform for Perinthalmanna & Angadipuram, Kerala. Helping residents discover verified offers, food spots, and neighborhood shops with zero social noise.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#047857] font-semibold">
              <MapPin className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Serving Perinthalmanna & Angadipuram</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-4">Discover</h4>
            <ul className="space-y-2.5 text-xs text-[#64748B]">
              <li>
                <Link to="/deals" className="hover:text-[#0F172A] transition-colors">
                  🔥 Today's Verified Deals
                </Link>
              </li>
              <li>
                <Link to="/food" className="hover:text-[#0F172A] transition-colors">
                  🍔 Food & Dining Spots
                </Link>
              </li>
              <li>
                <Link to="/businesses" className="hover:text-[#0F172A] transition-colors">
                  🏪 Neighborhood Shops Directory
                </Link>
              </li>
              <li>
                <Link to="/assistant" className="hover:text-[#047857] transition-colors flex items-center gap-1.5 font-semibold text-[#10B981]">
                  <Sparkles className="w-3.5 h-3.5" />
                  Ask PMNA Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* Business & Merchants */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-4">For Shop Owners</h4>
            <ul className="space-y-2.5 text-xs text-[#64748B]">
              <li>
                <Link to="/business/register" className="hover:text-[#0F172A] transition-colors">
                  Register Your Shop (Free)
                </Link>
              </li>
              <li>
                <Link to="/business/login" className="hover:text-[#0F172A] transition-colors">
                  Merchant Portal Login
                </Link>
              </li>
              <li>
                <Link to="/business/dashboard" className="hover:text-[#0F172A] transition-colors">
                  Promotion Management
                </Link>
              </li>
              <li>
                <span className="text-[#64748B] flex items-center gap-1.5 mt-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                  Verified Merchant Badging
                </span>
              </li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-4">Community Trust</h4>
            <p className="text-xs text-[#64748B] leading-relaxed mb-3">
              PMNA Assistant operates strictly on verified database records. We never invent deals, prices, or ratings.
            </p>
            <div className="text-xs text-[#64748B]">
              Found an incorrect offer or price? Click <strong className="text-[#0F172A]">"Report Offer"</strong> on any deal card to notify our moderation team immediately.
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <div>
            © {new Date().getFullYear()} PMNA Platform. Engineered for <span className="text-[#0F172A] font-semibold">ASVI Softworks</span> (Vivek K & Aswathi P).
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-[#047857] font-medium bg-[#ECFDF5] px-2.5 py-1 rounded-full text-[11px]">
              📍 Perinthalmanna & Angadipuram, Kerala
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
