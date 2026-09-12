import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  CreditCard,
  CheckCircle2,
  Calendar,
  FileText,
  Download,
  ArrowLeft,
  Store,
  ShieldCheck,
  Receipt,
  X,
  Printer,
} from 'lucide-react';

export const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const res = await api.get('/subscriptions/payments');
        if (res.data?.success) {
          setPayments(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching payments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const totalSpent = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/business/showcase" className="text-[#64748B] hover:text-[#0F172A] transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Payment & Invoice History</h1>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1 ml-7">
            View billing receipts and records for your PMNA Daily Showcase subscription.
          </p>
        </div>

        <Link
          to="/business/showcase"
          className="btn-primary inline-flex items-center gap-2 self-start sm:self-auto text-xs"
        >
          <Store className="w-3.5 h-3.5" />
          <span>Manage Showcase Space</span>
        </Link>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <span className="text-xs font-semibold text-[#64748B]">Total Subscription Spend</span>
          <div className="text-2xl font-black text-[#0F172A] mt-1">₹{totalSpent}</div>
          <span className="text-[11px] text-[#10B981] font-semibold mt-0.5 block">Showcase Ad Spaces</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <span className="text-xs font-semibold text-[#64748B]">Paid Invoices</span>
          <div className="text-2xl font-black text-[#0F172A] mt-1">{payments.length}</div>
          <span className="text-[11px] text-[#64748B] mt-0.5 block">All transactions verified</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <span className="text-xs font-semibold text-[#64748B]">Current Monthly Rate</span>
          <div className="text-2xl font-black text-[#047857] mt-1">₹99 <span className="text-xs text-[#64748B] font-normal">/ month</span></div>
          <span className="text-[11px] text-[#0EA5E9] font-semibold mt-0.5 block">Standard Local Merchant Tier</span>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-card overflow-hidden">
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#10B981]" />
            <h2 className="text-base font-bold text-[#0F172A]">Billing Transactions</h2>
          </div>
          <span className="text-xs text-[#64748B]">Showing {payments.length} records</span>
        </div>

        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-12 bg-slate-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Receipt #</th>
                  <th className="py-3.5 px-4">Plan / Description</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Billing Period</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0F172A]">
                      {p.receiptNumber || 'RCPT-00000'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#334155]">
                      {p.subscriptionId?.planName || 'PMNA Showcase Monthly Plan'}
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B]">
                      {new Date(p.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B]">
                      {p.billingPeriod?.startDate && p.billingPeriod?.endDate ? (
                        <span>
                          {new Date(p.billingPeriod.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} —{' '}
                          {new Date(p.billingPeriod.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      ) : (
                        '30 Days'
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#047857]">
                      ₹{p.amount}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#047857] border border-[#D1FAE5]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Paid</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedReceipt(p)}
                        className="text-[#047857] hover:text-[#10B981] font-semibold text-xs inline-flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Invoice</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-2">
            <CreditCard className="w-8 h-8 text-[#94A3B8] mx-auto" />
            <h3 className="text-sm font-bold text-[#0F172A]">No Payment Records Found</h3>
            <p className="text-xs text-[#64748B]">Your subscription payment invoices will appear here once activated.</p>
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-elevated border border-[#E2E8F0] overflow-hidden p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#10B981] text-white flex items-center justify-center font-bold text-sm">
                  P
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">PMNA Official Tax Receipt</h3>
                  <p className="text-[10px] text-[#64748B]">Perinthalmanna Local Discovery</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Receipt Number</span>
                <span className="font-mono font-bold text-[#0F172A]">{selectedReceipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Order / Transaction ID</span>
                <span className="font-mono text-[#0F172A]">{selectedReceipt.orderId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Payment Gateway</span>
                <span className="font-semibold text-[#0F172A]">{selectedReceipt.paymentGateway}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Method</span>
                <span className="font-semibold text-[#0F172A]">{selectedReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Date & Time</span>
                <span className="text-[#0F172A]">{new Date(selectedReceipt.createdAt).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-[#0F172A] text-sm">
                <span className="font-bold text-[#0F172A]">Total Paid</span>
                <span className="font-extrabold text-[#047857]">₹{selectedReceipt.amount}.00</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={() => window.print()}
                className="btn-secondary w-full !py-2.5 text-xs flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="btn-primary w-full !py-2.5 text-xs"
              >
                <span>Done</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
