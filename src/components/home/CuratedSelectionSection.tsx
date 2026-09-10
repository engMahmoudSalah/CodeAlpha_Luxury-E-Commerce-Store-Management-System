import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { ProductCard } from '../product/ProductCard';
import { Sparkles, ChevronLeft, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CuratedSelectionSectionProps {
  products: Product[];
  isLoading?: boolean;
  onQuickView?: (product: Product) => void;
}

const CATEGORY_TABS = [
  { id: 'all', label: 'كافة المقتنيات المميزة', param: 'all' },
  { id: 'Audio', label: 'الأنظمة الصوتية', param: 'Audio' },
  { id: 'Wearables', label: 'الساعات الفاخرة', param: 'Wearables' },
  { id: 'Electronics', label: 'الإلكترونيات الراقية', param: 'Electronics' },
  { id: 'Home & Office', label: 'مقتنيات المساحات', param: 'Home & Office' },
];

export const CuratedSelectionSection: React.FC<CuratedSelectionSectionProps> = ({
  products,
  isLoading,
  onQuickView
}) => {
  const [activeTab, setActiveTab] = useState('all');

  const filteredProducts = useMemo(() => {
    if (activeTab === 'all') {
      return products.slice(0, 8);
    }
    return products.filter((p) => p.category === activeTab).slice(0, 8);
  }, [products, activeTab]);

  return (
    <section className="w-full py-12 sm:py-16 bg-[#FCFAF7] border-t border-[#E8E3D8] font-arabic" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Title and Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10 pb-6 border-b border-[#E8E3D8]">
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#00875A]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>مختارات الموسم الملكية</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#181818] tracking-tight">
              تشكيلة مقتنيات فخامة المختارة
            </h2>
            <p className="text-xs sm:text-sm text-[#5A5852] max-w-xl">
              قطع استثنائية حازت على أعلى درجات التقييم والاعتماد من قبل خبراء الاقتناء والتصميم.
            </p>
          </div>

          {/* Category Tabs Pill Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
            {CATEGORY_TABS.map((tab) => {
              const isCurrent = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs font-black transition-all shrink-0 cursor-pointer whitespace-nowrap ${
                    isCurrent
                      ? 'bg-[#00875A] text-white shadow-xs'
                      : 'bg-white text-[#5A5852] hover:text-[#181818] border border-[#E8E3D8]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={`curated-skel-${idx}`}
                className="aspect-3/4 rounded-3xl bg-[#E8E3D8]/50 animate-pulse border border-[#E8E3D8]"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-[#E8E3D8]">
            <p className="text-sm font-bold text-[#5A5852]">لا توجد مقتنيات حالياً في هذا القسم.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, idx) => (
                <motion.div
                  key={`curated-${product.id || idx}-${idx}`}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <ProductCard product={product} onQuickView={onQuickView} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Bottom CTA to browse more */}
        <div className="mt-10 sm:mt-12 text-center">
          <Link
            to={activeTab === 'all' ? '/products' : `/products?category=${encodeURIComponent(activeTab)}`}
          >
            <button
              type="button"
              className="px-8 py-3.5 rounded-full bg-[#181818] hover:bg-[#00875A] text-white text-xs sm:text-sm font-black transition-all shadow-md hover:shadow-lg cursor-pointer inline-flex items-center gap-2 group"
            >
              <span>
                {activeTab === 'all'
                  ? 'عرض جميع المقتنيات في المتجر'
                  : `استكشف كافة مقتنيات ${CATEGORY_TABS.find((t) => t.id === activeTab)?.label}`}
              </span>
              <ChevronLeft className="w-4 h-4 text-[#00E676] transition-transform group-hover:-translate-x-1" />
            </button>
          </Link>
        </div>

      </div>
    </section>
  );
};
