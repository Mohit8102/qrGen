export interface UPIPaymentData {
  upiId: string;
  recipientName: string;
  amount?: string;
  message?: string;
  currency?: string;
  app?: string;
}

export interface FormErrors {
  upiId?: string;
  recipientName?: string;
  amount?: string;
  message?: string;
}

export interface UPIAppMeta {
  name: string;
  shortName: string;
  tagline: string;
  color: string;
  bgLight: string;
  textColor: string;
  iconType: 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'fampay' | 'other';
}

export interface ServerQRResult {
  qrCodeDataUrl: string;
  targetUri: string;
  universalUri: string;
  selectedApp?: {
    id: string;
    name: string;
    scheme: string;
    description: string;
    badge: string;
  };
  appUrls?: Record<string, string>;
  paymentDetails: {
    upiId: string;
    recipientName: string;
    amount?: string | null;
    message?: string | null;
    currency: string;
  };
}
