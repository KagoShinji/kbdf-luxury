import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchProducts } from '../../features/products/api';
import type { Product } from '../../features/products/types';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Debounced search
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      fetchProducts(undefined, trimmed)
        .then((data) => {
          setResults(data);
          setIsSearching(false);
        })
        .catch((err) => {
          console.error('Search failed:', err);
          setIsSearching(false);
        });
    }, 400); // 400ms debounce

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleResultClick = (slug: string) => {
    onClose();
    navigate(`/product/${slug}`);
  };

  const handleViewAll = () => {
    if (query.trim()) {
      onClose();
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          className="fixed inset-0 z-[60] bg-surface-white/95 backdrop-blur-xl flex flex-col"
        >
          {/* Header & Search Input */}
          <div className="w-full max-w-[1440px] mx-auto px-6 py-8 md:py-12 flex flex-col gap-8 relative h-full">
            
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 md:top-8 md:right-8 p-2 text-typography-muted hover:text-brand-pink transition-colors z-10"
            >
              <X className="w-8 h-8" strokeWidth={1} />
            </button>

            <div className="w-full max-w-4xl mx-auto mt-12 md:mt-24 relative">
              <div className="flex items-center border-b-2 border-brand-navy pb-4">
                <Search className="w-6 h-6 md:w-8 md:h-8 text-brand-navy mr-4" strokeWidth={1.5} />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search brands, products, collections..."
                  className="w-full bg-transparent text-2xl md:text-4xl font-serif text-brand-navy outline-none placeholder:text-typography-muted/40"
                />
              </div>

              {/* Loading Indicator */}
              {isSearching && (
                <div className="absolute -bottom-8 left-0 text-[10px] uppercase tracking-widest text-typography-muted animate-pulse">
                  Searching...
                </div>
              )}
            </div>

            {/* Results Area */}
            <div className="w-full max-w-4xl mx-auto flex-1 overflow-y-auto no-scrollbar pb-12">
              {query.trim() && !isSearching && results.length === 0 ? (
                <div className="text-center py-20 text-typography-muted uppercase tracking-widest text-xs font-medium">
                  No products found for "{query}"
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-8">
                  {results.slice(0, 8).map((product, i) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={product.id}
                      onClick={() => handleResultClick(product.slug)}
                      className="group cursor-pointer flex flex-col"
                    >
                      <div className="aspect-[4/5] bg-surface-offWhite overflow-hidden mb-4 relative">
                        <img 
                          src={product.image_urls[0] || '/placeholder.png'} 
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                      </div>
                      <h3 className="text-xs font-bold text-typography-primary uppercase tracking-wide line-clamp-1 mb-1 group-hover:text-brand-pink transition-colors">
                        {product.brand}
                      </h3>
                      <p className="text-[10px] text-typography-muted line-clamp-2 leading-relaxed mb-2 flex-1">
                        {product.title}
                      </p>
                      <p className="text-xs font-bold text-brand-navy">
                        ₱ {product.price.toLocaleString()}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
              
              {results.length > 8 && (
                <div className="flex justify-center mt-12">
                  <button 
                    onClick={handleViewAll}
                    className="text-[10px] uppercase tracking-widest font-bold border-b border-brand-navy pb-1 text-brand-navy hover:text-brand-pink hover:border-brand-pink transition-colors"
                  >
                    View All {results.length} Results
                  </button>
                </div>
              )}
            </div>
            
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
