import { UPIPaymentData } from '../types';

// Allow configuring backend URL via environment variable or default to relative proxy / localhost:5000
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface BackendHealthResponse {
  status: string;
  service: string;
  features: {
    qr_generator: boolean;
    multi_app_support: boolean;
    validation: boolean;
  };
  total_supported_apps: number;
}

export interface SupportedApp {
  id: string;
  name: string;
  description: string;
  badge: string;
  scheme: string;
}

export interface AppsResponse {
  success: boolean;
  apps: SupportedApp[];
}

export interface VerifyUPIResponse {
  valid: boolean;
  message: string;
  upiId?: string;
  username?: string;
  handle?: string;
  isRecognizedHandle?: boolean;
}

export interface GenerateQRRequest {
  upiId: string;
  recipientName: string;
  amount?: string;
  message?: string;
  app?: string;
}

export interface GenerateQRResponse {
  success: boolean;
  qrCodeDataUrl: string;
  targetUri: string;
  universalUri: string;
  selectedApp: SupportedApp;
  appUrls: Record<string, string>;
  paymentDetails: {
    upiId: string;
    recipientName: string;
    amount?: string | null;
    message?: string | null;
    currency: string;
  };
  error?: string;
}

/**
 * GET Request: Check backend health and status
 */
export async function checkBackendHealth(): Promise<{ isOnline: boolean; data?: BackendHealthResponse }> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data: BackendHealthResponse = await response.json();
      return { isOnline: true, data };
    }
    return { isOnline: false };
  } catch (error) {
    console.warn('[Backend API] Health check failed, running with offline/client fallback:', error);
    return { isOnline: false };
  }
}

/**
 * GET Request: Fetch list of supported UPI apps from backend
 */
export async function getSupportedApps(): Promise<SupportedApp[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/apps`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const result: AppsResponse = await response.json();
      return result.apps;
    }
    throw new Error(`Failed to fetch apps: ${response.statusText}`);
  } catch (error) {
    console.warn('[Backend API] Falling back to default app definitions:', error);
    return [
      { id: 'universal', name: 'Universal (All UPI Apps)', description: 'Works with Google Pay, PhonePe, Paytm, BHIM & more', badge: 'Recommended', scheme: 'upi://pay' },
      { id: 'phonepe', name: 'PhonePe', description: 'Direct link for PhonePe', badge: 'Popular', scheme: 'phonepe://pay' },
      { id: 'google_pay', name: 'Google Pay (GPay)', description: 'Direct link for Google Pay', badge: 'Popular', scheme: 'gpay://upi/pay' },
      { id: 'paytm', name: 'Paytm', description: 'Direct link for Paytm', badge: 'Popular', scheme: 'paytmmp://pay' },
      { id: 'fam_pay', name: 'FamPay', description: 'Direct link for FamPay', badge: 'Gen-Z', scheme: 'fampay://pay' },
      { id: 'bhim', name: 'BHIM UPI', description: 'NPCI Bharat Interface for Money', badge: 'Official', scheme: 'bhim://pay' },
    ];
  }
}

/**
 * POST Request: Verify & validate UPI ID on the server
 */
export async function verifyUPIIdOnServer(upiId: string): Promise<VerifyUPIResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/verify-upi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ upiId }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('[Backend API] Verify UPI fallback:', error);
    const hasAt = upiId.includes('@');
    return {
      valid: hasAt,
      message: hasAt ? 'Format looks valid (Client check)' : 'UPI ID must contain @',
    };
  }
}

/**
 * POST Request: Generate QR code from backend API
 */
export async function generateQRViaBackend(
  data: UPIPaymentData,
  selectedApp = 'universal'
): Promise<GenerateQRResponse> {
  const payload: GenerateQRRequest = {
    upiId: data.upiId,
    recipientName: data.recipientName,
    amount: data.amount,
    message: data.message,
    app: selectedApp,
  };

  const response = await fetch(`${BACKEND_URL}/api/generate-qr`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to generate QR on server' }));
    throw new Error(errorData.error || `Server responded with status ${response.status}`);
  }

  return await response.json();
}

/**
 * GET Direct QR Image Download / Stream URL
 */
export function getBackendQRImageUrl(
  data: UPIPaymentData,
  app = 'universal',
  download = false
): string {
  const params = new URLSearchParams({
    upiId: data.upiId,
    name: data.recipientName,
    app: app,
    download: download ? 'true' : 'false',
  });
  if (data.amount) params.append('amount', data.amount);
  if (data.message) params.append('message', data.message);

  return `${BACKEND_URL}/api/qr-image?${params.toString()}`;
}
