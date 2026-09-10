import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  showHome = true,
  className = '',
}) => {
  return (
    <nav
      aria-label="مسار التنقل"
      className={`flex items-center gap-1.5 text-xs text-[#8C887F] font-arabic overflow-x-auto no-scrollbar py-2 ${className}`}
      dir="rtl"
    >
      {showHome && (
        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-1 text-[#5A5852] hover:text-[#00875A] transition-colors"
            aria-label="الرئيسية"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="font-bold">الرئيسية</span>
          </Link>
          <ChevronLeft className="w-3.5 h-3.5 text-[#CDC7BA] shrink-0" />
        </div>
      )}

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={`breadcrumb-${index}`} className="flex items-center gap-1.5 shrink-0">
            {item.path && !isLast ? (
              <Link
                to={item.path}
                className="text-[#5A5852] hover:text-[#00875A] transition-colors font-bold"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={`font-extrabold truncate max-w-[200px] sm:max-w-xs ${
                  isLast ? 'text-[#181818]' : 'text-[#5A5852]'
                }`}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
            {!isLast && <ChevronLeft className="w-3.5 h-3.5 text-[#CDC7BA] shrink-0" />}
          </div>
        );
      })}
    </nav>
  );
};
