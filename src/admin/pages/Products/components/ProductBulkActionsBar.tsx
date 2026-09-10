import React from 'react';
import { CheckSquare, Trash2, Globe, FileEdit, Archive, X, Download } from 'lucide-react';
import { ProductStatus } from '../../../types';

interface ProductBulkActionsBarProps {
  selectedCount: number;
  totalVisible: number;
  onClearSelection: () => void;
  onBulkStatusChange: (status: ProductStatus) => void;
  onBulkDelete: () => void;
  onBulkExport: () => void;
  isProcessing: boolean;
}

export const ProductBulkActionsBar: React.FC<ProductBulkActionsBarProps> = ({
  selectedCount,
  totalVisible,
  onClearSelection,
  onBulkStatusChange,
  onBulkDelete,
  onBulkExport,
  isProcessing,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div
      id="product-bulk-actions-bar"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-stone-700/60 flex flex-wrap items-center gap-4 animate-in fade-in slide-in-from-bottom-5 duration-200 backdrop-blur-md"
    >
      {/* Selected Counter */}
      <div className="flex items-center gap-2 pr-2 border-l border-stone-700 text-sm font-medium text-amber-400">
        <CheckSquare className="w-4 h-4 text-amber-400" />
        <span>تم تحديد {selectedCount} من {totalVisible} منتج</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => onBulkStatusChange('published')}
          disabled={isProcessing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>نشر المحدد</span>
        </button>

        <button
          onClick={() => onBulkStatusChange('draft')}
          disabled={isProcessing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg transition-colors border border-stone-700 disabled:opacity-50"
        >
          <FileEdit className="w-3.5 h-3.5" />
          <span>تحويل لمسودة</span>
        </button>

        <button
          onClick={() => onBulkStatusChange('archived')}
          disabled={isProcessing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg transition-colors border border-stone-700 disabled:opacity-50"
        >
          <Archive className="w-3.5 h-3.5" />
          <span>أرشفة</span>
        </button>

        <button
          onClick={onBulkExport}
          disabled={isProcessing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-lg transition-colors border border-stone-700 disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>تصدير</span>
        </button>

        <button
          onClick={onBulkDelete}
          disabled={isProcessing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-rose-900/80 hover:bg-rose-700 text-rose-100 rounded-lg transition-colors border border-rose-800/50 disabled:opacity-50"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-300" />
          <span>حذف المحدد</span>
        </button>
      </div>

      {/* Clear Button */}
      <button
        onClick={onClearSelection}
        className="text-stone-400 hover:text-white p-1 rounded-md hover:bg-stone-800 transition-colors ml-1"
        title="إلغاء التحديد"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
