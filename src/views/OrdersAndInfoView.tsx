import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  STORE_NAME,
  STORE_TAGLINE,
  STORE_ABOUT,
  WHATSAPP_NUMBER,
  IMO_NUMBER,
  FACEBOOK_PAGE,
  DISPLAY_PHONE,
  STORE_EMAIL,
  STORE_LOCATION,
  DELIVERY_NOTE,
  RETURNS_NOTE,
  BLOG_URL,
  CURRENCY_SYMBOL,
} from '../config/storeConfig';
import { sendViaWhatsApp, sendViaMessenger, prepareImoOrder } from '../utils/orderHelper';
import {
  MessageCircle,
  Send,
  Phone,
  Mail,
  MapPin,
  Truck,
  RotateCcw,
  ExternalLink,
  Clock,
  Repeat,
  CheckCircle2,
  Copy,
  Info,
  Package,
} from 'lucide-react';

export const OrdersAndInfoView: React.FC = () => {
  const { orderHistory, showToast, openImoModal } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'info' | 'history'>('info');

  const handleReorderWhatsApp = (order: any) => {
    sendViaWhatsApp(order.items, order.customerInfo, () => {
      showToast('Re-order sent to WhatsApp!');
    });
  };

  const handleCopyOrder = async (rawMessage: string) => {
    try {
      await navigator.clipboard.writeText(rawMessage);
      showToast('Order details copied to clipboard!');
    } catch {
      showToast('Copied');
    }
  };

  const handleOpenWhatsApp = () => {
    const cleanNumber = WHATSAPP_NUMBER.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
  };

  const handleOpenMessenger = () => {
    const page = FACEBOOK_PAGE.replace(/^@/, '');
    window.open(`https://m.me/${page}`, '_blank');
  };

  const handleOpenImo = () => {
    openImoModal(`Hello ${STORE_NAME}, I would like to inquire about your products.`);
  };

  return (
    <div className="pb-32 max-w-3xl mx-auto px-4 pt-3 space-y-5">
      {/* Subtab Segmented Control */}
      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveSubTab('info')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'info'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>About & Contact</span>
        </button>
        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'history'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Order History ({orderHistory.length})</span>
        </button>
      </div>

      {activeSubTab === 'info' ? (
        <div className="space-y-5">
          {/* Brand Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 shadow-md space-y-3">
            <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold block">
              Official Ecommerce Catalog
            </span>
            <h2 className="text-2xl font-black tracking-tight">{STORE_NAME}</h2>
            <p className="text-xs text-emerald-300 font-semibold">{STORE_TAGLINE}</p>
            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              {STORE_ABOUT}
            </p>
          </div>

          {/* Three Direct Channels */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Direct Chat & Order Channels</h3>
            <p className="text-xs text-slate-500">
              Need assistance or want to order directly? Chat with our team anytime on:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {/* WhatsApp */}
              <button
                onClick={handleOpenWhatsApp}
                className="h-12 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>WhatsApp Chat</span>
              </button>

              {/* IMO */}
              <button
                onClick={handleOpenImo}
                className="h-12 rounded-2xl bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Chat on IMO</span>
              </button>

              {/* Messenger */}
              <button
                onClick={handleOpenMessenger}
                className="h-12 rounded-2xl bg-gradient-to-r from-[#0084FF] to-[#7B2CBF] hover:opacity-95 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Messenger Chat</span>
              </button>
            </div>
          </div>

          {/* Contact Details & Location */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Contact & Location</h3>
            <div className="space-y-2.5 text-xs text-slate-700">
              <a
                href={`tel:${WHATSAPP_NUMBER}`}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Phone / Helpline</span>
                  <span className="font-bold text-slate-900">{DISPLAY_PHONE}</span>
                </div>
              </a>

              <a
                href={`mailto:${STORE_EMAIL}`}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Email Address</span>
                  <span className="font-bold text-slate-900">{STORE_EMAIL}</span>
                </div>
              </a>

              <div className="flex items-center gap-3 p-2.5 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Physical Location</span>
                  <span className="font-bold text-slate-900">{STORE_LOCATION}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery & Returns Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Delivery Policy</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {DELIVERY_NOTE}
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <RotateCcw className="w-4 h-4 text-sky-600" />
                <span>Return & Exchange</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {RETURNS_NOTE}
              </p>
            </div>
          </div>

          {/* Blogger Source Link */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Catalog Data Source</span>
              <span className="text-xs font-bold text-slate-800">Blogger Blog Public Feed</span>
            </div>
            <a
              href={BLOG_URL}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 hover:bg-slate-100 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span>Visit Blog</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      ) : (
        /* Order History Tab */
        <div className="space-y-4">
          {orderHistory.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 opacity-60" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Past Orders Found</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                When you send an order via WhatsApp, IMO, or Messenger, a copy is automatically stored here so you can re-order anytime.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {orderHistory.map(ord => (
                <div
                  key={ord.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        {new Date(ord.date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        Channel: <strong className="text-emerald-700">{ord.channel}</strong>
                      </span>
                    </div>

                    <span className="text-sm font-extrabold text-slate-900 tabular-nums">
                      {CURRENCY_SYMBOL}{ord.total}
                    </span>
                  </div>

                  {/* Items in order */}
                  <div className="space-y-1.5">
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs text-slate-700">
                        <span className="line-clamp-1 flex-1 font-medium">
                          {idx + 1}. {it.name} {it.size ? `(${it.size})` : ''}
                        </span>
                        <span className="font-bold tabular-nums pl-2 text-slate-500">
                          x{it.quantity} · {CURRENCY_SYMBOL}{it.price * it.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Actions: Re-order & Copy Receipt */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleCopyOrder(ord.rawMessage)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Order Text</span>
                    </button>
                    <button
                      onClick={() => handleReorderWhatsApp(ord)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <Repeat className="w-3.5 h-3.5" />
                      <span>Re-Order on WhatsApp</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
