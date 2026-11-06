import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Check, Copy, Phone, ExternalLink, X, MessageSquare } from 'lucide-react';

export const ImoModal: React.FC = () => {
  const { imoModal, closeImoModal, showToast } = useApp();
  const [copiedNumber, setCopiedNumber] = useState(false);

  if (!imoModal.isOpen) return null;

  const handleCopyNumber = async () => {
    try {
      await navigator.clipboard.writeText(imoModal.number);
      setCopiedNumber(true);
      showToast('IMO Number copied to clipboard!');
      setTimeout(() => setCopiedNumber(false), 2500);
    } catch {
      showToast(`Number: ${imoModal.number}`);
    }
  };

  const handleOpenImo = () => {
    // Attempt custom URI for IMO or fallback
    window.location.href = `imo://`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl border border-slate-200 animate-slide-up max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/20 font-bold">
              IMO
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">Order Copied!</h3>
              <p className="text-xs text-sky-600 font-medium">Ready to paste in your IMO chat</p>
            </div>
          </div>
          <button
            onClick={closeImoModal}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Guide */}
        <div className="mt-4 p-3.5 bg-sky-50/70 border border-sky-100 rounded-xl space-y-2 text-xs text-slate-700">
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0 font-bold text-[10px]">1</span>
            <p>Your full order details have been <strong className="text-slate-900">automatically copied</strong> to your clipboard.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0 font-bold text-[10px]">2</span>
            <p>Open IMO, find or add <strong className="text-slate-900">+{imoModal.number}</strong>, and paste the order text in the chat.</p>
          </div>
        </div>

        {/* Target Phone Box */}
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">Store IMO Number</span>
            <span className="text-base font-bold text-slate-900 tabular-nums">+{imoModal.number}</span>
          </div>
          <button
            onClick={handleCopyNumber}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
          >
            {copiedNumber ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Message Preview */}
        <div className="mt-4">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Copied Message Preview:</span>
          <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-[11px] leading-relaxed font-mono overflow-x-auto whitespace-pre-wrap max-h-36 border border-slate-800">
            {imoModal.message}
          </pre>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 space-y-2">
          <button
            onClick={handleOpenImo}
            className="w-full h-12 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-[0.99] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Open IMO Application</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <a
              href={`tel:+${imoModal.number}`}
              className="h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Helpline</span>
            </a>
            <button
              onClick={closeImoModal}
              className="h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs flex items-center justify-center transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
