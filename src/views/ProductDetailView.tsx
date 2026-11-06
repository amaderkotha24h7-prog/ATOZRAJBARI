import React, { useState, useEffect } from 'react';
import { Product, CartItem } from '../types';
import { useApp } from '../context/AppContext';
import { CURRENCY_SYMBOL, WHATSAPP_NUMBER } from '../config/storeConfig';
import { sendViaWhatsApp, sendViaMessenger, prepareImoOrder } from '../utils/orderHelper';
import { ImageGalleryModal } from '../components/ImageGalleryModal';
import { ProductCard } from '../components/ProductCard';
import { getProducts } from '../services/feedService';
import {
  ArrowLeft,
  Heart,
  Share2,
  Plus,
  Minus,
  MessageCircle,
  Send,
  ShoppingBag,
  CheckCircle2,
  Users,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface ProductDetailViewProps {
  product: Product;
  onBack: () => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({ product, onBack }) => {
  const {
    customerDetails,
    updateCustomerDetails,
    addToCart,
    toggleWishlist,
    isWishlisted,
    showToast,
    openImoModal,
  } = useApp();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColour, setSelectedColour] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  // Related products from same category
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    setActiveImageIndex(0);
    if (product.sizes.length > 0) setSelectedSize(product.sizes[0]);
    else setSelectedSize('');
    if (product.colours.length > 0) setSelectedColour(product.colours[0]);
    else setSelectedColour('');
    setQuantity(1);

    // Fetch related products
    getProducts(1, 10).then(res => {
      const related = res.products.filter(
        p => p.id !== product.id && p.category.toLowerCase() === product.category.toLowerCase()
      );
      setRelatedProducts(related.slice(0, 4));
    });
  }, [product]);

  const isOutOfStock = product.availability === 'Out of Stock';
  const effectivePrice = product.price || 0;
  const totalPrice = effectivePrice * quantity;
  const wishlisted = isWishlisted(product.id);

  const createCurrentItem = (): CartItem => ({
    id: `${product.id}-${selectedSize || 'std'}-${selectedColour || 'std'}`,
    productId: product.id,
    name: product.name,
    price: effectivePrice,
    priceFormatted: `${CURRENCY_SYMBOL}${effectivePrice}`,
    size: selectedSize || undefined,
    colour: selectedColour || undefined,
    quantity,
    image: product.images[activeImageIndex] || product.thumbnail,
    link: product.link,
  });

  const handleOrderWhatsApp = () => {
    const item = createCurrentItem();
    sendViaWhatsApp([item], customerDetails, () => {
      showToast('Opening WhatsApp with your order...');
    });
  };

  const handleOrderMessenger = () => {
    const item = createCurrentItem();
    sendViaMessenger([item], customerDetails, msg => {
      showToast(msg);
    });
  };

  const handleOrderImo = async () => {
    const item = createCurrentItem();
    const message = await prepareImoOrder([item], customerDetails);
    openImoModal(message);
  };

  const handleAddToCart = () => {
    const item = createCurrentItem();
    addToCart(item);
  };

  const handleAskAvailability = () => {
    const cleanNumber = WHATSAPP_NUMBER.replace(/\D/g, '');
    const text = encodeURIComponent(
      `Hello ATOZ RAJBARI, I am interested in "${product.name}" (${product.link}). When will this item be back in stock?`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on ATOZ RAJBARI!`,
          url: product.link || window.location.href,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(product.link || window.location.href);
      showToast('Product link copied to clipboard!');
    } catch {
      showToast('Link copied');
    }
  };

  return (
    <div className="pb-32 max-w-4xl mx-auto px-4 pt-2 space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shadow-xs"
            title="Share Product"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleWishlist(product.id)}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-rose-500 hover:bg-slate-100 transition-colors shadow-xs"
            title="Save to Wishlist"
          >
            <Heart className={`w-4 h-4 ${wishlisted ? 'text-rose-500 fill-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Grid: Images & Primary Purchase Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left: Image Gallery */}
        <div className="space-y-3">
          {/* Main Active Image with Zoom Trigger */}
          <div
            onClick={() => setIsZoomOpen(true)}
            className="relative aspect-square w-full rounded-3xl bg-slate-100 border border-slate-200 overflow-hidden cursor-zoom-in group shadow-xs"
          >
            <img
              src={product.images[activeImageIndex] || product.thumbnail}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tap to zoom</span>
            </div>

            {/* Stock Badge */}
            <div className="absolute top-3 left-3">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm ${
                  isOutOfStock ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                }`}
              >
                {product.availability}
              </span>
            </div>
          </div>

          {/* Thumbnail Carousel if multiple images */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-16 rounded-2xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-emerald-600 ring-2 ring-emerald-500/20 scale-105'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Meta & Purchase Configuration */}
        <div className="space-y-5 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md inline-block mb-2">
              {product.category}
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
              {product.title || product.name}
            </h1>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {product.shortDescription}
            </p>
          </div>

          {/* Price Box */}
          <div className="flex items-baseline gap-3 py-3 border-y border-slate-100">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
              {product.price ? `${CURRENCY_SYMBOL}${product.price}` : 'Price on Inquiry'}
            </span>
            {quantity > 1 && product.price && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Total: {CURRENCY_SYMBOL}{totalPrice}
              </span>
            )}
          </div>

          {/* Size Selector */}
          {product.sizes.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-800">Available Sizes:</label>
                <span className="text-[11px] text-slate-400">Selected: {selectedSize || 'None'}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`min-h-[40px] px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedSize === size
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colour Selector */}
          {product.colours.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-800">Available Colours:</label>
                <span className="text-[11px] text-slate-400">Selected: {selectedColour || 'None'}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.colours.map(colour => (
                  <button
                    key={colour}
                    type="button"
                    onClick={() => setSelectedColour(colour)}
                    className={`min-h-[40px] px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedColour === colour
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {colour}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Quantity</span>
              <span className="text-[11px] text-slate-400">Choose quantity to order</span>
            </div>
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
              <button
                type="button"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-bold text-sm text-slate-900 tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(q => q + 1)}
                className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* THREE BIG ORDER BUTTONS */}
          <div className="space-y-2.5 pt-2">
            {isOutOfStock ? (
              <button
                onClick={handleAskAvailability}
                className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <MessageCircle className="w-5 h-5 text-emerald-400" />
                <span>Ask When Available via WhatsApp</span>
              </button>
            ) : (
              <>
                {/* 1. WhatsApp Order Button (Green #25D366) */}
                <button
                  onClick={handleOrderWhatsApp}
                  className="w-full h-13 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-[#25D366]/25 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>Order on WhatsApp ({CURRENCY_SYMBOL}{totalPrice})</span>
                </button>

                {/* 2. IMO Order Button (Sky Blue) & 3. Messenger Button (Blue-Purple) */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={handleOrderImo}
                    className="h-12 rounded-2xl bg-sky-600 hover:bg-sky-500 active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-sky-600/20 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Order on IMO</span>
                  </button>
                  <button
                    onClick={handleOrderMessenger}
                    className="h-12 rounded-2xl bg-gradient-to-r from-[#0084FF] to-[#7B2CBF] hover:opacity-95 active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Order on Messenger</span>
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className="w-full h-11 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 active:scale-[0.99] text-slate-800 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features & Suitable For */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Features list */}
        {product.features.length > 0 && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Product Features & Specs</span>
            </div>
            <ul className="space-y-2">
              {product.features.map((feat, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suitable For list */}
        {product.suitableFor.length > 0 && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Users className="w-4 h-4 text-sky-600" />
              <span>Recommended & Suitable For</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.suitableFor.map((item, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Full Description & Blogger Link */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Full Description</h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
          {product.fullDescription}
        </p>

        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Guaranteed Quality by ATOZ RAJBARI</span>
          </div>

          {product.link && (
            <a
              href={product.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-bold"
            >
              <span>View Original Blog Post</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Related Products Carousel */}
      {relatedProducts.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-900">
              Related in {product.category}
            </h3>
            <span className="text-xs text-slate-400">Handpicked for you</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {relatedProducts.map(rel => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen Image Gallery Modal */}
      <ImageGalleryModal
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        images={product.images}
        initialIndex={activeImageIndex}
        title={product.name}
      />
    </div>
  );
};
