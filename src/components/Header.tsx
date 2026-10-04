import React from 'react';
import { QrCode, ShieldCheck, Server, RefreshCw } from 'lucide-react';
import { BackendHealthResponse } from '../api/client';

interface HeaderProps {
  backendStatus?: {
    isOnline: boolean;
    data?: BackendHealthResponse;
    loading?: boolean;
    onRefresh?: () => void;
  };
}

export const Header: React.FC<HeaderProps> = ({ backendStatus }) => {
  return (
    <header className="pt-8 pb-6 text-center">
      {/* Badges bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold shadow-xs">
          <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
          <span>NPCI UPI Compatible</span>
          <span className="text-indigo-300">•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Safe
          </span>
        </div>

        {/* Backend Connectivity Status Badge */}
        {backendStatus && (
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              backendStatus.isOnline
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-xs'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span
              className={`w-2 h-2 rounded-full ${
                backendStatus.isOnline ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'
              }`}
            />
            <span>
              {backendStatus.loading
                ? 'Connecting to Backend...'
                : backendStatus.isOnline
                ? 'Python Backend Online (Port 5000)'
                : 'Offline / Client Mode'}
            </span>
            {backendStatus.onRefresh && (
              <button
                onClick={backendStatus.onRefresh}
                title="Check Backend Connection"
                className="ml-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${backendStatus.loading ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
          <QrCode className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          Universal UPI QR
        </h1>
      </div>

      <p className="text-base sm:text-lg text-slate-600 font-medium max-w-md mx-auto">
        Full Stack UPI QR Generator with REST API (GET &amp; POST Routes)
      </p>
    </header>
  );
};
