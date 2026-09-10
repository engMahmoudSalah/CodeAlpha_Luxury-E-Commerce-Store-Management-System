import http from 'http';
import { app } from './server.js';

console.log('====================================================');
console.log('🌐 Starting HTTP Integration Test Suite for API...');
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

async function runHttpTests() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  let sessionCookie = '';

  async function apiRequest(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    if (sessionCookie) {
      headers['Cookie'] = sessionCookie;
    }

    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers
    });

    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      sessionCookie = setCookie.split(';')[0];
    }

    let json = null;
    try {
      json = await response.json();
    } catch (e) {
      // not json
    }

    return {
      status: response.status,
      headers: response.headers,
      body: json
    };
  }

  try {
    console.log('\n--- 1. Health & Unauthenticated Me ---');
    const health = await apiRequest('/api/health');
    assert(health.status === 200 && health.body.success === true, 'GET /api/health returns 200 OK');

    const meUnauth = await apiRequest('/api/auth/me');
    assert(meUnauth.status === 401 && meUnauth.body.success === false, 'GET /api/auth/me without session returns 401 Unauthorized');

    console.log('\n--- 2. Validation & Registration Endpoints ---');
    // Missing fields
    const regMissing = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' })
    });
    assert(regMissing.status === 400, 'POST /api/auth/register without name returns 400 Bad Request');

    // Invalid email
    const regBadEmail = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test', email: 'notanemail', password: 'password123' })
    });
    assert(regBadEmail.status === 400, 'POST /api/auth/register with invalid email returns 400 Bad Request');

    // Password too short
    const regShortPass = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test', email: 'valid@example.com', password: '123' })
    });
    assert(regShortPass.status === 400, 'POST /api/auth/register with password < 6 chars returns 400 Bad Request');

    // Valid registration
    const testEmail = `http_test_${Date.now()}@example.com`;
    const testPass = 'securePassword123';
    const regValid = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'HTTP Test User', email: testEmail, password: testPass })
    });
    assert(regValid.status === 201 && regValid.body.success === true, 'POST /api/auth/register returns 201 Created');
    assert(regValid.body.data.user.password_hash === undefined, 'Registration response excludes password_hash');
    assert(Boolean(sessionCookie), 'Registration automatically establishes authenticated session cookie');

    // Duplicate email
    const regDup = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'HTTP Test User 2', email: testEmail, password: testPass })
    });
    assert(regDup.status === 409 && regDup.body.error.code === 'EMAIL_ALREADY_EXISTS', 'Duplicate email returns 409 Conflict with EMAIL_ALREADY_EXISTS');

    console.log('\n--- 3. Authenticated Session & Logout ---');
    const meAuth = await apiRequest('/api/auth/me');
    assert(meAuth.status === 200 && meAuth.body.data.user.email === testEmail, 'GET /api/auth/me returns 200 with user profile when logged in');

    // Logout
    const logoutRes = await apiRequest('/api/auth/logout', { method: 'POST' });
    assert(logoutRes.status === 200 && logoutRes.body.success === true, 'POST /api/auth/logout returns 200 OK');

    sessionCookie = ''; // clear client cookie representation
    const meAfterLogout = await apiRequest('/api/auth/me');
    assert(meAfterLogout.status === 401, 'GET /api/auth/me after logout returns 401 Unauthorized');

    console.log('\n--- 4. Login Endpoint ---');
    // Bad credentials
    const loginBad = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail, password: 'WrongPassword' })
    });
    assert(loginBad.status === 401 && loginBad.body.error.code === 'INVALID_CREDENTIALS', 'POST /api/auth/login with wrong password returns 401 with generic error');

    // Good credentials
    const loginGood = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail, password: testPass })
    });
    assert(loginGood.status === 200 && loginGood.body.data.user.email === testEmail, 'POST /api/auth/login with valid credentials returns 200 OK & session');

    console.log('\n--- 5. Products HTTP API ---');
    const prodsRes = await apiRequest('/api/products');
    assert(prodsRes.status === 200 && prodsRes.body.data.products.length >= 12, 'GET /api/products returns 200 with 12+ items');

    const firstItem = prodsRes.body.data.products[0];
    const singleRes = await apiRequest(`/api/products/${firstItem.id}`);
    assert(singleRes.status === 200 && singleRes.body.data.product.id === firstItem.id, `GET /api/products/${firstItem.id} returns 200 with product details`);

    const badIdRes = await apiRequest('/api/products/abc');
    assert(badIdRes.status === 400 && badIdRes.body.error.code === 'INVALID_ID', 'GET /api/products/abc returns 400 Bad Request for non-integer ID');

    const notFoundRes = await apiRequest('/api/products/99999');
    assert(notFoundRes.status === 404 && notFoundRes.body.error.code === 'PRODUCT_NOT_FOUND', 'GET /api/products/99999 returns 404 Not Found');

    const categoriesRes = await apiRequest('/api/products/categories');
    assert(categoriesRes.status === 200 && categoriesRes.body.data.categories.length >= 4, 'GET /api/products/categories returns 200 with categories');

    const searchRes = await apiRequest('/api/products?search=wireless&sort=price_desc');
    assert(searchRes.status === 200 && Array.isArray(searchRes.body.data.products), 'GET /api/products?search=wireless&sort=price_desc returns 200 filtered');

    console.log('\n--- 6. Phase 3: Orders API & Authentication Enforcement ---');
    // Logout and test unauthenticated order placement
    await apiRequest('/api/auth/logout', { method: 'POST' });
    sessionCookie = '';

    const unauthOrder = await apiRequest('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ productId: 1, quantity: 1 }],
        customer: {
          name: 'Anonymous',
          email: 'anon@example.com',
          address: 'Street',
          city: 'City',
          postalCode: '12345',
          phone: '12345678'
        }
      })
    });
    assert(unauthOrder.status === 401 && unauthOrder.body.error.code === 'UNAUTHORIZED', 'POST /api/orders without session returns 401 Unauthorized');

    const unauthOrderList = await apiRequest('/api/orders');
    assert(unauthOrderList.status === 401, 'GET /api/orders without session returns 401 Unauthorized');

    // Re-login User 1 with credentials
    const loginUser1 = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail, password: testPass })
    });
    assert(loginUser1.status === 200, 'User 1 re-authenticated successfully');

    const meCheck = await apiRequest('/api/auth/me');
    assert(meCheck.status === 200 && meCheck.body.data.user.email === testEmail, 'User 1 session active');

    console.log('\n--- 7. Orders Validation & Error Handling ---');
    // Empty cart items
    const emptyOrder = await apiRequest('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: [],
        customer: {
          name: 'Valid User',
          email: testEmail,
          address: '10 Nile St',
          city: 'Cairo',
          postalCode: '11511',
          phone: '01001234567'
        }
      })
    });
    assert(emptyOrder.status === 400 && emptyOrder.body.error.code === 'EMPTY_CART', 'POST /api/orders with empty items returns 400 EMPTY_CART');

    // Duplicate product ID in cart
    const dupProdOrder = await apiRequest('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: [
          { productId: 1, quantity: 1 },
          { productId: 1, quantity: 2 }
        ],
        customer: {
          name: 'Valid User',
          email: testEmail,
          address: '10 Nile St',
          city: 'Cairo',
          postalCode: '11511',
          phone: '01001234567'
        }
      })
    });
    assert(dupProdOrder.status === 400 && dupProdOrder.body.error.code === 'DUPLICATE_PRODUCT_IN_CART', 'POST /api/orders with duplicate product IDs returns 400 DUPLICATE_PRODUCT_IN_CART');

    // Invalid / Non-positive quantity
    const badQtyOrder = await apiRequest('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ productId: 1, quantity: -2 }],
        customer: {
          name: 'Valid User',
          email: testEmail,
          address: '10 Nile St',
          city: 'Cairo',
          postalCode: '11511',
          phone: '01001234567'
        }
      })
    });
    assert(badQtyOrder.status === 400 && badQtyOrder.body.error.code === 'INVALID_QUANTITY', 'POST /api/orders with negative quantity returns 400 INVALID_QUANTITY');

    // Missing customer phone
    const missingPhoneOrder = await apiRequest('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ productId: 1, quantity: 1 }],
        customer: {
          name: 'Valid User',
          email: testEmail,
          address: '10 Nile St',
          city: 'Cairo',
          postalCode: '11511',
          phone: ''
        }
      })
    });
    assert(missingPhoneOrder.status === 400, 'POST /api/orders with missing phone returns 400 VALIDATION_ERROR');

    console.log('\n--- 8. Successful Order Creation & Authoritative Pricing ---');
    // Get product 6 info before order
    const p6Res = await apiRequest('/api/products/6');
    const p6StockBefore = p6Res.body.data.product.stock;
    const p6Price = p6Res.body.data.product.price;

    const validCustomer = {
      name: 'HTTP Test User',
      email: testEmail,
      address: '77 Garden City Blvd',
      city: 'Cairo',
      postalCode: '11511',
      phone: '+201012345678'
    };

    // Client passes manipulated price and total
    const createOrderRes = await apiRequest('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ productId: 6, quantity: 2, price: 0.01 }],
        total: 0.02,
        customer: validCustomer
      })
    });

    assert(createOrderRes.status === 201 && createOrderRes.body.success === true, 'POST /api/orders returns 201 Created');
    const createdOrder = createOrderRes.body.data.order;
    const expectedP6Total = Number((p6Price * 2).toFixed(2));
    assert(createdOrder.totalAmount === expectedP6Total, `Total amount computed strictly from SQLite catalog ($${createdOrder.totalAmount} === $${expectedP6Total})`);
    assert(createdOrder.items.length === 1 && createdOrder.items[0].price === p6Price, 'Order items record historical price');

    // Verify stock decreased via HTTP
    const p6ResAfter = await apiRequest('/api/products/6');
    assert(p6ResAfter.body.data.product.stock === p6StockBefore - 2, `Product stock decremented in database (${p6StockBefore} -> ${p6ResAfter.body.data.product.stock})`);

    console.log('\n--- 9. Insufficient Stock & Nonexistent Products HTTP Handling ---');
    // Try to order 10,000 units of product 6
    const overStockOrder = await apiRequest('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ productId: 6, quantity: 10000 }],
        customer: validCustomer
      })
    });
    assert(overStockOrder.status === 400 || overStockOrder.status === 409, 'Over-limit stock order rejected (status: ' + overStockOrder.status + ')');

    // Try nonexistent product 99999
    const nonExistentOrder = await apiRequest('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ productId: 99999, quantity: 1 }],
        customer: validCustomer
      })
    });
    assert(nonExistentOrder.status === 404 && nonExistentOrder.body.error.code === 'PRODUCT_NOT_FOUND', 'Nonexistent product returns 404 PRODUCT_NOT_FOUND');

    console.log('\n--- 10. Order History & Ownership Enforcement ---');
    const myOrdersRes = await apiRequest('/api/orders');
    assert(myOrdersRes.status === 200 && myOrdersRes.body.data.orders.length >= 1, 'GET /api/orders returns 200 with user orders list');

    const singleOrderRes = await apiRequest(`/api/orders/${createdOrder.id}`);
    assert(singleOrderRes.status === 200 && singleOrderRes.body.data.order.id === createdOrder.id, 'GET /api/orders/:id returns 200 with order breakdown');
    assert(singleOrderRes.body.data.order.customer.address === validCustomer.address, 'Order details contain shipping address');

    // Register User 2 and verify isolation
    sessionCookie = '';
    const user2Email = `http_user2_${Date.now()}@example.com`;
    const regUser2 = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'User 2', email: user2Email, password: 'password123' })
    });
    assert(regUser2.status === 201, 'User 2 registered and authenticated');

    // User 2 tries to access User 1's order
    const crossAccessRes = await apiRequest(`/api/orders/${createdOrder.id}`);
    assert(crossAccessRes.status === 404 && crossAccessRes.body.error.code === 'ORDER_NOT_FOUND', 'Cross-user order access denied with 404 ORDER_NOT_FOUND');

    const user2OrdersRes = await apiRequest('/api/orders');
    assert(user2OrdersRes.status === 200 && user2OrdersRes.body.data.orders.length === 0, 'User 2 order list is empty initially');

    console.log('====================================================');
    console.log(`📊 HTTP API Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log('====================================================');

    server.close();
    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('HTTP Test Exception:', err);
    server.close();
    process.exit(1);
  }
}

runHttpTests();
