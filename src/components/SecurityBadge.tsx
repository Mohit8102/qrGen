import React from 'react';
import { ShieldCheck, Lock, EyeOff } from 'lucide-react';

export const SecurityBadge: React.FC = () => {
  return (
    <div className="bg-emerald-50/50 border border-emerald-200/70 rounded-2xl p-4 text-slate-700">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5">
            <span>Bank-Grade Privacy & Zero Credential Policy</span>
          </h4>
          <p className="text-xs text-emerald-900/80 leading-relaxed">
            This tool generates client-side UPI standard URIs only. We <strong>never</strong> ask for or store your <strong>UPI PIN, OTP, bank passwords, or card details</strong>. UPI PIN is only entered inside your official banking or UPI app during authorization.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-emerald-800 font-medium">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-600" />
              100% Client-Side
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <EyeOff className="w-3 h-3 text-emerald-600" />
              No Data Stored
            </span>
            <span>•</span>
            <span>NPCI Standard URI</span>
          </div>
        </div>
      </div>
    </div>
  );
};
