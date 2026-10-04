import React, { useState, useEffect } from 'react';
import { IndianRupee, User, AtSign, MessageSquare, ArrowRight, Sparkles, AlertCircle, CheckCircle2, Loader2, Layers } from 'lucide-react';
import { UPIPaymentData, FormErrors } from '../types';
import { validateUPIForm } from '../utils/upi';
import { verifyUPIIdOnServer, getSupportedApps, SupportedApp } from '../api/client';

interface PaymentFormProps {
  initialData?: UPIPaymentData;
  onGenerate: (data: UPIPaymentData, selectedApp: string) => void;
  isGenerating?: boolean;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  initialData,
  onGenerate,
  isGenerating = false,
}) => {
  const [formData, setFormData] = useState<UPIPaymentData>(
    initialData || {
      upiId: '',
      recipientName: '',
      amount: '',
      message: '',
    }
  );

  const [selectedApp, setSelectedApp] = useState<string>('universal');
  const [apps, setApps] = useState<SupportedApp[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverVerification, setServerVerification] = useState<{
    status: 'idle' | 'checking' | 'valid' | 'invalid';
    message?: string;
  }>({ status: 'idle' });

  const quickAmounts = ['100', '250', '500', '1000', '2000'];

  // Load supported apps from backend API (GET /api/apps)
  useEffect(() => {
    getSupportedApps()
      .then((appList) => {
        if (appList && appList.length > 0) {
          setApps(appList);
        }
      })
      .catch((err) => console.warn('Could not load apps from backend:', err));
  }, []);

  type FormField = 'upiId' | 'recipientName' | 'amount' | 'message';

  const handleChange = (field: FormField, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    // Reset server verification when UPI ID changes
    if (field === 'upiId') {
      setServerVerification({ status: 'idle' });
    }

    // If already touched, validate on change
    if (touched[field]) {
      const errs = validateUPIForm(updated);
      setErrors((prev) => ({
        ...prev,
        [field]: errs[field],
      }));
    }
  };

  const handleBlur = async (field: FormField) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errs = validateUPIForm(formData);
    setErrors((prev) => ({
      ...prev,
      [field]: errs[field],
    }));

    // Trigger server-side validation via POST /api/verify-upi when UPI ID loses focus
    if (field === 'upiId' && formData.upiId && !errs.upiId) {
      setServerVerification({ status: 'checking' });
      try {
        const res = await verifyUPIIdOnServer(formData.upiId);
        if (res.valid) {
          setServerVerification({ status: 'valid', message: res.message });
        } else {
          setServerVerification({ status: 'invalid', message: res.message });
        }
      } catch {
        setServerVerification({ status: 'valid', message: 'Format valid' });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      upiId: true,
      recipientName: true,
      amount: true,
      message: true,
    });

    const validationErrors = validateUPIForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      onGenerate({ ...formData, app: selectedApp }, selectedApp);
    }
  };

  const handleQuickAmount = (amt: string) => {
    if (formData.amount === amt) {
      handleChange('amount', '');
    } else {
      handleChange('amount', amt);
    }
  };

  const fillSampleData = () => {
    const sample: UPIPaymentData = {
      upiId: 'recipient@okhdfcbank',
      recipientName: 'Aarav Sharma',
      amount: '499',
      message: 'Consultation & Services',
    };
    setFormData(sample);
    setSelectedApp('universal');
    setErrors({});
    setTouched({});
    setServerVerification({
      status: 'valid',
      message: 'Verified HDFC UPI format',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7 relative overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Create Payment QR
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Backend API integration for PhonePe, GPay, Paytm, BHIM &amp; Universal QR
          </p>
        </div>
        <button
          type="button"
          onClick={fillSampleData}
          className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 rounded-lg px-2.5 py-1.5 transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Autofill sample payment details"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Try Demo</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* UPI ID Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="upiId" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              UPI ID <span className="text-rose-500">*</span>
            </label>
            {serverVerification.status === 'checking' && (
              <span className="flex items-center gap-1 text-[11px] text-indigo-600">
                <Loader2 className="w-3 h-3 animate-spin" /> Verifying with Backend...
              </span>
            )}
            {serverVerification.status === 'valid' && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                <CheckCircle2 className="w-3 h-3" /> {serverVerification.message || 'Valid UPI ID'}
              </span>
            )}
            {serverVerification.status === 'invalid' && (
              <span className="flex items-center gap-1 text-[11px] text-rose-600 font-medium">
                <AlertCircle className="w-3 h-3" /> {serverVerification.message}
              </span>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <AtSign className="w-4 h-4" />
            </div>
            <input
              id="upiId"
              type="text"
              value={formData.upiId}
              onChange={(e) => handleChange('upiId', e.target.value)}
              onBlur={() => handleBlur('upiId')}
              placeholder="example@okaxis"
              className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                errors.upiId
                  ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/20'
                  : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600'
              }`}
            />
          </div>
          {errors.upiId ? (
            <p className="flex items-center gap-1 text-xs text-rose-600 mt-1.5 font-medium animate-fadeIn">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors.upiId}
            </p>
          ) : (
            <p className="text-[11px] text-slate-400 mt-1">
              Supports any valid UPI ID (PhonePe @ybl, GPay @okaxis, Paytm @paytm, FamPay @fampay, etc.)
            </p>
          )}
        </div>

        {/* Recipient Name Field */}
        <div>
          <label htmlFor="recipientName" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Recipient Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              id="recipientName"
              type="text"
              value={formData.recipientName}
              onChange={(e) => handleChange('recipientName', e.target.value)}
              onBlur={() => handleBlur('recipientName')}
              placeholder="Enter recipient or business name"
              className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                errors.recipientName
                  ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/20'
                  : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600'
              }`}
            />
          </div>
          {errors.recipientName && (
            <p className="flex items-center gap-1 text-xs text-rose-600 mt-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors.recipientName}
            </p>
          )}
        </div>

        {/* Target App Selection Pills (From GET /api/apps) */}
        {apps.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>Target Payment App Scheme</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">Powered by Python Backend</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {apps.map((app) => {
                const isSelected = selectedApp === app.id;
                return (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => setSelectedApp(app.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-xs font-bold ${isSelected ? 'text-indigo-950' : 'text-slate-800'}`}>
                        {app.name}
                      </span>
                      {app.badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {app.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 truncate">
                      {app.scheme}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Amount Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="amount" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Amount <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <span className="text-[11px] text-slate-400 font-medium">Leave blank for any amount</span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-semibold text-sm">
              <IndianRupee className="w-4 h-4" />
            </div>
            <input
              id="amount"
              type="number"
              min="1"
              step="any"
              value={formData.amount || ''}
              onChange={(e) => handleChange('amount', e.target.value)}
              onBlur={() => handleBlur('amount')}
              placeholder="Enter amount (e.g. 500)"
              className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                errors.amount
                  ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/20'
                  : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600'
              }`}
            />
          </div>
          {errors.amount && (
            <p className="flex items-center gap-1 text-xs text-rose-600 mt-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors.amount}
            </p>
          )}

          {/* Quick Amount Pills */}
          <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-0.5">
            <span className="text-[11px] font-medium text-slate-400 mr-1 shrink-0">Quick:</span>
            {quickAmounts.map((amt) => {
              const isSelected = formData.amount === amt;
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickAmount(amt)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-100 text-slate-600 border-slate-200/80 hover:bg-slate-200/70 hover:text-slate-800'
                  }`}
                >
                  ₹{amt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment Message Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Payment Message <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <span className="text-[11px] text-slate-400 font-medium">Added to transaction note</span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <input
              id="message"
              type="text"
              maxLength={50}
              value={formData.message || ''}
              onChange={(e) => handleChange('message', e.target.value)}
              onBlur={() => handleBlur('message')}
              placeholder="What is this payment for? (e.g. Coffee / Order #123)"
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>
        </div>

        {/* Large Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-base shadow-md shadow-indigo-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating QR via Backend API (POST)...</span>
              </>
            ) : (
              <>
                <span>Generate UPI QR Code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
