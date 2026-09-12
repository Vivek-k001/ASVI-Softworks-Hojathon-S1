import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, Phone, ArrowRight } from 'lucide-react';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { registerCustomer } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await registerCustomer({ name, email, phone, password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
          <h1 className="text-2xl font-bold text-[#0F172A]">Create an Account</h1>
          <p className="text-xs text-[#64748B]">Join PMNA to discover deals and save local perks</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-[#FEE2E2] text-[#B91C1C] text-xs font-semibold border border-[#EF4444]/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Nair"
                required
                className="form-input pl-9"
              />
            </div>
          </div>

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
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
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
                placeholder="Minimum 6 characters"
                minLength={6}
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
            <span>{submitting ? 'Creating account...' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#E2E8F0] text-center text-xs text-[#64748B]">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#047857] hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};
