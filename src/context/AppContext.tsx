import React, { createContext, useContext, useState, useEffect } from 'react';
import { ActiveTab, CartItem, CustomerDetails, OrderRecord, Product } from '../types';
import { IMO_NUMBER } from '../config/storeConfig';

interface AppContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  wishlist: string[]; // product IDs
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  customerDetails: CustomerDetails;
  updateCustomerDetails: (details: Partial<CustomerDetails>) => void;
  orderHistory: OrderRecord[];
  refreshOrderHistory: () => void;
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  toast: string | null;
  showToast: (msg: string) => void;
  imoModal: { isOpen: boolean; message: string; number: string };
  openImoModal: (message: string) => void;
  closeImoModal: () => void;
  quickOrderProduct: Product | null;
  setQuickOrderProduct: (p: Product | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickOrderProduct, setQuickOrderProduct] = useState<Product | null>(null);

  // Cart state persisted to localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('atoz_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist state persisted to localStorage
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('atoz_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Customer details persisted to localStorage
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>(() => {
    try {
      const saved = localStorage.getItem('atoz_customer_details');
      return saved
        ? JSON.parse(saved)
        : { name: '', phone: '', address: '', note: '' };
    } catch {
      return { name: '', phone: '', address: '', note: '' };
    }
  });

  // Recent searches persisted
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('atoz_recent_searches');
      return saved ? JSON.parse(saved) : ['Safety Vest', 'Gloves', 'Boots', 'Helmet'];
    } catch {
      return ['Safety Vest', 'Gloves', 'Boots', 'Helmet'];
    }
  });

  // Order history
  const [orderHistory, setOrderHistory] = useState<OrderRecord[]>(() => {
    try {
      const saved = localStorage.getItem('atoz_order_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Toast feedback
  const [toast, setToast] = useState<string | null>(null);

  // IMO guidance modal
  const [imoModal, setImoModal] = useState<{
    isOpen: boolean;
    message: string;
    number: string;
  }>({
    isOpen: false,
    message: '',
    number: IMO_NUMBER,
  });

  // Sync cart to storage
  useEffect(() => {
    try {
      localStorage.setItem('atoz_cart', JSON.stringify(cart));
    } catch (err) {
      console.warn('Error saving cart:', err);
    }
  }, [cart]);

  // Sync wishlist to storage
  useEffect(() => {
    try {
      localStorage.setItem('atoz_wishlist', JSON.stringify(wishlist));
    } catch (err) {
      console.warn('Error saving wishlist:', err);
    }
  }, [wishlist]);

  // Sync customer info
  useEffect(() => {
    try {
      localStorage.setItem('atoz_customer_details', JSON.stringify(customerDetails));
    } catch (err) {
      console.warn('Error saving customer info:', err);
    }
  }, [customerDetails]);

  // Sync recent searches
  useEffect(() => {
    try {
      localStorage.setItem('atoz_recent_searches', JSON.stringify(recentSearches));
    } catch (err) {
      console.warn('Error saving searches:', err);
    }
  }, [recentSearches]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(prev => (prev === msg ? null : prev));
    }, 3500);
  };

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    const id = `${item.productId}-${item.size || 'std'}-${item.colour || 'std'}`;
    setCart(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing) {
        return prev.map(i =>
          i.id === id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, { ...item, id }];
    });
    showToast(`Added "${item.name}" to cart`);
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
    showToast('Item removed from cart');
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(i => {
          if (i.id === itemId) {
            const nextQty = i.quantity + delta;
            return nextQty > 0 ? { ...i, quantity: nextQty } : null;
          }
          return i;
        })
        .filter((i): i is CartItem => i !== null)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((acc, i) => acc + i.quantity, 0);
  const cartTotal = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        showToast('Removed from saved list');
        return prev.filter(id => id !== productId);
      } else {
        showToast('Saved to your wishlist');
        return [...prev, productId];
      }
    });
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const updateCustomerDetails = (details: Partial<CustomerDetails>) => {
    setCustomerDetails(prev => ({ ...prev, ...details }));
  };

  const refreshOrderHistory = () => {
    try {
      const saved = localStorage.getItem('atoz_order_history');
      if (saved) setOrderHistory(JSON.parse(saved));
    } catch {
      // ignore
    }
  };

  const addRecentSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(q => q.toLowerCase() !== trimmed.toLowerCase());
      return [trimmed, ...filtered].slice(0, 10);
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  const openImoModal = (message: string) => {
    setImoModal({
      isOpen: true,
      message,
      number: IMO_NUMBER,
    });
  };

  const closeImoModal = () => {
    setImoModal(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedProduct,
        setSelectedProduct,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        wishlist,
        toggleWishlist,
        isWishlisted,
        customerDetails,
        updateCustomerDetails,
        orderHistory,
        refreshOrderHistory,
        recentSearches,
        addRecentSearch,
        clearRecentSearches,
        toast,
        showToast,
        imoModal,
        openImoModal,
        closeImoModal,
        quickOrderProduct,
        setQuickOrderProduct,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
