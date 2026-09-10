import { db, initDatabase, DB_PATH } from './config/database.js';
import { seed, seedProducts } from '../database/seed.js';

console.log('====================================================');
console.log('🧪 Starting Backend Foundation Verification Tests...');
console.log('====================================================');

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

try {
  // Test 1: Database Initialization
  initDatabase();
  assert(true, 'Database schema initialized idempotently without error');

  // Test 2: Foreign Key Pragma
  const fkCheck = db.pragma('foreign_keys', { simple: true });
  assert(fkCheck === 1, `Foreign key enforcement is enabled (value: ${fkCheck})`);

  // Test 3: Table Existence
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
    ORDER BY name
  `).all().map(t => t.name);

  assert(tables.includes('users'), 'Table `users` exists');
  assert(tables.includes('products'), 'Table `products` exists');
  assert(tables.includes('orders'), 'Table `orders` exists');
  assert(tables.includes('order_items'), 'Table `order_items` exists');

  // Test 4: Indexes Existence
  const indexes = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='index' AND name NOT LIKE 'sqlite_%'
  `).all().map(i => i.name);

  assert(indexes.includes('idx_products_category'), 'Index `idx_products_category` exists');
  assert(indexes.includes('idx_orders_user_id'), 'Index `idx_orders_user_id` exists');
  assert(indexes.includes('idx_order_items_order_id'), 'Index `idx_order_items_order_id` exists');

  // Test 5: Seed Execution & Idempotency
  const seedResult = seed();
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  assert(productCount >= 12, `Products table contains at least 12 products (found: ${productCount})`);

  // Test running seed again to test idempotency
  const secondSeed = seed();
  const productCountAfter = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  assert(productCount === productCountAfter, `Seed is idempotent; no duplicate products created on re-run (count: ${productCountAfter})`);

  // Test 6: Verify Product Structure & Categories
  const sampleProduct = db.prepare('SELECT * FROM products LIMIT 1').get();
  assert(
    sampleProduct.id &&
    sampleProduct.name &&
    sampleProduct.description &&
    sampleProduct.price > 0 &&
    sampleProduct.image_url &&
    sampleProduct.stock >= 0 &&
    sampleProduct.category,
    'Product records contain all required fields (id, name, desc, price, image_url, stock, category)'
  );

  const categories = db.prepare('SELECT DISTINCT category FROM products').all().map(c => c.category);
  assert(categories.length >= 4, `Multiple categories present (found ${categories.length}: ${categories.join(', ')})`);

  // Test 7: Constraint validation (Price >= 0, Stock >= 0)
  let negativePriceFailed = false;
  try {
    db.prepare(`
      INSERT INTO products (name, description, price, image_url, stock, category)
      VALUES ('Invalid Product', 'Test', -10, 'http://example.com/img.jpg', 5, 'Electronics')
    `).run();
  } catch (err) {
    negativePriceFailed = true;
  }
  assert(negativePriceFailed, 'Negative product price constraint (CHECK price >= 0) rejected by SQLite');

  let negativeStockFailed = false;
  try {
    db.prepare(`
      INSERT INTO products (name, description, price, image_url, stock, category)
      VALUES ('Invalid Stock', 'Test', 10, 'http://example.com/img.jpg', -5, 'Electronics')
    `).run();
  } catch (err) {
    negativeStockFailed = true;
  }
  assert(negativeStockFailed, 'Negative product stock constraint (CHECK stock >= 0) rejected by SQLite');

  // Test 8: User unique email constraint
  const testUserEmail = `test_${Date.now()}@example.com`;
  db.prepare(`
    INSERT INTO users (name, email, password_hash)
    VALUES ('Test User', ?, 'hashed_pw_dummy')
  `).run(testUserEmail);

  let duplicateEmailFailed = false;
  try {
    db.prepare(`
      INSERT INTO users (name, email, password_hash)
      VALUES ('Test User Duplicate', ?, 'hashed_pw_dummy2')
    `).run(testUserEmail);
  } catch (err) {
    duplicateEmailFailed = true;
  }
  assert(duplicateEmailFailed, 'Duplicate user email uniqueness constraint enforced by SQLite');

  console.log('====================================================');
  console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
} catch (error) {
  console.error('Unexpected test error:', error);
  process.exit(1);
}
