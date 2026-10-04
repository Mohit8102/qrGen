import React, { useState } from 'react';
import { Download, Check, ChevronDown, Image as ImageIcon, QrCode } from 'lucide-react';
import { UPIPaymentData } from '../types';
import { downloadQRCodeImage } from '../utils/upi';

interface DownloadQRProps {
  data: UPIPaymentData;
  uri: string;
}

export const DownloadQR: React.FC<DownloadQRProps> = ({ data, uri }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [formatWithBadge, setFormatWithBadge] = useState(true);
  const [showOptions, setShowOptions] = useState(false);

  const handleDownload = async (withBadge: boolean) => {
    try {
      setDownloading(true);
      await downloadQRCodeImage(data, uri, withBadge);
      setDownloadSuccess(true);
      setShowOptions(false);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to download QR image:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="relative inline-flex flex-col w-full sm:w-auto">
      <div className="flex items-center w-full rounded-xl shadow-xs overflow-hidden border border-indigo-600 bg-indigo-600 hover:bg-indigo-700 transition-colors">
        <button
          type="button"
          onClick={() => handleDownload(formatWithBadge)}
          disabled={downloading}
          className="flex-1 py-2.5 px-4 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          {downloadSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Downloaded!</span>
            </>
          ) : downloading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download QR</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => setShowOptions(!showOptions)}
          className="px-2.5 py-2.5 text-white/80 hover:text-white hover:bg-indigo-800/50 border-l border-indigo-500/60 transition-colors cursor-pointer"
          title="Choose download style"
          aria-label="Choose download style"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {showOptions && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-20 animate-fadeIn">
          <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 tracking-wider">
            Select Format
          </div>
          <button
            type="button"
            onClick={() => {
              setFormatWithBadge(true);
              handleDownload(true);
            }}
            className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2.5 text-slate-700 font-medium"
          >
            <ImageIcon className="w-4 h-4 text-indigo-600" />
            <div>
              <div className="font-semibold text-slate-900">QR with Payment Label</div>
              <div className="text-[10px] text-slate-500">Includes recipient, amount, & title</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => {
              setFormatWithBadge(false);
              handleDownload(false);
            }}
            className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2.5 text-slate-700 font-medium"
          >
            <QrCode className="w-4 h-4 text-slate-600" />
            <div>
              <div className="font-semibold text-slate-900">Clean QR Code Only</div>
              <div className="text-[10px] text-slate-500">Square QR code for custom posters</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
