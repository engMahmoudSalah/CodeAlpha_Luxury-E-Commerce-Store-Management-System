import { db } from '../config/database.js';

// Safe sorting whitelist mapping
const SORT_MAPPINGS = {
  price_asc: 'ORDER BY price ASC',
  price_desc: 'ORDER BY price DESC',
  name_asc: 'ORDER BY name ASC',
  name_desc: 'ORDER BY name DESC',
  newest: 'ORDER BY created_at DESC, id DESC'
};

const DEFAULT_SORT = 'ORDER BY id ASC';

/**
 * Retrieve all products with optional search, category filtering, price filtering, sorting, and pagination
 */
export function getAllProducts(options = {}) {
  const { search, category, minPrice, maxPrice, sort, instock, page, limit } = options;

  let baseQuery = 'FROM products';
  const conditions = [];
  const params = [];

  // Search filter (name or description matching, case-insensitive in SQLite LIKE)
  if (search && typeof search === 'string' && search.trim().length > 0) {
    const searchPattern = `%${search.trim()}%`;
    conditions.push('(name LIKE ? OR description LIKE ?)');
    params.push(searchPattern, searchPattern);
  }

  // Category filter
  if (category && typeof category === 'string' && category.trim().length > 0 && category.toLowerCase() !== 'all') {
    conditions.push('category = ?');
    params.push(category.trim());
  }

  // Price range filters
  if (minPrice !== undefined && minPrice !== null && minPrice !== '' && !isNaN(Number(minPrice))) {
    conditions.push('price >= ?');
    params.push(Number(minPrice));
  }

  if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '' && !isNaN(Number(maxPrice))) {
    conditions.push('price <= ?');
    params.push(Number(maxPrice));
  }

  // In stock filter
  if (instock === 'true' || instock === true) {
    conditions.push('stock > 0');
  }

  if (conditions.length > 0) {
    baseQuery += ' WHERE ' + conditions.join(' AND ');
  }

  // Count total matching items
  const countQuery = 'SELECT COUNT(*) as count ' + baseQuery;
  const totalRow = db.prepare(countQuery).get(...params);
  const total = totalRow ? totalRow.count : 0;

  // Safe sorting
  const orderByClause = (sort && SORT_MAPPINGS[sort]) ? SORT_MAPPINGS[sort] : DEFAULT_SORT;
  let selectQuery = 'SELECT * ' + baseQuery + ' ' + orderByClause;

  let currentPage = 1;
  let pageSize = total || 12;
  let totalPages = 1;

  // Handle pagination parameters
  if (page !== undefined || limit !== undefined) {
    pageSize = Math.max(1, Math.min(100, parseInt(limit, 10) || 12));
    currentPage = Math.max(1, parseInt(page, 10) || 1);
    totalPages = Math.ceil(total / pageSize) || 1;

    if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    const offset = Math.max(0, (currentPage - 1) * pageSize);
    selectQuery += ' LIMIT ? OFFSET ?';
    params.push(pageSize, offset);
  }

  const stmt = db.prepare(selectQuery);
  const products = stmt.all(...params);

  // Attach metadata properties to array while preserving array identity
  products.total = total;
  products.totalPages = totalPages;
  products.page = currentPage;
  products.limit = pageSize;

  return products;
}

/**
 * Retrieve a single product by numeric ID
 */
export function getProductById(id) {
  const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
  return stmt.get(id) || null;
}

/**
 * Retrieve all distinct product categories with their item counts
 */
export function getCategories() {
  const stmt = db.prepare('SELECT DISTINCT category FROM products ORDER BY category ASC');
  return stmt.all().map(row => row.category);
}

/**
 * Retrieve categories with counts
 */
export function getCategoryCounts() {
  const stmt = db.prepare('SELECT category, COUNT(*) as count FROM products GROUP BY category');
  const rows = stmt.all();
  const totalRow = db.prepare('SELECT COUNT(*) as count FROM products').get();
  
  const counts = {
    all: totalRow ? totalRow.count : 0
  };
  rows.forEach(r => {
    counts[r.category] = r.count;
  });
  return counts;
}

/**
 * Retrieve min and max price across all products
 */
export function getPriceRange() {
  const row = db.prepare('SELECT MIN(price) as minPrice, MAX(price) as maxPrice FROM products').get();
  return {
    min: row?.minPrice !== null && row?.minPrice !== undefined ? Math.floor(row.minPrice) : 0,
    max: row?.maxPrice !== null && row?.maxPrice !== undefined ? Math.ceil(row.maxPrice) : 10000
  };
}

/**
 * Search suggestions endpoint logic
 */
export function getSearchSuggestions(query = '') {
  const clean = typeof query === 'string' ? query.trim() : '';
  if (!clean) {
    return {
      products: [],
      categories: []
    };
  }

  const pattern = `%${clean}%`;
  const productsStmt = db.prepare('SELECT id, name, price, image_url, category, stock FROM products WHERE name LIKE ? OR description LIKE ? LIMIT 5');
  const products = productsStmt.all(pattern, pattern);

  const categoriesStmt = db.prepare('SELECT DISTINCT category FROM products WHERE category LIKE ? LIMIT 3');
  const categories = categoriesStmt.all(pattern).map(r => r.category);

  return {
    products,
    categories
  };
}

/**
 * Create a new product in SQLite and sync to Firestore
 */
export function createProduct(data) {
  const { name, description, price, image_url, stock, category } = data;
  const stmt = db.prepare(`
    INSERT INTO products (name, description, price, image_url, stock, category)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    name,
    description || '',
    Number(price),
    image_url || '',
    parseInt(stock, 10) || 0,
    category || 'General'
  );
  const created = getProductById(result.lastInsertRowid);

  if (process.env.NODE_ENV !== 'test') {
    import('../config/firebase.js').then(({ db: firestoreDb }) => {
      import('firebase/firestore').then(({ doc, setDoc }) => {
        setDoc(doc(firestoreDb, 'products', String(created.id)), {
          ...created,
          status: 'published',
          createdAt: new Date().toISOString()
        }, { merge: true }).catch(() => {});
      }).catch(() => {});
    }).catch(() => {});
  }

  return created;
}

/**
 * Update an existing product in SQLite and sync to Firestore
 */
export function updateProduct(id, data) {
  const existing = getProductById(id);
  if (!existing) return null;

  const updatedName = data.name !== undefined ? data.name : existing.name;
  const updatedDesc = data.description !== undefined ? data.description : existing.description;
  const updatedPrice = data.price !== undefined ? Number(data.price) : existing.price;
  const updatedImage = data.image_url !== undefined ? data.image_url : existing.image_url;
  const updatedStock = data.stock !== undefined ? parseInt(data.stock, 10) : existing.stock;
  const updatedCat = data.category !== undefined ? data.category : existing.category;

  const stmt = db.prepare(`
    UPDATE products
    SET name = ?, description = ?, price = ?, image_url = ?, stock = ?, category = ?
    WHERE id = ?
  `);
  stmt.run(updatedName, updatedDesc, updatedPrice, updatedImage, updatedStock, updatedCat, id);
  const updated = getProductById(id);

  if (process.env.NODE_ENV !== 'test') {
    import('../config/firebase.js').then(({ db: firestoreDb }) => {
      import('firebase/firestore').then(({ doc, setDoc }) => {
        setDoc(doc(firestoreDb, 'products', String(id)), {
          ...updated,
          updatedAt: new Date().toISOString()
        }, { merge: true }).catch(() => {});
      }).catch(() => {});
    }).catch(() => {});
  }

  return updated;
}

/**
 * Delete a product from SQLite and Firestore
 */
export function deleteProduct(id) {
  const existing = getProductById(id);
  if (!existing) return false;

  const stmt = db.prepare('DELETE FROM products WHERE id = ?');
  stmt.run(id);

  if (process.env.NODE_ENV !== 'test') {
    import('../config/firebase.js').then(({ db: firestoreDb }) => {
      import('firebase/firestore').then(({ doc, deleteDoc }) => {
        deleteDoc(doc(firestoreDb, 'products', String(id))).catch(() => {});
      }).catch(() => {});
    }).catch(() => {});
  }

  return true;
}

