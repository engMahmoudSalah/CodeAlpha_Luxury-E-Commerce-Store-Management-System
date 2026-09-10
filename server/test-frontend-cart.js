/**
 * Phase 4: Automated Frontend Cart Engine & Logic Unit Tests
 */

// Emulate minimal browser environment for cart.js in Node.js
const mockStorage = new Map();

global.localStorage = {
  getItem: (key) => mockStorage.get(key) || null,
  setItem: (key, val) => mockStorage.set(key, String(val)),
  removeItem: (key) => mockStorage.delete(key),
  clear: () => mockStorage.clear()
};

let lastDispatchedEvent = null;
global.window = {
  dispatchEvent: (event) => {
    lastDispatchedEvent = event;
    return true;
  },
  addEventListener: () => {}
};
global.CustomEvent = class CustomEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.detail = options.detail || {};
  }
};

// Import cart module dynamically from modern src/utils/cartStorage.ts
const {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  getCartCount
} = await import('../src/utils/cartStorage.ts');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedTests++;
  }
}

console.log('====================================================');
console.log('🧪 Starting Phase 4: Frontend Cart & UX Unit Tests...');
console.log('====================================================');

// Reset storage
localStorage.clear();

console.log('\n--- 1. Empty Cart & Initialization ---');
const initialCart = getCart();
assert(Array.isArray(initialCart) && initialCart.length === 0, 'Initial cart is empty array');
assert(getCartCount() === 0, 'Initial cart count is 0');

console.log('\n--- 2. Add Items & Duplicate Merging ---');
addToCart(1, 2);
let cart = getCart();
assert(cart.length === 1, 'Cart has 1 unique product entry');
assert(cart[0].productId === 1 && cart[0].quantity === 2, 'Product 1 added with quantity 2');
assert(getCartCount() === 2, 'Cart count is 2');
assert(lastDispatchedEvent?.type === 'cart:updated', 'Dispatches cart:updated custom event');

// Add more of the same product
addToCart(1, 3);
cart = getCart();
assert(cart.length === 1, 'Duplicate product merged into existing entry');
assert(cart[0].quantity === 5, 'Quantity increased from 2 to 5 (sum: 5)');
assert(getCartCount() === 5, 'Cart total quantity count is 5');

// Add second distinct product
addToCart(2, 1);
cart = getCart();
assert(cart.length === 2, 'Cart contains 2 distinct products');
assert(getCartCount() === 6, 'Cart total quantity is 6 (5 + 1)');

console.log('\n--- 3. Quantity Stepper Updates & Removal on Zero ---');
updateQuantity(1, 3);
cart = getCart();
assert(cart.find(i => i.productId === 1).quantity === 3, 'Quantity for product 1 updated to 3');
assert(getCartCount() === 4, 'Cart count updated to 4 (3 + 1)');

// Update quantity to 0 -> should remove item
updateQuantity(2, 0);
cart = getCart();
assert(cart.length === 1 && !cart.some(i => i.productId === 2), 'Setting quantity to 0 removes product from cart');
assert(getCartCount() === 3, 'Cart count reflects removal (total: 3)');

console.log('\n--- 4. Remove and Clear Operations ---');
removeFromCart(1);
cart = getCart();
assert(cart.length === 0, 'removeFromCart(1) emptied the cart');
assert(getCartCount() === 0, 'Cart count is 0');

// Add items again and test clearCart
addToCart(3, 4);
addToCart(4, 2);
assert(getCartCount() === 6, 'Added items 3 and 4 (total: 6)');
clearCart();
cart = getCart();
assert(cart.length === 0, 'clearCart() resets cart to empty array');
assert(getCartCount() === 0, 'Cart count is 0 after clearCart()');

console.log('\n--- 5. Malformed Storage & Corrupt JSON Resilience ---');
// Corrupt JSON
localStorage.setItem('ecommerce_cart', '{ not_valid_json }');
cart = getCart();
assert(Array.isArray(cart) && cart.length === 0, 'Corrupt JSON safely falls back to empty array without crashing');

// Non-array object
localStorage.setItem('ecommerce_cart', JSON.stringify({ productId: 1, quantity: 2 }));
cart = getCart();
assert(Array.isArray(cart) && cart.length === 0, 'Non-array storage safely resets to empty array');

// Dirty array with negative values, NaN, and duplicate product IDs
const dirtyPayload = [
  { productId: 1, quantity: 2 },
  { productId: 'invalid', quantity: 5 },
  { productId: 1, quantity: 3 }, // Duplicate ID to be merged
  { productId: 2, quantity: -10 }, // Negative quantity to be dropped
  { productId: 2, quantity: 4 },
  null,
  "corrupted string",
  { productId: 5, quantity: 0 } // Zero quantity to be dropped
];
localStorage.setItem('ecommerce_cart', JSON.stringify(dirtyPayload));
cart = getCart();

assert(cart.length === 2, 'Sanitizer stripped invalid entries and kept valid products (count: 2)');
const prod1 = cart.find(i => i.productId === 1);
const prod2 = cart.find(i => i.productId === 2);
assert(prod1 && prod1.quantity === 5, 'Merged duplicate entries for product 1 (2 + 3 = 5)');
assert(prod2 && prod2.quantity === 4, 'Retained valid entry for product 2 (quantity: 4)');
assert(getCartCount() === 9, 'Total sanitized cart count is 9 (5 + 4)');

console.log('\n--- 6. Parameter Boundary Validation ---');
let caughtInvalidId = false;
try {
  addToCart(-5, 1);
} catch (e) {
  caughtInvalidId = true;
}
assert(caughtInvalidId, 'addToCart with negative ID is rejected');

let caughtInvalidQty = false;
try {
  addToCart(1, 0);
} catch (e) {
  caughtInvalidQty = true;
}
assert(caughtInvalidQty, 'addToCart with 0 quantity is rejected');

console.log('====================================================');
console.log(`📊 Frontend Cart Tests: ${passedTests} Passed, ${failedTests} Failed`);
console.log('====================================================');

if (failedTests > 0) {
  process.exit(1);
}
