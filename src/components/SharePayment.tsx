import React, { useState } from 'react';
import { Share2, Copy, Check, Link as LinkIcon, AtSign } from 'lucide-react';
import { UPIPaymentData } from '../types';
import { formatINR } from '../utils/upi';

interface SharePaymentProps {
  data: UPIPaymentData;
  uri: string;
}

export const SharePayment: React.FC<SharePaymentProps> = ({ data, uri }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [sharedToast, setSharedToast] = useState<string | null>(null);

  const getShareText = () => {
    let text = `UPI Payment\nRecipient: ${data.recipientName}\nUPI ID: ${data.upiId}`;
    if (data.amount && parseFloat(data.amount) > 0) {
      text += `\nAmount: ${formatINR(data.amount)}`;
    }
    if (data.message) {
      text += `\nNote: ${data.message}`;
    }
    text += `\nPayment Link: ${uri}`;
    return text;
  };

  const handleNativeShare = async () => {
    const shareText = getShareText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `UPI Payment to ${data.recipientName}`,
          text: shareText,
          url: uri,
        });
        setSharedToast('Shared successfully!');
        setTimeout(() => setSharedToast(null), 3000);
      } catch (err) {
        // User aborted or canceled
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard(shareText, 'Payment details copied to clipboard!');
        }
      }
    } else {
      // Fallback
      copyToClipboard(shareText, 'Share text copied to clipboard!');
    }
  };

  const copyToClipboard = async (text: string, toastMessage: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setSharedToast(toastMessage);
      setTimeout(() => setSharedToast(null), 2500);
    } catch (e) {
      console.error('Clipboard copy failed', e);
    }
  };

  const handleCopyLink = () => {
    copyToClipboard(uri, 'Payment link copied!');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyUPI = () => {
    copyToClipboard(data.upiId, 'UPI ID copied to clipboard!');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <div className="w-full space-y-3">
      {/* Toast alert if active */}
      {sharedToast && (
        <div className="p-2.5 bg-slate-900 text-white text-xs font-medium rounded-xl text-center shadow-lg animate-fadeIn flex items-center justify-center gap-2">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{sharedToast}</span>
        </div>
      )}

      {/* Button Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {/* Share Button */}
        <button
          type="button"
          onClick={handleNativeShare}
          className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border border-slate-200/80 transition-all cursor-pointer"
        >
          <Share2 className="w-4 h-4 text-indigo-600" />
          <span>Share QR Details</span>
        </button>

        {/* Copy UPI ID */}
        <button
          type="button"
          onClick={handleCopyUPI}
          className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border border-slate-200/80 transition-all cursor-pointer"
        >
          {copiedUpi ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700">UPI ID Copied</span>
            </>
          ) : (
            <>
              <AtSign className="w-4 h-4 text-indigo-600" />
              <span>Copy UPI ID</span>
            </>
          )}
        </button>

        {/* Copy Payment Link */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border border-slate-200/80 transition-all cursor-pointer"
        >
          {copiedLink ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700">Link Copied</span>
            </>
          ) : (
            <>
              <LinkIcon className="w-4 h-4 text-indigo-600" />
              <span>Copy Payment Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
