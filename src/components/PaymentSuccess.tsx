import React from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle, ArrowLeft, Download, Shield, Sparkles } from 'lucide-react';
import { UPIPaymentData } from '../types';
import { formatINR } from '../utils/upi';

interface PaymentSuccessProps {
  data: UPIPaymentData;
  onReset: () => void;
}

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ data, onReset }) => {
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#4F46E5', '#2563EB', '#10B981', '#F59E0B'],
    });
  };

  React.useEffect(() => {
    triggerConfetti();
  }, []);

  const txnId = `UPI${Math.floor(100000000000 + Math.random() * 900000000000)}`;
  const dateStr = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="bg-white rounded-2xl border border-emerald-200/80 shadow-md p-6 sm:p-8 text-center animate-fadeIn relative overflow-hidden">
      {/* Decorative accent */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>

      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
        <CheckCircle className="w-9 h-9" />
      </div>

      <span className="inline-block text-xs uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
        Payment Simulator Mode
      </span>

      <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
        Payment Successful!
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
        This is how a completed payment appears once your customer scans and authorizes via their UPI app.
      </p>

      {/* Payment Receipt Box */}
      <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-left max-w-md mx-auto space-y-2.5">
        <div className="flex justify-between items-center text-xs text-slate-500">
          <span>Transaction ID</span>
          <span className="font-mono text-slate-700 font-semibold">{txnId}</span>
        </div>
        <div className="flex justify-between items-center text-xs text-slate-500">
          <span>Date & Time</span>
          <span className="text-slate-700">{dateStr}</span>
        </div>
        <div className="flex justify-between items-center text-xs text-slate-500">
          <span>Paid To</span>
          <span className="font-semibold text-slate-800">{data.recipientName}</span>
        </div>
        <div className="flex justify-between items-center text-xs text-slate-500">
          <span>UPI ID</span>
          <span className="font-mono text-indigo-600">{data.upiId}</span>
        </div>
        {data.message && (
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Payment Note</span>
            <span className="italic text-slate-700">“{data.message}”</span>
          </div>
        )}
        <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
          <span className="text-sm font-bold text-slate-800">Total Amount</span>
          <span className="text-xl font-extrabold text-emerald-600">
            {formatINR(data.amount || '0')}
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
        <button
          type="button"
          onClick={triggerConfetti}
          className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors border border-emerald-200"
        >
          <Sparkles className="w-4 h-4" />
          <span>Celebrate Again</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to QR Generator</span>
        </button>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-center gap-1">
        <Shield className="w-3.5 h-3.5 text-slate-400" />
        <span>Direct bank-to-bank settlement via NPCI UPI protocol</span>
      </div>
    </div>
  );
};
