export interface Product {
  id: string;
  title: string;
  name: string;
  category: string;
  price: number | null;
  priceFormatted: string;
  sizes: string[];
  colours: string[];
  availability: 'In Stock' | 'Out of Stock';
  images: string[];
  thumbnail: string;
  shortDescription: string;
  fullDescription: string;
  features: string[];
  suitableFor: string[];
  published: string;
  link: string;
}

export interface CartItem {
  id: string; // Composite key: `${productId}-${size || 'na'}-${colour || 'na'}`
  productId: string;
  name: string;
  price: number;
  priceFormatted: string;
  size?: string;
  colour?: string;
  quantity: number;
  image: string;
  link: string;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  address: string;
  note?: string;
}

export interface OrderRecord {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  channel: 'WhatsApp' | 'IMO' | 'Messenger';
  customerInfo?: CustomerDetails;
  rawMessage: string;
}

export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc';

export type ActiveTab = 'home' | 'search' | 'cart' | 'wishlist' | 'info';
