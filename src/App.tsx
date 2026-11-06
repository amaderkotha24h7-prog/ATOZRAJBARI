/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Splash } from './components/Splash';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Toast';
import { ImoModal } from './components/ImoModal';
import { QuickOrderModal } from './components/QuickOrderModal';
import { HomeView } from './views/HomeView';
import { SearchView } from './views/SearchView';
import { ProductDetailView } from './views/ProductDetailView';
import { CartView } from './views/CartView';
import { WishlistView } from './views/WishlistView';
import { OrdersAndInfoView } from './views/OrdersAndInfoView';

const MainLayout: React.FC = () => {
  const { activeTab, selectedProduct, setSelectedProduct, quickOrderProduct, setQuickOrderProduct } = useApp();
  const [showSplash, setShowSplash] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Initial Splash Screen */}
      {showSplash && <Splash onDismiss={() => setShowSplash(false)} />}

      {/* Persistent Top Navigation Bar */}
      <Navbar />

      {/* Main View Area */}
      <main className="flex-1">
        {selectedProduct ? (
          <ProductDetailView
            product={selectedProduct}
            onBack={() => {
              setSelectedProduct(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : (
          <>
            {activeTab === 'home' && <HomeView />}
            {activeTab === 'search' && <SearchView />}
            {activeTab === 'cart' && <CartView />}
            {activeTab === 'wishlist' && <WishlistView />}
            {activeTab === 'info' && <OrdersAndInfoView />}
          </>
        )}
      </main>

      {/* Quick Order Bottom Sheet Modal */}
      <QuickOrderModal
        product={quickOrderProduct}
        onClose={() => setQuickOrderProduct(null)}
      />

      {/* IMO Instructions and Order Modal */}
      <ImoModal />

      {/* Notification Toast */}
      <Toast />

      {/* Ergonomic Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
