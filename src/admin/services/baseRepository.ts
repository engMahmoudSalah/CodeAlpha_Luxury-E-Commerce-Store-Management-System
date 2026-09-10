import { PaginatedResult, FilterParams, BulkActionPayload, BulkActionResult } from '../types';

export interface IRepository<T, ID = string | number> {
  getAll(params?: FilterParams): Promise<PaginatedResult<T>>;
  getById(id: ID): Promise<T | null>;
  create(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'> | T): Promise<T>;
  update(id: ID, updates: Partial<T>): Promise<T>;
  delete(id: ID): Promise<boolean>;
  bulkAction?(payload: BulkActionPayload): Promise<BulkActionResult>;
}

/**
 * Generic In-Memory & LocalStorage-backed Repository (Backend-Ready)
 * Can be swapped for an HTTP REST / GraphQL client repository without altering UI components.
 */
export class BaseInMemoryRepository<T extends { id: string | number }> implements IRepository<T> {
  protected items: T[] = [];
  protected storageKey: string;

  constructor(initialData: T[], storageKey?: string) {
    this.storageKey = storageKey ? `fakhama_admin_${storageKey}` : '';
    this.items = this.loadFromStorage(initialData);
  }

  private loadFromStorage(defaultData: T[]): T[] {
    if (!this.storageKey || typeof window === 'undefined') return [...defaultData];
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn(`Failed to read from localStorage for ${this.storageKey}:`, e);
    }
    return [...defaultData];
  }

  protected saveToStorage(): void {
    if (!this.storageKey || typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    } catch (e) {
      console.warn(`Failed to save to localStorage for ${this.storageKey}:`, e);
    }
  }

  public async getAll(params?: FilterParams): Promise<PaginatedResult<T>> {
    let result = [...this.items];

    // Search filter across text properties if provided
    if (params?.search && params.search.trim()) {
      const query = params.search.trim().toLowerCase();
      result = result.filter((item) => {
        return Object.values(item).some((val) => {
          if (typeof val === 'string') return val.toLowerCase().includes(query);
          if (typeof val === 'number') return val.toString().includes(query);
          return false;
        });
      });
    }

    // Sort
    if (params?.sortBy) {
      const field = params.sortBy as keyof T;
      const order = params.sortOrder === 'desc' ? -1 : 1;
      result.sort((a, b) => {
        const valA = a[field];
        const valB = b[field];
        if (typeof valA === 'string' && typeof valB === 'string') {
          return valA.localeCompare(valB) * order;
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
          return (valA - valB) * order;
        }
        return 0;
      });
    }

    const page = Number(params?.page) || 1;
    const limit = Number(params?.limit) || 10;
    const total = result.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedItems = result.slice(startIndex, startIndex + limit);

    return {
      data: paginatedItems,
      items: paginatedItems,
      page,
      pageSize: limit,
      totalCount: total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  public async getById(id: string | number): Promise<T | null> {
    const item = this.items.find((i) => String(i.id) === String(id));
    return item ? { ...item } : null;
  }

  public async create(newItemData: Omit<T, 'id' | 'createdAt' | 'updatedAt'> | T): Promise<T> {
    const id = (newItemData as { id?: string | number }).id || (typeof this.items[0]?.id === 'number' ? Date.now() : `item_${Date.now()}`);
    const timestamp = new Date().toISOString();
    const createdItem = {
      ...newItemData,
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
    } as unknown as T;

    this.items.unshift(createdItem);
    this.saveToStorage();
    return { ...createdItem };
  }

  public async update(id: string | number, updates: Partial<T>): Promise<T> {
    const index = this.items.findIndex((i) => String(i.id) === String(id));
    if (index === -1) {
      throw new Error(`Item with id ${id} not found.`);
    }

    const updatedItem = {
      ...this.items[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.items[index] = updatedItem;
    this.saveToStorage();
    return { ...updatedItem };
  }

  public async delete(id: string | number): Promise<boolean> {
    const prevLen = this.items.length;
    this.items = this.items.filter((i) => String(i.id) !== String(id));
    this.saveToStorage();
    return this.items.length < prevLen;
  }

  public async bulkAction(payload: BulkActionPayload): Promise<BulkActionResult> {
    const { action, ids } = payload;
    const strIds = ids.map(String);

    if (action === 'delete') {
      const prevLen = this.items.length;
      this.items = this.items.filter((i) => !strIds.includes(String(i.id)));
      this.saveToStorage();
      return {
        success: true,
        affectedCount: prevLen - this.items.length,
        message: `تم حذف ${prevLen - this.items.length} عنصر بنجاح.`,
      };
    }

    return {
      success: true,
      affectedCount: ids.length,
      message: `تم تنفيذ العملية "${action}" على ${ids.length} عنصر بنجاح.`,
    };
  }
}
