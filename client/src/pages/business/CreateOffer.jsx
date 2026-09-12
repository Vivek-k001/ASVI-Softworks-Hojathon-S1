import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  ArrowLeft,
  Tag,
  Calendar,
  Clock,
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  Link2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  FileImage,
} from 'lucide-react';

export const CreateOffer = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    offerType: 'percentage',
    originalPrice: '',
    offerPrice: '',
    imageUrl: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    terms: 'Valid while stocks last. Standard store terms and conditions apply.',
  });

  const [discountPreview, setDiscountPreview] = useState(0);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Multer Image Upload states
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'url'
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileMeta, setSelectedFileMeta] = useState(null);

  // Quick Preset Categories for Perinthalmanna Merchants
  const PRESET_IMAGES = [
    { label: 'Bakery & Sweets', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&fit=crop' },
    { label: 'Restaurant & Biriyani', url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&fit=crop' },
    { label: 'Mobile & Gadgets', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&fit=crop' },
    { label: 'Fashion & Apparel', url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&fit=crop' },
    { label: 'Grocery & Fresh', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&fit=crop' },
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data?.success) setCategories(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  // Compute discount preview in real time
  useEffect(() => {
    const orig = Number(formData.originalPrice);
    const offer = Number(formData.offerPrice);
    if (orig > 0 && offer > 0 && offer < orig) {
      setDiscountPreview(Math.round(((orig - offer) / orig) * 100));
    } else {
      setDiscountPreview(0);
    }
  }, [formData.originalPrice, formData.offerPrice]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Upload image via Multer endpoint (/api/upload/offer)
  const handleFileUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPEG, PNG, WEBP, GIF).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds 5MB limit. Please choose a smaller photo.');
      return;
    }

    setUploadError('');
    setUploading(true);
    setUploadProgress(15);
    setSelectedFileMeta({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
    });

    const data = new FormData();
    data.append('image', file);

    try {
      setUploadProgress(40);
      const res = await api.post('/upload/offer', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(Math.min(95, Math.max(30, percent)));
          }
        },
      });

      if (res.data?.success) {
        const uploadedUrl = res.data.data.url || res.data.data.imageUrl;
        setUploadProgress(100);
        setFormData((prev) => ({ ...prev, imageUrl: uploadedUrl }));
      } else {
        throw new Error(res.data?.message || 'Failed to upload photo');
      }
    } catch (err) {
      console.error('Upload Error:', err);
      setUploadError(err.response?.data?.message || err.message || 'Image upload failed. You can also paste an image URL directly.');
    } finally {
      setUploading(false);
    }
  };

  const onFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Drag & drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
    setSelectedFileMeta(null);
    setUploadProgress(0);
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.originalPrice && Number(formData.offerPrice) > Number(formData.originalPrice)) {
      setError('Offer price cannot exceed the original price.');
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError('End date cannot be before start date.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/offers', formData);
      if (res.data?.success) {
        navigate('/business/offers');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create offer.');
    } finally {
      setSubmitting(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Create New Promotion</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Publish a verified deal to local customers across PMNA</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-[#FEE2E2] text-[#B91C1C] text-xs font-semibold border border-[#EF4444]/20 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Promotion Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. 20% Off All Fresh Pastries & Cakes"
              className="form-input"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Description & Highlights *
            </label>
            <textarea
              name="description"
              required
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="Explain what the offer includes, applicable items, or special conditions..."
              className="w-full bg-white border border-[#E2E8F0] rounded-lg p-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#D1FAE5] transition-all"
            ></textarea>
          </div>

          {/* Category & Deal Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                Category *
              </label>
              <select
                name="categoryId"
                required
                value={formData.categoryId}
                onChange={handleChange}
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
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                Deal Type
              </label>
              <select
                name="offerType"
                value={formData.offerType}
                onChange={handleChange}
                className="form-input"
              >
                <option value="percentage">Percentage Discount</option>
                <option value="daily">Daily Special</option>
                <option value="flash">Flash Deal</option>
                <option value="bogo">Buy One Get One (BOGO)</option>
                <option value="special_price">Fixed Special Price</option>
                <option value="clearance">Clearance</option>
                <option value="festival">Festival Offer</option>
              </select>
            </div>
          </div>

          {/* Pricing Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Original Price (₹)
              </label>
              <input
                type="number"
                min="0"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleChange}
                placeholder="e.g. 500"
                className="form-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Offer / Deal Price (₹) *
              </label>
              <input
                type="number"
                min="0"
                required
                name="offerPrice"
                value={formData.offerPrice}
                onChange={handleChange}
                placeholder="e.g. 399"
                className="form-input"
              />
            </div>

            <div className="flex flex-col justify-center">
              <span className="text-xs font-semibold text-[#64748B] mb-1">Calculated Savings</span>
              <div className="flex items-center gap-2">
                <span className="badge-confirmed text-sm py-1 px-3">
                  {discountPreview}% OFF
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* ENHANCED PROMOTION IMAGE UPLOADER (MULTER INTEGRATION)                     */}
          {/* ========================================================================= */}
          <div className="space-y-3 p-4 rounded-xl border border-[#E2E8F0] bg-white shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                  <FileImage className="w-4 h-4 text-[#10B981]" />
                  <span>Promotion Poster / Deal Photo</span>
                </label>
                <p className="text-[11px] text-[#64748B]">Upload directly from your device or enter a web link</p>
              </div>

              {/* Upload Mode Switcher */}
              <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-lg self-start sm:self-auto border border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    uploadMode === 'file'
                      ? 'bg-white text-[#047857] shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Device Upload</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('url')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    uploadMode === 'url'
                      ? 'bg-white text-[#047857] shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Image URL</span>
                </button>
              </div>
            </div>

            {uploadError && (
              <div className="p-3 rounded-lg bg-[#FEE2E2] text-[#B91C1C] text-xs font-medium border border-[#EF4444]/20 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* View 1: Multer Device Upload Mode */}
            {uploadMode === 'file' && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={onFileInputChange}
                />

                {!formData.imageUrl ? (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2.5 ${
                      dragActive
                        ? 'border-[#10B981] bg-[#ECFDF5]'
                        : 'border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#10B981] hover:bg-[#F0FDF4]'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-[#E2E8F0] flex items-center justify-center text-[#10B981]">
                      {uploading ? (
                        <RefreshCw className="w-6 h-6 animate-spin text-[#10B981]" />
                      ) : (
                        <UploadCloud className="w-6 h-6 text-[#10B981]" />
                      )}
                    </div>

                    {uploading ? (
                      <div className="w-full max-w-xs space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-[#047857]">
                          <span>Uploading with Multer...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#10B981] h-full transition-all duration-300 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <p className="text-sm font-bold text-[#0F172A]">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-[#64748B] mt-0.5">
                            PNG, JPG, WEBP, or GIF (max. 5MB)
                          </p>
                        </div>
                        <span className="btn-secondary !text-xs !py-1.5 !px-3 inline-flex items-center gap-1.5">
                          <UploadCloud className="w-3.5 h-3.5" />
                          Browse Device
                        </span>
                      </>
                    )}
                  </div>
                ) : (
                  /* Uploaded Image Preview Card */
                  <div className="relative rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden border border-[#CBD5E1] bg-white shrink-0 shadow-xs">
                      <img
                        src={formData.imageUrl}
                        alt="Offer preview"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-[#047857] mb-1">
                        <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                        <span>Image Ready & Uploaded</span>
                      </div>
                      <p className="text-xs text-[#0F172A] font-semibold truncate">
                        {selectedFileMeta?.name || 'Uploaded Promotion Banner'}
                      </p>
                      {selectedFileMeta?.size && (
                        <p className="text-[11px] text-[#64748B]">Size: {selectedFileMeta.size}</p>
                      )}
                      <p className="text-[10px] text-[#94A3B8] font-mono truncate mt-0.5">
                        {formData.imageUrl}
                      </p>

                      <div className="flex items-center justify-center sm:justify-start gap-2 mt-2.5">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="btn-secondary !text-[11px] !py-1 !px-2.5 flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" /> Replace
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="btn-secondary !text-[11px] !py-1 !px-2.5 text-[#EF4444] hover:bg-[#FEE2E2] flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* View 2: Image URL Mode */}
            {uploadMode === 'url' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="form-input flex-1 text-xs"
                  />
                  {formData.imageUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-2.5 rounded-lg border border-[#E2E8F0] text-[#EF4444] hover:bg-[#FEE2E2]"
                      title="Clear URL"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {formData.imageUrl && (
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="w-14 h-14 rounded-md overflow-hidden border border-[#CBD5E1] shrink-0 bg-white">
                      <img src={formData.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs text-[#047857] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" /> Image URL active
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Quick Preset Photos for Perinthalmanna Merchants */}
            <div className="pt-2 border-t border-[#E2E8F0]">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  Or pick a category sample photo
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_IMAGES.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, imageUrl: preset.url }));
                      setSelectedFileMeta({ name: preset.label, size: 'Stock Preset' });
                    }}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                      formData.imageUrl === preset.url
                        ? 'border-[#10B981] bg-[#ECFDF5] text-[#047857]'
                        : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:bg-white hover:text-[#0F172A]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Start Date *</span>
              </label>
              <input
                type="date"
                required
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#EF4444]" />
                <span>End / Expiration Date *</span>
              </label>
              <input
                type="date"
                required
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          {/* Terms */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Terms & Conditions
            </label>
            <input
              type="text"
              name="terms"
              value={formData.terms}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
            <Link
              to="/business/offers"
              className="btn-secondary text-xs"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="btn-primary text-xs !py-2.5 !px-6"
            >
              {submitting ? 'Publishing...' : 'Publish Promotion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOffer;
