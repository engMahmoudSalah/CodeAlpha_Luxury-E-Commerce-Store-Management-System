import { db, initDatabase } from './config/database.js';
import { seed } from '../database/seed.js';
import { createUser, verifyPassword, findUserByEmail, findUserById } from './services/authService.js';
import { createOrder, getUserOrders, getUserOrderById, OrderError } from './services/orderService.js';
import { getProductById, getAllProducts } from './services/productService.js';
import http from 'http';
import { app } from './server.js';

console.log('====================================================');
console.log('🛡️ Starting Deep Security & Concurrency Verification Test Suite...');
console.log('====================================================');

initDatabase();
seed();

db.prepare('UPDATE products SET stock = 100').run();

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

// HTTP request helper
function makeRequest(server, options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: parsed
        });
      });
    });

    req.on('error', reject);

    if (body) {
      if (typeof body === 'object') {
        req.setHeader('Content-Type', 'application/json');
        req.write(JSON.stringify(body));
      } else {
        req.write(body);
      }
    }
    req.end();
  });
}

function extractCookie(headers) {
  const setCookie = headers['set-cookie'];
  if (!setCookie) return null;
  const cookieStr = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  return cookieStr.split(';')[0];
}

async function runDeepSecurityTests() {
  const testServer = http.createServer(app);
  await new Promise((resolve) => testServer.listen(0, '127.0.0.1', resolve));
  const port = testServer.address().port;

  try {
    const timestamp = Date.now();
    const userAEmail = `sec_user_a_${timestamp}@example.com`;
    const userBEmail = `sec_user_b_${timestamp}@example.com`;
    const password = 'StrongPassword123!';

    // ==========================================
    // 1. Session Security & Fixation
    // ==========================================
    console.log('\n--- 1. Session Security & Fixation ---');

    // Register User A
    const regRes = await makeRequest(testServer, {
      hostname: '127.0.0.1',
      port,
      path: '/api/auth/register',
      method: 'POST'
    }, { name: 'Security User A', email: userAEmail, password });

    assert(regRes.status === 201, 'User A registered successfully');
    const userACookie = extractCookie(regRes.headers);
    assert(userACookie && userACookie.startsWith('ecommerce.sid='), 'Session cookie established with ecommerce.sid prefix');

    // Check Set-Cookie headers for httpOnly & SameSite
    const setCookieHeader = regRes.headers['set-cookie'][0]; 
    assert(setCookieHeader.toLowerCase().includes('httponly'), 'Cookie contains HttpOnly flag');
    assert(setCookieHeader.toLowerCase().includes('samesite=lax'), 'Cookie contains SameSite=Lax flag');

    // Verify session ID is not stored in user body
    assert(!regRes.body.data.user.password_hash, 'Password hash excluded from response');
    assert(!regRes.body.data.user.password, 'Plaintext password excluded from response');
    assert(!regRes.body.data.user.session, 'Session secret not exposed in response body');

    // Test Me endpoint with valid session
    const meRes1 = await makeRequest(testServer, {
      hostname: '127.0.0.1',
      port,
      path: '/api/auth/me',
      method: 'GET',
      headers: { Cookie: userACookie }
    });
    assert(meRes1.status === 200 && meRes1.body.data.user.email === userAEmail, 'Me endpoint authenticates with valid session cookie');

    // Logout
    const logoutRes = await makeRequest(testServer, {
      hostname: '127.0.0.1',
      port,
      path: '/api/auth/logout',
      method: 'POST',
      headers: { Cookie: userACookie }
    });
    assert(logoutRes.status === 200, 'Logout succeeds with 200 OK');

    // Attempt to reuse old session after logout
    const meAfterLogout = await makeRequest(testServer, {
      hostname: '127.0.0.1',
      port,
      path: '/api/auth/me',
      method: 'GET',
      headers: { Cookie: userACookie }
    });
    assert(meAfterLogout.status === 401, 'Old session cookie rejected after logout (401 Unauthorized)');

    // Test malformed / invalid / forged cookies
    const invalidCookies = [
      'ecommerce.sid=forged_fake_session_id',
      'ecommerce.sid=s%3Ainvalid_signature_token',
      'ecommerce.sid=',
      'connect.sid=legacy_cookie',
      'ecommerce.sid=../../etc/passwd'
    ];

    for (const badCookie of invalidCookies) {
      const badRes = await makeRequest(testServer, {
        hostname: '127.0.0.1',
        port,
        path: '/api/auth/me',
        method: 'GET',
        headers: { Cookie: badCookie }
      });
      assert(badRes.status === 401, `Invalid cookie "${badCookie.substring(0, 25)}..." rejected with 401`);
    }

    // ==========================================
    // 2. Authentication Enumeration Prevention
    // ==========================================
    console.log('\n--- 2. Authentication Enumeration Resistance ---');
    // Login with existing email + wrong password
    const wrongPassRes = await makeRequest(testServer, {
      hostname: '127.0.0.1',
      port,
      path: '/api/auth/login',
      method: 'POST'
    }, { email: userAEmail, password: 'WrongPassword999!' });

    // Login with non-existent email + wrong password
    const nonExistentRes = await makeRequest(testServer, {
      hostname: '127.0.0.1',
      port,
      path: '/api/auth/login',
      method: 'POST'
    }, { email: `nonexistent_${timestamp}@example.com`, password: 'WrongPassword999!' });

    assert(wrongPassRes.status === 401, 'Existing user + wrong password returns 401');
    assert(nonExistentRes.status === 401, 'Nonexistent user returns 401');
    assert(wrongPassRes.body.error.message === nonExistentRes.body.error.message, 'Identical generic error message returned preventing email enumeration');

    // ==========================================
    // 3. Cross-User Authorization & Data Isolation
    // ==========================================
    console.log('\n--- 3. Cross-User Authorization & Order Isolation ---');

    // Login User A
    const loginARes = await makeRequest(testServer, {
      hostname: '127.0.0.1',
      port,
      path: '/api/auth/login',
      method: 'POST'
    }, { email: userAEmail, password });
    const userAActiveCookie = extractCookie(loginARes.headers);

    // Register & Login User B
    const regBRes = await makeRequest(testServer, {
      hostname: '127.0.0.1',
      port,
      path: '/api/auth/register',
      method: 'POST'
    }, { name: 'Security User B', email: userBEmail, password });
    const userBCookie = extractCookie(regBRes.headers);

    // User A creates an order
    const orderPayload = {
      items: [{ productId: 1, quantity: 1 }],
      customer: {
        name: 'User A Secret Name',
        email: userAEmail,
        address: '123 Private St',
        city: 'Alexandria',
        postalCode: '21500',
        phone: '+201009998877'
      }
    };

    const createOrderRes = await makeRequest(testServer, {
      hostname: '127.0.0.1',
      port,
      path: '/api/orders',
      method: 'POST',
      headers: { Cookie: userAActiveCookie }
    }, orderPayload);

    assert(createOrderRes.status === 201, 'User A order created');
    const orderAId = createOrderRes.body.data.order.id;

    // User B attempts to access User A's order by ID
    const crossAccessRes = await makeRequest(testServer, {
      hostname: '127.0.0.1',
      port,
      path: `/api/orders/${orderAId}`,
      method: 'GET',
      headers: { Cookie: userBCookie }
    });

    assert(crossAccessRes.status === 404, 'User B accessing User A order returns 404 NOT_FOUND');
    assert(!crossAccessRes.body.data, 'No customer details or order items leaked to User B');

    // User B retrieves their own order list
    const userBOrdersRes = await makeRequest(testServer, {
      hostname: '127.0.0.1',
      port,
      path: '/api/orders',
      method: 'GET',
      headers: { Cookie: userBCookie }
    });
    assert(userBOrdersRes.status === 200 && userBOrdersRes.body.data.orders.length === 0, 'User B order list contains 0 orders (does not list User A order)');

    // ==========================================
    // 4. Price & Total Tampering Attack Defense
    // ==========================================
    console.log('\n--- 4. Price & Total Tampering Defenses ---');
    const prod1 = getProductById(1);
    const prod2 = getProductById(2);

    const maliciousOrderRes = await makeRequest(testServer, {
      hostname: '127.0.0.1',
      port,
      path: '/api/orders',
      method: 'POST',
      headers: { Cookie: userAActiveCookie }
    }, {
      items: [
        { productId: 1, quantity: 1, price: 0.01, subtotal: 0.01 },
        { productId: 2, quantity: 1, price: 999999, subtotal: 999999 }
      ],
      total: 0.01, // Client attempting to dictate total
      customer: {
        name: 'User A',
        email: userAEmail,
        address: '123 Test St',
        city: 'Cairo',
        postalCode: '11511',
        phone: '+201001112233'
      }
    });

    assert(maliciousOrderRes.status === 201, 'Order created successfully');
    const expectedServerTotal = Number((prod1.price + prod2.price).toFixed(2));
    assert(
      maliciousOrderRes.body.data.order.totalAmount === expectedServerTotal,
      `Calculated total strictly uses SQLite prices ($${maliciousOrderRes.body.data.order.totalAmount} === $${expectedServerTotal}), ignoring fake prices`
    );

    // ==========================================
    // 5. Quantity & Product ID Parameter Boundary Testing
    // ==========================================
    console.log('\n--- 5. Quantity & Product ID Manipulation Defenses ---');
    const invalidQuantityPayloads = [
      { quantity: 0, desc: 'quantity = 0' },
      { quantity: -1, desc: 'quantity = -1' },
      { quantity: -999, desc: 'quantity = -999' },
      { quantity: 1.5, desc: 'quantity = 1.5 (float)' },
      { quantity: '10', desc: 'quantity = "10" (string)' },
      { quantity: null, desc: 'quantity = null' },
      { quantity: 999999, desc: 'quantity = 999999 (> 1000 limit)' }
    ];

    for (const testCase of invalidQuantityPayloads) {
      const qRes = await makeRequest(testServer, {
        hostname: '127.0.0.1',
        port,
        path: '/api/orders',
        method: 'POST',
        headers: { Cookie: userAActiveCookie }
      }, {
        items: [{ productId: 1, quantity: testCase.quantity }],
        customer: orderPayload.customer
      });
      assert(qRes.status === 400, `Rejected invalid ${testCase.desc} with 400 Bad Request`);
    }

    const invalidProductIdPayloads = [
      { productId: 0, desc: 'productId = 0' },
      { productId: -1, desc: 'productId = -1' },
      { productId: 1.5, desc: 'productId = 1.5 (float)' },
      { productId: 'abc', desc: 'productId = "abc"' },
      { productId: null, desc: 'productId = null' }
    ];

    for (const testCase of invalidProductIdPayloads) {
      const pidRes = await makeRequest(testServer, {
        hostname: '127.0.0.1',
        port,
        path: '/api/orders',
        method: 'POST',
        headers: { Cookie: userAActiveCookie }
      }, {
        items: [{ productId: testCase.productId, quantity: 1 }],
        customer: orderPayload.customer
      });
      assert(pidRes.status === 400, `Rejected invalid ${testCase.desc} with 400 Bad Request`);
    }

    // ==========================================
    // 6. Stock Oversell & Concurrency Race Condition
    // ==========================================
    console.log('\n--- 6. Stock Oversell & Concurrency Verification ---');

    // Create a dedicated limited stock test product in SQLite
    const insertTestProdStmt = db.prepare(`
      INSERT INTO products (name, description, price, category, stock, image_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const limitedProdInfo = insertTestProdStmt.run(
      'Concurrency Test Item',
      'Test item with stock=1',
      99.99,
      'Test',
      1,
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'
    );
    const limitedProdId = Number(limitedProdInfo.lastInsertRowid);

    // Launch 2 concurrent order requests competing for 1 item
    const concurrentReq1 = makeRequest(testServer, {
      hostname: '127.0.0.1',
      port,
      path: '/api/orders',
      method: 'POST',
      headers: { Cookie: userAActiveCookie }
    }, {
      items: [{ productId: limitedProdId, quantity: 1 }],
      customer: orderPayload.customer
    });

    const concurrentReq2 = makeRequest(testServer, {
      hostname: '127.0.0.1',
      port,
      path: '/api/orders',
      method: 'POST',
      headers: { Cookie: userBCookie }
    }, {
      items: [{ productId: limitedProdId, quantity: 1 }],
      customer: orderPayload.customer
    });

    const [res1, res2] = await Promise.all([concurrentReq1, concurrentReq2]);

    const successes = [res1, res2].filter(r => r.status === 201).length;
    const failures = [res1, res2].filter(r => r.status === 409 || r.status === 400).length;

    assert(successes === 1, `Concurrency race test: Exactly 1 order succeeded (successes: ${successes})`);
    assert(failures === 1, `Concurrency race test: Competing order failed safely (failures: ${failures})`);

    const limitedProdAfter = getProductById(limitedProdId);
    assert(limitedProdAfter.stock === 0, `Database stock is exactly 0 (not negative: ${limitedProdAfter.stock})`);

    // High Concurrency Test: 10 concurrent requests on product with stock=5
    console.log('\n--- 7. High-Concurrency Stock Test (10 requests on stock=5) ---');
    const highConcProdInfo = insertTestProdStmt.run(
      'High Concurrency Test Item',
      'Stock = 5',
      49.99,
      'Test',
      5,
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'
    );
    const highConcProdId = Number(highConcProdInfo.lastInsertRowid);

    const concurrent10Promises = [];
    for (let i = 0; i < 10; i++) {
      concurrent10Promises.push(
        makeRequest(testServer, {
          hostname: '127.0.0.1',
          port,
          path: '/api/orders',
          method: 'POST',
          headers: { Cookie: userAActiveCookie }
        }, {
          items: [{ productId: highConcProdId, quantity: 1 }],
          customer: orderPayload.customer
        })
      );
    }

    const results10 = await Promise.all(concurrent10Promises);
    const successes10 = results10.filter(r => r.status === 201).length;
    const failures10 = results10.filter(r => r.status === 409 || r.status === 400).length;

    assert(successes10 === 5, `High concurrency test: Exactly 5 out of 10 requests succeeded (successes: ${successes10})`);
    assert(failures10 === 5, `High concurrency test: Exactly 5 requests rejected (failures: ${failures10})`);

    const highConcProdAfter = getProductById(highConcProdId);
    assert(highConcProdAfter.stock === 0, `Database stock after 10 concurrent requests is exactly 0 (${highConcProdAfter.stock})`);

    // ==========================================
    // 8. Transaction Rollback Atomicity
    // ==========================================
    console.log('\n--- 8. Multi-Item Transaction Rollback Atomicity ---');
    const rollbackProd1 = insertTestProdStmt.run('Rollback Item 1', 'Desc', 20.0, 'Test', 10, 'img');
    const rollbackProd2 = insertTestProdStmt.run('Rollback Item 2', 'Desc', 30.0, 'Test', 2, 'img');

    const rbId1 = Number(rollbackProd1.lastInsertRowid);
    const rbId2 = Number(rollbackProd2.lastInsertRowid);

    const ordersCountBefore = db.prepare('SELECT count(*) as c FROM orders').get().c;
    const orderItemsCountBefore = db.prepare('SELECT count(*) as c FROM order_items').get().c;

    const rollbackOrderRes = await makeRequest(testServer, {
      hostname: '127.0.0.1',
      port,
      path: '/api/orders',
      method: 'POST',
      headers: { Cookie: userAActiveCookie }
    }, {
      items: [
        { productId: rbId1, quantity: 2 }, // valid (stock 10 >= 2)
        { productId: rbId2, quantity: 5 }  // invalid (stock 2 < 5)
      ],
      customer: orderPayload.customer
    });

    assert(rollbackOrderRes.status === 409, 'Order with 1 insufficient item rejected with 409 INSUFFICIENT_STOCK');

    const rb1After = getProductById(rbId1);
    const rb2After = getProductById(rbId2);
    const ordersCountAfter = db.prepare('SELECT count(*) as c FROM orders').get().c;
    const orderItemsCountAfter = db.prepare('SELECT count(*) as c FROM order_items').get().c;

    assert(rb1After.stock === 10, 'Item 1 stock remained 10 (was rolled back, not decremented)');
    assert(rb2After.stock === 2, 'Item 2 stock remained 2 (untouched)');
    assert(ordersCountAfter === ordersCountBefore, 'No partial order record was inserted into orders table');
    assert(orderItemsCountAfter === orderItemsCountBefore, 'No partial order item was inserted into order_items table');

    // ==========================================
    // 9. Historical Price Permanence
    // ==========================================
    console.log('\n--- 9. Historical Price Permanence ---');
    const histProdInfo = insertTestProdStmt.run('Historical Price Test Item', 'Desc', 150.0, 'Test', 10, 'img');
    const histProdId = Number(histProdInfo.lastInsertRowid);

    // Place order at $150.00
    const histOrderRes = await makeRequest(testServer, {
      hostname: '127.0.0.1',
      port,
      path: '/api/orders',
      method: 'POST',
      headers: { Cookie: userAActiveCookie }
    }, {
      items: [{ productId: histProdId, quantity: 1 }],
      customer: orderPayload.customer
    });

    assert(histOrderRes.status === 201, 'Order created with unit price $150.00');
    const histOrderId = histOrderRes.body.data.order.id;

    // Mutate catalog product price to $300.00
    db.prepare('UPDATE products SET price = 300.00 WHERE id = ?').run(histProdId);
    const updatedProd = getProductById(histProdId);
    assert(updatedProd.price === 300.0, 'Catalog product price updated to $300.00');

    // Retrieve historical order
    const getHistOrderRes = await makeRequest(testServer, {
      hostname: '127.0.0.1',
      port,
      path: `/api/orders/${histOrderId}`,
      method: 'GET',
      headers: { Cookie: userAActiveCookie }
    });

    assert(getHistOrderRes.status === 200, 'Retrieved historical order');
    assert(getHistOrderRes.body.data.order.items[0].price === 150.0, 'Historical item price remains $150.00');
    assert(getHistOrderRes.body.data.order.totalAmount === 150.0, 'Historical order total remains $150.00');

    // ==========================================
    // 10. SQL Injection Adversarial Test
    // ==========================================
    console.log('\n--- 10. SQL Injection Adversarial Resistance ---');
    const sqliPayloads = [
      "' OR 1=1 --",
      "' UNION SELECT null, name, password_hash, null, null, null FROM users --",
      "'; DROP TABLE products; --",
      "1; DROP TABLE orders; --",
      "admin'--",
      "1 OR 1=1"
    ];

    for (const payload of sqliPayloads) {
      // Test search
      const searchRes = await makeRequest(testServer, {
        hostname: '127.0.0.1',
        port,
        path: `/api/products?search=${encodeURIComponent(payload)}`,
        method: 'GET'
      });
      assert(searchRes.status === 200, `SQLi search payload handled safely (status: ${searchRes.status})`);

      // Test category
      const catRes = await makeRequest(testServer, {
        hostname: '127.0.0.1',
        port,
        path: `/api/products?category=${encodeURIComponent(payload)}`,
        method: 'GET'
      });
      assert(catRes.status === 200, `SQLi category payload handled safely (status: ${catRes.status})`);

      // Test product ID
      const pidRes = await makeRequest(testServer, {
        hostname: '127.0.0.1',
        port,
        path: `/api/products/${encodeURIComponent(payload)}`,
        method: 'GET'
      });
      assert(pidRes.status === 400 || pidRes.status === 404, `SQLi product ID rejected safely (status: ${pidRes.status})`);
    }

    // Verify products and orders tables still exist and are unharmed
    const prodCount = db.prepare('SELECT count(*) as c FROM products').get().c;
    assert(prodCount >= 12, `Products table intact after SQLi test (products count: ${prodCount})`);

    // ==========================================
    // 11. XSS & Payload Sanitization
    // ==========================================
    console.log('\n--- 11. XSS Input Handling & Sanitization ---');
    const xssPayload = '<script>alert("XSS")</script><img src=x onerror=alert(1)>';
    const xssOrderRes = await makeRequest(testServer, {
      hostname: '127.0.0.1',
      port,
      path: '/api/orders',
      method: 'POST',
      headers: { Cookie: userAActiveCookie }
    }, {
      items: [{ productId: 1, quantity: 1 }],
      customer: {
        name: xssPayload,
        email: userAEmail,
        address: xssPayload,
        city: 'Cairo',
        postalCode: '11511',
        phone: '+201009998877'
      }
    });

    assert(xssOrderRes.status === 201, 'Order created with raw text input');
    assert(xssOrderRes.body.data.order.customer.name === xssPayload, 'Server retains payload as raw string without execution');

    // ==========================================
    // 12. API Error Leakage & Robustness
    // ==========================================
    console.log('\n--- 12. API Robustness & Error Sanitization ---');
    const malformedJsonRes = await makeRequest(testServer, {
      hostname: '127.0.0.1',
      port,
      path: '/api/orders',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: userAActiveCookie
      }
    }, '{"items": [invalid_json}');

    assert(malformedJsonRes.status === 400 || malformedJsonRes.status === 500, `Malformed JSON returns controlled response (${malformedJsonRes.status})`);
    const respString = JSON.stringify(malformedJsonRes.body);
    assert(!respString.includes('/server/'), 'No filesystem path exposed in error response');
    assert(!respString.includes('password_hash'), 'No sensitive database columns exposed');

    // ==========================================
    // 13. Database Schema Integrity & Constraints
    // ==========================================
    console.log('\n--- 13. Database Schema Integrity & Constraints ---');
    const fkCheck = db.pragma('foreign_keys', { simple: true });
    assert(fkCheck === 1, `SQLite Foreign Keys enforcement active (foreign_keys = ${fkCheck})`);

    // Verify mathematical integrity of all existing orders
    const allOrders = db.prepare('SELECT * FROM orders').all();
    let mathConsistent = true;
    for (const ord of allOrders) {
      const itemsSum = db.prepare('SELECT sum(price * quantity) as total FROM order_items WHERE order_id = ?').get(ord.id).total;
      if (Math.abs(ord.total_amount - itemsSum) > 0.01) {
        mathConsistent = false;
        break;
      }
    }
    assert(mathConsistent, `All ${allOrders.length} orders match SUM(order_items.price * quantity)`);

    // Check for negative stock
    const negStock = db.prepare('SELECT count(*) as count FROM products WHERE stock < 0').get().count;
    assert(negStock === 0, 'Zero products have negative stock');

    // Check for orphan order_items
    const orphanItems = db.prepare(`
      SELECT count(*) as count FROM order_items oi
      LEFT JOIN orders o ON oi.order_id = o.id
      WHERE o.id IS NULL
    `).get().count;
    assert(orphanItems === 0, 'Zero orphan order_items found');

    // ==========================================
    // 14. Server Stability & Normal Flow Continuation
    // ==========================================
    console.log('\n--- 14. Server Stability & Post-Attack Operations ---');
    const healthCheck = await makeRequest(testServer, {
      hostname: '127.0.0.1',
      port,
      path: '/api/health',
      method: 'GET'
    });
    assert(healthCheck.status === 200 && healthCheck.body.data.status === 'healthy', 'Server is fully healthy and operational after adversarial tests');

  } finally {
    testServer.close();
  }

  console.log('\n====================================================');
  console.log(`📊 Deep Security Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runDeepSecurityTests().catch((err) => {
  console.error('Unhandled test suite error:', err);
  process.exit(1);
});
