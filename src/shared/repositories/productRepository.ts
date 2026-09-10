import { Product, ProductFilterParams, PaginatedResult } from '../types/commerce';
import { commerceStore } from '../store/commerceStore';

export const productRepository = {
  async getProducts(params: ProductFilterParams = {}): Promise<PaginatedResult<Product>> {
    let items = commerceStore.getProducts();

    if (params.search && params.search.trim()) {
      const query = params.search.trim().toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          (p.brand && p.brand.toLowerCase().includes(query)) ||
          p.tags?.some((t) => t.toLowerCase().includes(query))
      );
    }

    if (params.category && params.category !== 'all') {
      items = items.filter((p) => p.category === params.category);
    }

    if (params.brand && params.brand !== 'all') {
      items = items.filter((p) => p.brand === params.brand);
    }

    if (params.status) {
      items = items.filter((p) => p.status === params.status);
    }

    if (params.stockStatus) {
      items = items.filter((p) => p.stockStatus === params.stockStatus);
    }

    if (params.isFeatured) {
      items = items.filter((p) => p.isFeatured);
    }

    if (params.isBestSeller) {
      items = items.filter((p) => p.isBestSeller);
    }

    if (params.minPrice !== undefined) {
      items = items.filter((p) => p.price >= params.minPrice!);
    }

    if (params.maxPrice !== undefined) {
      items = items.filter((p) => p.price <= params.maxPrice!);
    }

    // Sorting
    if (params.sort) {
      switch (params.sort) {
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
        default:
          break;
      }
    }

    const page = params.page || 1;
    const limit = params.limit || 12;
    const total = items.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedItems = items.slice(startIndex, startIndex + limit);

    return {
      data: paginatedItems,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  },

  async getProductById(id: number | string): Promise<Product | undefined> {
    return commerceStore.getProductById(id);
  },

  async createProduct(productData: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    return commerceStore.addProduct(productData);
  },

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined> {
    return commerceStore.updateProduct(id, updates);
  },

  async deleteProduct(id: number): Promise<boolean> {
    return commerceStore.deleteProduct(id);
  },
};
