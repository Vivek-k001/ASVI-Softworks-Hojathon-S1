import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Store, Mail, Lock, ArrowRight } from 'lucide-react';

export const BusinessLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await login(email, password);
      if (data.user?.role === 'business') {
        navigate('/business/dashboard');
      } else {
        setError('This account does not have merchant privileges.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid merchant credentials');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card-elevated space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-lg bg-[#047857] text-white flex items-center justify-center mx-auto shadow-sm">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Merchant Portal</h1>
          <p className="text-xs text-[#64748B]">Sign in to manage your shop offers and view analytics</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-[#FEE2E2] text-[#B91C1C] text-xs font-semibold border border-[#EF4444]/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Business Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="walkzone@pmna.local"
                required
                className="form-input pl-9"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="form-input pl-9"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-primary text-xs !py-3"
          >
            <span>{submitting ? 'Authenticating...' : 'Access Merchant Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#E2E8F0] flex flex-col gap-2 text-center text-xs">
          <p className="text-[#64748B]">
            Want to list your shop?{' '}
            <Link to="/business/register" className="font-semibold text-[#047857] hover:underline">
              Register your business
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
