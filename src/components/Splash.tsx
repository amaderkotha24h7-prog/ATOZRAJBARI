import React, { useEffect } from 'react';
import { STORE_NAME, STORE_TAGLINE } from '../config/storeConfig';
import { ShoppingBag, Sparkles, ShieldCheck } from 'lucide-react';

interface SplashProps {
  onDismiss: () => void;
}

export const Splash: React.FC<SplashProps> = ({ onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 1800);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div 
      onClick={onDismiss}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-950 text-white p-8 cursor-pointer select-none transition-opacity duration-500"
    >
      <div className="w-full flex justify-end">
        <span className="text-xs text-slate-400 font-medium px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
          Tap to skip
        </span>
      </div>

      <div className="flex flex-col items-center text-center max-w-sm">
        {/* Brand Icon Badge */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-2xl shadow-emerald-500/20">
            <ShoppingBag className="w-10 h-10 text-slate-950 stroke-[2.2]" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-amber-400 text-slate-950 p-1.5 rounded-full shadow-lg">
            <Sparkles className="w-4 h-4 fill-slate-950" />
          </div>
        </div>

        {/* Brand Title & Tagline */}
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
          {STORE_NAME}
        </h1>
        <p className="mt-2 text-sm text-emerald-400 font-semibold tracking-wide">
          {STORE_TAGLINE}
        </p>

        <p className="mt-6 text-xs text-slate-400 leading-relaxed max-w-xs">
          Direct shopping with fast doorstep delivery. Order easily via WhatsApp, IMO, and Messenger.
        </p>
      </div>

      {/* Trust Badges */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>100% Genuine Products · Direct Contact</span>
      </div>
    </div>
  );
};
