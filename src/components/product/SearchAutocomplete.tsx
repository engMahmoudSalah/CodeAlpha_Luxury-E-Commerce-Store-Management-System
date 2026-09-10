import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, TrendingUp, Sparkles, ArrowUpLeft, ChevronLeft } from 'lucide-react';
import { useSearchSuggestions } from '../../hooks/useProducts';

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (query: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

const RECENT_SEARCHES_KEY = 'luxestore_recent_searches';
const POPULAR_SEARCHES = ['ساعة فاخرة', 'سماعات رأس', 'مكبر صوت', 'Bang & Olufsen', 'جلد طبيعي', 'إصدار محدود'];

export const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'ابحث عن مقتنياتك المفضلة (ساعة، سماعة، نظام صوتي)...',
  className = '',
  autoFocus = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch {
      // Ignore localStorage error
    }
  }, []);

  const saveRecentSearch = (query: string) => {
    const clean = query.trim();
    if (!clean) return;
    const updated = [clean, ...recentSearches.filter(s => s.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const removeRecentSearch = (e: React.MouseEvent, query: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== query);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const clearAllRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Ignore
    }
  };

  // Live suggestions query
  const { data: suggestions, isLoading } = useSearchSuggestions(value);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      saveRecentSearch(value.trim());
      onSubmit(value.trim());
      setIsOpen(false);
    }
  };

  const handleSelectQuery = (query: string) => {
    onChange(query);
    saveRecentSearch(query);
    onSubmit(query);
    setIsOpen(false);
  };

  const handleSelectProduct = (productId: number, productName: string) => {
    saveRecentSearch(productName);
    setIsOpen(false);
    navigate(`/products/${productId}`);
  };

  const hasSuggestions = Boolean(
    suggestions && (suggestions.products.length > 0 || suggestions.categories.length > 0)
  );

  return (
    <div ref={containerRef} className={`relative ${className}`} dir="rtl">
      <form onSubmit={handleFormSubmit} className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full bg-white border border-[#E8E3D8] rounded-full pr-11 pl-24 py-2.5 text-xs text-[#111111] placeholder-neutral-400 focus:outline-none focus:border-[#008F68] focus:ring-2 focus:ring-[#008F68]/15 transition-all font-arabic shadow-2xs"
        />
        <Search className="w-4.5 h-4.5 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            className="absolute left-20 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer rounded-full"
            title="مسح البحث"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          type="submit"
          className="absolute left-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-[#008F68] hover:bg-[#007353] text-white text-[11px] font-black rounded-full transition-all cursor-pointer font-arabic shadow-2xs hover:shadow-xs active:scale-95"
        >
          بحث
        </button>
      </form>

      {/* Autocomplete & Suggestions Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 left-0 mt-2 bg-white rounded-2xl border border-[#E8E3D8] shadow-xl z-50 overflow-hidden font-arabic transition-all animate-in fade-in slide-in-from-top-2 duration-150">
          {/* 1. Live Matching Suggestions when typing */}
          {value.trim().length >= 2 ? (
            <div className="p-3">
              {isLoading ? (
                <div className="py-6 text-center text-xs text-neutral-400">
                  <span className="inline-block animate-spin mr-2">⟳</span>
                  جاري البحث في المقتنيات...
                </div>
              ) : hasSuggestions ? (
                <div className="flex flex-col gap-3">
                  {/* Category Matching */}
                  {suggestions?.categories && suggestions.categories.length > 0 && (
                    <div className="pb-2 border-b border-neutral-100">
                      <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block mb-1.5 px-2">
                        فئات مطابقة
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestions.categories.map((cat, idx) => (
                          <button
                            key={`search-cat-${cat}-${idx}`}
                            type="button"
                            onClick={() => {
                              handleSelectQuery(cat);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-[#FAF8F3] hover:bg-[#008F68]/10 text-neutral-800 hover:text-[#008F68] border border-[#E8E3D8] rounded-full text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-[#FFC700]" />
                            <span>{cat === 'Audio' ? 'الأنظمة الصوتية' : cat === 'Wearables' ? 'الساعات الفاخرة' : 'الإلكترونيات الراقية'}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Products */}
                  {suggestions?.products && suggestions.products.length > 0 && (
                    <div>
                      <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block mb-1.5 px-2">
                        مقتنيات مقترحة
                      </span>
                      <div className="flex flex-col divide-y divide-neutral-100">
                        {suggestions.products.map((item, idx) => (
                          <button
                            key={`search-prod-${item.id || idx}-${idx}`}
                            type="button"
                            onClick={() => handleSelectProduct(item.id, item.name)}
                            className="flex items-center justify-between gap-3 p-2 hover:bg-[#FAF8F3] rounded-xl transition-colors cursor-pointer text-right w-full group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-center shrink-0 p-1">
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  className="w-full h-full object-contain mix-blend-multiply"
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-black text-[#111111] truncate group-hover:text-[#008F68] transition-colors">
                                  {item.name}
                                </div>
                                <div className="text-[10px] text-neutral-400">
                                  {item.category === 'Audio' ? 'صوتيات' : item.category === 'Wearables' ? 'ساعات' : 'إلكترونيات'} • {item.stock > 0 ? 'متوفر' : 'نفد'}
                                </div>
                              </div>
                            </div>
                            <div className="text-left shrink-0">
                              <span className="text-xs font-black text-[#111111]">
                                {Number(item.price).toLocaleString('ar-SA')} ر.س
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* View All Search Results Button */}
                  <div className="pt-2 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => handleSelectQuery(value.trim())}
                      className="w-full py-2 px-3 bg-[#FAF8F3] hover:bg-[#008F68] hover:text-white text-xs font-black text-[#111111] rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>عرض جميع نتائج البحث عن &ldquo;{value}&rdquo;</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-xs text-neutral-500 font-bold mb-1">لا توجد اقتراحات مطابقة لـ &ldquo;{value}&rdquo;</p>
                  <button
                    type="button"
                    onClick={() => handleSelectQuery(value.trim())}
                    className="text-[11px] text-[#008F68] hover:underline font-black cursor-pointer"
                  >
                    اضغط للبحث في كافة السجلات
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* 2. Empty query view: Recent searches & Trending searches */
            <div className="p-4 flex flex-col gap-4">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black text-neutral-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      عمليات البحث الأخيرة
                    </span>
                    <button
                      type="button"
                      onClick={clearAllRecent}
                      className="text-[10px] text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      مسح السجل
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((item, idx) => (
                      <div
                        key={`search-rec-${item}-${idx}`}
                        onClick={() => handleSelectQuery(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF8F3] hover:bg-[#008F68]/10 text-neutral-700 hover:text-[#008F68] border border-[#E8E3D8] rounded-full text-xs font-bold transition-all cursor-pointer group"
                      >
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={(e) => removeRecentSearch(e, item)}
                          className="text-neutral-400 hover:text-neutral-800 p-0.5 rounded-full"
                          title="حذف من السجل"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending / Popular Searches */}
              <div>
                <span className="text-[11px] font-black text-neutral-400 flex items-center gap-1 mb-2">
                  <TrendingUp className="w-3 h-3 text-[#008F68]" />
                  المقتنيات الأكثر بحثاً الآن
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SEARCHES.map((item, idx) => (
                    <button
                      key={`search-pop-${item}-${idx}`}
                      type="button"
                      onClick={() => handleSelectQuery(item)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-[#008F68] text-neutral-700 hover:text-white border border-[#E8E3D8] hover:border-[#008F68] rounded-full text-xs font-bold transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                    >
                      <ArrowUpLeft className="w-3 h-3 opacity-60" />
                      <span>{item}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
