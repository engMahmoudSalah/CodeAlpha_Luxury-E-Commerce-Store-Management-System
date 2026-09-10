import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, writeBatch } from 'firebase/firestore';

const cfg = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(cfg);
const db = getFirestore(app, cfg.firestoreDatabaseId);

async function seedFirestore() {
  console.log('--- Checking Firestore Products in Database:', cfg.firestoreDatabaseId, '---');
  const snap = await getDocs(collection(db, 'products'));
  console.log(`Current products count: ${snap.size}`);

  if (snap.size > 0) {
    console.log('Firestore already contains products. Skipping seed.');
    return;
  }

  console.log('Seeding initial luxury catalog to Firestore...');

  const products = [
    {
      id: 'prod_01',
      name: 'ساعة كرونوغراف أوتوماتيك لومينور',
      nameEn: 'Luminor Automatic Chronograph',
      slug: 'luminor-automatic-chronograph',
      sku: 'WTC-LUM-001',
      price: 4950,
      compareAtPrice: 6200,
      costPrice: 2800,
      category: 'ساعات فاخرة',
      brand: 'Fakhama Heritage',
      stock: 7,
      status: 'published',
      featured: true,
      rating: 4.9,
      reviewsCount: 28,
      salesCount: 142,
      createdAt: '2025-01-10T12:00:00Z',
      updatedAt: '2025-02-15T09:30:00Z',
      image_url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80',
      description: 'ساعة يد ميكانيكية استثنائية بحركة أوتوماتيكية سويسرية، هيكل من الفولاذ المقاوم للصدأ عيار 316L وزجاج ياقوتي مضاد للانعكاس مع حزام جلد طبيعي مخيط يدوياً.'
    },
    {
      id: 'prod_02',
      name: 'حقيبة أعمال جلد العجل الفاخر',
      nameEn: 'Calfskin Executive Briefcase',
      slug: 'calfskin-executive-briefcase',
      sku: 'LDR-BRF-002',
      price: 3800,
      compareAtPrice: 4500,
      costPrice: 1900,
      category: 'حقائب جلدية',
      brand: 'Maison Leather',
      stock: 4,
      status: 'published',
      featured: true,
      rating: 4.8,
      reviewsCount: 19,
      salesCount: 88,
      createdAt: '2025-01-12T14:20:00Z',
      updatedAt: '2025-02-18T11:00:00Z',
      image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80',
      description: 'حقيبة وثائق وأعمال فاخرة مصنوعة من جلد العجل الإيطالي المدبوغ نباتياً، تحتوي على مقصورات مبطنة لحاسوب محمول وجيب سري مع قفل نحاسي عتيق.'
    },
    {
      id: 'prod_03',
      name: 'عطر العود الملكي المعتّق 100 مل',
      nameEn: 'Royal Aged Oud Parfum 100ml',
      slug: 'royal-aged-oud-parfum',
      sku: 'PRF-OUD-003',
      price: 2150,
      compareAtPrice: 2600,
      costPrice: 850,
      category: 'عطور ملكية',
      brand: 'Fakhama Parfums',
      stock: 12,
      status: 'published',
      featured: true,
      rating: 5.0,
      reviewsCount: 47,
      salesCount: 310,
      createdAt: '2025-01-05T08:00:00Z',
      updatedAt: '2025-02-20T16:45:00Z',
      image_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&auto=format&fit=crop&q=80',
      description: 'توليفة عطرية ملكية غنية بدهن العود الكمبودي النادر المعتق لأكثر من عشر سنوات، ممزوج بنفحات العنبر الرمادي والزعفران الإيراني الفاخر والورد الطائفي.'
    },
    {
      id: 'prod_04',
      name: 'قلم حبر جاف مطلي بالذهب عيار 18',
      nameEn: '18K Gold Plated Luxury Pen',
      slug: '18k-gold-plated-pen',
      sku: 'ACC-PEN-004',
      price: 1450,
      compareAtPrice: 1800,
      costPrice: 620,
      category: 'أقلام وإكسسوارات',
      brand: 'Fakhama Heritage',
      stock: 15,
      status: 'published',
      featured: false,
      rating: 4.7,
      reviewsCount: 14,
      salesCount: 65,
      createdAt: '2025-01-18T10:15:00Z',
      updatedAt: '2025-02-10T14:10:00Z',
      image_url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80',
      description: 'أداة كتابة فخمة متقنة، هيكل محفور بالليزر بزخارف هندسية إسلامية مطلية بالذهب الأصفر عيار 18 قيراط مع رأس كروي سويسري فائق الدقة.'
    },
    {
      id: 'prod_05',
      name: 'نظارة شمسية أفياتور بتيتانيوم مصقول',
      nameEn: 'Titanium Aviator Sunglasses',
      slug: 'titanium-aviator-sunglasses',
      sku: 'EYE-AVI-005',
      price: 1850,
      compareAtPrice: 2200,
      costPrice: 790,
      category: 'نظارات شمسية',
      brand: 'Fakhama Heritage',
      stock: 9,
      status: 'published',
      featured: true,
      rating: 4.6,
      reviewsCount: 22,
      salesCount: 94,
      createdAt: '2025-01-22T13:40:00Z',
      updatedAt: '2025-02-22T10:05:00Z',
      image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80',
      description: 'إطار مصنوع من التيتانيوم الياباني خفيف الوزن وفائق المتانة مع عدسات مستقطبة توفر حماية 100% من الأشعة فوق البنفسجية UV400 مع طبقة مقاومة للخدش.'
    },
    {
      id: 'prod_06',
      name: 'أزرار أكمام ملكية مرصعة بالملكيت الأخضر',
      nameEn: 'Green Malachite Royal Cufflinks',
      slug: 'green-malachite-cufflinks',
      sku: 'JW-CUF-006',
      price: 1250,
      compareAtPrice: 1600,
      costPrice: 480,
      category: 'أقلام وإكسسوارات',
      brand: 'Fakhama Heritage',
      stock: 18,
      status: 'published',
      featured: false,
      rating: 4.9,
      reviewsCount: 31,
      salesCount: 112,
      createdAt: '2025-01-25T15:30:00Z',
      updatedAt: '2025-02-14T12:00:00Z',
      image_url: 'https://images.unsplash.com/photo-1590548784585-643d2b9f2925?w=600&auto=format&fit=crop&q=80',
      description: 'أزرار ثوب وأكمام مصنوعة من الفضة الإسترلينية عيار 925 مطلية بالروديوم الأبيض، مرصعة بحجر الملكيت الطبيعي الأخضر الملكي بنقوشه الفريدة.'
    },
    {
      id: 'prod_07',
      name: 'محفظة جيب كلاسيكية من جلد التمساح',
      nameEn: 'Crocodile Pattern Bifold Wallet',
      slug: 'crocodile-pattern-wallet',
      sku: 'LDR-WLT-007',
      price: 1650,
      compareAtPrice: 1950,
      costPrice: 650,
      category: 'حقائب جلدية',
      brand: 'Maison Leather',
      stock: 11,
      status: 'published',
      featured: false,
      rating: 4.8,
      reviewsCount: 26,
      salesCount: 156,
      createdAt: '2025-01-28T11:20:00Z',
      updatedAt: '2025-02-19T08:30:00Z',
      image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
      description: 'محفظة نقود وبطاقات فاخرة بتصميم أنحف يتسع لـ 8 بطاقات مع جيب نقود مبطن بحرير الجاكار ومزودة بحماية كاملة من سرقة بيانات RFID.'
    },
    {
      id: 'prod_08',
      name: 'مسبحة العقيق اليماني الفاخر بكركوشة فضة',
      nameEn: 'Yemeni Agate Luxury Prayer Beads',
      slug: 'yemeni-agate-prayer-beads',
      sku: 'ACC-ROS-008',
      price: 2400,
      compareAtPrice: 2900,
      costPrice: 1100,
      category: 'أقلام وإكسسوارات',
      brand: 'Fakhama Heritage',
      stock: 5,
      status: 'published',
      featured: true,
      rating: 5.0,
      reviewsCount: 38,
      salesCount: 89,
      createdAt: '2025-01-30T09:00:00Z',
      updatedAt: '2025-02-23T14:15:00Z',
      image_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
      description: 'مسبحة مقتنيات نادرة مكونة من 33 حبة من حجر العقيق الكبدي اليماني الطبيعي المشغول يدوياً بدقة فائقة مع كركوشة من خيوط الفضة الخالصة عيار 999.'
    }
  ];

  const categories = [
    { id: 'cat_01', name: 'ساعات فاخرة', slug: 'luxury-watches', description: 'ساعات ميكانيكية وسويسرية استثنائية', productsCount: 18, isActive: true },
    { id: 'cat_02', name: 'حقائب جلدية', slug: 'leather-goods', description: 'مصنوعات جلدية من أفخر أنواع الجلود الإيطالية', productsCount: 14, isActive: true },
    { id: 'cat_03', name: 'عطور ملكية', slug: 'royal-perfumes', description: 'عطور نيش ودهن عود معتق ونفحات نادرة', productsCount: 12, isActive: true },
    { id: 'cat_04', name: 'أقلام وإكسسوارات', slug: 'pens-accessories', description: 'أدوات كتابة وأزرار أكمام ومقتنيات فاخرة', productsCount: 22, isActive: true },
    { id: 'cat_05', name: 'نظارات شمسية', slug: 'sunglasses', description: 'نظارات راقية بتصاميم كلاسيكية وعصرية', productsCount: 9, isActive: true }
  ];

  const settings = {
    id: 'storeSettings',
    storeName: 'فخامة - Fakhama Luxury Store',
    storeEmail: 'contact@fakhama.sa',
    storePhone: '+966 800 124 9999',
    currency: 'SAR',
    defaultTaxRate: 15,
    taxRatePercentage: 15,
    defaultShippingFee: 35,
    freeShippingThreshold: 500,
    allowGuestCheckout: true,
    autoAcceptOrders: true,
    inventoryAlertThreshold: 3
  };

  const batch = writeBatch(db);

  products.forEach((p) => {
    batch.set(doc(db, 'products', p.id), p);
  });

  categories.forEach((c) => {
    batch.set(doc(db, 'categories', c.id), c);
  });

  batch.set(doc(db, 'settings', 'storeSettings'), settings);

  await batch.commit();
  console.log(`✅ Successfully seeded ${products.length} products, ${categories.length} categories, and store settings to Firestore!`);
}

seedFirestore()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  });
