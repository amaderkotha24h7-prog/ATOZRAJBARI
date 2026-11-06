import React, { useState } from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { CURRENCY_SYMBOL } from '../config/storeConfig';
import { Heart, ShoppingBag, Send } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { setSelectedProduct, toggleWishlist, isWishlisted, setQuickOrderProduct } = useApp();
  const [imageError, setImageError] = useState(false);

  const wishlisted = isWishlisted(product.id);
  const isOutOfStock = product.availability === 'Out of Stock';

  const handleCardClick = () => {
    setSelectedProduct(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickOrderProduct(product);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden flex flex-col cursor-pointer"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        {imageError ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-4 text-center">
            <ShoppingBag className="w-8 h-8 mb-1 opacity-50" />
            <span className="text-[10px] font-medium leading-tight line-clamp-2">{product.name}</span>
          </div>
        ) : (
          <img
            src={product.thumbnail || product.images[0]}
            alt={product.name}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}

        {/* Stock Status Badge */}
        <div className="absolute top-2 left-2">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm ${
              isOutOfStock
                ? 'bg-rose-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {isOutOfStock ? 'Out of Stock' : 'In Stock'}
          </span>
        </div>

        {/* Wishlist Heart Icon */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-slate-600 hover:text-rose-500 hover:bg-white shadow-sm transition-colors"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart
            className={`w-4 h-4 ${
              wishlisted ? 'text-rose-500 fill-rose-500' : 'stroke-[2]'
            }`}
          />
        </button>
      </div>

      {/* Card Content */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Category kicker */}
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 line-clamp-1 block mb-0.5">
            {product.category}
          </span>

          {/* Product Name */}
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
            {product.title || product.name}
          </h3>

          {/* Feature Snippet */}
          {product.features.length > 0 && (
            <p className="mt-1 text-[11px] text-slate-500 line-clamp-1 hidden sm:block">
              {product.features[0]}
            </p>
          )}
        </div>

        {/* Price & Quick Order Button */}
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
          <div>
            <span className="text-[10px] text-slate-400 block -mb-0.5">Price</span>
            <span className="text-sm sm:text-base font-extrabold text-slate-900 tabular-nums">
              {product.price ? `${CURRENCY_SYMBOL}${product.price}` : 'Price on Ask'}
            </span>
          </div>

          <button
            onClick={handleQuickOrder}
            className={`min-h-[36px] px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
              isOutOfStock
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 active:scale-95'
            }`}
          >
            <Send className="w-3 h-3" />
            <span>Order</span>
          </button>
        </div>
      </div>
    </div>
  );
};
