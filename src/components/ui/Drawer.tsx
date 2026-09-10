import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  position?: 'right' | 'left' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  id?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  position = 'right',
  size = 'md',
  id,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    right: {
      sm: 'max-w-xs',
      md: 'max-w-sm sm:max-w-md',
      lg: 'max-w-lg sm:max-w-xl',
      xl: 'max-w-2xl',
      full: 'max-w-full',
    },
    left: {
      sm: 'max-w-xs',
      md: 'max-w-sm sm:max-w-md',
      lg: 'max-w-lg sm:max-w-xl',
      xl: 'max-w-2xl',
      full: 'max-w-full',
    },
    bottom: {
      sm: 'max-h-[30vh]',
      md: 'max-h-[50vh]',
      lg: 'max-h-[75vh]',
      xl: 'max-h-[90vh]',
      full: 'max-h-full',
    },
  };

  const positionClasses = {
    right: 'inset-y-0 right-0 w-full animate-slideLeft',
    left: 'inset-y-0 left-0 w-full animate-slideRight',
    bottom: 'inset-x-0 bottom-0 w-full rounded-t-3xl animate-slideUp',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex bg-black/50 backdrop-blur-xs font-arabic"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      dir="rtl"
    >
      <div
        id={id}
        className={`fixed bg-[#FAF8F3] border-[#E8E3D8] shadow-2xl flex flex-col z-50 text-[#181818] ${
          position === 'bottom' ? 'border-t' : position === 'right' ? 'border-l' : 'border-r'
        } ${positionClasses[position]} ${sizeClasses[position][size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E3D8] bg-white">
          {title ? (
            <h2 className="text-base font-extrabold text-[#181818] tracking-tight">{title}</h2>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="w-8 h-8 rounded-full bg-[#FAF8F3] border border-[#E8E3D8] text-[#8C887F] hover:text-[#181818] hover:bg-[#EFECE5] transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-[#E8E3D8] bg-white">{footer}</div>
        )}
      </div>
    </div>
  );
};
