import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ElementType;
  disabled?: boolean;
}

interface AdminTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'underline' | 'pills' | 'segmented';
  className?: string;
}

export const AdminTabs: React.FC<AdminTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  className = '',
}) => {
  if (variant === 'segmented') {
    return (
      <div
        className={`inline-flex items-center p-1 bg-[#FAF8F3] border border-[#E8E3D8] rounded-2xl gap-1 ${className}`}
        dir="rtl"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              disabled={tab.disabled}
              onClick={() => onChange(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all select-none ${
                isActive
                  ? 'bg-[#181818] text-white shadow-sm'
                  : 'text-[#6B6860] hover:text-[#181818] hover:bg-[#F3EFE6]'
              } ${tab.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-[#00875A] text-white' : 'bg-[#E8E3D8] text-[#5A5852]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'pills') {
    return (
      <div className={`flex flex-wrap items-center gap-1.5 ${className}`} dir="rtl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              disabled={tab.disabled}
              onClick={() => onChange(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all select-none border ${
                isActive
                  ? 'bg-[#00875A] text-white border-[#00875A] shadow-sm'
                  : 'bg-white text-[#5A5852] border-[#E8E3D8] hover:border-[#181818]/20 hover:text-[#181818]'
              } ${tab.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#F2EFE8] text-[#5A5852]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Default Underline
  return (
    <div className={`border-b border-[#E8E3D8] flex items-center gap-6 overflow-x-auto no-scrollbar ${className}`} dir="rtl">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            disabled={tab.disabled}
            onClick={() => onChange(tab.id)}
            className={`pb-3 text-xs font-bold flex items-center gap-2 transition-all relative shrink-0 select-none ${
              isActive ? 'text-[#00875A]' : 'text-[#6B6860] hover:text-[#181818]'
            } ${tab.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-[#E6F4EE] text-[#00875A]' : 'bg-[#FAF8F3] text-[#6B6860] border border-[#E8E3D8]'
                }`}
              >
                {tab.count}
              </span>
            )}

            {isActive && (
              <span className="absolute bottom-0 right-0 left-0 h-0.5 bg-[#00875A] rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
};
