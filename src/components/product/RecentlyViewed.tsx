import React, { useEffect, useState } from 'react';
import { ProductCard } from './ProductCard';
import { commerceStore } from '../../shared/store/commerceStore';
import { Product } from '../../types';

const KEY = 'fk_recent_v1';

function read(): number[] {
  try {
    const a = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(a) ? a.filter((n) => Number.isFinite(n)) : [];
  } catch {
    return [];
  }
}

export const RecentlyViewed: React.FC<{ currentId?: number }> = ({ currentId }) => {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    if (!currentId || isNaN(currentId)) return;
    const prev = read();
    const next = [currentId, ...prev.filter((n) => n !== currentId)].slice(0, 12);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage full or blocked */ }
    const all = commerceStore.getProducts().filter((p) => p.status === 'published');
    setItems(prev.filter((n) => n !== currentId).map((id) => all.find((p) => p.id === id)).filter(Boolean).slice(0, 4) as Product[]);
  }, [currentId]);

  if (!items.length) return null;
  return (
    <section className="flex flex-col gap-6 pt-8 border-t border-neutral-100" data-testid="recently-viewed">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-[#111111]">شاهدتها مؤخراً</h3>
          <p className="text-xs text-neutral-400">عد إلى المقتنيات التي تصفحتها قبل قليل.</p>
        </div>
        <button
          type="button"
          onClick={() => { try { localStorage.removeItem(KEY); } catch { /* ignore */ } setItems([]); }}
          className="text-xs font-black text-neutral-400 hover:text-[#008F68]"
        >
          مسح السجل
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((p) => (
          <ProductCard key={`rv-${p.id}`} product={p} />
        ))}
      </div>
    </section>
  );
};
