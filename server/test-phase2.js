import bcrypt from 'bcryptjs';
import { db } from './config/database.js';
import {
  createUser,
  findUserByEmail,
  findUserById,
  verifyPassword,
  sanitizeUser
} from './services/authService.js';
import {
  getAllProducts,
  getProductById,
  getCategories
} from './services/productService.js';

console.log('====================================================');
console.log('🧪 Starting Phase 2: Auth & Products API Test Suite..');
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

async function runTests() {
  try {
    // ----------------------------------------------------
    // Section 1: Authentication & User Service Tests
    // ----------------------------------------------------
    console.log('\n--- 1. User Registration & Password Hashing ---');
    const uniqueEmail = `user_${Date.now()}@example.com`;
    const rawPassword = 'SecretPassword123!';

    const createdUser = await createUser({
      name: 'Alice Johnson',
      email: uniqueEmail,
      password: rawPassword
    });

    assert(createdUser.id > 0, 'User created with valid ID');
    assert(createdUser.name === 'Alice Johnson', 'User name stored correctly');
    assert(createdUser.email === uniqueEmail.toLowerCase(), 'User email normalized to lowercase');
    assert(createdUser.password_hash === undefined, 'Created user return object omits `password_hash`');

    // Verify database password storage
    const rawDbUser = db.prepare('SELECT * FROM users WHERE id = ?').get(createdUser.id);
    assert(rawDbUser.password_hash !== rawPassword, 'Database does NOT store plaintext password');
    assert(rawDbUser.password_hash.startsWith('$2a$') || rawDbUser.password_hash.startsWith('$2b$'), 'Password hash uses standard bcrypt format');

    const passwordMatch = await verifyPassword(rawPassword, rawDbUser.password_hash);
    assert(passwordMatch === true, 'bcrypt correctly verifies original password against stored hash');

    const wrongPasswordMatch = await verifyPassword('WrongPassword', rawDbUser.password_hash);
    assert(wrongPasswordMatch === false, 'bcrypt correctly rejects incorrect password');

    // Duplicate email registration test
    let duplicateRejected = false;
    try {
      await createUser({
        name: 'Alice Duplicate',
        email: uniqueEmail,
        password: 'anotherpassword'
      });
    } catch (err) {
      if (err.statusCode === 409 && err.code === 'EMAIL_ALREADY_EXISTS') {
        duplicateRejected = true;
      }
    }
    assert(duplicateRejected, 'Duplicate registration attempt is rejected with 409 Conflict & EMAIL_ALREADY_EXISTS');

    // Safe user sanitization
    const sanitized = sanitizeUser(rawDbUser);
    assert(sanitized.password_hash === undefined, 'sanitizeUser helper reliably strips `password_hash`');
    assert(sanitized.email === uniqueEmail.toLowerCase(), 'sanitizeUser preserves public user fields');

    // ----------------------------------------------------
    // Section 2: Products Service & Queries
    // ----------------------------------------------------
    console.log('\n--- 2. Products Catalog & Filter Queries ---');

    // All products
    const allProducts = getAllProducts();
    assert(Array.isArray(allProducts) && allProducts.length >= 12, `getAllProducts returns complete catalog (count: ${allProducts.length})`);

    // Single product by ID
    const firstProduct = allProducts[0];
    const fetchedById = getProductById(firstProduct.id);
    assert(fetchedById !== null && fetchedById.name === firstProduct.name, `getProductById(${firstProduct.id}) retrieves matching product`);

    const nonExistent = getProductById(99999);
    assert(nonExistent === null, 'getProductById with nonexistent ID safely returns null');

    // Distinct categories
    const categories = getCategories();
    assert(categories.length >= 4, `getCategories returns distinct category array (${categories.join(', ')})`);

    // Search filter
    const searchResults = getAllProducts({ search: 'Headphones' });
    assert(
      searchResults.length > 0 && searchResults.every(p => p.name.toLowerCase().includes('headphone') || p.description.toLowerCase().includes('headphone')),
      `Search query 'Headphones' returns relevant items (found ${searchResults.length})`
    );

    // Case-insensitive search
    const caseSearch = getAllProducts({ search: 'gaming' });
    assert(caseSearch.length > 0, `Case-insensitive search for 'gaming' returns items (found ${caseSearch.length})`);

    // Category filter
    const gamingProducts = getAllProducts({ category: 'Gaming' });
    assert(
      gamingProducts.length > 0 && gamingProducts.every(p => p.category === 'Gaming'),
      `Category filter for 'Gaming' returns strictly Gaming products (found ${gamingProducts.length})`
    );

    // Sorting: price_asc
    const priceAsc = getAllProducts({ sort: 'price_asc' });
    let isAsc = true;
    for (let i = 0; i < priceAsc.length - 1; i++) {
      if (priceAsc[i].price > priceAsc[i + 1].price) isAsc = false;
    }
    assert(isAsc, 'Sorting `price_asc` returns products in ascending price order');

    // Sorting: price_desc
    const priceDesc = getAllProducts({ sort: 'price_desc' });
    let isDesc = true;
    for (let i = 0; i < priceDesc.length - 1; i++) {
      if (priceDesc[i].price < priceDesc[i + 1].price) isDesc = false;
    }
    assert(isDesc, 'Sorting `price_desc` returns products in descending price order');

    // Sorting: name_asc
    const nameAsc = getAllProducts({ sort: 'name_asc' });
    let isNameAsc = true;
    for (let i = 0; i < nameAsc.length - 1; i++) {
      if (nameAsc[i].name.localeCompare(nameAsc[i + 1].name) > 0) isNameAsc = false;
    }
    assert(isNameAsc, 'Sorting `name_asc` returns products in alphabetical order');

    // Combined query
    const combined = getAllProducts({ search: 'Wireless', category: 'Audio', sort: 'price_asc' });
    assert(
      Array.isArray(combined) && combined.every(p => p.category === 'Audio' && (p.name.toLowerCase().includes('wireless') || p.description.toLowerCase().includes('wireless'))),
      `Combined query (search='Wireless', category='Audio', sort='price_asc') works cleanly (found ${combined.length})`
    );

    // ----------------------------------------------------
    // Section 3: Security & SQL Injection Prevention
    // ----------------------------------------------------
    console.log('\n--- 3. Security & SQL Injection Resilience ---');

    // Malicious search string
    const sqlInjectionSearch = getAllProducts({ search: "' OR '1'='1" });
    assert(Array.isArray(sqlInjectionSearch), 'SQL injection attempt in search query handled safely as text literal without error');

    // Malicious category string
    const sqlInjectionCategory = getAllProducts({ category: "Electronics' OR 1=1 --" });
    assert(Array.isArray(sqlInjectionCategory) && sqlInjectionCategory.length === 0, 'SQL injection in category safely parameterized (returned 0 rows)');

    // Invalid sort key fallback
    const invalidSort = getAllProducts({ sort: 'non_existent_column; DROP TABLE products; --' });
    assert(Array.isArray(invalidSort) && invalidSort.length === allProducts.length, 'Invalid sort parameter safely falls back to default sort without SQL error');

    console.log('====================================================');
    console.log(`📊 Phase 2 Test Summary: ${passed} Passed, ${failed} Failed`);
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
}

runTests();
