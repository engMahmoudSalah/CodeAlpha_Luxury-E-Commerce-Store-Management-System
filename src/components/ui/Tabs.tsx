import React from 'react';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'pills' | 'underline' | 'contained';
  size?: 'sm' | 'md';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'pills',
  size = 'md',
  className = '',
}) => {
  return (
    <div
      role="tablist"
      className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar font-arabic ${
        variant === 'contained' ? 'p-1.5 bg-[#EFECE5] rounded-full border border-[#E5E0D6]' : ''
      } ${
        variant === 'underline' ? 'border-b border-[#E8E3D8] gap-6' : ''
      } ${className}`}
      dir="rtl"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        let style = '';
        if (variant === 'pills') {
          style = isActive
            ? 'bg-[#00875A] text-white shadow-xs font-extrabold'
            : 'bg-white hover:bg-[#F3EFE6] text-[#5A5852] hover:text-[#181818] border border-[#E8E3D8] font-bold';
        } else if (variant === 'contained') {
          style = isActive
            ? 'bg-white text-[#00875A] shadow-2xs font-extrabold'
            : 'text-[#5A5852] hover:text-[#181818] font-bold';
        } else if (variant === 'underline') {
          style = isActive
            ? 'text-[#00875A] border-b-2 border-[#00875A] font-extrabold pb-3 -mb-px'
            : 'text-[#8C887F] hover:text-[#181818] font-bold pb-3 -mb-px';
        }

        const sizeStyle = size === 'sm' ? 'text-xs px-3.5 py-1.5 rounded-full' : 'text-xs sm:text-sm px-4.5 py-2 rounded-full';

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center gap-2 whitespace-nowrap transition-all duration-200 cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed ${style} ${
              variant !== 'underline' ? sizeStyle : ''
            }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge && <span className="shrink-0">{tab.badge}</span>}
          </button>
        );
      })}
    </div>
  );
};
