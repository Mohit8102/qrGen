import React, { useEffect, useState } from 'react';
import { QrCode, ExternalLink, RefreshCw, Smartphone, Check, Sparkles, AlertCircle, Download, CheckCircle, Server, Copy } from 'lucide-react';
import { UPIPaymentData, ServerQRResult } from '../types';
import { buildUPIURI, formatINR, generateQRCodeDataURL } from '../utils/upi';
import { DownloadQR } from './DownloadQR';
import { SharePayment } from './SharePayment';
import { getBackendQRImageUrl } from '../api/client';

interface UniversalQRCodeProps {
  data: UPIPaymentData;
  serverResult?: ServerQRResult | null;
  onReset: () => void;
  onSimulateSuccess?: () => void;
}

export const UniversalQRCode: React.FC<UniversalQRCodeProps> = ({
  data,
  serverResult,
  onReset,
  onSimulateSuccess,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [activeApp, setActiveApp] = useState<string>(data.app || 'universal');
  const [showMobileNotice, setShowMobileNotice] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // App-specific URLs returned from backend or calculated
  const appUrls: Record<string, string> = serverResult?.appUrls || {
    universal: buildUPIURI(data),
    phonepe: `phonepe://pay?pa=${encodeURIComponent(data.upiId)}&pn=${encodeURIComponent(data.recipientName)}&cu=INR${data.amount ? `&am=${data.amount}` : ''}${data.message ? `&tn=${encodeURIComponent(data.message)}` : ''}`,
    google_pay: `gpay://upi/pay?pa=${encodeURIComponent(data.upiId)}&pn=${encodeURIComponent(data.recipientName)}&cu=INR${data.amount ? `&am=${data.amount}` : ''}${data.message ? `&tn=${encodeURIComponent(data.message)}` : ''}`,
    paytm: `paytmmp://pay?pa=${encodeURIComponent(data.upiId)}&pn=${encodeURIComponent(data.recipientName)}&cu=INR${data.amount ? `&am=${data.amount}` : ''}${data.message ? `&tn=${encodeURIComponent(data.message)}` : ''}`,
    fam_pay: `fampay://pay?pa=${encodeURIComponent(data.upiId)}&pn=${encodeURIComponent(data.recipientName)}&cu=INR${data.amount ? `&am=${data.amount}` : ''}${data.message ? `&tn=${encodeURIComponent(data.message)}` : ''}`,
    bhim: `bhim://pay?pa=${encodeURIComponent(data.upiId)}&pn=${encodeURIComponent(data.recipientName)}&cu=INR${data.amount ? `&am=${data.amount}` : ''}${data.message ? `&tn=${encodeURIComponent(data.message)}` : ''}`,
  };

  const currentUri = appUrls[activeApp] || appUrls['universal'] || buildUPIURI(data);

  useEffect(() => {
    // If we have serverResult and activeApp matches what was returned from backend, use backend base64 directly!
    if (serverResult?.qrCodeDataUrl && activeApp === (data.app || 'universal')) {
      setQrDataUrl(serverResult.qrCodeDataUrl);
      setLoading(false);
      return;
    }

    // Otherwise generate QR for current URI
    let isMounted = true;
    setLoading(true);

    generateQRCodeDataURL(currentUri, 512)
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error generating QR:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [data, activeApp, serverResult, currentUri]);

  const handleMobilePay = () => {
    setShowMobileNotice(true);
    window.location.href = currentUri;
  };

  const handleCopyUri = (schemeKey: string, uri: string) => {
    navigator.clipboard.writeText(uri);
    setCopiedLink(schemeKey);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  // Direct backend download link (GET request to /api/qr-image)
  const backendDownloadUrl = getBackendQRImageUrl(data, activeApp, true);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 sm:p-8 flex flex-col items-center text-center">
      {/* Card Header: Scan & Pay */}
      <div className="w-full flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Scan &amp; Pay
            </h2>
            {serverResult && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                <Server className="w-3 h-3" /> Backend Rendered
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Compatible with Google Pay, PhonePe, Paytm, BHIM, FamPay &amp; all UPI apps
          </p>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-slate-200/80 rounded-xl px-3 py-2 transition-all flex items-center gap-1.5 cursor-pointer"
          title="Edit or generate another QR"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Generate New QR</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* App Specific Filter Tabs */}
      <div className="w-full mb-5">
        <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap bg-slate-100 p-1.5 rounded-xl border border-slate-200/70">
          {[
            { id: 'universal', label: 'Universal' },
            { id: 'phonepe', label: 'PhonePe' },
            { id: 'google_pay', label: 'Google Pay' },
            { id: 'paytm', label: 'Paytm' },
            { id: 'fam_pay', label: 'FamPay' },
            { id: 'bhim', label: 'BHIM' },
          ].map((tab) => {
            const isTabActive = activeApp === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveApp(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isTabActive
                    ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recipient & Amount Highlight */}
      <div className="mb-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">
          Paying to
        </div>
        <div className="text-xl sm:text-2xl font-black text-slate-900">
          {data.recipientName}
        </div>
        <div className="inline-block mt-1 font-mono text-xs sm:text-sm text-indigo-700 bg-indigo-50/80 border border-indigo-100/80 px-3 py-0.5 rounded-full font-semibold">
          {data.upiId}
        </div>
      </div>

      {/* Amount Display */}
      <div className="mb-5">
        <div className="text-2xl sm:text-3xl font-black text-emerald-600">
          {data.amount && parseFloat(data.amount) > 0 ? (
            formatINR(data.amount)
          ) : (
            <span className="text-slate-600 font-bold text-lg sm:text-xl">
              Any Amount <span className="text-xs text-slate-400 font-normal">(Customer enters in app)</span>
            </span>
          )}
        </div>
        {data.message && (
          <p className="text-xs sm:text-sm text-slate-500 italic mt-1 bg-slate-50 px-3 py-1 rounded-lg inline-block border border-slate-100">
            “{data.message}”
          </p>
        )}
      </div>

      {/* Large QR Code Container */}
      <div className="relative p-4 sm:p-5 rounded-2xl bg-white border-2 border-slate-100 shadow-lg shadow-indigo-100/50 mb-4 max-w-[340px] w-full aspect-square flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-semibold text-slate-500">Rendering QR Code...</span>
          </div>
        ) : qrDataUrl ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={qrDataUrl}
              alt={`${activeApp} UPI QR Code`}
              className="w-full h-full object-contain rounded-lg"
              referrerPolicy="no-referrer"
            />
            {/* Center Logo Badge for NPCI / UPI Authenticity */}
            <div className="absolute inset-0 m-auto w-11 h-11 bg-white rounded-xl shadow-md border border-slate-200 flex items-center justify-center p-1 pointer-events-none">
              <div className="w-full h-full rounded-lg bg-indigo-600 text-white flex flex-col items-center justify-center font-bold text-[9px] leading-tight">
                <span>{activeApp === 'universal' ? 'UPI' : activeApp.substring(0, 4).toUpperCase()}</span>
                <span className="text-[7px] text-indigo-200">NPCI</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-rose-500 font-medium">Failed to generate QR code</div>
        )}
      </div>

      {/* Clear Instruction */}
      <div className="mb-6 space-y-1">
        <p className="text-sm sm:text-base font-bold text-slate-900">
          Scan this QR using {activeApp === 'universal' ? 'any UPI app' : activeApp.replace('_', ' ').toUpperCase()}
        </p>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Google Pay • PhonePe • Paytm • BHIM • FamPay • Cred • Amazon Pay
        </p>
      </div>

      {/* Mobile Experience: Pay Now button */}
      <div className="w-full mb-6 max-w-md">
        <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-indigo-100/80 text-left">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-indigo-900">
              <Smartphone className="w-4 h-4 text-indigo-600 shrink-0" />
              <div className="text-xs">
                <span className="font-bold">On a mobile device?</span>
                <p className="text-[11px] text-slate-500">Launch installed UPI apps directly</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleMobilePay}
              className="py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>Pay Now</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {showMobileNotice && (
            <div className="mt-2.5 pt-2 border-t border-indigo-100/80 text-[11px] text-slate-600 flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
              <span>
                Attempted to launch UPI apps. If no app opened, scan the QR code above or copy the link below.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* App Scheme Links Overview (from Backend) */}
      <div className="w-full max-w-md mb-5 text-left bg-slate-50 border border-slate-200 rounded-xl p-3.5">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Backend Generated UPI URI Schemes</span>
          <span className="text-[10px] text-slate-400 font-normal">Click to copy URI</span>
        </div>
        <div className="space-y-1.5">
          {Object.entries(appUrls).slice(0, 4).map(([key, uri]) => (
            <div
              key={key}
              className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/80 text-xs"
            >
              <div className="truncate mr-2">
                <span className="font-bold text-slate-700 capitalize mr-1.5">{key.replace('_', ' ')}:</span>
                <code className="text-[11px] text-slate-500">{uri}</code>
              </div>
              <button
                type="button"
                onClick={() => handleCopyUri(key, uri)}
                className="text-slate-400 hover:text-indigo-600 p-1 shrink-0 cursor-pointer"
                title="Copy UPI scheme URL"
              >
                {copiedLink === key ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons: Download QR & Share QR */}
      <div className="w-full max-w-md space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="w-full sm:flex-1">
            <DownloadQR data={data} uri={currentUri} />
          </div>

          {/* Direct Backend Download Button */}
          <a
            href={backendDownloadUrl}
            download={`upi_qr_${activeApp}.png`}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            title="Download directly via Backend GET /api/qr-image"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Server PNG</span>
          </a>

          <button
            type="button"
            onClick={onReset}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            <span>New QR</span>
          </button>
        </div>

        {/* Share & Copy controls */}
        <SharePayment data={data} uri={currentUri} />

        {/* Demo Simulation Action */}
        {onSimulateSuccess && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onSimulateSuccess}
              className="text-[11px] text-slate-500 hover:text-indigo-600 underline underline-offset-2 flex items-center justify-center gap-1 mx-auto transition-colors cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>Preview Customer Payment Confirmation (Demo)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
