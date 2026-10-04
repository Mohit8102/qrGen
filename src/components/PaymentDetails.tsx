import React from 'react';
import { UPIPaymentData } from '../types';
import { formatINR } from '../utils/upi';
import { User, AtSign, IndianRupee, Coins, FileText, CheckCircle2 } from 'lucide-react';

interface PaymentDetailsProps {
  data: UPIPaymentData;
}

export const PaymentDetails: React.FC<PaymentDetailsProps> = ({ data }) => {
  const rows = [
    {
      label: 'Recipient',
      value: data.recipientName,
      icon: <User className="w-4 h-4 text-slate-400" />,
      highlight: false,
    },
    {
      label: 'UPI ID',
      value: data.upiId,
      icon: <AtSign className="w-4 h-4 text-indigo-500" />,
      mono: true,
      highlight: true,
    },
    {
      label: 'Amount',
      value: data.amount && parseFloat(data.amount) > 0 ? formatINR(data.amount) : 'Any Amount (Customer enters in UPI app)',
      icon: <IndianRupee className="w-4 h-4 text-emerald-500" />,
      highlight: !!(data.amount && parseFloat(data.amount) > 0),
      badge: !!(data.amount && parseFloat(data.amount) > 0) ? 'Fixed Amount' : 'Dynamic',
    },
    {
      label: 'Currency',
      value: 'INR (Indian Rupee)',
      icon: <Coins className="w-4 h-4 text-slate-400" />,
      highlight: false,
    },
    {
      label: 'Payment Note',
      value: data.message ? data.message : 'Not specified',
      icon: <FileText className="w-4 h-4 text-slate-400" />,
      highlight: false,
      italic: !data.message,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Payment Details</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </h3>
          <p className="text-xs text-slate-500">
            Encoded payload parameters inside the QR
          </p>
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
          Standard UPI
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-100 divide-y divide-slate-100 bg-slate-50/40">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:px-4 gap-1 text-sm transition-colors hover:bg-slate-50/90"
          >
            <div className="flex items-center gap-2 text-slate-600 font-medium text-xs sm:text-sm">
              {row.icon}
              <span>{row.label}</span>
            </div>
            <div className="flex items-center gap-2 sm:text-right pl-6 sm:pl-0">
              <span
                className={`text-xs sm:text-sm ${
                  row.mono ? 'font-mono text-indigo-700 font-semibold' : ''
                } ${row.highlight ? 'font-bold text-slate-900' : 'text-slate-700'} ${
                  row.italic ? 'text-slate-400 italic' : ''
                }`}
              >
                {row.value}
              </span>
              {row.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60">
                  {row.badge}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
