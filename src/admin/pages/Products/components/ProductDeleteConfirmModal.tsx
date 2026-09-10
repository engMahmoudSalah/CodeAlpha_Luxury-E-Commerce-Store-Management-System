import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ProductDeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title?: string;
  itemCount?: number;
  isProcessing?: boolean;
}

export const ProductDeleteConfirmModal: React.FC<ProductDeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemCount = 1,
  isProcessing = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="product-delete-confirm-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/65 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-rose-100 overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl shrink-0 border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-stone-900">
                {itemCount > 1
                  ? `تأكيد حذف ${itemCount} منتجات محددة`
                  : 'تأكيد حذف المنتج'}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {title ? (
                  <>
                    هل أنت متأكد من رغبتك في حذف <strong className="text-stone-900">{title}</strong>؟
                  </>
                ) : (
                  'هل أنت متأكد من رغبتك في تنفيذ عملية الحذف للمنتجات المحددة؟'
                )}
                {' '}هذا الإجراء نهائي ولا يمكن التراجع عنه.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-stone-100">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {isProcessing ? 'جارٍ الحذف...' : 'نعم، احذف نهائياً'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
