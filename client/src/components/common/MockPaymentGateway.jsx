import React, { useState } from 'react';
import { CreditCard, Smartphone, CheckCircle, Loader2, ShieldCheck, Lock, X, Sparkles, QrCode } from 'lucide-react';

/**
 * 3D Flipping Payment Gateway (Card & UPI/QR)
 * Ported from ReliefLink1 with PMNA Perks Design System
 */
export const MockPaymentGateway = ({
  amount = 499,
  planName = 'PMNA Merchant Plan',
  onSuccess,
  onCancel,
}) => {
  const [method, setMethod] = useState('card'); // 'card' or 'upi'
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // UPI details
  const [upiId, setUpiId] = useState('');

  const formatCardNumber = (val) => {
    const v = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = (v.match(/\d{4,16}/g) && v.match(/\d{4,16}/g)[0]) || '';
    const parts = [];
    for (let i = 0, len = matches.length; i < len; i += 4) {
      parts.push(matches.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : val;
  };

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        if (onSuccess) {
          onSuccess({
            method: method.toUpperCase(),
            amount,
            transactionId: `TXN_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
            paymentId: `PAY_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            timestamp: new Date().toISOString(),
          });
        }
      }, 1000);
    }, 1800);
  };

  const isCardValid = cardNumber.replace(/\s/g, '').length === 16 && cardName.trim().length > 2 && expiry.length === 5 && cvv.length >= 3;

  return (
    <div className="relative w-full max-w-[500px] mx-auto bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl p-6 sm:p-8 text-[#0F172A] font-sans">
      {/* Close button if onCancel provided */}
      {onCancel && (
        <button
          onClick={onCancel}
          type="button"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-[#E2E8F0] mb-6">
        <div>
          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">{planName}</span>
          <h3 className="text-xl font-black text-[#0F172A] tracking-tight">Complete Payment</h3>
        </div>
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#ECFDF5] border border-[#10B981]/20 text-[#047857]">
          <span className="text-xs font-semibold">Total:</span>
          <span className="text-lg font-black tracking-tight">₹{amount}</span>
        </div>
      </div>

      {/* Payment Method Tabs */}
      <div className="flex gap-3 mb-6">
        <button
          type="button"
          onClick={() => setMethod('card')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all duration-200 ${
            method === 'card'
              ? 'border-[#10B981] bg-[#ECFDF5] text-[#047857] shadow-xs'
              : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:border-[#CBD5E1]'
          }`}
        >
          <CreditCard className={`w-4 h-4 ${method === 'card' ? 'text-[#10B981]' : 'text-[#64748B]'}`} />
          <span>Card / Netbanking</span>
        </button>
        <button
          type="button"
          onClick={() => setMethod('upi')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all duration-200 ${
            method === 'upi'
              ? 'border-[#10B981] bg-[#ECFDF5] text-[#047857] shadow-xs'
              : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:border-[#CBD5E1]'
          }`}
        >
          <Smartphone className={`w-4 h-4 ${method === 'upi' ? 'text-[#10B981]' : 'text-[#64748B]'}`} />
          <span>UPI / QR Scan</span>
        </button>
      </div>

      {/* 3D Flipping Container (from ReliefLink1) */}
      <div style={{ perspective: '1200px' }} className="relative mb-6">
        <div
          style={{
            display: 'grid',
            transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
            transformStyle: 'preserve-3d',
            transform: method === 'card' ? 'rotateY(0deg)' : 'rotateY(180deg)',
            position: 'relative',
          }}
        >
          {/* ================= FRONT: CARD UI ================= */}
          <div
            style={{
              gridArea: '1 / 1 / 2 / 2',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              pointerEvents: method === 'card' ? 'auto' : 'none',
            }}
          >
            {/* Gradient Card Visual */}
            <div
              className="relative w-full h-48 sm:h-52 rounded-2xl p-5 mb-5 flex flex-col justify-between overflow-hidden shadow-lg text-white"
              style={{
                background: 'linear-gradient(135deg, #064E3B 0%, #047857 50%, #10B981 100%)',
                boxShadow: '0 12px 30px -8px rgba(16,185,129,0.35)',
              }}
            >
              {/* Background Glow Accents */}
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute -bottom-12 -left-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />

              {/* Card Header */}
              <div className="flex justify-between items-start relative z-10">
                {/* Gold EMV Chip */}
                <div className="w-11 h-9 rounded-md bg-gradient-to-br from-[#FDE047] via-[#D97706] to-[#B45309] p-[1px] grid grid-cols-2 grid-rows-3 gap-[1px] shadow-sm">
                  <div className="border border-black/15 border-l-0 border-t-0" />
                  <div className="border border-black/15 border-r-0 border-t-0" />
                  <div className="border border-black/15 border-l-0" />
                  <div className="border border-black/15 border-r-0" />
                  <div className="border border-black/15 border-l-0 border-b-0" />
                  <div className="border border-black/15 border-r-0 border-b-0" />
                </div>

                <div className="text-right">
                  <span className="text-base font-black italic tracking-tight text-white drop-shadow-sm">PMNA Pay</span>
                  <span className="block text-[9px] font-semibold text-white/75 uppercase tracking-widest">Business</span>
                </div>
              </div>

              {/* Card Number & Details */}
              <div className="relative z-10">
                <div className="text-lg sm:text-xl font-mono tracking-widest text-[#F8FAFC] mb-3 text-shadow-sm drop-shadow">
                  {cardNumber || '•••• •••• •••• ••••'}
                </div>

                <div className="flex justify-between items-end text-[10px] text-white/80 uppercase tracking-wider">
                  <div className="min-w-0 pr-2">
                    <div className="text-[9px] text-white/60 mb-0.5">Cardholder</div>
                    <div className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px]">
                      {cardName || 'YOUR NAME'}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[9px] text-white/60 mb-0.5">Expires</div>
                    <div className="text-xs sm:text-sm font-bold text-white font-mono">{expiry || 'MM/YY'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Inputs Form */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">Card Number</label>
                <input
                  type="text"
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="4532 8901 2345 6789"
                  className="w-full bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm font-mono font-semibold text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#10B981] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">Cardholder Name</label>
                <input
                  type="text"
                  maxLength={26}
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.replace(/[^a-zA-Z\s]/g, '').toUpperCase())}
                  placeholder="e.g. ASWATHI"
                  className="w-full bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#10B981] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    maxLength={5}
                    value={expiry}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^0-9]/g, '');
                      if (val.length >= 3) val = val.substring(0, 2) + '/' + val.substring(2, 4);
                      setExpiry(val);
                    }}
                    placeholder="12/28"
                    className="w-full bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm font-mono font-semibold text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#10B981] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1">CVV</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="•••"
                    className="w-full bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm font-mono font-semibold text-[#0F172A] placeholder-[#94A3B8] tracking-widest focus:outline-none focus:border-[#10B981] transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ================= BACK: UPI/QR UI ================= */}
          <div
            style={{
              gridArea: '1 / 1 / 2 / 2',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              pointerEvents: method === 'upi' ? 'auto' : 'none',
            }}
            className="flex flex-col items-center justify-center text-center pt-2 pb-4"
          >
            {/* Trustworthy UPI Box */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs w-full max-w-[320px] mx-auto flex flex-col items-center">
              <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-3">
                Scan with any UPI App
              </span>

              {/* Simulated QR Code with Corner Brackets */}
              <div className="relative bg-white p-3 rounded-2xl border border-[#CBD5E1] shadow-xs mb-3.5">
                <div className="w-40 h-40 grid grid-cols-12 grid-rows-12 gap-[2px] p-1">
                  {Array.from({ length: 144 }).map((_, i) => {
                    const row = Math.floor(i / 12);
                    const col = i % 12;
                    const isCorner =
                      (col < 3 && row < 3) ||
                      (col > 8 && row < 3) ||
                      (col < 3 && row > 8);
                    const isInnerCorner =
                      (col === 1 && row === 1) ||
                      (col === 10 && row === 1) ||
                      (col === 1 && row === 10);

                    const bg = isInnerCorner ? '#FFFFFF' : isCorner ? '#0F172A' : (i * 17) % 3 === 0 ? '#0F172A' : '#FFFFFF';
                    return <div key={i} style={{ background: bg }} className="rounded-[1px]" />;
                  })}
                </div>

                {/* Central UPI Logo */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 py-1 rounded-md shadow-xs border border-[#E2E8F0] flex items-center justify-center">
                  <span className="text-[10px] font-black text-[#047857] tracking-tight">UPI</span>
                </div>

                {/* Bracket corners in Emerald */}
                <div className="absolute -top-2 -left-2 w-5 h-5 border-t-[3px] border-l-[3px] border-[#10B981] rounded-tl-lg" />
                <div className="absolute -top-2 -right-2 w-5 h-5 border-t-[3px] border-r-[3px] border-[#10B981] rounded-tr-lg" />
                <div className="absolute -bottom-2 -left-2 w-5 h-5 border-b-[3px] border-l-[3px] border-[#10B981] rounded-bl-lg" />
                <div className="absolute -bottom-2 -right-2 w-5 h-5 border-b-[3px] border-r-[3px] border-[#10B981] rounded-br-lg" />
              </div>

              {/* Merchant VPA Badge */}
              <div className="w-full bg-[#F8FAFC] p-2.5 border border-[#E2E8F0] rounded-xl text-xs">
                <div className="text-[10px] text-[#64748B] font-semibold mb-0.5">PMNA Merchant VPA</div>
                <div className="font-bold text-[#0F172A] font-mono select-all">pmna.perks@upi</div>
              </div>
            </div>

            {/* UPI ID Input Alternative */}
            <div className="w-full max-w-[320px] mt-4 text-left">
              <label className="block text-[11px] font-bold text-[#475569] mb-1">Or enter your UPI ID</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourname@okhdfcbank"
                className="w-full bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#10B981]"
              />
            </div>

            <p className="text-[11px] text-[#64748B] mt-2 font-medium">
              Supported: Google Pay, PhonePe, Paytm, BHIM, CRED
            </p>
          </div>
        </div>
      </div>

      {/* Security Info Badge */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] text-[#64748B] mb-5">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-[#10B981]" />
          <span>256-Bit SSL Encrypted Instant Gateway</span>
        </div>
        <span className="text-[10px] font-bold text-[#047857] bg-[#ECFDF5] px-2 py-0.5 rounded">
          Sandbox Verified
        </span>
      </div>

      {/* Pay Button */}
      <button
        type="button"
        onClick={handlePay}
        disabled={isProcessing || isSuccess}
        className={`w-full py-3.5 px-5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] ${
          isSuccess
            ? 'bg-[#10B981] text-white'
            : isProcessing
            ? 'bg-[#A7F3D0] text-[#065F46] cursor-not-allowed'
            : 'bg-[#10B981] hover:bg-[#059669] text-white hover:shadow-lg shadow-[#10B981]/25'
        }`}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Authorizing Payment of ₹{amount}...</span>
          </>
        ) : isSuccess ? (
          <>
            <CheckCircle className="w-4 h-4 text-white" />
            <span>Payment Successful! Verified.</span>
          </>
        ) : (
          <>
            <ShieldCheck className="w-4 h-4" />
            <span>Pay ₹{amount} Securely</span>
          </>
        )}
      </button>
    </div>
  );
};

export default MockPaymentGateway;
