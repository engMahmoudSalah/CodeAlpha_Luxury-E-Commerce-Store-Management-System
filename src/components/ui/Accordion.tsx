import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AccordionItem {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultExpandedIds?: string[];
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  defaultExpandedIds = [],
  className = '',
}) => {
  const [expandedIds, setExpandedIds] = useState<string[]>(defaultExpandedIds);

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setExpandedIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setExpandedIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={`flex flex-col gap-2.5 font-arabic ${className}`} dir="rtl">
      {items.map((item) => {
        const isExpanded = expandedIds.includes(item.id);

        return (
          <div
            key={item.id}
            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
              isExpanded
                ? 'bg-white border-[#CDC7BA] shadow-2xs'
                : 'bg-[#FAF8F3] border-[#E8E3D8] hover:border-[#CDC7BA]'
            } ${item.disabled ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <button
              type="button"
              onClick={() => toggleItem(item.id)}
              aria-expanded={isExpanded}
              className="w-full px-5 py-4 flex items-center justify-between text-right cursor-pointer gap-4"
            >
              <div className="flex items-center gap-3 font-bold text-xs sm:text-sm text-[#181818]">
                {item.icon && <span className="text-[#00875A] shrink-0">{item.icon}</span>}
                <span>{item.title}</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-[#8C887F] shrink-0 transition-transform duration-200 ${
                  isExpanded ? 'rotate-180 text-[#00875A]' : ''
                }`}
              />
            </button>
            {isExpanded && (
              <div className="px-5 pb-4 pt-1 text-xs text-[#5A5852] leading-relaxed border-t border-[#E8E3D8] bg-[#FAF8F3]/50">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
