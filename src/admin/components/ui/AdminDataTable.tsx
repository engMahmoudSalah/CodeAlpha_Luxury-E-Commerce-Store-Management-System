import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Search,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Eye,
  CheckSquare,
  Square,
  AlertCircle,
  Inbox
} from 'lucide-react';
import { AdminButton } from './AdminButton';
import { AdminSkeleton } from './AdminSkeleton';

export interface ColumnDef<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export interface BulkActionOption {
  id: string;
  label: string;
  icon?: React.ElementType;
  variant?: 'primary' | 'danger' | 'outline' | 'secondary';
  onClick: (selectedIds: (string | number)[]) => void;
}

interface AdminDataTableProps<T extends { id: string | number }> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;

  // Search & Filter
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  filterComponent?: React.ReactNode;

  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (columnId: string) => void;

  // Pagination
  page?: number;
  totalPages?: number;
  totalCount?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;

  // Selection & Bulk Actions
  selectable?: boolean;
  selectedIds?: (string | number)[];
  onToggleSelectAll?: () => void;
  onToggleSelectItem?: (id: string | number) => void;
  onClearSelection?: () => void;
  bulkActions?: BulkActionOption[];

  // Empty State
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;

  // Primary action button (e.g. "+ Add Product")
  primaryAction?: React.ReactNode;
}

export function AdminDataTable<T extends { id: string | number }>({
  columns,
  data,
  loading = false,
  error = null,
  onRetry,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'بحث...',
  filterComponent,
  sortBy,
  sortOrder,
  onSort,
  page = 1,
  totalPages = 1,
  totalCount = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  selectable = false,
  selectedIds = [],
  onToggleSelectAll,
  onToggleSelectItem,
  onClearSelection,
  bulkActions = [],
  emptyTitle = 'لا توجد بيانات متاحة',
  emptyDescription = 'لم يتم العثور على أي عناصر مطابقة في الوقت الحالي.',
  emptyAction,
  primaryAction,
}: AdminDataTableProps<T>) {
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(columns.map((c) => c.id));
  const [colMenuOpen, setColMenuOpen] = useState(false);

  const isAllSelected = data.length > 0 && selectedIds.length === data.length;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < data.length;

  const toggleColumnVisibility = (colId: string) => {
    setVisibleColumns((prev) =>
      prev.includes(colId) ? prev.filter((id) => id !== colId) : [...prev, colId]
    );
  };

  const displayedColumns = columns.filter((col) => visibleColumns.includes(col.id));

  return (
    <div className="space-y-4" dir="rtl">
      {/* Table Toolbar (Search, Filter Button, Column Picker, Primary Action) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E8E3D8] shadow-sm">
        <div className="flex items-center gap-2.5 flex-1 max-w-md">
          {onSearchChange && (
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-4 pr-10 py-2 text-xs bg-[#FAF8F3] border border-[#E8E3D8] rounded-xl focus:bg-white focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/20 transition-all text-[#181818] placeholder:text-[#9E9A90] outline-none"
              />
              <Search className="w-4 h-4 text-[#9E9A90] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          {filterComponent && (
            <button
              type="button"
              onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
              className={`p-2 border rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
                filterDrawerOpen
                  ? 'bg-[#00875A] text-white border-[#00875A]'
                  : 'bg-[#FAF8F3] text-[#5A5852] border-[#E8E3D8] hover:bg-[#F3EFE6] hover:text-[#181818]'
              }`}
              title="تصفية البيانات"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">فلاتر</span>
            </button>
          )}

          {/* Column Visibility Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setColMenuOpen(!colMenuOpen)}
              className="p-2 bg-[#FAF8F3] hover:bg-[#F3EFE6] border border-[#E8E3D8] rounded-xl text-[#5A5852] hover:text-[#181818] transition-colors"
              title="تخصيص الأعمدة"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            {colMenuOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl border border-[#E8E3D8] shadow-lg p-2 z-30 space-y-1">
                <div className="text-[11px] font-bold text-[#6B6860] px-2 py-1 border-b border-[#F0ECE4]">
                  الأعمدة الظاهرة
                </div>
                {columns.map((col) => (
                  <label
                    key={col.id}
                    className="flex items-center gap-2 px-2 py-1 text-xs text-[#181818] hover:bg-[#FAF8F3] rounded-lg cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumns.includes(col.id)}
                      onChange={() => toggleColumnVisibility(col.id)}
                      className="rounded border-[#E8E3D8] text-[#00875A] focus:ring-[#00875A]"
                    />
                    <span className="truncate">{col.header}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {primaryAction && <div className="shrink-0">{primaryAction}</div>}
      </div>

      {/* Embedded Filter Component Row */}
      {filterDrawerOpen && filterComponent && (
        <div className="bg-[#FAF8F3] p-4 rounded-2xl border border-[#E8E3D8] shadow-inner animate-fadeIn">
          {filterComponent}
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      {selectable && selectedIds.length > 0 && (
        <div className="sticky top-20 z-20 bg-[#181818] text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between gap-4 border border-[#262626] animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-[#00875A] text-white text-xs flex items-center justify-center font-bold">
              {selectedIds.length}
            </span>
            <span className="text-xs font-semibold">عناصر محددة</span>
          </div>

          <div className="flex items-center gap-2">
            {bulkActions.map((action) => {
              const ActionIcon = action.icon;
              return (
                <AdminButton
                  key={action.id}
                  variant={action.variant || 'secondary'}
                  size="sm"
                  onClick={() => action.onClick(selectedIds)}
                  icon={ActionIcon}
                >
                  {action.label}
                </AdminButton>
              );
            })}
            <button
              type="button"
              onClick={onClearSelection}
              className="text-xs text-neutral-400 hover:text-white px-2 py-1 underline font-medium"
            >
              إلغاء التحديد
            </button>
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-[#E8E3D8] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-[#E8E3D8] bg-[#FAF8F3]/70 text-[#5A5852] text-xs font-bold uppercase tracking-wider">
                {selectable && (
                  <th className="p-4 w-12 text-center">
                    <button
                      type="button"
                      onClick={onToggleSelectAll}
                      className="text-[#5A5852] hover:text-[#00875A] transition-colors focus:outline-none"
                    >
                      {isAllSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#00875A]" />
                      ) : isSomeSelected ? (
                        <div className="w-4 h-4 rounded bg-[#00875A]/20 border border-[#00875A] flex items-center justify-center">
                          <div className="w-2 h-0.5 bg-[#00875A]" />
                        </div>
                      ) : (
                        <Square className="w-4 h-4 text-[#9E9A90]" />
                      )}
                    </button>
                  </th>
                )}

                {displayedColumns.map((col) => {
                  const isSorted = sortBy === col.id;
                  return (
                    <th
                      key={col.id}
                      className={`p-4 text-xs font-bold text-[#5A5852] ${
                        col.align === 'center'
                          ? 'text-center'
                          : col.align === 'left'
                          ? 'text-left'
                          : 'text-right'
                      } ${col.className || ''}`}
                    >
                      {col.sortable && onSort ? (
                        <button
                          type="button"
                          onClick={() => onSort(col.id)}
                          className="inline-flex items-center gap-1.5 hover:text-[#181818] font-bold group select-none"
                        >
                          <span>{col.header}</span>
                          {isSorted ? (
                            sortOrder === 'asc' ? (
                              <ChevronUp className="w-3.5 h-3.5 text-[#00875A]" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-[#00875A]" />
                            )
                          ) : (
                            <ChevronsUpDown className="w-3.5 h-3.5 text-[#9E9A90] opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </button>
                      ) : (
                        <span>{col.header}</span>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F0ECE4] text-xs text-[#181818]">
              {loading ? (
                // Loading Skeleton Rows
                Array.from({ length: pageSize || 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse">
                    {selectable && (
                      <td className="p-4 text-center">
                        <AdminSkeleton variant="circle" width="16px" height="16px" />
                      </td>
                    )}
                    {displayedColumns.map((col) => (
                      <td key={col.id} className="p-4">
                        <AdminSkeleton variant="text" width={col.id === 'name' ? '70%' : '50%'} height="16px" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : error ? (
                // Error State Row
                <tr>
                  <td colSpan={displayedColumns.length + (selectable ? 1 : 0)} className="p-12 text-center">
                    <div className="max-w-md mx-auto flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-[#181818]">تعذر تحميل البيانات</h4>
                      <p className="text-xs text-[#6B6860]">{error}</p>
                      {onRetry && (
                        <AdminButton variant="outline" size="sm" onClick={onRetry} icon={RefreshCw}>
                          إعادة المحاولة
                        </AdminButton>
                      )}
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                // Empty State Row
                <tr>
                  <td colSpan={displayedColumns.length + (selectable ? 1 : 0)} className="p-12 text-center">
                    <div className="max-w-md mx-auto flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#FAF8F3] text-[#9E9A90] border border-[#E8E3D8] flex items-center justify-center">
                        <Inbox className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-[#181818]">{emptyTitle}</h4>
                      <p className="text-xs text-[#6B6860]">{emptyDescription}</p>
                      {emptyAction && <div className="mt-2">{emptyAction}</div>}
                    </div>
                  </td>
                </tr>
              ) : (
                // Data Rows
                data.map((row, index) => {
                  const isSelected = selectedIds.includes(row.id);
                  return (
                    <tr
                      key={String(row.id)}
                      className={`hover:bg-[#FAF8F3] transition-colors group ${
                        isSelected ? 'bg-[#E6F4EE]/40' : ''
                      }`}
                    >
                      {selectable && (
                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => onToggleSelectItem && onToggleSelectItem(row.id)}
                            className="text-[#5A5852] hover:text-[#00875A] transition-colors focus:outline-none"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-[#00875A]" />
                            ) : (
                              <Square className="w-4 h-4 text-[#9E9A90]" />
                            )}
                          </button>
                        </td>
                      )}

                      {displayedColumns.map((col) => {
                        return (
                          <td
                            key={col.id}
                            className={`p-4 ${
                              col.align === 'center'
                                ? 'text-center'
                                : col.align === 'left'
                                ? 'text-left'
                                : 'text-right'
                            } ${col.className || ''}`}
                          >
                            {col.cell
                              ? col.cell(row, index)
                              : col.accessorKey
                              ? String(row[col.accessorKey] ?? '—')
                              : '—'}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer & Pagination */}
        {!loading && data.length > 0 && onPageChange && (
          <div className="p-4 border-t border-[#E8E3D8] bg-[#FAF8F3]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs text-[#6B6860]">
              <span>
                عرض <strong>{data.length}</strong> من إجمالي <strong>{totalCount}</strong> عنصر
              </span>

              {onPageSizeChange && (
                <div className="flex items-center gap-1.5 mr-3">
                  <span>لكل صفحة:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    className="bg-white border border-[#E8E3D8] rounded-lg px-2 py-1 text-xs text-[#181818] outline-none focus:border-[#00875A]"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="p-2 rounded-xl border border-[#E8E3D8] bg-white text-[#5A5852] hover:bg-[#FAF8F3] disabled:opacity-40 disabled:pointer-events-none transition-colors"
                aria-label="الصفحة السابقة"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <span className="text-xs font-semibold px-3 py-1 bg-white border border-[#E8E3D8] rounded-xl text-[#181818]">
                {page} من {totalPages || 1}
              </span>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className="p-2 rounded-xl border border-[#E8E3D8] bg-white text-[#5A5852] hover:bg-[#FAF8F3] disabled:opacity-40 disabled:pointer-events-none transition-colors"
                aria-label="الصفحة التالية"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
