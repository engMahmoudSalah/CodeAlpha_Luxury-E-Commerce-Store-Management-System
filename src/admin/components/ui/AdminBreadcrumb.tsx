import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';
import { BreadcrumbItem } from '../../types';

interface AdminBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const AdminBreadcrumb: React.FC<AdminBreadcrumbProps> = ({
  items,
  className = '',
}) => {
  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="مسار التنقل"
      className={`flex items-center gap-1.5 text-xs text-[#6B6860] flex-wrap ${className}`}
    >
      <Link
        to="/admin"
        className="flex items-center gap-1 hover:text-[#00875A] transition-colors p-1 rounded-md"
        title="لوحة التحكم"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={`${item.label}-${index}`}>
            <ChevronLeft className="w-3 h-3 text-[#9E9A90] shrink-0" />
            {isLast || !item.path ? (
              <span
                className={`font-semibold ${
                  isLast ? 'text-[#181818]' : 'text-[#6B6860]'
                }`}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            ) : (
              <Link
                to={item.path}
                className="hover:text-[#00875A] transition-colors"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
