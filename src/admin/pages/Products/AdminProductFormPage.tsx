import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Save,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  DollarSign,
  Package,
  Image as ImageIcon,
  Search,
  Bookmark,
  Trash2,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { adminService } from '../../services';
import { AdminProduct, ProductOption, ProductSEO, ProductStatus, ProductVariant } from '../../types';
import { ProductFormGeneralTab } from './components/ProductFormGeneralTab';
import { ProductFormPricingTab } from './components/ProductFormPricingTab';
import { ProductFormInventoryTab } from './components/ProductFormInventoryTab';
import { ProductFormMediaTab } from './components/ProductFormMediaTab';
import { ProductFormVariantsTab } from './components/ProductFormVariantsTab';
import { ProductFormSEOTab } from './components/ProductFormSEOTab';

type TabKey = 'general' | 'pricing' | 'inventory' | 'media' | 'variants' | 'seo';

export const AdminProductFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id && id !== 'new');
  const productId = isEditMode ? Number(id) : null;

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabKey>('general');

  // Loading & Action State
  const [isLoading, setIsLoading] = useState<boolean>(isEditMode);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Metadata Lists
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  // Inputs for Tags and Collections
  const [tagInput, setTagInput] = useState('');
  const [collectionInput, setCollectionInput] = useState('');

  // Primary Form State
  const [formData, setFormData] = useState<{
    name: string;
    slug: string;
    sku: string;
    barcode?: string;
    category: string;
    subcategory?: string;
    brand: string;
    price: number | '';
    compareAtPrice?: number | '';
    costPrice?: number | '';
    taxIncluded?: boolean;
    stock: number | '';
    lowStockThreshold: number | '';
    status: ProductStatus;
    image_url: string;
    galleryImages: string[];
    description: string;
    shortDescription?: string;
    tags: string[];
    collections: string[];
    isFeatured: boolean;
    hasVariants: boolean;
    options: ProductOption[];
    variants: ProductVariant[];
    weight?: number | '';
    dimensions?: { length?: number | ''; width?: number | ''; height?: number | '' };
    seo: ProductSEO;
  }>({
    name: '',
    slug: '',
    sku: '',
    barcode: '',
    category: 'مسابح فاخرة',
    subcategory: '',
    brand: 'فخامة الملكية',
    price: '',
    compareAtPrice: '',
    costPrice: '',
    taxIncluded: true,
    stock: 10,
    lowStockThreshold: 3,
    status: 'published',
    image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    galleryImages: [],
    description: '',
    shortDescription: '',
    tags: ['فاخر', 'نوادر'],
    collections: ['المجموعة الملكية'],
    isFeatured: false,
    hasVariants: false,
    options: [],
    variants: [],
    weight: 250,
    dimensions: { length: 15, width: 10, height: 5 },
    seo: {
      metaTitle: '',
      metaDescription: '',
      canonicalUrl: '',
    },
  });

  // Load Metadata
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [cats, brs] = await Promise.all([
          adminService.getProductCategories(),
          adminService.getProductBrands(),
        ]);
        setCategories(cats);
        setBrands(brs);
      } catch (err) {
        console.error('Error loading metadata:', err);
      }
    };
    loadMeta();
  }, []);

  // Load Existing Product if Edit Mode
  useEffect(() => {
    if (!isEditMode || !productId) return;

    const loadProduct = async () => {
      setIsLoading(true);
      try {
        const product = await adminService.getProductById(productId);
        if (product) {
          setFormData({
            name: product.name,
            slug: product.slug,
            sku: product.sku,
            barcode: product.barcode || '',
            category: product.category,
            subcategory: product.subcategory || '',
            brand: product.brand,
            price: product.price,
            compareAtPrice: product.compareAtPrice ?? '',
            costPrice: product.costPrice ?? '',
            taxIncluded: product.taxIncluded !== false,
            stock: product.stock,
            lowStockThreshold: product.lowStockThreshold || 3,
            status: product.status,
            image_url: product.image_url,
            galleryImages: product.galleryImages || [],
            description: product.description,
            shortDescription: product.shortDescription || '',
            tags: product.tags || [],
            collections: product.collections || [],
            isFeatured: product.isFeatured || false,
            hasVariants: Boolean(product.hasVariants || (product.variants && product.variants.length > 0)),
            options: product.options || [],
            variants: product.variants || [],
            weight: product.weight ?? '',
            dimensions: product.dimensions || { length: '', width: '', height: '' },
            seo: product.seo || {
              metaTitle: '',
              metaDescription: '',
              canonicalUrl: '',
            },
          });
        } else {
          setErrorMessage('المنتج المطلوب غير موجود أو تم حذفه');
        }
      } catch (err) {
        setErrorMessage('تعذر تحميل بيانات المنتج');
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [isEditMode, productId]);

  // Toast Helper
  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 3500);
  };

  // Field change handlers
  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Generate Slug
  const handleGenerateSlug = () => {
    if (!formData.name) return;
    const generated = formData.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s\u0621-\u064A-]/g, '')
      .replace(/\s+/g, '-');
    setFormData((prev) => ({ ...prev, slug: generated }));
  };

  // Generate SKU
  const handleGenerateSKU = () => {
    const brandPrefix = formData.brand ? formData.brand.slice(0, 3).toUpperCase() : 'FKH';
    const rand = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({ ...prev, sku: `${brandPrefix}-${rand}` }));
  };

  // Tags Handlers
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (!formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  // Collections Handlers
  const handleAddCollection = () => {
    if (!collectionInput.trim()) return;
    if (!formData.collections.includes(collectionInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        collections: [...prev.collections, collectionInput.trim()],
      }));
    }
    setCollectionInput('');
  };

  const handleRemoveCollection = (col: string) => {
    setFormData((prev) => ({
      ...prev,
      collections: prev.collections.filter((c) => c !== col),
    }));
  };

  // Media Handlers
  const handleAddGalleryImage = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      galleryImages: [...prev.galleryImages, url],
    }));
  };

  const handleRemoveGalleryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index),
    }));
  };

  const handleSetAsPrimary = (index: number) => {
    const selectedUrl = formData.galleryImages[index];
    if (!selectedUrl) return;

    const oldPrimary = formData.image_url;
    const newGallery = formData.galleryImages.filter((_, i) => i !== index);
    if (oldPrimary) newGallery.unshift(oldPrimary);

    setFormData((prev) => ({
      ...prev,
      image_url: selectedUrl,
      galleryImages: newGallery,
    }));
  };

  // Submit & Save Form
  const handleSubmit = async (e?: React.FormEvent, customStatus?: ProductStatus) => {
    if (e) e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      setActiveTab('general');
      setErrorMessage('يرجى إدخال اسم المنتج');
      return;
    }
    if (formData.price === '' || Number(formData.price) < 0) {
      setActiveTab('pricing');
      setErrorMessage('يرجى إدخال سعر بيع صحيح للمنتج');
      return;
    }
    if (!formData.sku.trim()) {
      setActiveTab('inventory');
      setErrorMessage('يرجى إدخال رمز المخزون SKU للمنتج');
      return;
    }
    if (!formData.image_url) {
      setActiveTab('media');
      setErrorMessage('يرجى تحديد صورة الغلاف الرئيسية للمنتج');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const payloadStatus = customStatus || formData.status;

    try {
      const payload: any = {
        ...formData,
        status: payloadStatus,
        price: Number(formData.price),
        compareAtPrice:
          formData.compareAtPrice !== '' ? Number(formData.compareAtPrice) : undefined,
        costPrice: formData.costPrice !== '' ? Number(formData.costPrice) : undefined,
        stock: Number(formData.stock) || 0,
        lowStockThreshold: Number(formData.lowStockThreshold) || 3,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
      };

      if (isEditMode && productId) {
        await adminService.updateProduct(productId, payload);
        triggerToast('تم حفظ التعديلات بنجاح');
      } else {
        const created = await adminService.createProduct(payload);
        triggerToast('تم إنشاء المنتج الملكي ونشره بنجاح');
        setTimeout(() => {
          navigate('/admin/products');
        }, 800);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'حدث خطأ أثناء حفظ المنتج');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs: { key: TabKey; label: string; icon: React.FC<{ className?: string }> }[] = [
    { key: 'general', label: 'المعلومات العامة', icon: Bookmark },
    { key: 'pricing', label: 'التسعير والأرباح', icon: DollarSign },
    { key: 'inventory', label: 'المخزون والترميز', icon: Package },
    { key: 'media', label: 'معرض الصور', icon: ImageIcon },
    { key: 'variants', label: 'الخيارات والمتغيرات', icon: Layers },
    { key: 'seo', label: 'محركات البحث (SEO)', icon: Search },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-3">
        <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-stone-500 font-medium">جاري تحميل بيانات المنتج الملكي...</p>
      </div>
    );
  }

  return (
    <form id="admin-product-form" onSubmit={(e) => handleSubmit(e)} className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-xl bg-emerald-900 text-emerald-100 border border-emerald-700 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Bar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200/80 pb-5">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2.5 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl text-stone-700 transition-colors shadow-2xs"
            title="رجوع لقائمة المنتجات"
          >
            <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-0.5">
              <span>إدارة المنتجات</span>
              <span>/</span>
              <span className="text-amber-700 font-semibold">
                {isEditMode ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
              <span>{formData.name || (isEditMode ? 'تعديل منتج' : 'منتج ملكي جديد')}</span>
              {formData.isFeatured && (
                <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-700 border border-amber-300 font-bold rounded-md">
                  مميز
                </span>
              )}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Status Selector */}
          <select
            value={formData.status}
            onChange={(e) => handleFieldChange('status', e.target.value as ProductStatus)}
            className="px-3.5 py-2 text-xs font-bold bg-white border border-stone-200 rounded-xl text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 shadow-2xs"
          >
            <option value="published">منشور في المتجر (نشط)</option>
            <option value="draft">مسودة (غير معروض)</option>
            <option value="archived">مؤرشف</option>
            <option value="out_of_stock">نفد المخزون</option>
          </select>

          {/* Quick Preview Link if edit */}
          {isEditMode && formData.slug && (
            <Link
              to={`/products/${formData.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl shadow-2xs transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-stone-500" />
              <span>معاينة في المتجر</span>
            </Link>
          )}

          {/* Save Draft */}
          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSubmit(undefined, 'draft')}
            className="px-4 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors disabled:opacity-50"
          >
            حفظ كمسودة
          </button>

          {/* Save / Publish Button */}
          <button
            type="submit"
            disabled={isSaving}
            id="save-product-button"
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-stone-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-xs transition-all active:scale-98 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isEditMode ? 'حفظ التعديلات' : 'نشر المنتج الملكي'}</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs font-medium text-rose-800">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-stone-200 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              id={`tab-btn-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-amber-500 text-stone-950 shadow-2xs font-extrabold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 bg-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-stone-950' : 'text-stone-500'}`} />
              <span>{tab.label}</span>
              {tab.key === 'variants' && formData.hasVariants && (
                <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels Content */}
      <div className="pt-2">
        {activeTab === 'general' && (
          <ProductFormGeneralTab
            formData={formData}
            categories={categories}
            brands={brands}
            onChange={handleFieldChange}
            tagInput={tagInput}
            setTagInput={setTagInput}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            collectionInput={collectionInput}
            setCollectionInput={setCollectionInput}
            onAddCollection={handleAddCollection}
            onRemoveCollection={handleRemoveCollection}
            onGenerateSlug={handleGenerateSlug}
          />
        )}

        {activeTab === 'pricing' && (
          <ProductFormPricingTab
            formData={formData}
            onChange={handleFieldChange}
          />
        )}

        {activeTab === 'inventory' && (
          <ProductFormInventoryTab
            formData={formData}
            onChange={handleFieldChange}
            onGenerateSKU={handleGenerateSKU}
          />
        )}

        {activeTab === 'media' && (
          <ProductFormMediaTab
            primaryImage={formData.image_url}
            galleryImages={formData.galleryImages}
            onChangePrimaryImage={(url) => handleFieldChange('image_url', url)}
            onAddGalleryImage={handleAddGalleryImage}
            onRemoveGalleryImage={handleRemoveGalleryImage}
            onSetAsPrimary={handleSetAsPrimary}
          />
        )}

        {activeTab === 'variants' && (
          <ProductFormVariantsTab
            hasVariants={formData.hasVariants}
            onToggleHasVariants={(enabled) => handleFieldChange('hasVariants', enabled)}
            options={formData.options}
            variants={formData.variants}
            basePrice={Number(formData.price) || 0}
            baseSku={formData.sku}
            onChangeOptions={(opts) => handleFieldChange('options', opts)}
            onChangeVariants={(vars) => handleFieldChange('variants', vars)}
          />
        )}

        {activeTab === 'seo' && (
          <ProductFormSEOTab
            seo={formData.seo}
            productName={formData.name}
            productDescription={formData.description}
            slug={formData.slug}
            onChangeSEO={(seo) => handleFieldChange('seo', seo)}
          />
        )}
      </div>

      {/* Bottom Sticky Action Footer */}
      <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-stone-200 shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>يتم حفظ وتحديث بيانات الكتالوج في الوقت الفعلي</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
          >
            إلغاء
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-stone-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-xs transition-all active:scale-98 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isEditMode ? 'حفظ التعديلات' : 'نشر المنتج الملكي'}</span>
          </button>
        </div>
      </div>
    </form>
  );
};
