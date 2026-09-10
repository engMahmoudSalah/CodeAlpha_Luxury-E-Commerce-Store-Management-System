import React, { useState, useEffect } from 'react';
import { useProducts, useCategoryCounts } from '../hooks/useProducts';
import { Product } from '../types';
import { QuickViewModal } from '../components/product/QuickViewModal';
import { commerceStore } from '../shared/store/commerceStore';
// Redesigned Luxury Homepage Sections
import { MainVisualHero } from '../components/home/MainVisualHero';
import { ThmanyahHeroSection } from '../components/home/ThmanyahHeroSection';
import { TrustFeatures } from '../components/home/TrustFeatures';
import { CategoryBentoGrid } from '../components/home/CategoryBentoGrid';
import { CuratedSelectionSection } from '../components/home/CuratedSelectionSection';
import { BestSellersCarousel } from '../components/home/BestSellersCarousel';
import { BrandPhilosophySection } from '../components/home/BrandPhilosophySection';
import { EditorialCollectionSection } from '../components/home/EditorialCollectionSection';
import { LiveTileHero } from '../components/home/LiveTileHero';
import { SocialProofSection } from '../components/home/SocialProofSection';
import { Sparkles } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [homepageSections, setHomepageSections] = useState(() => commerceStore.getHomepageSections());

  useEffect(() => {
    return commerceStore.subscribe(() => {
      setHomepageSections(commerceStore.getHomepageSections());
    });
  }, []);

  const { data: categoryCountsData } = useCategoryCounts();
  
  // Query featured products for homepage highlights
  const { data: allProductsData, isLoading: isAllProductsLoading } = useProducts({ limit: 24 });
  const allProducts = allProductsData?.products || [];

  return (
    <div className="w-full bg-[#FAF8F3]" dir="rtl">
      {homepageSections
        .filter((s) => s.enabled)
        .map((sec) => {
          switch (sec.id) {
            case 'hero':
              return <MainVisualHero key={sec.id} />;
            case 'trust_perks':
              return <TrustFeatures key={sec.id} />;
            case 'categories_grid':
              return <CategoryBentoGrid key={sec.id} categoryCounts={categoryCountsData?.counts} />;
            case 'featured_products':
              return (
                <CuratedSelectionSection
                  key={sec.id}
                  products={allProducts}
                  isLoading={isAllProductsLoading}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              );
            case 'best_sellers':
              return (
                <BestSellersCarousel
                  key={sec.id}
                  products={allProducts.slice(4, 16)}
                  isLoading={isAllProductsLoading}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              );
            case 'editorial':
              return (
                <React.Fragment key={sec.id}>
                  <ThmanyahHeroSection />
                  <EditorialCollectionSection />
                </React.Fragment>
              );
            case 'philosophy':
              return <BrandPhilosophySection key={sec.id} />;
            case 'live_gallery':
              return (
                <section key={sec.id} className="w-full py-12 sm:py-16 bg-[#FAF8F3] border-t border-[#E8E3D8]">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#00875A]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>معرض فخامة الحي</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-[#181818] tracking-tight font-arabic">
                        المعرض التفاعلي الحكائي (Live Tile Mosaic)
                      </h2>
                    </div>
                    <span className="text-xs font-bold text-[#5A5852] hidden sm:inline">
                      توزع ديناميكي وتحركات حية للمقتنيات الملكية
                    </span>
                  </div>
                  <LiveTileHero />
                </section>
              );
            case 'social_proof':
              return <SocialProofSection key={sec.id} />;
            default:
              return null;
          }
        })}

      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
export default HomePage;
