import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Compass, ShoppingBag, ArrowRight } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto font-arabic" dir="rtl">
      <div className="w-16 h-16 rounded-2xl bg-[#008F68]/10 border border-[#008F68]/20 flex items-center justify-center text-[#008F68] mb-6 shadow-xs">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="text-4xl sm:text-5xl font-black text-[#111111] tracking-tight mb-2 font-mono">404</h1>
      <h2 className="text-lg sm:text-xl font-bold text-[#111111] mb-3">الصفحة أو المقتنى غير موجود</h2>
      <p className="text-xs sm:text-sm text-neutral-500 mb-8 leading-relaxed">
        الوجهة التي تبحث عنها غير متوفرة حالياً أو تم نقلها إلى قسم آخر في المعرض الملكي.
      </p>
      <Link to="/">
        <Button variant="primary" size="lg" leftIcon={<ShoppingBag className="w-4 h-4" />}>
          العودة إلى المعرض الرئيسي
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
