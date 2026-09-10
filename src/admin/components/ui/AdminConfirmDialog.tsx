import React from 'react';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { AdminModal } from './AdminModal';
import { AdminButton } from './AdminButton';

interface AdminConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export const AdminConfirmDialog: React.FC<AdminConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  variant = 'danger',
  isLoading = false,
}) => {
  const iconConfig = {
    danger: {
      icon: AlertTriangle,
      bg: 'bg-rose-50',
      color: 'text-rose-600',
      border: 'border-rose-200',
      btnVariant: 'danger' as const,
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-amber-50',
      color: 'text-amber-600',
      border: 'border-amber-200',
      btnVariant: 'primary' as const,
    },
    primary: {
      icon: CheckCircle2,
      bg: 'bg-emerald-50',
      color: 'text-[#00875A]',
      border: 'border-emerald-200',
      btnVariant: 'primary' as const,
    },
  };

  const config = iconConfig[variant];
  const Icon = config.icon;

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onClose}
      size="sm"
      showCloseButton={!isLoading}
      footer={
        <>
          <AdminButton
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </AdminButton>
          <AdminButton
            variant={config.btnVariant}
            size="md"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </AdminButton>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${config.bg} ${config.color} ${config.border}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-base font-bold text-[#181818]">{title}</h4>
          <div className="text-xs sm:text-sm text-[#6B6860] mt-1.5 leading-relaxed">
            {message}
          </div>
        </div>
      </div>
    </AdminModal>
  );
};
