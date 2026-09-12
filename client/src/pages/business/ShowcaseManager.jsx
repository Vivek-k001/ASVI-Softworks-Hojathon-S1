import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ShopShowcaseCard } from '../../components/showcase/ShopShowcaseCard';
import { MockPaymentGateway } from '../../components/common/MockPaymentGateway';
import {
  Sparkles,
  Upload,
  Calendar,
  Tag,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  QrCode,
  ShieldCheck,
  Eye,
  RefreshCw,
  ExternalLink,
  Info,
  Clock,
  ArrowRight,
  X,
  Lock,
} from 'lucide-react';

export const ShowcaseManager = () => {
  const { business } = useAuth();

  // Subscription state
  const [subStatus, setSubStatus] = useState(null);
  const [subLoading, setSubLoading] = useState(true);

  // Showcase form state
  const [showcase, setShowcase] = useState({
    title: '',
    description: '',
    imageUrl: '',
    cloudinaryPublicId: '',
    discount: '',
    expiryDate: '',
    isActive: true,
    targetOfferId: '',
  });
  const [offers, setOffers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Image upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Payment checkout modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI_QR'); // UPI_QR, UPI, CARD
  const [upiId, setUpiId] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // 1. Fetch Subscription Status & Existing Showcase
  const fetchData = async () => {
    setSubLoading(true);
    try {
      const [subRes, scRes, offersRes] = await Promise.all([
        api.get('/subscriptions/status'),
        api.get('/showcases/me').catch(() => ({ data: { success: false } })),
        api.get('/offers/my-offers').catch(() => ({ data: { success: false, data: [] } })),
      ]);

      if (subRes.data?.success) {
        setSubStatus(subRes.data.data);
      }

      if (scRes.data?.success && scRes.data.data) {
        const sc = scRes.data.data;
        setShowcase({
          title: sc.title || '',
          description: sc.description || '',
          imageUrl: sc.imageUrl || '',
          cloudinaryPublicId: sc.cloudinaryPublicId || '',
          discount: sc.discount || '',
          expiryDate: sc.expiryDate ? sc.expiryDate.split('T')[0] : '',
          isActive: sc.isActive !== undefined ? sc.isActive : true,
          targetOfferId: sc.targetOfferId?._id || sc.targetOfferId || '',
        });
      }

      if (offersRes.data?.success && offersRes.data.data) {
        setOffers(offersRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching showcase data:', err);
    } finally {
      setSubLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Handle Promotional Banner Image Upload to Cloudinary via Server
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    setUploadProgress(20);
    setErrorMsg('');

    try {
      setUploadProgress(50);
      const res = await api.post('/upload/showcase', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(Math.min(90, Math.max(50, percent)));
          }
        },
      });

      if (res.data?.success) {
        setUploadProgress(100);
        setShowcase((prev) => ({
          ...prev,
          imageUrl: res.data.data.url || res.data.data.imageUrl,
          cloudinaryPublicId: res.data.data.publicId,
        }));
      } else {
        throw new Error(res.data?.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Banner upload error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to upload image. You can also paste an image URL directly.');
    } finally {
      setUploading(false);
    }
  };

  // 3. Handle Showcase Form Submit
  const handleSaveShowcase = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSaveSuccess(false);

    if (!showcase.title.trim()) {
      setErrorMsg('Promotional headline is required.');
      setSaving(false);
      return;
    }

    if (!showcase.imageUrl.trim()) {
      setErrorMsg('Promotional banner image is required.');
      setSaving(false);
      return;
    }

    try {
      const res = await api.post('/showcases/me', showcase);
      if (res.data?.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Save showcase error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to save showcase');
    } finally {
      setSaving(false);
    }
  };

  // 4. Handle Subscription Checkout & Payment with ReliefLink1 3D Gateway
  const handlePaymentSuccess = async (paymentDetails) => {
    try {
      setPaymentProcessing(true);
      setErrorMsg('');

      // 1. Create Subscription Order
      const orderRes = await api.post('/subscriptions/create-order');
      if (!orderRes.data?.success) {
        throw new Error('Failed to create payment order');
      }
      const orderData = orderRes.data.data;

      // 2. Verify Payment with Gateway
      const verifyRes = await api.post('/subscriptions/verify-payment', {
        orderId: orderData.orderId,
        paymentId: paymentDetails.paymentId || `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        paymentMethod: paymentDetails.method || 'CARD',
        amount: orderData.amount,
      });

      if (verifyRes.data?.success) {
        setPaymentSuccess(true);
        setTimeout(() => {
          setPaymentSuccess(false);
          setShowPaymentModal(false);
          fetchData(); // Refresh subscription status
        }, 1200);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setErrorMsg(err.response?.data?.message || 'Payment verification failed.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const isSubscribed = subStatus?.status === 'active' || subStatus?.status === 'expiring_soon';
  const planPrice = subStatus?.plan?.amount || 99;

  // Real-time preview object
  const previewData = {
    title: showcase.title || 'Your Promotional Ad Headline Here',
    description: showcase.description || 'Provide engaging details about your store sale, seasonal discount, or special event here.',
    imageUrl: showcase.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&h=600&fit=crop',
    discount: showcase.discount || 'FLAT 30% OFF',
    expiryDate: showcase.expiryDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    businessId: business || {
      name: 'Your Shop Name',
      address: 'Perinthalmanna Road',
      locationId: { name: 'Perinthalmanna' },
      phone: '+91 94470 00000',
    },
    targetOfferId: showcase.targetOfferId || null,
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Showcase & Daily Ads Manager</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#047857] border border-[#D1FAE5]">
              Home Screen Ad Space
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Display your shop in the primary "Daily Deals & Offers" newspaper-style ad space on PMNA's front page.
          </p>
        </div>

        <Link
          to="/"
          target="_blank"
          className="btn-secondary inline-flex items-center gap-2 self-start sm:self-auto text-xs"
        >
          <Eye className="w-3.5 h-3.5 text-[#10B981]" />
          <span>View Public Home Page</span>
          <ExternalLink className="w-3 h-3 text-[#94A3B8]" />
        </Link>
      </div>

      {/* 1. SUBSCRIPTION STATUS BANNER */}
      <div className={`p-6 rounded-2xl border transition-all ${
        isSubscribed
          ? 'bg-gradient-to-r from-[#ECFDF5] to-[#F0FDF4] border-[#A7F3D0]'
          : 'bg-gradient-to-r from-[#FFFBEB] to-[#FEF3C7] border-[#FDE68A]'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isSubscribed ? 'bg-[#10B981] text-white' : 'bg-[#F59E0B] text-white'
              }`}>
                {isSubscribed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                {subStatus?.status === 'active'
                  ? 'Subscription Active'
                  : subStatus?.status === 'expiring_soon'
                  ? 'Expiring Soon'
                  : subStatus?.status === 'expired'
                  ? 'Subscription Expired'
                  : 'Subscription Required'}
              </span>

              {isSubscribed && subStatus?.daysRemaining !== undefined && (
                <span className="text-xs font-semibold text-[#047857] bg-white px-2.5 py-1 rounded-md border border-[#A7F3D0] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#10B981]" />
                  {subStatus.daysRemaining} days remaining
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-bold text-[#0F172A]">
              {isSubscribed
                ? 'Your Shop Showcase is Eligible for Home Screen Discovery'
                : 'Showcase Ad is Hidden — Activate Your Monthly Plan'}
            </h3>

            <p className="text-xs sm:text-sm text-[#475569] max-w-2xl">
              {isSubscribed
                ? `Plan active until ${new Date(subStatus.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}. Your ad appears directly in the first row of PMNA's Home Screen.`
                : `For only ₹${planPrice}/month, get your dedicated promotional display box seen by shoppers across Perinthalmanna and Angadipuram.`}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowPaymentModal(true)}
              className="btn-primary !py-2.5 !px-5 text-xs font-bold shadow-md flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>{isSubscribed ? 'Extend / Renew Plan (₹' + planPrice + ')' : 'Subscribe Now (₹' + planPrice + '/mo)'}</span>
            </button>

            <Link
              to="/business/payments"
              className="btn-secondary !py-2.5 !px-4 text-xs font-semibold"
            >
              <span>Receipts</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN WORKSPACE: LEFT EDITOR, RIGHT LIVE PREVIEW */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column: Form & Uploader (7 cols) */}
        <div className="xl:col-span-7 space-y-6">
          <form onSubmit={handleSaveShowcase} className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E2E8F0] shadow-card space-y-6">
            
            <div className="border-b border-[#E2E8F0] pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A]">Promotional Ad Details</h2>
                <p className="text-xs text-[#64748B]">Customize your high-visibility newspaper-style display space</p>
              </div>

              {/* Visibility Switch */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showcase.isActive}
                  onChange={(e) => setShowcase((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                <span className="text-xs font-bold text-[#334155]">
                  {showcase.isActive ? 'Active' : 'Paused'}
                </span>
              </label>
            </div>

            {/* Error / Success Banners */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {saveSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#10B981]" />
                <span className="font-semibold">Showcase ad updated and published successfully!</span>
              </div>
            )}

            {/* Field: Headline */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                Promotional Headline *
              </label>
              <input
                type="text"
                value={showcase.title}
                onChange={(e) => setShowcase((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Mega Monsoon Footwear Carnival — Flat 40% OFF"
                maxLength={120}
                required
                className="form-input text-sm"
              />
              <span className="text-[11px] text-[#94A3B8] mt-1 block">
                Make it bold, punchy, and clear for local readers. ({120 - showcase.title.length} chars remaining)
              </span>
            </div>

            {/* Field: Offer / Discount Badge */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                  Discount / Tag Badge
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={showcase.discount}
                    onChange={(e) => setShowcase((prev) => ({ ...prev, discount: e.target.value }))}
                    placeholder="e.g. FLAT 40% OFF or BUY 1 GET 1"
                    maxLength={30}
                    className="form-input pl-9 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                  Offer Expiry Date *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={showcase.expiryDate}
                    onChange={(e) => setShowcase((prev) => ({ ...prev, expiryDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="form-input pl-9 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Field: Cloudinary Promotional Banner Image */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                Promotional Banner Image (High Resolution) *
              </label>

              {/* Upload Drop Area */}
              <div className="border-2 border-dashed border-[#CBD5E1] hover:border-[#10B981] rounded-2xl p-6 bg-[#F8FAFC] text-center transition-colors">
                <input
                  type="file"
                  id="showcase-banner-input"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <label
                  htmlFor="showcase-banner-input"
                  className="cursor-pointer flex flex-col items-center justify-center gap-2.5"
                >
                  <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-[#E2E8F0] flex items-center justify-center text-[#10B981]">
                    {uploading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#047857] hover:underline">
                      Click to upload banner to Cloudinary
                    </span>
                    <span className="text-xs text-[#64748B]"> or drag and drop</span>
                  </div>
                  <span className="text-[11px] text-[#94A3B8]">
                    PNG, JPG, WEBP up to 5MB (Recommended: 1200 × 600 px)
                  </span>
                </label>

                {uploading && (
                  <div className="mt-4 space-y-1 max-w-xs mx-auto">
                    <div className="h-2 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#10B981] transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-semibold text-[#64748B]">
                      Uploading securely to Cloudinary ({uploadProgress}%)...
                    </span>
                  </div>
                )}
              </div>

              {/* Fallback Image URL Input */}
              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                  Or use Direct Image URL:
                </label>
                <input
                  type="url"
                  value={showcase.imageUrl}
                  onChange={(e) => setShowcase((prev) => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                  className="form-input text-xs"
                />
              </div>
            </div>

            {/* Field: Description Copy */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                Promotional Details / Copy
              </label>
              <textarea
                value={showcase.description}
                onChange={(e) => setShowcase((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
                placeholder="Describe your special showroom promotion, festival offers, gifts with purchase, and dining details..."
                className="form-input text-sm resize-none"
              ></textarea>
              <span className="text-[11px] text-[#94A3B8] mt-1 block">
                This copy appears right beneath your advertisement banner on the Home Screen.
              </span>
            </div>

            {/* Field: Target Offer Link */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                Link to an Active Store Offer (Optional)
              </label>
              <select
                value={showcase.targetOfferId}
                onChange={(e) => setShowcase((prev) => ({ ...prev, targetOfferId: e.target.value }))}
                className="form-input text-sm"
              >
                <option value="">-- No specific offer (Directs to Store Profile) --</option>
                {offers.map((off) => (
                  <option key={off._id} value={off._id}>
                    {off.title} ({off.discountPercentage}% OFF — ₹{off.offerPrice})
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-[#94A3B8] mt-1 block">
                When customers tap "View Offer", they will be taken straight to this item.
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={saving || uploading}
                className="btn-primary w-full !py-3 font-bold text-sm flex items-center justify-center gap-2 shadow-md"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Ad Space...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Save & Publish Showcase Ad</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Home Screen Ad Preview (5 cols) */}
        <div className="xl:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#10B981]" />
                <h3 className="text-sm font-bold text-[#0F172A]">Live Home Screen Ad Preview</h3>
              </div>
              <span className="text-[11px] font-semibold text-[#64748B]">
                Malayala Manorama Display Style
              </span>
            </div>

            <p className="text-xs text-[#64748B] mb-4">
              This is how your promotional box will look to customers browsing the PMNA Home Screen:
            </p>

            {/* Live Component Preview */}
            <div className="scale-95 origin-top">
              <ShopShowcaseCard showcase={previewData} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. PAYMENT CHECKOUT MODAL (3D FLIPPING CARD & UPI FROM RELIEFLINK1) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-[500px] my-6">
            <MockPaymentGateway
              amount={planPrice}
              planName="Showcase Banner Subscription"
              onSuccess={handlePaymentSuccess}
              onCancel={() => setShowPaymentModal(false)}
            />
          </div>
        </div>
      )}

    </div>
  );
};
