import React, { useState, useEffect } from 'react';
import { Product, CartItem } from '../types';
import { useApp } from '../context/AppContext';
import { CURRENCY_SYMBOL, WHATSAPP_NUMBER } from '../config/storeConfig';
import { sendViaWhatsApp, sendViaMessenger, prepareImoOrder } from '../utils/orderHelper';
import { X, Plus, Minus, ShoppingBag, MessageCircle, Send, Check } from 'lucide-react';

interface QuickOrderModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickOrderModal: React.FC<QuickOrderModalProps> = ({ product, onClose }) => {
  const { customerDetails, updateCustomerDetails, addToCart, showToast, openImoModal } = useApp();

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColour, setSelectedColour] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  // Editable customer info
  const [name, setName] = useState(customerDetails.name);
  const [phone, setPhone] = useState(customerDetails.phone);
  const [address, setAddress] = useState(customerDetails.address);

  useEffect(() => {
    if (product) {
      if (product.sizes.length > 0) setSelectedSize(product.sizes[0]);
      if (product.colours.length > 0) setSelectedColour(product.colours[0]);
      setQuantity(1);
    }
    setName(customerDetails.name);
    setPhone(customerDetails.phone);
    setAddress(customerDetails.address);
  }, [product, customerDetails]);

  if (!product) return null;

  const isOutOfStock = product.availability === 'Out of Stock';
  const effectivePrice = product.price || 0;
  const totalPrice = effectivePrice * quantity;

  const currentInfo = { name, phone, address, note: '' };

  const saveDetails = () => {
    updateCustomerDetails({ name, phone, address });
  };

  const createCurrentItem = (): CartItem => ({
    id: `${product.id}-${selectedSize || 'std'}-${selectedColour || 'std'}`,
    productId: product.id,
    name: product.name,
    price: effectivePrice,
    priceFormatted: `${CURRENCY_SYMBOL}${effectivePrice}`,
    size: selectedSize || undefined,
    colour: selectedColour || undefined,
    quantity,
    image: product.thumbnail || product.images[0] || '',
    link: product.link,
  });

  const handleOrderWhatsApp = () => {
    saveDetails();
    const item = createCurrentItem();
    sendViaWhatsApp([item], currentInfo, () => {
      showToast('Opening WhatsApp with your order...');
      onClose();
    });
  };

  const handleOrderMessenger = () => {
    saveDetails();
    const item = createCurrentItem();
    sendViaMessenger([item], currentInfo, msg => {
      showToast(msg);
      onClose();
    });
  };

  const handleOrderImo = async () => {
    saveDetails();
    const item = createCurrentItem();
    const message = await prepareImoOrder([item], currentInfo);
    onClose();
    openImoModal(message);
  };

  const handleAskAvailability = () => {
    const cleanNumber = WHATSAPP_NUMBER.replace(/\D/g, '');
    const text = encodeURIComponent(
      `Hello ATOZ RAJBARI, I am interested in "${product.name}" (${product.link}). When will this item be back in stock?`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
    onClose();
  };

  const handleAddToCart = () => {
    const item = createCurrentItem();
    addToCart(item);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
              <img 
                src={product.thumbnail || product.images[0]} 
                alt={product.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">Quick Order</span>
              <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{product.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-extrabold text-emerald-600">
                  {product.price ? `${CURRENCY_SYMBOL}${product.price}` : 'Contact for Price'}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  isOutOfStock ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {product.availability}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Size Selector */}
          {product.sizes.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Select Size:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
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
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Select Colour:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.colours.map(colour => (
                  <button
                    key={colour}
                    type="button"
                    onClick={() => setSelectedColour(colour)}
                    className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
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
          <div className="flex items-center justify-between py-2 border-y border-slate-100">
            <div>
              <span className="text-xs font-semibold text-slate-700 block">Quantity</span>
              <span className="text-[11px] text-slate-500">Total: {CURRENCY_SYMBOL}{totalPrice}</span>
            </div>
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
              <button
                type="button"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                disabled={quantity <= 1}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center font-bold text-xs text-slate-900 tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(q => q + 1)}
                className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Optional Delivery Info for next time */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-bold text-slate-800 block">Delivery Details (Optional):</span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <input
              type="text"
              placeholder="Delivery Address (e.g. Rajbari Sadar / Dhaka)"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2">
          {isOutOfStock ? (
            <button
              onClick={handleAskAvailability}
              className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Ask When Available on WhatsApp</span>
            </button>
          ) : (
            <>
              {/* WhatsApp Order Button */}
              <button
                onClick={handleOrderWhatsApp}
                className="w-full h-12 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#25D366]/25 transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Order on WhatsApp (৳{totalPrice})</span>
              </button>

              {/* IMO & Messenger buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleOrderImo}
                  className="h-11 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Order on IMO</span>
                </button>
                <button
                  onClick={handleOrderMessenger}
                  className="h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Order on Messenger</span>
                </button>
              </div>

              {/* Add to Cart Secondary */}
              <button
                onClick={handleAddToCart}
                className="w-full h-10 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
