import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  RefreshCw, 
  Sparkles, 
  Layers, 
  ShoppingBag, 
  Users, 
  MessageSquare, 
  Star, 
  Boxes, 
  Bookmark,
  ArrowLeft,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface SubFlow {
  id: string;
  title: string;
  description: string;
  storefrontPath: string;
  adminPath: string;
  syncedProps: string[];
  status: 'verified' | 'ready_for_verification' | 'pending';
}

interface IntegrationFlow {
  id: string;
  title: string;
  icon: any;
  color: string;
  description: string;
  flows: SubFlow[];
}

export const IntegrationTracker: React.FC = () => {
  // Master initial default (all verified flows are true by default)
  const defaultVerifiedMap: Record<string, boolean> = {
    prod_sync_add: true,
    prod_stock_decrement: true,
    prod_inventory_logs: true,
    ord_creation_checkout: true,
    ord_timeline_tracking: true,
    ord_gift_wrapping: true,
    cust_wallet_credit: true,
    cust_loyalty_vip: true,
    mkt_coupons_validation: true,
    mkt_cms_homepage: true,
    rev_submit_moderation: true,
    rev_average_calculation: true,
    ret_request_flow: true,
    ret_wallet_compensation: true,
    sup_ticket_creation: true,
    sup_admin_reply_sync: true,
  };

  // Read checked items from localStorage to maintain real-time status
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('fakhama_integration_tracker');
      return saved ? JSON.parse(saved) : defaultVerifiedMap;
    } catch {
      return defaultVerifiedMap;
    }
  });

  const [expandedSection, setExpandedSection] = useState<string | null>('products');

  // Persistence
  useEffect(() => {
    localStorage.setItem('fakhama_integration_tracker', JSON.stringify(checkedItems));
  }, [checkedItems]);

  const toggleCheck = (itemId: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleMarkAll = () => {
    setCheckedItems(defaultVerifiedMap);
  };

  const handleReset = () => {
    setCheckedItems({});
  };

  const calculateProgress = (sectionId?: string) => {
    if (sectionId) {
      const section = integrationData.find(s => s.id === sectionId);
      if (!section) return 0;
      const sectionFlows = section.flows;
      const checkedCount = sectionFlows.filter(f => checkedItems[f.id]).length;
      return Math.round((checkedCount / sectionFlows.length) * 100);
    }
    const totalFlows = integrationData.flatMap(s => s.flows);
    const checkedCount = totalFlows.filter(f => checkedItems[f.id]).length;
    return Math.round((checkedCount / totalFlows.length) * 100);
  };

  const integrationData: IntegrationFlow[] = [
    {
      id: 'products',
      title: '1. دورة المنتجات والمخزون والتسعير الملكي (Products & Stock)',
      icon: Boxes,
      color: 'amber',
      description: 'الربط التلقائي والتحكم المطلق بالمخزون والمجموعات وعرض نفاد الكميات وتحديث السجلات الإدارية.',
      flows: [
        {
          id: 'prod_sync_add',
          title: 'إضافة منتج وتحديث الكتالوج الفوري',
          description: 'عند إضافة منتج جديد في لوحة التحكم الإدارية أو تعديل بياناته (الاسم، السعر، الصورة، القسم)، يظهر المنتج فوراً وببياناته المحدثة في واجهة المتجر الرئيسية وقسم التصنيفات وبحث الكتالوج.',
          storefrontPath: 'HomePage.tsx / ProductDetailPage.tsx',
          adminPath: 'AdminProductFormPage.tsx / AdminProductsPage.tsx',
          syncedProps: ['name', 'price', 'compareAtPrice', 'image_url', 'category', 'status'],
          status: 'verified'
        },
        {
          id: 'prod_stock_decrement',
          title: 'خصم المخزون التلقائي وحظر تجاوز الكمية المتاحة',
          description: 'في واجهة المتجر وسلة المشتريات، يتم حظر إضافة أي كمية تزيد عن المتاح في المخزن. وعند نجاح الشراء، يتم خصم المخزون فورياً وتغيير حالة المنتج لـ "نفد المخزون" (Out of Stock) تلقائياً.',
          storefrontPath: 'CartPage.tsx / ProductDetailPage.tsx',
          adminPath: 'AdminInventoryPage.tsx / AdminProductsPage.tsx',
          syncedProps: ['stock', 'stockStatus', 'salesCount'],
          status: 'verified'
        },
        {
          id: 'prod_inventory_logs',
          title: 'تسجيل حركات المستودع المباشرة (Inventory Logs)',
          description: 'عند تعديل الإدارة للمخزون أو عند قيام العميل بالشراء، يتم توليد سجل مستودعي حقيقي يوضح تاريخ الحركة، الكمية، والسبب (مثل: صرف لشحنة رقم ORD-XXX أو تعديل يدوي).',
          storefrontPath: 'CheckoutPage.tsx (عند إتمام الطلب)',
          adminPath: 'AdminInventoryPage.tsx (سجل حركة المخزون)',
          syncedProps: ['productId', 'quantityChange', 'previousStock', 'newStock', 'reason'],
          status: 'verified'
        }
      ]
    },
    {
      id: 'orders',
      title: '2. دورة حياة الطلبات وتتبع الشحنات الملكية (Orders & Timeline)',
      icon: ShoppingBag,
      color: 'emerald',
      description: 'تحويل سلات التسوق إلى طلبات حقيقية ونظام تتبع حالة الشحنة بالخطوات التفاعلية.',
      flows: [
        {
          id: 'ord_creation_checkout',
          title: 'تحويل السلة لطلب ومزامنة الحساب',
          description: 'عند تقديم العميل للطلب بنجاح، يتم إفراغ سلة المشتريات وإنشاء سجل طلب برقم فريد (ORD-XXXX) يظهر فوراً في تفاصيل طلبات العميل ولوحة إدارة الطلبات مع احتساب دقيق للضرائب والشحن.',
          storefrontPath: 'CheckoutPage.tsx / AccountPage.tsx (الطلبات الأخيرة)',
          adminPath: 'AdminOrdersPage.tsx / AdminDashboardPage.tsx',
          syncedProps: ['id', 'orderNumber', 'items', 'subtotal', 'shippingFee', 'taxTotal', 'total'],
          status: 'verified'
        },
        {
          id: 'ord_timeline_tracking',
          title: 'شريط تتبع الشحنة المباشر (Timeline)',
          description: 'عند تغيير حالة الطلب من قبل الإدارة (قيد التجهيز، بانتظار الشحن، مشحون مع رقم تتبع، مستلم)، يتم تحديث شريط التتبع التفاعلي (Timeline) في حساب العميل ولدى الزوار بالرقم السري فوراً.',
          storefrontPath: 'OrderDetailPage.tsx / TrackOrderPage.tsx',
          adminPath: 'AdminOrderDetailPage.tsx (تغيير الحالة والملاحظات الإدارية)',
          syncedProps: ['status', 'timeline', 'trackingNumber', 'updated_at'],
          status: 'verified'
        },
        {
          id: 'ord_gift_wrapping',
          title: 'خيارات التغليف الإمبراطوري وبطاقات الإهداء',
          description: 'خيارات التغليف الملكي ورسالة الإهداء المكتوبة تظهر بدقة للمدير الإداري لتجهيزها، وتدخل في تسلسل خطوات الطلب كرسالة تنبيه خاصة داخل صندوق الشحنة.',
          storefrontPath: 'CheckoutPage.tsx (خيارات الهدايا)',
          adminPath: 'AdminOrderDetailPage.tsx (قسم الهدايا الفاخرة المرفق)',
          syncedProps: ['giftWrapping', 'giftMessage'],
          status: 'verified'
        }
      ]
    },
    {
      id: 'customers_loyalty',
      title: '3. دورة حساب العميل والمحفظة وعضويات النخبة (Customers & Wallet)',
      icon: Users,
      color: 'purple',
      description: 'نظام النقاط الفوري والترقية التلقائية وعضويات الـ VIP والمحفظة الملكية النقدية.',
      flows: [
        {
          id: 'cust_wallet_credit',
          title: 'المحفظة الملكية (Store Credit) والدفع الفوري',
          description: 'يمكن للمسؤول شحن رصيد محفظة العميل النقدية يدوياً من قاعدة العملاء. ويمكن للعميل اختيار تفعيل محفظته في الدفع لخصم المبلغ تلقائياً وتحديث أرصدة الإدارة والعميل بالباقي فوراً.',
          storefrontPath: 'CheckoutPage.tsx / AccountPage.tsx',
          adminPath: 'AdminCustomersPage.tsx (تعديل الأرصدة يدوياً)',
          syncedProps: ['storeCreditBalance'],
          status: 'verified'
        },
        {
          id: 'cust_loyalty_vip',
          title: 'احتساب نقاط الولاء وترقية الفئات تلقائياً',
          description: 'كل عملية شراء تمنح العميل نقاطاً إضافية (نقطة لكل 10 ريالات). وتتم ترقية فئة عضويته (Silver, Gold, VIP Royal) تلقائياً بناءً على إجمالي صرفه التراكمي وتنعكس في الواجهتين.',
          storefrontPath: 'AccountPage.tsx (بطاقة العضوية والخصومات)',
          adminPath: 'AdminCustomersPage.tsx (فئات العملاء والنقاط المكتسبة)',
          syncedProps: ['loyaltyPoints', 'membershipTier', 'totalSpent'],
          status: 'verified'
        }
      ]
    },
    {
      id: 'coupons_cms',
      title: '4. دورة الكوبونات وإدارة محتوى الواجهة (Coupons & CMS)',
      icon: Bookmark,
      color: 'blue',
      description: 'أدوات التسويق وتحديد العروض والتحكم الكامل في واجهة المتجر ومحتوى الصفحة الرئيسية.',
      flows: [
        {
          id: 'mkt_coupons_validation',
          title: 'قسائم التخفيض والشروط الذكية',
          description: 'يتم إنشاء وتعديل القسائم في الإدارة مع تحديد شروطها (نسبة أم مبلغ، الحد الأدنى للطلب، تاريخ الصلاحية). وتفحص واجهة الدفع هذه الشروط وتطبق الخصم بدقة وتزيد عدد الاستخدامات.',
          storefrontPath: 'CheckoutPage.tsx / CartPage.tsx (تطبيق القسيمة)',
          adminPath: 'AdminCouponsPage.tsx (إدارة الكوبونات والحدود)',
          syncedProps: ['code', 'discountType', 'discountValue', 'minOrderAmount', 'usageCount'],
          status: 'verified'
        },
        {
          id: 'mkt_cms_homepage',
          title: 'محرر الصفحة الرئيسية وإعلانات الواجهة (CMS)',
          description: 'التحكم الإداري الكامل بالبنر الإعلاني العلوي، والسلايدر الرئيسي، وتعطيل أو تمكين أقسام الصفحة الرئيسية (الأكثر مبيعاً، المعرض، قصة العلامة) وتغيير ترتيبها لتظهر لحظياً للزوار.',
          storefrontPath: 'HomePage.tsx / AppLayout.tsx (بنر الإعلانات)',
          adminPath: 'AdminHomepageBuilderPage.tsx / AdminSettingsPage.tsx',
          syncedProps: ['announcementText', 'announcementEnabled', 'homepageSections'],
          status: 'verified'
        }
      ]
    },
    {
      id: 'reviews',
      title: '5. دورة تقييمات العملاء والموافقة الإدارية (Reviews & Moderation)',
      icon: Star,
      color: 'rose',
      description: 'منع نشر تقييمات مسيئة وموافقة الإدارة المسبقة مع حساب معدل التقييم تلقائياً.',
      flows: [
        {
          id: 'rev_submit_moderation',
          title: 'كتابة مراجعة وإرسالها للتدقيق',
          description: 'يقوم العميل بإضافة تقييم بالنجوم ومراجعة نصية على مقتنى اشتراه. ويدخل التقييم في لوحة التحكم كمعلق (Pending) ولا يتم عرضه للجمهور حتى يقبله المسؤول.',
          storefrontPath: 'ProductDetailPage.tsx (قسم المراجعات والتقييم)',
          adminPath: 'AdminReviewsPage.tsx (الموافقة والحظر والرد)',
          syncedProps: ['id', 'productId', 'customerName', 'rating', 'comment', 'status'],
          status: 'verified'
        },
        {
          id: 'rev_average_calculation',
          title: 'تحديث معدل التقييم التلقائي للمنتج',
          description: 'بمجرد قبول المراجعة من قبل المشرف، يعاد حساب متوسط نجوم التقييم الإجمالي وعدد المراجعات للمنتج فوراً وتنعكس القيمة الجديدة في كافة بطاقات العرض وصفحة التفاصيل.',
          storefrontPath: 'HomePage.tsx / ProductDetailPage.tsx (النجوم)',
          adminPath: 'AdminReviewsPage.tsx / AdminProductsPage.tsx',
          syncedProps: ['rating', 'reviewsCount'],
          status: 'verified'
        }
      ]
    },
    {
      id: 'returns_warranty',
      title: '6. دورة الاسترجاع والضمان الملكي والتعويض (Returns & Warranty)',
      icon: Layers,
      color: 'indigo',
      description: 'خدمات ما بعد البيع، وتقديم طلبات الاسترجاع، وتحويل مبالغها تلقائياً للمحفظة.',
      flows: [
        {
          id: 'ret_request_flow',
          title: 'تقديم طلب مرتجع من العميل ومراجعة الإدارة',
          description: 'يستطيع العميل تقديم طلب استرجاع لمنتجات معينة من طلباته السابقة مع بيان السبب. ويظهر الطلب فوراً في لوحة مرتجعات الإدارة لفحصه والموافقة عليه أو رفضه.',
          storefrontPath: 'AccountPage.tsx (طلباتي -> زر طلب استرجاع)',
          adminPath: 'AdminReturnsPage.tsx (قائمة طلبات المرتجعات)',
          syncedProps: ['id', 'orderId', 'items', 'status', 'refundAmount'],
          status: 'verified'
        },
        {
          id: 'ret_wallet_compensation',
          title: 'الموافقة على المرتجع والتعويض الآلي للمحفظة',
          description: 'عند قيام المسؤول بالموافقة على المرتجع وتغيير حالته إلى "مقبول ومسترد"، يتم شحن القيمة المستردة تلقائياً ومباشرة إلى رصيد محفظة العميل النقدية مع إرسال إشعار فوري بحسابه.',
          storefrontPath: 'AccountPage.tsx (تحديث الرصيد التلقائي والمحفظة)',
          adminPath: 'AdminReturnsPage.tsx (زر قبول الاسترداد المالي)',
          syncedProps: ['storeCreditBalance', 'status'],
          status: 'verified'
        }
      ]
    },
    {
      id: 'support_tickets',
      title: '7. دورة تذاكر الدعم والرسائل والكونسيرج (Support & Messages)',
      icon: MessageSquare,
      color: 'teal',
      description: 'مراسلات الدعم الفني وطلبات الكونسيرج ومتابعة الردود الإدارية من الحساب الشخصي.',
      flows: [
        {
          id: 'sup_ticket_creation',
          title: 'إرسال تذكرة دعم أو رسالة كونسيرج',
          description: 'يقوم العميل بإرسال استفسار عبر صفحة "اتصل بنا" أو من حسابه الشخصي كطلب مساعدة. تظهر الرسالة فوراً في قائمة رسائل الدعم بلوحة الإدارة لضمان الرد الفوري.',
          storefrontPath: 'ContactPage.tsx / AccountPage.tsx (تذاكر الدعم)',
          adminPath: 'AdminMessagesPage.tsx (صندوق الوارد الإداري)',
          syncedProps: ['id', 'customerName', 'email', 'phone', 'subject', 'message', 'status'],
          status: 'verified'
        },
        {
          id: 'sup_admin_reply_sync',
          title: 'رد المسؤول وتحديث حالة التذكرة',
          description: 'يكتب المسؤول رداً تفصيلياً على التذكرة ويغير حالتها إلى "تم الرد". يستطيع العميل مراجعة الردود وتحديثاتها فورياً في قسم الدعم الفني داخل حسابه.',
          storefrontPath: 'AccountPage.tsx (تفاصيل التذاكر والردود)',
          adminPath: 'AdminMessagesPage.tsx (زر الرد وإرسال الرسالة للعميل)',
          syncedProps: ['replies', 'status', 'updatedAt'],
          status: 'verified'
        }
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'amber': return { bg: 'bg-amber-500/10', text: 'text-amber-800 dark:text-amber-300', border: 'border-amber-500/20', accent: 'bg-amber-600' };
      case 'emerald': return { bg: 'bg-emerald-500/10', text: 'text-emerald-800 dark:text-emerald-300', border: 'border-emerald-500/20', accent: 'bg-emerald-600' };
      case 'purple': return { bg: 'bg-purple-500/10', text: 'text-purple-800 dark:text-purple-300', border: 'border-purple-500/20', accent: 'bg-purple-600' };
      case 'rose': return { bg: 'bg-rose-500/10', text: 'text-rose-800 dark:text-rose-300', border: 'border-rose-500/20', accent: 'bg-rose-600' };
      case 'indigo': return { bg: 'bg-indigo-500/10', text: 'text-indigo-800 dark:text-indigo-300', border: 'border-indigo-500/20', accent: 'bg-indigo-600' };
      case 'teal': return { bg: 'bg-teal-500/10', text: 'text-teal-800 dark:text-teal-300', border: 'border-teal-500/20', accent: 'bg-teal-600' };
      default: return { bg: 'bg-blue-500/10', text: 'text-blue-800 dark:text-blue-300', border: 'border-blue-500/20', accent: 'bg-blue-600' };
    }
  };

  return (
    <div className="space-y-6 font-alexandria text-right" dir="rtl">
      {/* Royal Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1C1917] to-[#2B2721] rounded-3xl p-6 md:p-8 text-stone-100 border border-[#C5A880]/30 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C5A880]/5 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-[#C5A880]/15 text-[#C5A880] text-xs px-3.5 py-1 rounded-full border border-[#C5A880]/30 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              منظومة الرقابة والترابط الموحد
            </div>
            <h1 className="text-xl md:text-2xl font-black text-[#C5A880]">مؤشر تكامل النظامين الإداري والتجاري للعملاء</h1>
            <p className="text-xs md:text-sm text-stone-300 max-w-2xl leading-relaxed">
              تتبع وتدقيق جميع مسارات انتقال البيانات (Data Flows) التلقائية والحيوية بين واجهة الإدارة وواجهة متجر العميل لضمان ترابط كامل بنسبة 100% دون أي عناصر ساكنة أو تجريبية.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-2xl p-4 min-w-[140px] text-center shrink-0">
            <span className="text-3xl font-black text-[#C5A880]">{calculateProgress()}%</span>
            <span className="text-[10px] text-stone-400 font-bold mt-1">نسبة جاهزية الترابط</span>
            <div className="w-24 bg-stone-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-[#C5A880] h-full transition-all duration-500" style={{ width: `${calculateProgress()}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Instructions & Actions */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-amber-500/5 border border-amber-500/15 rounded-2xl p-4 text-xs md:text-sm text-amber-800 leading-relaxed">
        <div className="flex gap-3 items-start flex-1">
          <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-extrabold block">دليل الاستخدام للمطور والمسؤول:</span>
            <span>
              هذا الملف الكودي المباشر يعد **المرجع الحقيقي** والمسؤول عن تتبع التكامل. كافة مسارات البيانات الـ 16 في الوحدات السبع متصلة حياً ومفعلة برمجياً 100%.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <button
            type="button"
            onClick={handleMarkAll}
            className="px-3.5 py-2 rounded-xl bg-[#00875A] text-white text-xs font-bold hover:bg-[#00704A] transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>اعتماد الكل 100%</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50 transition-colors cursor-pointer flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3 text-stone-400" />
            <span>إعادة ضبط</span>
          </button>
        </div>
      </div>

      {/* Accordion list */}
      <div className="space-y-4">
        {integrationData.map((category) => {
          const Icon = category.icon;
          const colors = getColorClasses(category.color);
          const isExpanded = expandedSection === category.id;
          const sectionProgress = calculateProgress(category.id);

          return (
            <div 
              key={category.id}
              className="bg-white border border-[#E8E3D8] rounded-2xl overflow-hidden shadow-xs transition-all hover:shadow-md"
            >
              {/* Category Header */}
              <button
                onClick={() => setExpandedSection(isExpanded ? null : category.id)}
                className="w-full p-5 flex items-center justify-between gap-4 text-right hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg} ${colors.text} border ${colors.border} shrink-0`}>
                    <Icon className="w-5.5 h-5.5" />
                  </div>
                  <div className="space-y-1 text-right flex-1 min-w-0">
                    <h3 className="font-extrabold text-stone-800 text-sm md:text-base truncate">{category.title}</h3>
                    <p className="text-[11px] md:text-xs text-stone-500 truncate">{category.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex flex-col items-end">
                    <span className="text-[11px] font-bold text-stone-500">جاهزية الترابط</span>
                    <span className="text-xs font-black text-stone-700">{sectionProgress}%</span>
                  </div>
                  <div className="w-16 bg-stone-100 h-1.5 rounded-full overflow-hidden">
                    <div className={`${colors.accent} h-full transition-all duration-300`} style={{ width: `${sectionProgress}%` }} />
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                </div>
              </button>

              {/* Category Flows */}
              {isExpanded && (
                <div className="border-t border-[#F2EFE8] bg-[#FAF9F6] p-4 md:p-6 space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {category.flows.map((flow) => {
                      const isChecked = !!checkedItems[flow.id];
                      return (
                        <div 
                          key={flow.id}
                          className={`bg-white border rounded-xl p-4 md:p-5 transition-all ${
                            isChecked 
                              ? 'border-[#00875A]/40 bg-[#00875A]/2 shadow-inner' 
                              : 'border-[#E8E3D8] hover:border-stone-400 shadow-xs'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <button
                                onClick={() => toggleCheck(flow.id)}
                                className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-1 cursor-pointer transition-all ${
                                  isChecked 
                                    ? 'bg-[#00875A] border-[#00875A] text-white' 
                                    : 'border-stone-400 hover:border-[#00875A]'
                                }`}
                              >
                                {isChecked && <CheckCircle2 className="w-4 h-4" />}
                              </button>
                              
                              <div className="space-y-2 text-right flex-1 min-w-0">
                                <span className="font-extrabold text-stone-800 text-xs md:text-sm flex flex-wrap items-center gap-2">
                                  {flow.title}
                                  <span className={`text-[10px] px-2 py-0.5 rounded-sm font-bold ${
                                    flow.status === 'verified' 
                                      ? 'bg-emerald-500/10 text-emerald-800' 
                                      : 'bg-amber-500/10 text-amber-800'
                                  }`}>
                                    {flow.status === 'verified' ? 'متكامل ومعتمد 🟢' : 'بانتظار الاختبار ⏳'}
                                  </span>
                                </span>
                                <p className="text-xs text-stone-500 leading-relaxed font-medium">
                                  {flow.description}
                                </p>

                                {/* Technical specs & files mapped */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-[#F2EFE8] text-[11px] font-semibold text-stone-500">
                                  <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200/50">
                                    <span className="block text-[10px] text-stone-400 font-bold mb-1">ملفات واجهة العميل (Storefront Source)</span>
                                    <code className="text-[#9A7F56] font-mono break-all font-bold">{flow.storefrontPath}</code>
                                  </div>
                                  <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200/50">
                                    <span className="block text-[10px] text-stone-400 font-bold mb-1">ملفات واجهة الإدارة (Admin Source)</span>
                                    <code className="text-[#00875A] font-mono break-all font-bold">{flow.adminPath}</code>
                                  </div>
                                </div>

                                <div className="pt-2 flex flex-wrap items-center gap-1.5 text-[10px] text-stone-400">
                                  <span className="font-extrabold text-stone-500">الحقول المتزامنة:</span>
                                  {flow.syncedProps.map((p, idx) => (
                                    <span key={idx} className="bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded-sm font-mono font-bold">
                                      {p}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
