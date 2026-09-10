import { commerceStore } from '../shared/store/commerceStore';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import {
  Product,
  ProductFilters,
  ProductsResponse,
  CategoryCountsResponse,
  PriceRangeResponse,
  SearchSuggestionsResponse
} from '../types';

export const productApi = {
  async getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
    let products = commerceStore.getProducts();
    let items = products.filter((p) => p.status === 'published');

    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q))
      );
    }

    if (filters.category && filters.category !== 'all') {
      items = items.filter((p) => p.category === filters.category);
    }

    if (filters.instock) {
      items = items.filter((p) => p.stock > 0);
    }

    if (filters.minPrice !== undefined) {
      items = items.filter((p) => p.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      items = items.filter((p) => p.price <= filters.maxPrice!);
    }

    if (filters.sort) {
      switch (filters.sort) {
        case 'price_asc':
          items.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          items.sort((a, b) => b.price - a.price);
          break;
        case 'name_asc':
          items.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
          break;
        case 'name_desc':
          items.sort((a, b) => b.name.localeCompare(a.name, 'ar'));
          break;
        case 'newest':
          items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
      }
    }

    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const total = items.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedItems = items.slice(startIndex, startIndex + limit);

    return {
      products: paginatedItems,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  },

  async getProductById(id: number | string): Promise<Product> {
    let found = commerceStore.getProductById(id);
    if (!found) {
      try {
        const snap = await getDoc(doc(db, 'products', String(id)));
        if (snap.exists()) {
          const data = snap.data();
          found = { ...data, id: data.id ? parseInt(String(data.id), 10) : parseInt(snap.id, 10) } as any;
        }
      } catch (err) {
        console.warn('Error fetching product from Firestore:', err);
      }
    }
    if (!found) throw new Error('المنتج غير موجود');
    return found;
  },

  async getCategories(): Promise<string[]> {
    const cats = commerceStore.getCategories();
    return cats.map((c) => c.name);
  },

  async getCategoryCounts(): Promise<CategoryCountsResponse> {
    const products = commerceStore.getProducts().filter((p) => p.status === 'published');
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });

    return {
      categories: Object.keys(counts),
      counts,
    };
  },

  async getPriceRange(): Promise<PriceRangeResponse> {
    const products = commerceStore.getProducts();
    if (products.length === 0) return { min: 0, max: 10000 };
    const prices = products.map((p) => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  },

  async getSearchSuggestions(query: string): Promise<SearchSuggestionsResponse> {
    const products = commerceStore.getProducts().filter((p) => p.status === 'published');
    const q = query.trim().toLowerCase();
    const matchedProducts = products
      .filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
      .slice(0, 5);

    const categories = Array.from(new Set(products.map((p) => p.category))).filter((c) =>
      c.toLowerCase().includes(q)
    );

    return {
      products: matchedProducts.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image_url: p.image_url,
        category: p.category,
        stock: p.stock,
      })),
      categories,
    };
  }
};

