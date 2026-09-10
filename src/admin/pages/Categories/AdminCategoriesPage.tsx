import React, { useState, useEffect, useMemo } from 'react';
import {
  FolderTree,
  Plus,
  Search,
  Filter,
  Eye,
  EyeOff,
  Star,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  MoveUp,
  MoveDown,
  Layers,
  LayoutGrid,
  List,
  Sparkles,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  PackageCheck
} from 'lucide-react';
import { adminService } from '../../services';
import { AdminCategory } from '../../types';
import { useToast } from '../../../context/ToastContext';
import { CategoryModal } from '../../components/categories/CategoryModal';
import { commerceEventBus } from '../../../shared/events/commerceEvents';

export const AdminCategoriesPage: React.FC = () => {
  const { showToast } = useToast();

  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'hidden'>('all');
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured' | 'regular'>('all');
  const [viewMode, setViewMode] = useState<'tree' | 'grid' | 'table'>('tree');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<AdminCategory | null>(null);

  // Delete Confirmation Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<AdminCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Expanded nodes in Tree View
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await adminService.getCategories();
      setCategories(data);
      // Auto expand all parents initially
      const initialExpanded: Record<string, boolean> = {};
      data.forEach((c) => {
        if (!c.parentId) initialExpanded[c.id] = true;
      });
      setExpandedNodes(initialExpanded);
    } catch (err: any) {
      showToast('تعذر تحميل بيانات التصنيفات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    const unsubCat = commerceEventBus.subscribe('CATEGORY_UPDATED', () => {
      loadCategories();
    });
    const unsubProd = commerceEventBus.subscribe('PRODUCT_UPDATED', () => {
      loadCategories();
    });
    return () => {
      unsubCat();
      unsubProd();
    };
  }, []);

  const toggleNodeExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter categories
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = cat.name.toLowerCase().includes(q);
        const matchesSlug = cat.slug.toLowerCase().includes(q);
        if (!matchesName && !matchesSlug) return false;
      }
      // Status
      if (statusFilter !== 'all' && cat.status !== statusFilter) {
        return false;
      }
      // Featured
      if (featuredFilter === 'featured' && !cat.featured) return false;
      if (featuredFilter === 'regular' && cat.featured) return false;

      return true;
    });
  }, [categories, searchQuery, statusFilter, featuredFilter]);

  // Separate parents and subcategories
  const parentCategories = useMemo(() => {
    return categories.filter((c) => !c.parentId);
  }, [categories]);

  const treeStructure = useMemo(() => {
    const parents = filteredCategories.filter((c) => !c.parentId);
    return parents.map((parent) => ({
      ...parent,
      children: filteredCategories.filter((c) => c.parentId === parent.id),
    }));
  }, [filteredCategories]);

  // Handlers
  const handleCreateOrUpdate = async (
    data: Omit<AdminCategory, 'id' | 'createdAt' | 'productCount'>
  ) => {
    try {
      if (categoryToEdit) {
        await adminService.updateCategory(categoryToEdit.id, data);
        showToast(`تم تحديث تصنيف "${data.name}" بنجاح`, 'success');
      } else {
        await adminService.createCategory(data);
        showToast(`تم إنشاء تصنيف "${data.name}" بنجاح`, 'success');
      }
      await loadCategories();
    } catch (err: any) {
      showToast('حدث خطأ أثناء حفظ التصنيف', 'error');
    }
  };

  const handleToggleStatus = async (cat: AdminCategory, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = cat.status === 'active' ? 'hidden' : 'active';
    try {
      await adminService.updateCategoryStatus(cat.id, newStatus);
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, status: newStatus } : c))
      );
      showToast(
        newStatus === 'active'
          ? `تم تفعيل ظهور "${cat.name}"`
          : `تم إخفاء تصنيف "${cat.name}"`,
        'success'
      );
    } catch (err: any) {
      showToast('تعذر تغيير حالة التصنيف', 'error');
    }
  };

  const handleToggleFeatured = async (cat: AdminCategory, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await adminService.toggleCategoryFeatured(cat.id);
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, featured: !c.featured } : c))
      );
      showToast(
        !cat.featured
          ? `تمت إضافة "${cat.name}" للتصنيفات المميزة`
          : `تمت إزالة "${cat.name}" من المميزة`,
        'success'
      );
    } catch (err: any) {
      showToast('تعذر تغيير حالة التمييز', 'error');
    }
  };

  const handleMoveOrder = async (cat: AdminCategory, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    const siblingList = categories
      .filter((c) => (cat.parentId ? c.parentId === cat.parentId : !c.parentId))
      .sort((a, b) => a.displayOrder - b.displayOrder);

    const currentIndex = siblingList.findIndex((c) => c.id === cat.id);
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === siblingList.length - 1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentItem = siblingList[currentIndex];
    const targetItem = siblingList[targetIndex];

    // Swap displayOrder
    const tempOrder = currentItem.displayOrder;
    currentItem.displayOrder = targetItem.displayOrder;
    targetItem.displayOrder = tempOrder;

    try {
      await adminService.updateCategory(currentItem.id, { displayOrder: currentItem.displayOrder });
      await adminService.updateCategory(targetItem.id, { displayOrder: targetItem.displayOrder });
      await loadCategories();
      showToast('تم تحديث ترتيب التصنيف', 'success');
    } catch (err: any) {
      showToast('تعذر تغيير الترتيب', 'error');
    }
  };

  const confirmDelete = (cat: AdminCategory, e: React.MouseEvent) => {
    e.stopPropagation();
    setCategoryToDelete(cat);
    setDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!categoryToDelete) return;
    try {
      setIsDeleting(true);
      await adminService.deleteCategory(categoryToDelete.id);
      showToast(`تم حذف تصنيف "${categoryToDelete.name}" بنجاح`, 'success');
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      await loadCategories();
    } catch (err: any) {
      showToast('تعذر حذف التصنيف', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const openAddModal = (parent?: AdminCategory) => {
    setCategoryToEdit(null);
    setModalOpen(true);
  };

  const openEditModal = (cat: AdminCategory, e: React.MouseEvent) => {
    e.stopPropagation();
    setCategoryToEdit(cat);
    setModalOpen(true);
  };

  // Metrics summary
  const totalCategories = categories.length;
  const activeCategories = categories.filter((c) => c.status === 'active').length;
  const featuredCategories = categories.filter((c) => c.featured).length;
  const totalProductsAssigned = categories.reduce((sum, c) => sum + (c.productCount || 0), 0);

  return (
    <div id="admin-categories-page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#181818] tracking-tight font-arabic flex items-center gap-2.5">
            <FolderTree className="w-7 h-7 text-[#00875A]" />
            <span>إدارة التصنيفات والكتالوج</span>
          </h1>
          <p className="text-sm text-[#5A5852] mt-1 font-arabic">
            تنظيم شجرة التصنيفات الملكية، ترتيب العرض، وضبط ظهور الأقسام في المتجر
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="add-category-main-btn"
            type="button"
            onClick={() => openAddModal()}
            className="px-4 py-2.5 rounded-xl bg-[#00875A] text-white text-sm font-bold hover:bg-[#00704A] transition-colors shadow-sm cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة تصنيف جديد</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E8E3D8] shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] flex items-center justify-center text-[#181818]">
            <FolderTree className="w-5 h-5 text-[#00875A]" />
          </div>
          <div>
            <span className="text-xs text-[#5A5852] block font-arabic">إجمالي التصنيفات</span>
            <span className="text-xl font-black text-[#181818] font-arabic">
              {totalCategories.toLocaleString('ar-SA')}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8E3D8] shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#E6F4EE] border border-[#00875A]/20 flex items-center justify-center text-[#00875A]">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-[#5A5852] block font-arabic">التصنيفات النشطة</span>
            <span className="text-xl font-black text-[#00875A] font-arabic">
              {activeCategories.toLocaleString('ar-SA')}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8E3D8] shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <span className="text-xs text-[#5A5852] block font-arabic">التصنيفات المميزة</span>
            <span className="text-xl font-black text-amber-700 font-arabic">
              {featuredCategories.toLocaleString('ar-SA')}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8E3D8] shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] flex items-center justify-center text-[#181818]">
            <PackageCheck className="w-5 h-5 text-[#5A5852]" />
          </div>
          <div>
            <span className="text-xs text-[#5A5852] block font-arabic">المنتجات المصنفة</span>
            <span className="text-xl font-black text-[#181818] font-arabic">
              {totalProductsAssigned.toLocaleString('ar-SA')}
            </span>
          </div>
        </div>
      </div>

      {/* Filter & View Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E3D8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5A5852]" />
          <input
            id="categories-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم أو الرابط..."
            className="w-full pr-10 pl-4 py-2 rounded-xl border border-[#E8E3D8] bg-[#FAF8F5] text-sm text-[#181818] placeholder-[#5A5852] focus:outline-none focus:border-[#00875A] transition-colors"
          />
        </div>

        {/* Filters & View Modes */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <select
            id="categories-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-[#E8E3D8] bg-white text-xs font-bold text-[#181818] focus:outline-none focus:border-[#00875A] cursor-pointer"
          >
            <option value="all">كل الحالات</option>
            <option value="active">النشطة فقط</option>
            <option value="hidden">المخفية فقط</option>
          </select>

          {/* Featured Filter */}
          <select
            id="categories-featured-filter"
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-[#E8E3D8] bg-white text-xs font-bold text-[#181818] focus:outline-none focus:border-[#00875A] cursor-pointer"
          >
            <option value="all">الكل (مميز وعادي)</option>
            <option value="featured">المميزة فقط ⭐</option>
            <option value="regular">غير المميزة</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#FAF8F5] p-1 rounded-xl border border-[#E8E3D8]">
            <button
              id="view-mode-tree-btn"
              type="button"
              onClick={() => setViewMode('tree')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'tree'
                  ? 'bg-white text-[#00875A] shadow-xs'
                  : 'text-[#5A5852] hover:text-[#181818]'
              }`}
              title="عرض شجري متسلسل"
            >
              <FolderTree className="w-4 h-4" />
            </button>
            <button
              id="view-mode-grid-btn"
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-[#00875A] shadow-xs'
                  : 'text-[#5A5852] hover:text-[#181818]'
              }`}
              title="عرض بطاقات شبكية"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              id="view-mode-table-btn"
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-[#00875A] shadow-xs'
                  : 'text-[#5A5852] hover:text-[#181818]'
              }`}
              title="عرض جدول تفصيلي"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-[#E8E3D8]">
          <div className="w-10 h-10 border-3 border-[#00875A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-[#5A5852] font-arabic">جاري تحميل شجرة التصنيفات...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-[#E8E3D8] p-6">
          <FolderTree className="w-12 h-12 text-[#5A5852]/40 mx-auto mb-3" />
          <h3 className="text-base font-extrabold text-[#181818] mb-1 font-arabic">
            لا توجد تصنيفات مطابقة للبحث
          </h3>
          <p className="text-xs text-[#5A5852] mb-4">
            جرب تغيير معايير التصفية أو أضف تصنيفاً جديداً إلى الكتالوج
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setFeaturedFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] text-xs font-bold text-[#181818] hover:bg-[#F2EFE8] cursor-pointer"
          >
            إعادة ضبط الفلاتر
          </button>
        </div>
      ) : viewMode === 'tree' ? (
        /* TREE VIEW HIERARCHY */
        <div className="space-y-3">
          {treeStructure.map((parent) => {
            const isExpanded = expandedNodes[parent.id];
            const hasChildren = parent.children && parent.children.length > 0;

            return (
              <div
                key={parent.id}
                className="bg-white rounded-2xl border border-[#E8E3D8] overflow-hidden shadow-xs transition-shadow hover:shadow-md"
              >
                {/* Parent Row */}
                <div className="p-4 sm:p-5 flex items-center justify-between gap-3 bg-white">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Expand toggle */}
                    {hasChildren ? (
                      <button
                        type="button"
                        onClick={() => toggleNodeExpand(parent.id)}
                        className="w-8 h-8 rounded-lg border border-[#E8E3D8] bg-[#FAF8F5] hover:bg-[#F2EFE8] text-[#181818] flex items-center justify-center cursor-pointer transition-transform"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] flex items-center justify-center text-[#5A5852]/50">
                        •
                      </div>
                    )}

                    {/* Image */}
                    <div className="w-12 h-12 rounded-xl border border-[#E8E3D8] overflow-hidden shrink-0 bg-[#FAF8F5]">
                      <img
                        src={parent.image}
                        alt={parent.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Title and details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-base text-[#181818] font-arabic truncate">
                          {parent.name}
                        </h3>
                        {parent.featured && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>مميز</span>
                          </span>
                        )}
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#FAF8F5] text-[#5A5852] border border-[#E8E3D8] font-mono">
                          /{parent.slug}
                        </span>
                      </div>

                      <p className="text-xs text-[#5A5852] mt-0.5 truncate max-w-md hidden sm:block">
                        {parent.description || 'لا يوجد وصف'}
                      </p>
                    </div>
                  </div>

                  {/* Right Actions & Meta */}
                  <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    {/* Products count badge */}
                    <div className="text-left hidden sm:block">
                      <span className="text-xs font-extrabold text-[#181818] block font-arabic">
                        {parent.productCount} منتج
                      </span>
                      <span className="text-[10px] text-[#5A5852]">مرتبط بالتصنيف</span>
                    </div>

                    {/* Status Pill */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleStatus(parent, e)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                        parent.status === 'active'
                          ? 'bg-[#E6F4EE] text-[#00875A] border border-[#00875A]/20'
                          : 'bg-[#F2EFE8] text-[#5A5852] border border-[#E8E3D8]'
                      }`}
                    >
                      {parent.status === 'active' ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">نشط</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">مخفي</span>
                        </>
                      )}
                    </button>

                    {/* Order up/down */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleMoveOrder(parent, 'up', e)}
                        className="w-7 h-7 rounded-lg border border-[#E8E3D8] bg-white text-[#5A5852] hover:text-[#181818] hover:bg-[#FAF8F5] flex items-center justify-center cursor-pointer"
                        title="تحريك لأعلى"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleMoveOrder(parent, 'down', e)}
                        className="w-7 h-7 rounded-lg border border-[#E8E3D8] bg-white text-[#5A5852] hover:text-[#181818] hover:bg-[#FAF8F5] flex items-center justify-center cursor-pointer"
                        title="تحريك لأسفل"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Edit & Delete */}
                    <button
                      type="button"
                      onClick={(e) => openEditModal(parent, e)}
                      className="w-8 h-8 rounded-lg border border-[#E8E3D8] bg-white text-[#5A5852] hover:text-[#00875A] hover:bg-[#E6F4EE] flex items-center justify-center transition-colors cursor-pointer"
                      title="تعديل التصنيف"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => confirmDelete(parent, e)}
                      className="w-8 h-8 rounded-lg border border-[#E8E3D8] bg-white text-[#5A5852] hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                      title="حذف التصنيف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subcategories (Children) */}
                {hasChildren && isExpanded && (
                  <div className="border-t border-[#E8E3D8] bg-[#FAF8F5]/60 divide-y divide-[#E8E3D8]/60 pl-4 pr-10 py-1">
                    {parent.children.map((child) => (
                      <div
                        key={child.id}
                        className="py-3 flex items-center justify-between gap-3 text-sm"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg border border-[#E8E3D8] overflow-hidden shrink-0 bg-white">
                            <img
                              src={child.image}
                              alt={child.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#181818] font-arabic truncate">
                                {child.name}
                              </span>
                              <span className="text-[10px] text-[#5A5852] font-mono">
                                /{child.slug}
                              </span>
                            </div>
                            <span className="text-[11px] text-[#5A5852] block">
                              {child.productCount} منتج
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleToggleStatus(child, e)}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                              child.status === 'active'
                                ? 'bg-[#E6F4EE] text-[#00875A]'
                                : 'bg-[#F2EFE8] text-[#5A5852]'
                            }`}
                          >
                            {child.status === 'active' ? 'نشط' : 'مخفي'}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => openEditModal(child, e)}
                            className="p-1 text-[#5A5852] hover:text-[#00875A] cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => confirmDelete(child, e)}
                            className="p-1 text-[#5A5852] hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCategories.map((cat, idx) => (
            <div
              key={`admin-cat-grid-${cat.id || idx}-${idx}`}
              className="bg-white rounded-2xl border border-[#E8E3D8] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
            >
              {/* Card Image */}
              <div className="relative h-44 w-full bg-[#FAF8F5] overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

                {/* Badges on image */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold backdrop-blur-md ${
                      cat.status === 'active'
                        ? 'bg-[#00875A]/90 text-white'
                        : 'bg-black/60 text-white'
                    }`}
                  >
                    {cat.status === 'active' ? 'نشط' : 'مخفي'}
                  </span>
                  {cat.featured && (
                    <span className="p-1 rounded-lg bg-amber-500 text-white shadow-xs">
                      <Star className="w-3.5 h-3.5 fill-white" />
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 right-3 left-3 text-white">
                  <span className="text-[11px] text-amber-300 font-semibold tracking-wider block mb-0.5">
                    {cat.productCount} منتج مسجل
                  </span>
                  <h3 className="font-extrabold text-base leading-snug font-arabic drop-shadow-xs">
                    {cat.name}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <p className="text-xs text-[#5A5852] line-clamp-2 leading-relaxed">
                    {cat.description || 'تصنيف مخصص لمقتنيات الفخامة والقطع النادرة.'}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-[#5A5852]">
                    <span className="font-mono bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E8E3D8]">
                      /{cat.slug}
                    </span>
                    <span>ترتيب: #{cat.displayOrder}</span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-[#E8E3D8] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleToggleStatus(cat, e)}
                    className="text-xs font-bold text-[#5A5852] hover:text-[#00875A] transition-colors cursor-pointer flex items-center gap-1"
                  >
                    {cat.status === 'active' ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>إخفاء</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>تفعيل</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => openEditModal(cat, e)}
                      className="p-1.5 rounded-lg border border-[#E8E3D8] bg-white text-[#5A5852] hover:text-[#00875A] hover:bg-[#E6F4EE] transition-colors cursor-pointer"
                      title="تعديل"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => confirmDelete(cat, e)}
                      className="p-1.5 rounded-lg border border-[#E8E3D8] bg-white text-[#5A5852] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
                  <th className="py-3.5 px-4">التصنيف</th>
                  <th className="py-3.5 px-4">الاسم اللطيف (Slug)</th>
                  <th className="py-3.5 px-4">التصنيف الأب</th>
                  <th className="py-3.5 px-4">عدد المنتجات</th>
                  <th className="py-3.5 px-4">الترتيب</th>
                  <th className="py-3.5 px-4">الحالة</th>
                  <th className="py-3.5 px-4">مميز</th>
                  <th className="py-3.5 px-4 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E3D8] text-xs">
                {filteredCategories.map((cat, idx) => {
                  const parent = categories.find((c) => c.id === cat.parentId);
                  return (
                    <tr
                      key={`admin-cat-tbl-${cat.id || idx}-${idx}`}
                      className="hover:bg-[#FAF8F5]/80 transition-colors cursor-default"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl border border-[#E8E3D8] overflow-hidden shrink-0 bg-[#FAF8F5]">
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <span className="font-extrabold text-sm text-[#181818] block font-arabic">
                              {cat.name}
                            </span>
                            <span className="text-[11px] text-[#5A5852] line-clamp-1">
                              {cat.description || 'لا يوجد وصف'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[#5A5852]">/{cat.slug}</td>
                      <td className="py-3 px-4 text-[#181818]">
                        {parent ? (
                          <span className="px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E8E3D8]">
                            📁 {parent.name}
                          </span>
                        ) : (
                          <span className="text-[#5A5852]">— رئيسي</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#181818] font-arabic">
                        {cat.productCount} منتج
                      </td>
                      <td className="py-3 px-4 font-mono text-[#5A5852]">#{cat.displayOrder}</td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={(e) => handleToggleStatus(cat, e)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                            cat.status === 'active'
                              ? 'bg-[#E6F4EE] text-[#00875A] border border-[#00875A]/20'
                              : 'bg-[#F2EFE8] text-[#5A5852] border border-[#E8E3D8]'
                          }`}
                        >
                          {cat.status === 'active' ? 'نشط' : 'مخفي'}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={(e) => handleToggleFeatured(cat, e)}
                          className="cursor-pointer"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              cat.featured
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
                            onClick={(e) => openEditModal(cat, e)}
                            className="p-1.5 rounded-lg border border-[#E8E3D8] bg-white text-[#5A5852] hover:text-[#00875A] hover:bg-[#E6F4EE] transition-colors cursor-pointer"
                            title="تعديل"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => confirmDelete(cat, e)}
                            className="p-1.5 rounded-lg border border-[#E8E3D8] bg-white text-[#5A5852] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Category Modal (Create/Edit) */}
      <CategoryModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setCategoryToEdit(null);
        }}
        onSave={handleCreateOrUpdate}
        categoryToEdit={categoryToEdit}
        parentCategories={parentCategories}
      />

      {/* Delete Confirmation Modal */}
      {deleteDialogOpen && categoryToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E8E3D8] shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-extrabold text-lg text-[#181818] mb-2 font-arabic">
              تأكيد حذف تصنيف "{categoryToDelete.name}"
            </h3>

            <p className="text-xs text-[#5A5852] leading-relaxed mb-4">
              {categoryToDelete.productCount > 0 ? (
                <span className="text-rose-700 font-bold block mb-2">
                  ⚠️ تنبيه: يرتبط بهذا التصنيف حالياً {categoryToDelete.productCount} منتج. سيتم
                  إلغاء ربطها بالتصنيف.
                </span>
              ) : (
                'هل أنت متأكد من رغبتك في حذف هذا التصنيف نهائياً من الكتالوج؟'
              )}
              هذا الإجراء لا يمكن التراجع عنه.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setCategoryToDelete(null);
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
                <span>نعم، حذف التصنيف</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
