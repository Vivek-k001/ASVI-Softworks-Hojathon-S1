import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import api from '../services/api';
import { Store, CheckCircle } from 'lucide-react';

export const BusinessRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    categoryId: '',
    locationId: '',
    address: '',
    description: '',
    openingHours: '9:30 AM - 9:00 PM',
  });

  const [categories, setCategories] = useState([]);
  const { locations } = useLocation();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [registeredPending, setRegisteredPending] = useState(false);
  const { registerBusiness } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data?.success) setCategories(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.categoryId || !formData.locationId) {
      setError('Please select both category and location.');
      return;
    }

    setSubmitting(true);
    try {
      await registerBusiness(formData);
      setRegisteredPending(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (registeredPending) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="card-elevated space-y-4">
          <CheckCircle className="w-14 h-14 text-[#10B981] mx-auto animate-bounce" />
          <h2 className="text-2xl font-bold text-[#0F172A]">Application Received!</h2>
          <div className="inline-block badge-pending">
            Status: PENDING APPROVAL
          </div>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Your shop registration for <strong>{formData.name}</strong> has been submitted. Our PMNA governance team verifies local businesses before granting public promotion publishing rights.
          </p>
          <div className="pt-4">
            <Link
              to="/business/dashboard"
              className="btn-primary w-full text-xs !py-3 block"
            >
              Go to Merchant Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="card-elevated space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-lg bg-[#047857] text-white flex items-center justify-center mx-auto shadow-sm">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Register Your Business</h1>
          <p className="text-xs text-[#64748B]">Reach local shoppers & diners across Perinthalmanna & Angadipuram</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-[#FEE2E2] text-[#B91C1C] text-xs font-semibold border border-[#EF4444]/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Business Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Kozhikode Star Biriyani"
                required
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Owner / Manager Name *</label>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                placeholder="e.g. Abdul Niyas"
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Login Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="shop@example.com"
                required
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Contact Phone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                required
                className="form-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              minLength={6}
              required
              className="form-input"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Category *</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                className="form-input"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Location *</label>
              <select
                name="locationId"
                value={formData.locationId}
                onChange={handleChange}
                required
                className="form-input"
              >
                <option value="">Select Location</option>
                {locations.map((loc) => (
                  <option key={loc._id} value={loc._id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Shop Address *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. Near Town Bus Stand, Ooty Road, Perinthalmanna"
              required
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Opening Hours</label>
            <input
              type="text"
              name="openingHours"
              value={formData.openingHours}
              onChange={handleChange}
              placeholder="e.g. 9:30 AM - 9:00 PM"
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Short Description</label>
            <textarea
              name="description"
              rows="2"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your shop offerings..."
              className="w-full bg-white border border-[#E2E8F0] rounded-lg p-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#D1FAE5] transition-all"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-primary text-xs !py-3"
          >
            {submitting ? 'Submitting Registration...' : 'Submit Application'}
          </button>
        </form>

        <div className="pt-4 border-t border-[#E2E8F0] text-center text-xs text-[#64748B]">
          Already registered?{' '}
          <Link to="/business/login" className="font-semibold text-[#047857] hover:underline">
            Merchant Login
          </Link>
        </div>
      </div>
    </div>
  );
};
