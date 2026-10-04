import QRCode from 'qrcode';
import { UPIPaymentData, FormErrors } from '../types';

/**
 * Builds standard UPI Payment URI
 * e.g., upi://pay?pa=example@upi&pn=John&am=500&cu=INR&tn=Payment
 */
export function buildUPIURI(data: UPIPaymentData): string {
  const pa = encodeURIComponent(data.upiId.trim());
  const pn = encodeURIComponent(data.recipientName.trim());
  const cu = 'INR';

  let uri = `upi://pay?pa=${pa}&pn=${pn}&cu=${cu}`;

  if (data.amount && data.amount.trim() !== '') {
    const numAmount = parseFloat(data.amount.trim());
    if (!isNaN(numAmount) && numAmount > 0) {
      uri += `&am=${encodeURIComponent(numAmount.toString())}`;
    }
  }

  if (data.message && data.message.trim() !== '') {
    uri += `&tn=${encodeURIComponent(data.message.trim())}`;
  }

  return uri;
}

/**
 * Validate form inputs
 */
export function validateUPIForm(data: UPIPaymentData): FormErrors {
  const errors: FormErrors = {};

  // UPI ID validation
  const upiTrimmed = (data.upiId || '').trim();
  if (!upiTrimmed) {
    errors.upiId = 'UPI ID is required.';
  } else {
    // Basic valid UPI format: must contain '@' and have valid chars before & after
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,64}@[a-zA-Z0-9]{2,64}$/;
    if (!upiRegex.test(upiTrimmed)) {
      errors.upiId = 'Please enter a valid UPI ID such as example@upi.';
    }
  }

  // Recipient Name validation
  const nameTrimmed = (data.recipientName || '').trim();
  if (!nameTrimmed) {
    errors.recipientName = 'Recipient name is required.';
  } else if (nameTrimmed.length < 2) {
    errors.recipientName = 'Recipient name must be at least 2 characters.';
  }

  // Amount validation (optional, but if provided must be positive number)
  if (data.amount && data.amount.trim() !== '') {
    const num = Number(data.amount.trim());
    if (isNaN(num) || num <= 0) {
      errors.amount = 'Please enter a valid payment amount.';
    } else if (num > 100000) {
      errors.amount = 'UPI single-transaction limit is generally ₹1,00,000.';
    }
  }

  // Message validation
  if (data.message && data.message.length > 50) {
    errors.message = 'Payment message should be under 50 characters for UPI compatibility.';
  }

  return errors;
}

/**
 * Generate QR code as SVG string or Canvas Data URL
 */
export async function generateQRCodeDataURL(uri: string, size = 480): Promise<string> {
  return await QRCode.toDataURL(uri, {
    width: size,
    margin: 2,
    color: {
      dark: '#0F172A', // Slate 900
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'M',
  });
}

/**
 * Format currency string
 */
export function formatINR(amount?: string | number): string {
  if (!amount || amount === '') return 'Any Amount';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'Any Amount';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Downloads a high resolution PNG with option for clean QR or branded payment card
 */
export async function downloadQRCodeImage(
  data: UPIPaymentData,
  uri: string,
  withDetailsBadge = true
): Promise<void> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Generate high-res base QR
  const qrDataUrl = await QRCode.toDataURL(uri, {
    width: 600,
    margin: 2,
    color: {
      dark: '#0F172A',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'H',
  });

  const qrImg = new Image();
  await new Promise((resolve, reject) => {
    qrImg.onload = resolve;
    qrImg.onerror = reject;
    qrImg.src = qrDataUrl;
  });

  if (!withDetailsBadge) {
    // Clean QR only
    canvas.width = 600;
    canvas.height = 600;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 600, 600);
    ctx.drawImage(qrImg, 0, 0, 600, 600);
  } else {
    // Beautiful branded card
    canvas.width = 640;
    canvas.height = 860;

    // Background
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header strip
    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grad.addColorStop(0, '#4338CA');
    grad.addColorStop(1, '#2563EB');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, 80);

    // Title in header
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Universal UPI QR', canvas.width / 2, 48);

    // White Card container for QR
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 8;
    ctx.beginPath();
    ctx.roundRect(40, 110, 560, 560, 20);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    // Draw QR centered inside card
    ctx.drawImage(qrImg, 70, 130, 500, 500);

    // Scan & Pay text inside card bottom
    ctx.fillStyle = '#64748B';
    ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Scan with GPay, PhonePe, Paytm, BHIM & Any UPI App', canvas.width / 2, 645);

    // Details below card
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(data.recipientName, canvas.width / 2, 715);

    ctx.fillStyle = '#4F46E5';
    ctx.font = '600 16px monospace';
    ctx.fillText(data.upiId, canvas.width / 2, 745);

    if (data.amount && parseFloat(data.amount) > 0) {
      ctx.fillStyle = '#059669';
      ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`Amount: ${formatINR(data.amount)}`, canvas.width / 2, 780);
    } else {
      ctx.fillStyle = '#64748B';
      ctx.font = '16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Amount: Any Amount', canvas.width / 2, 780);
    }

    if (data.message) {
      ctx.fillStyle = '#64748B';
      ctx.font = 'italic 14px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`“${data.message}”`, canvas.width / 2, 815);
    }
  }

  const link = document.createElement('a');
  link.download = 'universal-upi-qr.png';
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
