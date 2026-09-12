import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, Store } from 'lucide-react';

export const Login = () => {
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
      } else if (data.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card-elevated space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-lg bg-[#10B981] text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-sm">
            P
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Welcome to PMNA</h1>
          <p className="text-xs text-[#64748B]">Sign in to your account</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-[#FEE2E2] text-[#B91C1C] text-xs font-semibold border border-[#EF4444]/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
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
            <span>{submitting ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#E2E8F0] flex flex-col gap-2 text-center text-xs">
          <p className="text-[#64748B]">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-[#047857] hover:underline">
              Register here
            </Link>
          </p>

          <Link
            to="/business/login"
            className="inline-flex items-center justify-center gap-1.5 text-[#64748B] hover:text-[#047857] font-medium mt-1"
          >
            <Store className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Are you a local shopkeeper? Merchant Login</span>
          </Link>
        </div>

        {/* Demo Accounts Tip */}
        <div className="bg-[#F8FAFC] p-3.5 rounded-lg border border-[#E2E8F0] text-[11px] text-[#64748B] space-y-1">
          <div className="font-bold text-[#0F172A]">Demo Accounts:</div>
          <div>Admin: <code className="bg-white border border-[#E2E8F0] px-1 py-0.5 rounded text-[#0F172A]">admin@pmna.local</code> / <code className="bg-white border border-[#E2E8F0] px-1 py-0.5 rounded text-[#0F172A]">Admin@123</code></div>
          <div>Merchant: <code className="bg-white border border-[#E2E8F0] px-1 py-0.5 rounded text-[#0F172A]">walkzone@pmna.local</code> / <code className="bg-white border border-[#E2E8F0] px-1 py-0.5 rounded text-[#0F172A]">Shop@123</code></div>
          <div>Customer: <code className="bg-white border border-[#E2E8F0] px-1 py-0.5 rounded text-[#0F172A]">customer@pmna.local</code> / <code className="bg-white border border-[#E2E8F0] px-1 py-0.5 rounded text-[#0F172A]">Customer@123</code></div>
        </div>
      </div>
    </div>
  );
};
