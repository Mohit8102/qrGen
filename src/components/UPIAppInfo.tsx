import React from 'react';
import { CheckCircle2, Smartphone, Info } from 'lucide-react';

interface UPIAppItem {
  name: string;
  badge: string;
  color: string;
  bg: string;
  borderColor: string;
  textColor: string;
  iconSvg: React.ReactNode;
}

export const UPIAppInfo: React.FC = () => {
  const apps: UPIAppItem[] = [
    {
      name: 'Google Pay',
      badge: 'GPay',
      color: '#4285F4',
      bg: 'bg-blue-50/70',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      iconSvg: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path fill="#4285F4" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.93V18h-2v-1.07c-1.78-.4-3.03-1.63-3.11-3.38h2.02c.07.82.72 1.45 1.59 1.45.92 0 1.55-.58 1.55-1.35 0-.7-.43-1.15-1.75-1.57-1.85-.59-2.91-1.34-2.91-2.92 0-1.54 1.15-2.73 2.61-3.04V5h2v1.07c1.47.33 2.6 1.45 2.73 2.93h-2.02c-.11-.69-.64-1.18-1.41-1.18-.8 0-1.4.5-1.4 1.18 0 .62.43 1.05 1.63 1.47 1.95.68 3.03 1.46 3.03 3.02 0 1.63-1.21 2.87-2.71 3.24z"/>
        </svg>
      ),
    },
    {
      name: 'PhonePe',
      badge: 'PhonePe',
      color: '#5F259F',
      bg: 'bg-purple-50/70',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700',
      iconSvg: (
        <div className="w-5 h-5 rounded-full bg-[#5f259f] text-white flex items-center justify-center font-bold text-xs">
          पे
        </div>
      ),
    },
    {
      name: 'Paytm',
      badge: 'Paytm',
      color: '#00BAF2',
      bg: 'bg-sky-50/70',
      borderColor: 'border-sky-200',
      textColor: 'text-sky-800',
      iconSvg: (
        <div className="w-5 h-5 rounded bg-[#002e6e] text-[#00baf2] flex items-center justify-center font-black text-[9px] tracking-tight">
          PAY
        </div>
      ),
    },
    {
      name: 'BHIM',
      badge: 'BHIM UPI',
      color: '#007A3D',
      bg: 'bg-emerald-50/70',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-800',
      iconSvg: (
        <div className="w-5 h-5 rounded-full bg-[#007A3D] text-white flex items-center justify-center font-black text-[9px]">
          BH
        </div>
      ),
    },
    {
      name: 'Other UPI Apps',
      badge: 'Amazon Pay, CRED & All Banks',
      color: '#475569',
      bg: 'bg-slate-100',
      borderColor: 'border-slate-200',
      textColor: 'text-slate-700',
      iconSvg: <Smartphone className="w-5 h-5 text-slate-600" />,
    },
  ];

  return (
    <section className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs mb-6">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
            <span>Universal UPI QR</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
              NPCI Compliant
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Works with supported UPI apps
          </p>
        </div>
        <div className="p-2 rounded-xl bg-slate-50 text-slate-400">
          <Info className="w-4 h-4 text-slate-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
        {apps.map((app) => (
          <div
            key={app.name}
            className={`flex items-center gap-2 p-2.5 rounded-xl border ${app.bg} ${app.borderColor} transition-transform hover:-translate-y-0.5`}
          >
            <div className="shrink-0">{app.iconSvg}</div>
            <div className="min-w-0">
              <div className={`text-xs font-bold ${app.textColor} truncate`}>
                {app.name}
              </div>
              <div className="text-[10px] text-slate-500 flex items-center gap-0.5 truncate">
                <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>Compatible</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-[11px] text-slate-400 bg-slate-50/80 rounded-lg px-3 py-1.5 border border-slate-100">
        Single unified payment QR: standard <code className="font-mono text-slate-600">upi://pay</code> URI automatically resolves to the customer's default or chosen UPI app on scan.
      </p>
    </section>
  );
};
