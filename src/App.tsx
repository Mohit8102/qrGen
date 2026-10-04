import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { UPIAppInfo } from './components/UPIAppInfo';
import { PaymentForm } from './components/PaymentForm';
import { UniversalQRCode } from './components/UniversalQRCode';
import { PaymentDetails } from './components/PaymentDetails';
import { PaymentSuccess } from './components/PaymentSuccess';
import { SecurityBadge } from './components/SecurityBadge';
import { UPIPaymentData, ServerQRResult } from './types';
import { ArrowRight, Server, Shield } from 'lucide-react';
import { checkBackendHealth, generateQRViaBackend, BackendHealthResponse } from './api/client';

export default function App() {
  const [paymentData, setPaymentData] = useState<UPIPaymentData | null>(null);
  const [serverQRResult, setServerQRResult] = useState<ServerQRResult | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSuccessSimulated, setIsSuccessSimulated] = useState<boolean>(false);
  
  // Backend connection state
  const [backendStatus, setBackendStatus] = useState<{
    isOnline: boolean;
    data?: BackendHealthResponse;
    loading: boolean;
  }>({
    isOnline: false,
    loading: true,
  });

  // Check backend health on mount
  const verifyBackend = useCallback(async () => {
    setBackendStatus((prev) => ({ ...prev, loading: true }));
    const result = await checkBackendHealth();
    setBackendStatus({
      isOnline: result.isOnline,
      data: result.data,
      loading: false,
    });
  }, []);

  useEffect(() => {
    verifyBackend();
  }, [verifyBackend]);

  const handleGenerate = async (data: UPIPaymentData, selectedApp = 'universal') => {
    setIsGenerating(true);
    setPaymentData(data);
    setIsSuccessSimulated(false);

    try {
      // POST /api/generate-qr request to backend
      const result = await generateQRViaBackend(data, selectedApp);
      if (result.success) {
        setServerQRResult({
          qrCodeDataUrl: result.qrCodeDataUrl,
          targetUri: result.targetUri,
          universalUri: result.universalUri,
          selectedApp: result.selectedApp,
          appUrls: result.appUrls,
          paymentDetails: result.paymentDetails,
        });
      }
    } catch (error) {
      console.warn('Backend QR generation call fell back to client:', error);
      setServerQRResult(null);
    } finally {
      setIsGenerating(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setPaymentData(null);
    setServerQRResult(null);
    setIsSuccessSimulated(false);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col justify-between selection:bg-indigo-600 selection:text-white">
      {/* Top Banner & Header */}
      <div className="w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Header
            backendStatus={{
              ...backendStatus,
              onRefresh: verifyBackend,
            }}
          />

          {/* How It Works Breadcrumb/Flow indicator */}
          <div className="bg-white/80 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-3 sm:p-4 mb-6 shadow-xs">
            <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-500 overflow-x-auto pb-1 sm:pb-0 gap-2">
              <div className={`flex items-center gap-1.5 shrink-0 ${!paymentData ? 'text-indigo-600 font-bold' : 'text-emerald-600'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${!paymentData ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  1
                </span>
                <span>Enter UPI Details</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <div className={`flex items-center gap-1.5 shrink-0 ${paymentData && !isSuccessSimulated ? 'text-indigo-600 font-bold' : paymentData ? 'text-emerald-600' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${paymentData && !isSuccessSimulated ? 'bg-indigo-100 text-indigo-700' : paymentData ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                  2
                </span>
                <span>Generate via Backend API</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <div className={`flex items-center gap-1.5 shrink-0 ${isSuccessSimulated ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${isSuccessSimulated ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                  3
                </span>
                <span>Scan &amp; Pay</span>
              </div>
            </div>
          </div>

          {/* Universal QR Compatibility Overview */}
          <UPIAppInfo />

          {/* Main Area */}
          <main className="mb-10">
            {isSuccessSimulated && paymentData ? (
              <PaymentSuccess
                data={paymentData}
                onReset={() => setIsSuccessSimulated(false)}
              />
            ) : paymentData ? (
              <div className="space-y-6 animate-fadeIn">
                {/* QR Display Card */}
                <UniversalQRCode
                  data={paymentData}
                  serverResult={serverQRResult}
                  onReset={handleReset}
                  onSimulateSuccess={() => setIsSuccessSimulated(true)}
                />

                {/* Details Table Card */}
                <PaymentDetails data={paymentData} />

                {/* Quick Security Check */}
                <SecurityBadge />
              </div>
            ) : (
              <div className="space-y-6">
                <PaymentForm
                  onGenerate={handleGenerate}
                  isGenerating={isGenerating}
                />
                <SecurityBadge />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-6 px-4 text-center mt-auto">
        <div className="max-w-4xl mx-auto space-y-2">
          <p className="text-sm font-bold text-slate-800">
            Universal UPI QR • Connected Full-Stack System
          </p>
          <p className="text-xs text-slate-500">
            Connected Frontend (React + Vite) with Backend (Python Flask API) via REST routes: <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">GET /api/health</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">GET /api/apps</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">POST /api/verify-upi</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">POST /api/generate-qr</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">GET /api/qr-image</code>.
          </p>
          <div className="pt-2 flex items-center justify-center gap-1 text-[11px] text-slate-400">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Zero credentials requested. Standard NPCI UPI URI Specification.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
