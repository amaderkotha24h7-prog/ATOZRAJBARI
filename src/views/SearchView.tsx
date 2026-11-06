import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../types';
import { searchProducts } from '../services/feedService';
import { ProductCard } from '../components/ProductCard';
import { useApp } from '../context/AppContext';
import { WHATSAPP_NUMBER } from '../config/storeConfig';
import { Search, X, Clock, MessageCircle, ArrowLeft, Loader2 } from 'lucide-react';

export const SearchView: React.FC = () => {
  const { recentSearches, addRecentSearch, clearRecentSearches, setActiveTab } = useApp();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const matches = await searchProducts(query);
        setResults(matches);
        setSearched(true);
        addRecentSearch(query);
      } catch (err) {
        console.error('Search failure:', err);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query]);

  const handleSelectRecent = (term: string) => {
    setQuery(term);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
  };

  const handleAskWhatsApp = () => {
    const cleanNumber = WHATSAPP_NUMBER.replace(/\D/g, '');
    const text = encodeURIComponent(
      `Hello ATOZ RAJBARI, I am looking for "${query}" on your catalog. Do you have this product in stock?`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="pb-24 max-w-5xl mx-auto px-4 pt-3 space-y-4">
      {/* Search Input Bar */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('home')}
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
          aria-label="Back to home"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            autoFocus
            placeholder="Type to search live catalog..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-white text-slate-900 placeholder-slate-400 text-sm pl-10 pr-10 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
          />
          {query ? (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : loading ? (
            <Loader2 className="w-4 h-4 text-emerald-600 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
          ) : null}
        </div>
      </div>

      {/* Recent Searches */}
      {!searched && recentSearches.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Recent Searches</span>
            </div>
            <button
              onClick={clearRecentSearches}
              className="text-xs font-semibold text-slate-400 hover:text-rose-500 transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {recentSearches.map((term, i) => (
              <button
                key={i}
                onClick={() => handleSelectRecent(term)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Live Results Header */}
      {searched && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-semibold text-slate-600">
            {loading ? 'Searching live Blogger feed...' : `Found ${results.length} results for "${query}"`}
          </p>
          {loading && <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />}
        </div>
      )}

      {/* Results Grid */}
      {results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {results.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : searched && !loading ? (
        /* Empty State with "Ask us on WhatsApp" */
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8 opacity-60" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No products found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
              We couldn't find any products matching &quot;{query}&quot;. We frequently stock new tools and equipment not yet listed on the blog!
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleAskWhatsApp}
              className="w-full sm:w-auto px-6 h-12 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 mx-auto shadow-md shadow-[#25D366]/25 transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Ask us on WhatsApp about &quot;{query}&quot;</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
