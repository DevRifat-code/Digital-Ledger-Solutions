import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Package, FileText, Zap, ArrowRight, Loader2, Sparkles, ShoppingBag, CornerDownLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface SearchResultItem {
  id: string;
  type: 'product' | 'blog' | 'service';
  title: string;
  description: string;
  category?: string;
  price?: string;
  imageUrl?: string;
  link: string;
}

const STATIC_SERVICES: SearchResultItem[] = [
  {
    id: 'srv-pos-starter',
    type: 'service',
    title: 'Starter POS Plan',
    description: 'Perfect for small retail shops getting started with POS automation in Bangladesh.',
    category: 'POS Software',
    price: '৳5,000',
    link: '/#pricing',
  },
  {
    id: 'srv-pos-pro',
    type: 'service',
    title: 'Pro POS Automation Suite',
    description: 'Unlimited products, multi-user, cloud sync & 24/7 priority support.',
    category: 'POS Software',
    price: '৳12,000',
    link: '/#pricing',
  },
  {
    id: 'srv-enterprise',
    type: 'service',
    title: 'Enterprise Multi-Store Solution',
    description: 'Warehouse tracking, custom integration & dedicated accounting suite for chain stores.',
    category: 'Enterprise',
    price: 'Custom',
    link: '/contact',
  },
  {
    id: 'srv-custom-dev',
    type: 'service',
    title: 'Custom Software & App Development',
    description: 'Bespoke web applications, inventory management systems, and business tools.',
    category: 'Services',
    price: 'On Request',
    link: '/contact',
  },
  {
    id: 'srv-cloud-accounting',
    type: 'service',
    title: 'Cloud Accounting & Ledger Suite',
    description: 'Automated ledger tracking, VAT calculation, and profit/loss reports.',
    category: 'Accounting',
    price: 'Included',
    link: '/marketplace',
  }
];

interface GlobalSearchProps {
  isMobileNav?: boolean;
  onCloseMobileNav?: () => void;
  navbarThemeOverride?: boolean; // when navbar is on transparent hero background
}

export function GlobalSearch({ isMobileNav = false, onCloseMobileNav, navbarThemeOverride = false }: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'product' | 'blog' | 'service'>('all');
  const [products, setProducts] = useState<SearchResultItem[]>([]);
  const [blogPosts, setBlogPosts] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Handle Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Auto focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      if (!hasFetched) {
        fetchSearchableData();
      }
    }
  }, [isOpen, hasFetched]);

  const fetchSearchableData = async () => {
    setLoading(true);
    try {
      // Fetch Products
      const prodQuery = query(collection(db, 'products'), limit(30));
      const prodSnap = await getDocs(prodQuery);
      const prodItems: SearchResultItem[] = prodSnap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          type: 'product',
          title: data.name || 'Untitled Product',
          description: data.description || '',
          category: data.category || 'Digital Asset',
          price: data.price ? `৳${data.price.toLocaleString()}` : 'Free',
          imageUrl: data.imageUrl || '',
          link: `/product/${doc.id}`,
        };
      });

      // Fetch Blog Posts
      const blogQuery = query(collection(db, 'blog'), limit(30));
      const blogSnap = await getDocs(blogQuery);
      const blogItems: SearchResultItem[] = blogSnap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          type: 'blog',
          title: data.title || 'Untitled Post',
          description: data.excerpt || data.content?.substring(0, 120) || '',
          category: data.category || 'Article',
          imageUrl: data.imageUrl || '',
          link: `/blog/${data.permalink || doc.id}`,
        };
      });

      setProducts(prodItems);
      setBlogPosts(blogItems);
      setHasFetched(true);
    } catch (err) {
      console.error('Error fetching data for search:', err);
    } finally {
      setLoading(false);
    }
  };

  // Combine and filter items
  const allItems: SearchResultItem[] = [...products, ...blogPosts, ...STATIC_SERVICES];

  const filteredResults = allItems.filter((item) => {
    const matchesFilter = filterType === 'all' || item.type === filterType;
    if (!matchesFilter) return false;

    if (!searchTerm.trim()) return true; // show featured/trending items if search is empty

    const term = searchTerm.toLowerCase();
    const matchesTitle = item.title.toLowerCase().includes(term);
    const matchesDesc = item.description.toLowerCase().includes(term);
    const matchesCat = item.category?.toLowerCase().includes(term);

    return matchesTitle || matchesDesc || matchesCat;
  });

  const handleSelectResult = (link: string) => {
    setIsOpen(false);
    setSearchTerm('');
    if (onCloseMobileNav) {
      onCloseMobileNav();
    }
    
    if (link.startsWith('/#')) {
      const elementId = link.replace('/#', '');
      navigate('/');
      setTimeout(() => {
        const elem = document.getElementById(elementId);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      navigate(link);
    }
  };

  const getBadgeStyle = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'product':
        return 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'blog':
        return 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
      case 'service':
        return 'bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    }
  };

  const getTypeIcon = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'product':
        return <Package size={16} className="text-emerald-500" />;
      case 'blog':
        return <FileText size={16} className="text-indigo-500" />;
      case 'service':
        return <Zap size={16} className="text-amber-500" />;
    }
  };

  return (
    <>
      {/* Search Button Trigger */}
      {isMobileNav ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 font-medium text-sm transition-all active:scale-[0.99]"
        >
          <span className="flex items-center gap-2.5">
            <Search size={18} className="text-indigo-500 dark:text-emerald-400" />
            Search products, articles, services...
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-md text-slate-600 dark:text-slate-300">
            Search
          </span>
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border shadow-sm group ${
            navbarThemeOverride
              ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white/90 placeholder-white/60'
              : 'bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300'
          }`}
          title="Search Marketplace & Blog (Cmd+K)"
        >
          <Search size={15} className="text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-emerald-400 transition-colors" />
          <span className="hidden sm:inline-block max-w-[120px] lg:max-w-[180px] truncate text-slate-500 dark:text-slate-400">
            Search catalog...
          </span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 text-[10px] font-mono font-bold px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-400 shadow-2xs">
            <span>⌘</span>K
          </kbd>
        </button>
      )}

      {/* Global Search Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 sm:px-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-950/60 dark:bg-black/80 backdrop-blur-md transition-opacity"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl shadow-indigo-950/20 dark:shadow-none overflow-hidden z-10 flex flex-col max-h-[82vh]"
            >
              {/* Top Search Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 relative flex items-center gap-4">
                <Search size={22} className="text-indigo-600 dark:text-emerald-400 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search products, blog posts, services, or pricing..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent text-slate-900 dark:text-white font-medium text-lg placeholder-slate-400 dark:placeholder-slate-500 outline-none"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-2.5 py-1 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors shrink-0"
                >
                  ESC
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="px-6 py-3 bg-slate-50/80 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
                {(['all', 'product', 'blog', 'service'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all shrink-0 ${
                      filterType === type
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                        : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60'
                    }`}
                  >
                    {type === 'all' && 'All Results'}
                    {type === 'product' && 'Products'}
                    {type === 'blog' && 'Blog Posts'}
                    {type === 'service' && 'Services'}
                  </button>
                ))}
                {loading && (
                  <span className="ml-auto flex items-center gap-2 text-xs text-indigo-600 dark:text-emerald-400 font-bold animate-pulse">
                    <Loader2 size={14} className="animate-spin" /> Loading catalogue...
                  </span>
                )}
              </div>

              {/* Search Results List */}
              <div className="p-6 overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800/60 space-y-2">
                {!searchTerm && (
                  <div className="pb-3 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
                    <Sparkles size={14} className="text-amber-500" />
                    Top Marketplace Solutions & Insights
                  </div>
                )}

                {filteredResults.length > 0 ? (
                  filteredResults.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectResult(item.link)}
                      className="group pt-3 pb-3 first:pt-0 last:pb-0 px-4 -mx-4 rounded-2xl hover:bg-indigo-50/60 dark:hover:bg-slate-800/50 transition-all cursor-pointer flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Thumbnail / Icon */}
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                          {item.imageUrl && item.imageUrl.trim() !== '' ? (
                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            getTypeIcon(item.type)
                          )}
                        </div>

                        {/* Title & Desc */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span
                              className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${getBadgeStyle(
                                item.type
                              )}`}
                            >
                              {item.type}
                            </span>
                            {item.category && (
                              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                                • {item.category}
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                            {item.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 font-medium mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Price & Action */}
                      <div className="flex items-center gap-3 shrink-0">
                        {item.price && (
                          <span className="text-xs font-black text-indigo-600 dark:text-emerald-400 bg-indigo-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-indigo-100 dark:border-emerald-900/40">
                            {item.price}
                          </span>
                        )}
                        <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700/60 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shadow-2xs">
                          <ArrowRight size={14} />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-16 text-center">
                    <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-4">
                      <Search size={28} />
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      No results matching "{searchTerm}"
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                      Try searching for broader keywords like "POS", "Ledger", "Accounting", "Retail", or "Plan".
                    </p>
                    <div className="flex items-center justify-center gap-3 mt-6">
                      <button
                        onClick={() => handleSelectResult('/marketplace')}
                        className="px-4 py-2 bg-indigo-600 dark:bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
                      >
                        Browse All Products
                      </button>
                      <button
                        onClick={() => handleSelectResult('/blog')}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
                      >
                        Explore Blog
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <CornerDownLeft size={12} /> to select
                  </span>
                  <span>ESC to exit</span>
                </div>
                <span>
                  Showing {filteredResults.length} {filteredResults.length === 1 ? 'item' : 'items'}
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
