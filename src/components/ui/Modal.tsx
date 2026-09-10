import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
  id?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
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

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-xs animate-fadeIn font-arabic"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      dir="rtl"
    >
      <div
        id={id}
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-[#FAF8F3] border border-[#E8E3D8] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-[#181818] animate-scaleUp`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="إغلاق النافذة"
          className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white border border-[#E8E3D8] text-[#8C887F] hover:text-[#181818] hover:bg-[#F3EFE6] transition-colors z-10 flex items-center justify-center cursor-pointer shadow-2xs"
        >
          <X className="w-4 h-4" />
        </button>

        {title && (
          <div className="px-6 py-4 border-b border-[#E8E3D8] bg-white flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-extrabold text-[#181818] tracking-tight">{title}</h2>
          </div>
        )}

        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};


