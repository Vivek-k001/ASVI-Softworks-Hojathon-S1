import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Store, Save, CheckCircle, Upload } from 'lucide-react';

export const Profile = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    openingHours: '',
    description: '',
    logoUrl: '',
    coverUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const handlePhotoUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Photo size exceeds 5MB limit.');
      return;
    }

    const isLogo = field === 'logoUrl';
    if (isLogo) setUploadingLogo(true);
    else setUploadingCover(true);
    setError('');

    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const res = await api.post('/upload/business', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success) {
        const url = res.data.data.url || res.data.data.imageUrl;
        setFormData((prev) => ({ ...prev, [field]: url }));
      }
    } catch (err) {
      console.error('Photo upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload image');
    } finally {
      if (isLogo) setUploadingLogo(false);
      else setUploadingCover(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get('/businesses/me');
        if (res.data?.success) {
          const b = res.data.data;
          setFormData({
            name: b.name || '',
            phone: b.phone || '',
            address: b.address || '',
            openingHours: b.openingHours || '',
            description: b.description || '',
            logoUrl: b.logoUrl || '',
            coverUrl: b.coverUrl || '',
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      await api.put('/businesses/me', formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto h-96 bg-[#F1F5F9] rounded-xl animate-pulse border border-[#E2E8F0]"></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/business/dashboard"
        className="inline-flex items-center gap-1 text-xs text-[#64748B] hover:text-[#047857] font-medium"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Dashboard
      </Link>

      <div className="card space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Edit Store Profile</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Update public contact info, timings, and store photos</p>
        </div>

        {success && (
          <div className="p-3.5 rounded-lg bg-[#ECFDF5] text-[#047857] text-xs font-semibold flex items-center gap-2 border border-[#10B981]/20">
            <CheckCircle className="w-4 h-4 text-[#10B981]" />
            <span>Store profile updated successfully!</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-lg bg-[#FEE2E2] text-[#B91C1C] text-xs font-semibold border border-[#EF4444]/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Business / Store Name
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                Contact Phone / WhatsApp
              </label>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                Opening Hours
              </label>
              <input
                type="text"
                name="openingHours"
                value={formData.openingHours}
                onChange={handleChange}
                placeholder="e.g. 9:00 AM – 9:30 PM (Daily)"
                className="form-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Full Physical Address
            </label>
            <input
              type="text"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              About the Store
            </label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell customers about your offerings, brands, and specialties..."
              className="w-full bg-white border border-[#E2E8F0] rounded-lg p-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#D1FAE5] transition-all"
            ></textarea>
          </div>

          {/* Photos: Logo & Cover Photo with Multer Upload */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
            {/* Store Logo */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#0F172A]">
                Store Logo
              </label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl border border-[#CBD5E1] bg-white overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Store logo" className="w-full h-full object-cover" />
                  ) : (
                    <Store className="w-6 h-6 text-[#94A3B8]" />
                  )}
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <label className="btn-secondary !text-xs !py-1.5 !px-3 cursor-pointer inline-flex items-center gap-1.5 w-auto">
                    <Upload className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingLogo}
                      onChange={(e) => handlePhotoUpload(e, 'logoUrl')}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="url"
                    name="logoUrl"
                    value={formData.logoUrl}
                    onChange={handleChange}
                    placeholder="Or paste image URL"
                    className="form-input text-xs !py-1.5"
                  />
                </div>
              </div>
            </div>

            {/* Store Cover Photo */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#0F172A]">
                Store Cover Photo
              </label>
              <div className="flex items-center gap-3">
                <div className="w-20 h-16 rounded-xl border border-[#CBD5E1] bg-white overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                  {formData.coverUrl ? (
                    <img src={formData.coverUrl} alt="Store cover" className="w-full h-full object-cover" />
                  ) : (
                    <Store className="w-6 h-6 text-[#94A3B8]" />
                  )}
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <label className="btn-secondary !text-xs !py-1.5 !px-3 cursor-pointer inline-flex items-center gap-1.5 w-auto">
                    <Upload className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>{uploadingCover ? 'Uploading...' : 'Upload Cover'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingCover}
                      onChange={(e) => handlePhotoUpload(e, 'coverUrl')}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="url"
                    name="coverUrl"
                    value={formData.coverUrl}
                    onChange={handleChange}
                    placeholder="Or paste image URL"
                    className="form-input text-xs !py-1.5"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
            <Link
              to="/business/dashboard"
              className="btn-secondary text-xs"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-xs !py-2.5 !px-6"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
