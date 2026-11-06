import React, { useState, useEffect, useMemo } from 'react';
import { Product, SortOption } from '../types';
import { getProducts } from '../services/feedService';
import { ProductCard } from '../components/ProductCard';
import { useApp } from '../context/AppContext';
import { FEED_BATCH_SIZE, STORE_NAME, STORE_TAGLINE, WHATSAPP_NUMBER } from '../config/storeConfig';
import { Search, SlidersHorizontal, ArrowUpDown, Sparkles, RefreshCw, MessageCircle } from 'lucide-react';

export const HomeView: React.FC = () => {
  const { setActiveTab } = useApp();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [startIndex, setStartIndex] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  // Initial load
  useEffect(() => {
    loadInitialProducts();
  }, []);

  const loadInitialProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts(1, FEED_BATCH_SIZE);
      setProducts(res.products);
      setHasMore(res.hasMore);
      setStartIndex(res.startIndex + res.products.length);
    } catch (err) {
      console.error('Failed to load initial products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const res = await getProducts(startIndex, FEED_BATCH_SIZE);
      // Append unique items
      setProducts(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const newItems = res.products.filter(p => !existingIds.has(p.id));
        return [...prev, ...newItems];
      });
      setHasMore(res.hasMore);
      setStartIndex(prev => prev + res.products.length);
    } catch (err) {
      console.error('Failed to load more products:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Derive all unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.category && p.category.trim()) {
        set.add(p.category.trim());
      }
    });
    return ['All', ...Array.from(set)];
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Category filter
    if (selectedCategory !== 'All') {
      list = list.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // In-stock filter
    if (inStockOnly) {
      list = list.filter(p => p.availability === 'In Stock');
    }

    // Sorting
    list.sort((a, b) => {
      if (sortOption === 'price-asc') {
        return (a.price || 0) - (b.price || 0);
      }
      if (sortOption === 'price-desc') {
        return (b.price || 0) - (a.price || 0);
      }
      if (sortOption === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      // newest
      return new Date(b.published).getTime() - new Date(a.published).getTime();
    });

    return list;
  }, [products, selectedCategory, inStockOnly, sortOption]);

  // "New Arrivals" top products (up to 6)
  const newArrivals = useMemo(() => {
    return [...products]
      .sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime())
      .slice(0, 6);
  }, [products]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setActiveTab('search');
    }
  };

  return (
    <div className="pb-24 max-w-5xl mx-auto px-4 pt-3 space-y-5">
      {/* Search Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Blogger Catalog</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-0.5">
              {STORE_NAME}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-md">
              {STORE_TAGLINE}. Browse verified products and place your order directly via WhatsApp, IMO, or Messenger.
            </p>
          </div>

          {/* Big Search Bar with always-visible search button */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search safety vests, boots, gloves, helmets..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onFocus={() => setActiveTab('search')}
                className="w-full bg-white/95 text-slate-900 placeholder-slate-400 text-xs sm:text-sm pl-10 pr-4 py-3 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="ml-2 px-4 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all shrink-0 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </form>
        </div>
      </div>

      {/* Horizontal Category Selector Chips */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Categories
          </span>
          <span className="text-[11px] text-slate-400">
            {categories.length - 1} sections
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-4 px-4">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`min-h-[40px] px-4 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/15 ring-2 ring-slate-900/20'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* "New Arrivals" Horizontal Row */}
      {newArrivals.length > 0 && selectedCategory === 'All' && !inStockOnly && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                New Arrivals
              </h3>
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold">
              Latest Additions
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar py-1 -mx-4 px-4">
            {newArrivals.map(prod => (
              <div key={`na-${prod.id}`} className="w-40 sm:w-48 shrink-0">
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sort and Filter Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-medium text-slate-500">Sort:</span>
          <select
            value={sortOption}
            onChange={e => setSortOption(e.target.value as SortOption)}
            className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Product Name (A-Z)</option>
          </select>
        </div>

        {/* In-Stock Only Toggle */}
        <button
          onClick={() => setInStockOnly(!inStockOnly)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border cursor-pointer ${
            inStockOnly
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>In-Stock Only</span>
        </button>
      </div>

      {/* Products Catalog Title */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          {selectedCategory === 'All' ? 'All Catalog Products' : selectedCategory}
        </h3>
        <span className="text-xs font-semibold text-slate-500 tabular-nums">
          {filteredProducts.length} items
        </span>
      </div>

      {/* 2-Column Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200 p-3 space-y-3 animate-pulse">
              <div className="aspect-square bg-slate-200 rounded-xl w-full" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3">
          <p className="text-base font-bold text-slate-800">No products match your filter</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try resetting the category filter or searching for a specific item. You can also chat with us on WhatsApp to inquire about any product!
          </p>
          <div className="pt-2 flex justify-center gap-2">
            <button
              onClick={() => {
                setSelectedCategory('All');
                setInStockOnly(false);
              }}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-[#25D366] text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Ask on WhatsApp</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination "Load More" Button */}
      {hasMore && (
        <div className="pt-4 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="min-h-[48px] px-8 rounded-2xl bg-white border border-slate-300 hover:border-slate-400 active:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
          >
            {loadingMore ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Loading more from Blogger...</span>
              </>
            ) : (
              <span>Load More Products</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
