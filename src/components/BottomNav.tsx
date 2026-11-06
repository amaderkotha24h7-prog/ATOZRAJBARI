import React from 'react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';
import { Home, Search, ShoppingBag, Heart, HelpCircle } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setSelectedProduct, cartCount, wishlist } = useApp();

  const handleTabChange = (tab: ActiveTab) => {
    setSelectedProduct(null);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems: { tab: ActiveTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { tab: 'home', label: 'Home', icon: Home },
    { tab: 'search', label: 'Search', icon: Search },
    { tab: 'cart', label: 'Cart', icon: ShoppingBag, badge: cartCount },
    { tab: 'wishlist', label: 'Saved', icon: Heart, badge: wishlist.length },
    { tab: 'info', label: 'About & Orders', icon: HelpCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
      <div className="max-w-md md:max-w-xl mx-auto grid grid-cols-5 h-16 items-center px-1">
        {navItems.map(({ tab, label, icon: Icon, badge }) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] py-1 transition-colors relative select-none ${
                isActive ? 'text-emerald-700 font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-150 ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
                {badge !== undefined && badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-600" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
