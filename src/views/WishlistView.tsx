import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { getProducts } from '../services/feedService';
import { ProductCard } from '../components/ProductCard';
import { Heart, ArrowRight } from 'lucide-react';

export const WishlistView: React.FC = () => {
  const { wishlist, setActiveTab } = useApp();
  const [savedProducts, setSavedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts(1, 50).then(res => {
      const matched = res.products.filter(p => wishlist.includes(p.id));
      setSavedProducts(matched);
      setLoading(false);
    });
  }, [wishlist]);

  if (wishlist.length === 0) {
    return (
      <div className="pb-28 max-w-lg mx-auto px-4 pt-12 text-center space-y-5">
        <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
          <Heart className="w-10 h-10 opacity-70" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-slate-900">No Saved Items</h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Tap the heart icon on any product to save it to your wishlist for quick access later.
          </p>
        </div>
        <div>
          <button
            onClick={() => setActiveTab('home')}
            className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center gap-2 shadow-md cursor-pointer"
          >
            <span>Browse Products</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28 max-w-5xl mx-auto px-4 pt-3 space-y-4">
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Saved Wishlist</h1>
          <p className="text-xs text-slate-500">Products you've saved for later</p>
        </div>
        <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">
          {wishlist.length} saved
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200 p-3 space-y-3 animate-pulse">
              <div className="aspect-square bg-slate-200 rounded-xl w-full" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {savedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
