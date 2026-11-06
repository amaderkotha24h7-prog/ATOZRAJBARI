import React from 'react';
import { STORE_NAME, STORE_TAGLINE, WHATSAPP_NUMBER } from '../config/storeConfig';
import { useApp } from '../context/AppContext';
import { ShoppingBag, Heart, Search, MessageCircle } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { cartCount, wishlist, setActiveTab, setSelectedProduct } = useApp();

  const handleLogoClick = () => {
    setSelectedProduct(null);
    setActiveTab('home');
  };

  const handleOpenWhatsApp = () => {
    const cleanNumber = WHATSAPP_NUMBER.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-shadow duration-200">
      <div className="max-w-5xl mx-auto px-4 h-15 flex items-center justify-between gap-3">
        {/* Brand Zone */}
        <button
          onClick={handleLogoClick}
          className="flex flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
        >
          <span className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
            {STORE_NAME}
          </span>
          <span className="text-[10px] font-medium text-emerald-600 tracking-wide leading-none truncate max-w-[170px] sm:max-w-none">
            {STORE_TAGLINE}
          </span>
        </button>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Direct WhatsApp Quick Chat */}
          <button
            onClick={handleOpenWhatsApp}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
            title="Chat on WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
            <span>Support</span>
          </button>

          {/* Quick Search */}
          <button
            onClick={() => {
              setSelectedProduct(null);
              setActiveTab('search');
            }}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Search Catalog"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Wishlist */}
          <button
            onClick={() => {
              setSelectedProduct(null);
              setActiveTab('wishlist');
            }}
            className="relative w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Wishlist"
          >
            <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
            {wishlist.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart with count badge */}
          <button
            onClick={() => {
              setSelectedProduct(null);
              setActiveTab('cart');
            }}
            className="relative w-10 h-10 flex items-center justify-center rounded-xl text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-4.5 h-4.5 px-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
