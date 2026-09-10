import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { ProductCard } from '../product/ProductCard';
import { Sparkles, ChevronLeft, ChevronRight, Flame, Trophy } from 'lucide-react';

interface BestSellersCarouselProps {
  products: Product[];
  isLoading?: boolean;
  onQuickView?: (product: Product) => void;
}

export const BestSellersCarousel: React.FC<BestSellersCarouselProps> = ({
  products,
  isLoading,
  onQuickView
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Top trending items from data
  const bestSellers = products.slice(0, 8);

  return (
    <section className="w-full py-12 sm:py-16 bg-[#FAF8F3] border-t border-[#E8E3D8] font-arabic" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Title and Scroll Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10 pb-5 border-b border-[#E8E3D8]">
          <div className="flex flex-col gap-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#00875A]">
              <Trophy className="w-4 h-4 text-[#FFC700]" />
              <span>الأعلى طلباً وتقييماً</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#181818] tracking-tight">
              المقتنيات الأكثر اقتناءً في دار فخامة
            </h2>
            <p className="text-xs sm:text-sm text-[#5A5852] max-w-xl">
              إصدارات نالت ثقة النخبة وتصدرت اختيارات المقتنين خلال هذا الشهر.
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full bg-white border border-[#E8E3D8] hover:border-[#00875A] text-[#181818] hover:text-[#00875A] flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
              aria-label="التمرير لليمين"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full bg-white border border-[#E8E3D8] hover:border-[#00875A] text-[#181818] hover:text-[#00875A] flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
              aria-label="التمرير لليسار"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Carousel Track */}
        {isLoading ? (
          <div className="flex gap-6 overflow-hidden">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={`skeleton-${idx}`}
                className="w-72 sm:w-80 shrink-0 aspect-3/4 rounded-3xl bg-[#E8E3D8]/50 animate-pulse border border-[#E8E3D8]"
              />
            ))}
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth no-scrollbar"
          >
            {bestSellers.map((product, index) => {
              const rank = (index + 1).toString().padStart(2, '0');

              return (
                <div
                  key={`bestseller-${product.id || index}-${index}`}
                  className="w-[280px] sm:w-[320px] shrink-0 snap-start relative flex flex-col"
                >
                  {/* Subtle Rank Watermark Badge */}
                  <div className="absolute top-2 right-2 z-20 pointer-events-none">
                    <span className="text-[11px] font-black font-mono px-2.5 py-1 bg-[#181818] text-[#FFC700] rounded-full shadow-md border border-white/20">
                      #{rank}
                    </span>
                  </div>

                  <ProductCard product={product} onQuickView={onQuickView} />
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
