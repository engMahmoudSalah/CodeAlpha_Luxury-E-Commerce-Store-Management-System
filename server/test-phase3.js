import { db, initDatabase } from './config/database.js';
import { seed } from '../database/seed.js';
import { createUser } from './services/authService.js';
import { createOrder, getUserOrders, getUserOrderById, OrderError } from './services/orderService.js';
import { getProductById } from './services/productService.js';

console.log('====================================================');
console.log('🧪 Starting Phase 3: Cart, Checkout & Orders Test Suite...');
console.log('====================================================');

initDatabase();
seed();

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
    // Setup test users
    const timestamp = Date.now();
    const userA = await createUser({
      name: 'Order Test User A',
      email: `user_a_${timestamp}@example.com`,
      password: 'password123'
    });

    const userB = await createUser({
      name: 'Order Test User B',
      email: `user_b_${timestamp}@example.com`,
      password: 'password123'
    });

    console.log('\n--- 1. Order Creation & Server-Side Price Calculation ---');
    // Get initial product stock and price
    const prod1Before = getProductById(1);
    const prod2Before = getProductById(2);
    assert(prod1Before && prod2Before, 'Products 1 and 2 exist in test database');

    const expectedTotal = Number(((prod1Before.price * 2) + (prod2Before.price * 1)).toFixed(2));

    const validCustomer = {
      name: 'Order Test User A',
      email: userA.email,
      address: '100 Nile Corniche Ave',
      city: 'Cairo',
      postalCode: '11511',
      phone: '+201001234567'
    };

    // Client maliciously passes price: 0.01 and total: 0.01
    const order1 = createOrder({
      userId: userA.id,
      items: [
        { productId: 1, quantity: 2, price: 0.01, subtotal: 0.02 },
        { productId: 2, quantity: 1, price: 0.01, subtotal: 0.01 }
      ],
      customer: validCustomer
    });

    assert(order1 && order1.id > 0, `Order created with valid ID: ${order1.id}`);
    assert(order1.totalAmount === expectedTotal, `Server-side price calculated accurately ($${order1.totalAmount} === $${expectedTotal}) ignoring fake client prices`);
    assert(order1.items.length === 2, 'Order contains 2 order item records');
    assert(order1.itemsCount === 3, 'Order items count sum is 3 (2 of prod 1, 1 of prod 2)');
    assert(order1.items[0].price === prod1Before.price, `Historical price for item 1 preserved in order_items as $${prod1Before.price}`);
    assert(order1.items[1].price === prod2Before.price, `Historical price for item 2 preserved in order_items as $${prod2Before.price}`);

    // Verify stock decrement in SQLite database
    const prod1After = getProductById(1);
    const prod2After = getProductById(2);
    assert(prod1After.stock === prod1Before.stock - 2, `Product 1 stock decreased by 2 (${prod1Before.stock} -> ${prod1After.stock})`);
    assert(prod2After.stock === prod2Before.stock - 1, `Product 2 stock decreased by 1 (${prod2Before.stock} -> ${prod2After.stock})`);

    console.log('\n--- 2. Stock Validation & Insufficient Stock Handling ---');
    let insufficientStockThrew = false;
    const prod3 = getProductById(3);
    const excessiveQuantity = prod3.stock + 50;

    try {
      createOrder({
        userId: userA.id,
        items: [{ productId: 3, quantity: excessiveQuantity }],
        customer: validCustomer
      });
    } catch (err) {
      insufficientStockThrew = true;
      assert(err instanceof OrderError, 'Insufficient stock throws instance of OrderError');
      assert(err.status === 409 && err.code === 'INSUFFICIENT_STOCK', `Throws 409 INSUFFICIENT_STOCK (got code: ${err.code})`);
    }
    assert(insufficientStockThrew, 'Order with excessive stock is rejected');

    const prod3AfterFail = getProductById(3);
    assert(prod3AfterFail.stock === prod3.stock, 'Product stock remains completely unchanged after failed order attempt');

    console.log('\n--- 3. Atomic Transaction Rollback Integrity ---');
    // Multi-item order where 1st product has stock, but 2nd product has insufficient stock
    const prod4Before = getProductById(4);
    const prod5Before = getProductById(5);
    const ordersCountBefore = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    const orderItemsCountBefore = db.prepare('SELECT COUNT(*) as count FROM order_items').get().count;

    let multiItemFailThrew = false;
    try {
      createOrder({
        userId: userA.id,
        items: [
          { productId: 4, quantity: 1 }, // valid
          { productId: 5, quantity: prod5Before.stock + 999 } // invalid
        ],
        customer: validCustomer
      });
    } catch (err) {
      multiItemFailThrew = true;
      assert(err.code === 'INSUFFICIENT_STOCK', 'Multi-item transaction throws INSUFFICIENT_STOCK on invalid 2nd item');
    }

    assert(multiItemFailThrew, 'Multi-item transaction rejected due to 2nd item constraint');

    // Verify rollback: Product 4 stock must NOT have decreased
    const prod4After = getProductById(4);
    const prod5After = getProductById(5);
    const ordersCountAfter = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    const orderItemsCountAfter = db.prepare('SELECT COUNT(*) as count FROM order_items').get().count;

    assert(prod4After.stock === prod4Before.stock, 'Transaction rollback: Product 4 stock was NOT decremented');
    assert(prod5After.stock === prod5Before.stock, 'Transaction rollback: Product 5 stock remained unchanged');
    assert(ordersCountAfter === ordersCountBefore, 'Transaction rollback: No partial order inserted');
    assert(orderItemsCountAfter === orderItemsCountBefore, 'Transaction rollback: No partial order_items inserted');

    console.log('\n--- 4. Nonexistent Product Handling ---');
    let nonexistentProdThrew = false;
    try {
      createOrder({
        userId: userA.id,
        items: [{ productId: 999999, quantity: 1 }],
        customer: validCustomer
      });
    } catch (err) {
      nonexistentProdThrew = true;
      assert(err.code === 'PRODUCT_NOT_FOUND' && err.status === 404, 'Nonexistent product throws 404 PRODUCT_NOT_FOUND');
    }
    assert(nonexistentProdThrew, 'Order with nonexistent product ID is rejected');

    console.log('\n--- 5. User Isolation & Order History ---');
    // Create an order for User B
    const orderForUserB = createOrder({
      userId: userB.id,
      items: [{ productId: 3, quantity: 1 }],
      customer: {
        name: 'Order Test User B',
        email: userB.email,
        address: '200 Tahrir Sq',
        city: 'Cairo',
        postalCode: '11512',
        phone: '+201009876543'
      }
    });
    assert(orderForUserB && orderForUserB.id > 0, `Order created for User B (ID: ${orderForUserB.id})`);

    // User A order history
    const userAOrders = getUserOrders(userA.id);
    assert(Array.isArray(userAOrders) && userAOrders.length >= 1, `User A retrieves their orders (found: ${userAOrders.length})`);
    assert(userAOrders.every(o => o.userId === userA.id), 'All orders in User A list belong strictly to User A');

    // User B order history
    const userBOrders = getUserOrders(userB.id);
    assert(Array.isArray(userBOrders) && userBOrders.length === 1, 'User B retrieves only their own single order');
    assert(userBOrders[0].id === orderForUserB.id, 'User B retrieved matching order ID');

    // Specific order query authorization check
    const userAFetchesOwnOrder = getUserOrderById(order1.id, userA.id);
    assert(userAFetchesOwnOrder && userAFetchesOwnOrder.id === order1.id, 'User A can retrieve their own specific order');
    assert(userAFetchesOwnOrder.customer.address === '100 Nile Corniche Ave', 'Order details include shipping address');

    // User B attempting to access User A's order
    const userBFetchesUserAOrder = getUserOrderById(order1.id, userB.id);
    assert(userBFetchesUserAOrder === null, 'User B cannot retrieve User A order (returns null / 404 without leakage)');

    // User A attempting to access User B's order
    const userAFetchesUserBOrder = getUserOrderById(orderForUserB.id, userA.id);
    assert(userAFetchesUserBOrder === null, 'User A cannot retrieve User B order (returns null / 404 without leakage)');

    console.log('\n--- 6. Authentication Guard ---');
    let unauthThrew = false;
    try {
      createOrder({
        userId: null,
        items: [{ productId: 1, quantity: 1 }],
        customer: validCustomer
      });
    } catch (err) {
      unauthThrew = true;
      assert(err.status === 401 && err.code === 'UNAUTHORIZED', 'createOrder without userId throws 401 UNAUTHORIZED');
    }
    assert(unauthThrew, 'Unauthenticated order rejected');

    console.log('====================================================');
    console.log(`📊 Phase 3 Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Phase 3 Test Failure Exception:', err);
    process.exit(1);
  }
}

runTests();
