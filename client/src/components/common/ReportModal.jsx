import React, { useState } from 'react';
import api from '../../services/api';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';

export const ReportModal = ({ isOpen, onClose, targetType = 'offer', targetId, targetTitle }) => {
  const [reason, setReason] = useState('fake_offer');
  const [details, setDetails] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!details.trim()) {
      setError('Please provide details explaining the issue.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.post('/reports', {
        targetType,
        targetId,
        reason,
        details,
        reporterName: name,
        reporterContact: contact,
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-elevated border border-[#E2E8F0] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle className="w-12 h-12 text-[#10B981] mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-[#0F172A]">Report Submitted</h3>
            <p className="text-xs text-[#64748B]">
              Thank you for keeping PMNA trustworthy. Our governance team will review this listing shortly.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 text-[#EF4444] mb-2">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-[#0F172A]">Report this {targetType}</h3>
            </div>
            <p className="text-xs text-[#64748B] mb-4 truncate">
              Reporting: <span className="font-semibold text-[#0F172A]">{targetTitle}</span>
            </p>

            {error && (
              <div className="mb-4 p-2.5 rounded-lg bg-[#FEE2E2] text-[#B91C1C] text-xs font-semibold border border-[#EF4444]/20">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Reason</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="form-input"
                >
                  <option value="fake_offer">Fake or Unhonored Offer</option>
                  <option value="wrong_price">Wrong Price / Hidden Charges</option>
                  <option value="expired_offer">Already Expired / Out of Stock</option>
                  <option value="wrong_business_info">Incorrect Shop Info / Address</option>
                  <option value="inappropriate_content">Inappropriate Content</option>
                  <option value="other">Other Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Details <span className="text-[#EF4444]">*</span>
                </label>
                <textarea
                  rows="3"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Explain what happened or why this listing needs correction..."
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg p-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#D1FAE5] transition-all"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Your Name (Optional)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Contact (Optional)</label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Phone or Email"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary text-xs !py-2 !px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-danger text-xs !py-2 !px-4"
                >
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
