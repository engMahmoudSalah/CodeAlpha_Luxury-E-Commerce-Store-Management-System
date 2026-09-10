import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  Plus,
  Search,
  Star,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Archive,
  FileEdit,
  LayoutGrid,
  List,
  Sparkles,
  ExternalLink,
  AlertTriangle,
  PackageCheck
} from 'lucide-react';
import { adminService } from '../../services';
import { AdminCollection } from '../../types';
import { useToast } from '../../../context/ToastContext';
import { CollectionModal } from '../../components/collections/CollectionModal';
import { commerceEventBus } from '../../../shared/events/commerceEvents';

export const AdminCollectionsPage: React.FC = () => {
  const { showToast } = useToast();

  const [collections, setCollections] = useState<AdminCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'archived'>('all');
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured' | 'regular'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [collectionToEdit, setCollectionToEdit] = useState<AdminCollection | null>(null);

  // Delete Confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<AdminCollection | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const data = await adminService.getCollections();
      setCollections(data);
    } catch (err: any) {
      showToast('تعذر تحميل بيانات المجموعات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
    const unsubCol = commerceEventBus.subscribe('COLLECTION_UPDATED', () => {
      loadCollections();
    });
    const unsubProd = commerceEventBus.subscribe('PRODUCT_UPDATED', () => {
      loadCollections();
    });
    return () => {
      unsubCol();
      unsubProd();
    };
  }, []);

  // Filtering
  const filteredCollections = useMemo(() => {
    return collections.filter((col) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = col.title.toLowerCase().includes(q);
        const matchesSlug = col.slug.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSlug) return false;
      }
      if (statusFilter !== 'all' && col.status !== statusFilter) {
        return false;
      }
      if (featuredFilter === 'featured' && !col.featured) return false;
      if (featuredFilter === 'regular' && col.featured) return false;

      return true;
    });
  }, [collections, searchQuery, statusFilter, featuredFilter]);

  // Handlers
  const handleCreateOrUpdate = async (
    data: Omit<AdminCollection, 'id' | 'createdAt' | 'productsCount'>
  ) => {
    try {
      if (collectionToEdit) {
        await adminService.updateCollection(collectionToEdit.id, data);
        showToast(`تم تحديث مجموعة "${data.title}" بنجاح`, 'success');
      } else {
        await adminService.createCollection(data);
        showToast(`تم إنشاء مجموعة "${data.title}" بنجاح`, 'success');
      }
      await loadCollections();
    } catch (err: any) {
      showToast('حدث خطأ أثناء حفظ المجموعة', 'error');
    }
  };

  const handleToggleFeatured = async (col: AdminCollection, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await adminService.toggleCollectionFeatured(col.id);
      setCollections((prev) =>
        prev.map((c) => (c.id === col.id ? { ...c, featured: !c.featured } : c))
      );
      showToast(
        !col.featured
          ? `تم تمييز مجموعة "${col.title}" في الواجهة`
          : `تمت إزالة تمييز مجموعة "${col.title}"`,
        'success'
      );
    } catch (err: any) {
      showToast('تعذر تغيير التمييز', 'error');
    }
  };

  const handleStatusChange = async (col: AdminCollection, status: 'active' | 'draft' | 'archived', e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await adminService.updateCollectionStatus(col.id, status);
      setCollections((prev) =>
        prev.map((c) => (c.id === col.id ? { ...c, status } : c))
      );
      showToast(`تم تغيير حالة المجموعة إلى ${status === 'active' ? 'نشطة' : status === 'draft' ? 'مسودة' : 'مؤرشفة'}`, 'success');
    } catch (err: any) {
      showToast('تعذر تغيير حالة المجموعة', 'error');
    }
  };

  const confirmDelete = (col: AdminCollection, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollectionToDelete(col);
    setDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!collectionToDelete) return;
    try {
      setIsDeleting(true);
      await adminService.deleteCollection(collectionToDelete.id);
      showToast(`تم حذف مجموعة "${collectionToDelete.title}" بنجاح`, 'success');
      setDeleteDialogOpen(false);
      setCollectionToDelete(null);
      await loadCollections();
    } catch (err: any) {
      showToast('تعذر حذف المجموعة', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const openAddModal = () => {
    setCollectionToEdit(null);
    setModalOpen(true);
  };

  const openEditModal = (col: AdminCollection, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollectionToEdit(col);
    setModalOpen(true);
  };

  // Metrics
  const totalCollections = collections.length;
  const activeCount = collections.filter((c) => c.status === 'active').length;
  const featuredCount = collections.filter((c) => c.featured).length;
  const totalProducts = collections.reduce((sum, c) => sum + (c.productsCount || 0), 0);

  const getStatusBadge = (status: AdminCollection['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#E6F4EE] text-[#00875A] border border-[#00875A]/20 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span>نشطة</span>
          </span>
        );
      case 'draft':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            <FileEdit className="w-3.5 h-3.5" />
            <span>مسودة</span>
          </span>
        );
      case 'archived':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#F2EFE8] text-[#5A5852] border border-[#E8E3D8] flex items-center gap-1">
            <Archive className="w-3.5 h-3.5" />
            <span>مؤرشفة</span>
          </span>
        );
    }
  };

  return (
    <div id="admin-collections-page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#181818] tracking-tight font-arabic flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-[#00875A]" />
            <span>المجموعات الملكية والحملات</span>
          </h1>
          <p className="text-sm text-[#5A5852] mt-1 font-arabic">
            إدارة التشكيلات الترويجية، بوكسات الهدايا الموسمية، وعروض كبار الشخصيات
          </p>
        </div>

        <button
          id="add-collection-main-btn"
          type="button"
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-[#00875A] text-white text-sm font-bold hover:bg-[#00704A] transition-colors shadow-sm cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء مجموعة جديدة</span>
        </button>
      </div>

      {/* Stats Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E8E3D8] shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] flex items-center justify-center text-[#181818]">
            <Layers className="w-5 h-5 text-[#00875A]" />
          </div>
          <div>
            <span className="text-xs text-[#5A5852] block font-arabic">إجمالي المجموعات</span>
            <span className="text-xl font-black text-[#181818] font-arabic">
              {totalCollections.toLocaleString('ar-SA')}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8E3D8] shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#E6F4EE] border border-[#00875A]/20 flex items-center justify-center text-[#00875A]">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-[#5A5852] block font-arabic">المجموعات النشطة</span>
            <span className="text-xl font-black text-[#00875A] font-arabic">
              {activeCount.toLocaleString('ar-SA')}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8E3D8] shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <span className="text-xs text-[#5A5852] block font-arabic">مميزة في الواجهة</span>
            <span className="text-xl font-black text-amber-700 font-arabic">
              {featuredCount.toLocaleString('ar-SA')}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8E3D8] shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] flex items-center justify-center text-[#181818]">
            <PackageCheck className="w-5 h-5 text-[#5A5852]" />
          </div>
          <div>
            <span className="text-xs text-[#5A5852] block font-arabic">المنتجات المختارة</span>
            <span className="text-xl font-black text-[#181818] font-arabic">
              {totalProducts.toLocaleString('ar-SA')}
            </span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E3D8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5A5852]" />
          <input
            id="collections-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث عن مجموعة أو حملة..."
            className="w-full pr-10 pl-4 py-2 rounded-xl border border-[#E8E3D8] bg-[#FAF8F5] text-sm text-[#181818] placeholder-[#5A5852] focus:outline-none focus:border-[#00875A] transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            id="collections-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-[#E8E3D8] bg-white text-xs font-bold text-[#181818] focus:outline-none focus:border-[#00875A] cursor-pointer"
          >
            <option value="all">كل الحالات</option>
            <option value="active">النشطة فقط</option>
            <option value="draft">المسودات</option>
            <option value="archived">المؤرشفة</option>
          </select>

          <select
            id="collections-featured-filter"
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-[#E8E3D8] bg-white text-xs font-bold text-[#181818] focus:outline-none focus:border-[#00875A] cursor-pointer"
          >
            <option value="all">الكل</option>
            <option value="featured">المميزة فقط ⭐</option>
            <option value="regular">غير المميزة</option>
          </select>

          <div className="flex items-center bg-[#FAF8F5] p-1 rounded-xl border border-[#E8E3D8]">
            <button
              id="view-collections-grid-btn"
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-[#00875A] shadow-xs'
                  : 'text-[#5A5852] hover:text-[#181818]'
              }`}
              title="عرض بطاقات بانر"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              id="view-collections-table-btn"
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-[#00875A] shadow-xs'
                  : 'text-[#5A5852] hover:text-[#181818]'
              }`}
              title="عرض جدول"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-[#E8E3D8]">
          <div className="w-10 h-10 border-3 border-[#00875A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-[#5A5852] font-arabic">جاري تحميل المجموعات الملكية...</p>
        </div>
      ) : filteredCollections.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-[#E8E3D8] p-6">
          <Layers className="w-12 h-12 text-[#5A5852]/40 mx-auto mb-3" />
          <h3 className="text-base font-extrabold text-[#181818] mb-1 font-arabic">
            لا توجد مجموعات مطابقة للبحث
          </h3>
          <p className="text-xs text-[#5A5852] mb-4">
            جرب تعديل الفلاتر أو أنشئ تشكيلة تسويقية ملكية جديدة
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* BANNER GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCollections.map((col, idx) => (
            <div
              key={`admin-col-grid-${col.id || idx}-${idx}`}
              className="bg-white rounded-2xl border border-[#E8E3D8] overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group"
            >
              {/* Banner Cover */}
              <div className="relative h-48 w-full bg-[#FAF8F5] overflow-hidden">
                <img
                  src={col.image}
                  alt={col.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-3.5 right-3.5 flex items-center gap-2">
                  {getStatusBadge(col.status)}
                  {col.featured && (
                    <span className="px-2 py-1 rounded-lg bg-amber-500 text-white text-[11px] font-bold shadow-xs flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-white" />
                      <span>بارز</span>
                    </span>
                  )}
                </div>

                {/* Bottom Overlay Title */}
                <div className="absolute bottom-3.5 right-3.5 left-3.5 text-white">
                  <span className="text-[11px] font-bold text-amber-300 tracking-wider block mb-1">
                    {col.productsCount} قطعة مختارة
                  </span>
                  <h3 className="font-extrabold text-lg leading-tight font-arabic drop-shadow-xs">
                    {col.title}
                  </h3>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <p className="text-xs text-[#5A5852] line-clamp-2 leading-relaxed">
                    {col.description || 'تشكيلة مختارة من أندر مقتنيات المتجر.'}
                  </p>
                  <div className="mt-2.5">
                    <span className="text-[11px] font-mono bg-[#FAF8F5] text-[#5A5852] px-2.5 py-1 rounded-md border border-[#E8E3D8]">
                      /{col.slug}
                    </span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-[#E8E3D8] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleToggleFeatured(col, e)}
                    className={`text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                      col.featured ? 'text-amber-700' : 'text-[#5A5852] hover:text-[#181818]'
                    }`}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        col.featured ? 'fill-amber-500 text-amber-500' : ''
                      }`}
                    />
                    <span>{col.featured ? 'مميز' : 'تمييز بالرئيسية'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => openEditModal(col, e)}
                      className="p-2 rounded-xl border border-[#E8E3D8] bg-white text-[#5A5852] hover:text-[#00875A] hover:bg-[#E6F4EE] transition-colors cursor-pointer"
                      title="تعديل المجموعة"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => confirmDelete(col, e)}
                      className="p-2 rounded-xl border border-[#E8E3D8] bg-white text-[#5A5852] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="حذف المجموعة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-[#E8E3D8] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E8E3D8] text-[11px] font-bold text-[#5A5852] uppercase tracking-wider font-arabic">
                  <th className="py-3.5 px-4">المجموعة الملكية</th>
                  <th className="py-3.5 px-4">الاسم اللطيف (Slug)</th>
                  <th className="py-3.5 px-4">عدد المنتجات</th>
                  <th className="py-3.5 px-4">الحالة</th>
                  <th className="py-3.5 px-4">مميز</th>
                  <th className="py-3.5 px-4 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E3D8] text-xs">
                {filteredCollections.map((col, idx) => (
                  <tr
                    key={`admin-col-tbl-${col.id || idx}-${idx}`}
                    className="hover:bg-[#FAF8F5]/80 transition-colors cursor-default"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 rounded-xl border border-[#E8E3D8] overflow-hidden shrink-0 bg-[#FAF8F5]">
                          <img
                            src={col.image}
                            alt={col.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <span className="font-extrabold text-sm text-[#181818] block font-arabic">
                            {col.title}
                          </span>
                          <span className="text-[11px] text-[#5A5852] line-clamp-1">
                            {col.description || 'لا يوجد وصف'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#5A5852]">/{col.slug}</td>
                    <td className="py-3 px-4 font-bold text-[#181818] font-arabic">
                      {col.productsCount} منتج
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(col.status)}</td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={(e) => handleToggleFeatured(col, e)}
                        className="cursor-pointer"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            col.featured
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-[#E8E3D8] hover:text-[#5A5852]'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-left">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => openEditModal(col, e)}
                          className="p-1.5 rounded-lg border border-[#E8E3D8] bg-white text-[#5A5852] hover:text-[#00875A] hover:bg-[#E6F4EE] transition-colors cursor-pointer"
                          title="تعديل"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => confirmDelete(col, e)}
                          className="p-1.5 rounded-lg border border-[#E8E3D8] bg-white text-[#5A5852] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Collection Modal */}
      <CollectionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setCollectionToEdit(null);
        }}
        onSave={handleCreateOrUpdate}
        collectionToEdit={collectionToEdit}
      />

      {/* Delete Modal */}
      {deleteDialogOpen && collectionToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E8E3D8] shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-extrabold text-lg text-[#181818] mb-2 font-arabic">
              تأكيد حذف مجموعة "{collectionToDelete.title}"
            </h3>

            <p className="text-xs text-[#5A5852] leading-relaxed mb-4">
              هل أنت متأكد من رغبتك في حذف هذه المجموعة التسويقية؟ سيتم إلغاء ارتباط المنتجات بها
              دون حذف المنتجات نفسها.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setCollectionToDelete(null);
                }}
                className="px-4 py-2 rounded-xl border border-[#E8E3D8] bg-white text-xs font-bold text-[#5A5852] hover:bg-[#FAF8F5] cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={executeDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>نعم، حذف المجموعة</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
