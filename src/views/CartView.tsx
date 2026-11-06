import React from 'react';
import { useApp } from '../context/AppContext';
import { CURRENCY_SYMBOL } from '../config/storeConfig';
import { sendViaWhatsApp, sendViaMessenger, prepareImoOrder } from '../utils/orderHelper';
import { Trash2, Plus, Minus, ShoppingBag, MessageCircle, Send, ArrowRight, ShieldCheck } from 'lucide-react';

export const CartView: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    customerDetails,
    updateCustomerDetails,
    showToast,
    openImoModal,
    setActiveTab,
  } = useApp();

  const handleOrderWhatsApp = () => {
    if (cart.length === 0) return;
    sendViaWhatsApp(cart, customerDetails, () => {
      showToast('Opening WhatsApp with your complete order...');
    });
  };

  const handleOrderMessenger = () => {
    if (cart.length === 0) return;
    sendViaMessenger(cart, customerDetails, msg => {
      showToast(msg);
    });
  };

  const handleOrderImo = async () => {
    if (cart.length === 0) return;
    const message = await prepareImoOrder(cart, customerDetails);
    openImoModal(message);
  };

  if (cart.length === 0) {
    return (
      <div className="pb-28 max-w-lg mx-auto px-4 pt-12 text-center space-y-5">
        <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-10 h-10 opacity-70" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-slate-900">Your Cart is Empty</h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Browse our catalog, pick your required sizes and quantities, and place orders directly via WhatsApp or Messenger.
          </p>
        </div>
        <div>
          <button
            onClick={() => setActiveTab('home')}
            className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center gap-2 shadow-md"
          >
            <span>Explore Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32 max-w-3xl mx-auto px-4 pt-3 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Your Shopping Cart</h1>
          <p className="text-xs text-slate-500">No payment required here. Order finalized via chat.</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-500 hover:text-rose-600"
        >
          Clear All
        </button>
      </div>

      {/* Cart Items List */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {cart.map(item => (
          <div key={item.id} className="p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
            {/* Image */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
              <img
                src={item.image}
                alt={item.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">{item.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                    {item.size && <span>Size: <strong className="text-slate-800">{item.size}</strong></span>}
                    {item.size && item.colour && <span>·</span>}
                    {item.colour && <span>Colour: <strong className="text-slate-800">{item.colour}</strong></span>}
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quantity and Price Row */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-7 text-center font-bold text-xs text-slate-900 tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="text-right">
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 tabular-nums">
                    {CURRENCY_SYMBOL}{item.price * item.quantity}
                  </span>
                  {item.quantity > 1 && (
                    <span className="block text-[10px] text-slate-400">
                      ({CURRENCY_SYMBOL}{item.price} each)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Total Summary Row */}
        <div className="p-4 sm:p-5 bg-slate-50/70 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-700">Subtotal Estimated</span>
          <span className="text-xl font-black text-slate-900 tabular-nums">
            {CURRENCY_SYMBOL}{cartTotal}
          </span>
        </div>
      </div>

      {/* Customer Information (Saved in localStorage for next time) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Delivery Information (Optional)</h3>
          <p className="text-[11px] text-slate-400">
            Saved automatically on your device so you never have to re-type it.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Your Name</label>
            <input
              type="text"
              placeholder="e.g. Mohammad Rahim"
              value={customerDetails.name}
              onChange={e => updateCustomerDetails({ name: e.target.value })}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Phone Number</label>
            <input
              type="tel"
              placeholder="e.g. 017XXXXXXXX"
              value={customerDetails.phone}
              onChange={e => updateCustomerDetails({ phone: e.target.value })}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-600 block mb-1">Delivery Address</label>
          <input
            type="text"
            placeholder="e.g. House 12, Road 4, Rajbari Sadar / Dhaka"
            value={customerDetails.address}
            onChange={e => updateCustomerDetails({ address: e.target.value })}
            className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-600 block mb-1">Special Order Note (Optional)</label>
          <input
            type="text"
            placeholder="e.g. Urgent delivery needed, deliver after 2 PM"
            value={customerDetails.note || ''}
            onChange={e => updateCustomerDetails({ note: e.target.value })}
            className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* THREE SEND ORDER BUTTONS */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block px-1">
          Complete Order via Chat
        </span>

        {/* WhatsApp */}
        <button
          onClick={handleOrderWhatsApp}
          className="w-full h-13 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/25 transition-all cursor-pointer"
        >
          <MessageCircle className="w-5 h-5 fill-white" />
          <span>Send Order via WhatsApp ({CURRENCY_SYMBOL}{cartTotal})</span>
        </button>

        {/* IMO & Messenger */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleOrderImo}
            className="h-12 rounded-2xl bg-sky-600 hover:bg-sky-500 active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-sky-600/20 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Send via IMO</span>
          </button>
          <button
            onClick={handleOrderMessenger}
            className="h-12 rounded-2xl bg-gradient-to-r from-[#0084FF] to-[#7B2CBF] hover:opacity-95 active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Send via Messenger</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Cash on Delivery (COD) · Fast Nationwide Delivery</span>
      </div>
    </div>
  );
};
