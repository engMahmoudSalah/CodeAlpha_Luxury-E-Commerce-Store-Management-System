# LuxeStore — Full-Stack E-Commerce Application

A complete, production-ready basic e-commerce web application with server-authoritative inventory, transactional order processing, and a modern vanilla HTML5/CSS3/JavaScript frontend.

---

## 1. Technology Stack

* **Frontend:** HTML5, CSS3 (Custom responsive design system), Vanilla JavaScript (ES Modules), Fetch API.
* **Backend:** Node.js, Express.js (RESTful API architecture).
* **Database:** SQLite with `better-sqlite3` (WAL mode enabled, strict foreign keys, atomic transactions).
* **Security & Auth:** `bcryptjs` (password hashing with salt rounds), server-side session management via `cookie-parser` and `httpOnly` secure cookies.

---

## 2. Architecture & Directory Structure

```text
├── database/
│   ├── schema.sql              # Relational DDL: users, sessions, products, orders, order_items
│   ├── seed.js                 # Initial seeder with realistic product catalog
│   └── ecommerce.db            # SQLite persistent database file
├── public/                     # Static Frontend Assets
│   ├── css/
│   │   └── style.css           # Unified responsive design system & component stylesheets
│   ├── js/
│   │   ├── api.js              # Centralized Fetch client with standardized error handling
│   │   ├── auth.js             # Client-side session and auth modal management
│   │   ├── cart.js             # Client cart engine with storage sanitization
│   │   ├── utils.js            # Toast notifications, currency formatting, HTML escaping
│   │   └── pages/              # Individual Page Controllers
│   │       ├── index.js        # Catalog, category filtering, search, sorting, details modal
│   │       ├── cart-page.js    # Live price/stock validation, quantity stepper, stock warnings
│   │       ├── checkout-page.js# Shipping validation, duplicate submission lock, order creation
│   │       ├── order-success-page.js # Itemized order receipt with historical prices
│   │       └── orders-page.js  # Authenticated order history
│   ├── index.html              # Store catalog & product quick-view modal
│   ├── cart.html               # Shopping cart & stock check
│   ├── checkout.html           # Shipping & checkout form
│   ├── order-success.html      # Order confirmation receipt
│   └── orders.html             # User order history
├── server/                     # Express.js REST API Backend
│   ├── config/
│   │   └── database.js         # SQLite connection with WAL mode & foreign keys
│   ├── middleware/
│   │   ├── auth.js             # Session validation & route authentication guards
│   │   ├── errorHandler.js     # Standardized JSON error response handler
│   │   └── validation.js       # Request payload schemas and parameter sanitizers
│   ├── routes/
│   │   ├── auth.js             # Authentication routes (/api/auth)
│   │   ├── products.js         # Products catalog routes (/api/products)
│   │   └── orders.js           # Transactional orders routes (/api/orders)
│   ├── services/
│   │   ├── authService.js      # Password hashing, registration, login, sessions
│   │   ├── productService.js   # Product querying, search, categories, sorting
│   │   └── orderService.js     # Atomic order creation, stock verification & deduction
│   ├── server.js               # Express application entry point
│   ├── test-foundation.js      # Phase 1 backend unit tests
│   ├── test-phase2.js          # Phase 2 auth & product service unit tests
│   ├── test-phase3.js          # Phase 3 transactional order processing tests
│   ├── test-api-http.js        # End-to-end HTTP API integration tests
│   └── test-frontend-cart.js   # Automated client-side cart logic tests
├── package.json
└── README.md
```

---

## 3. Database Schema

* **`users`**: `id`, `name`, `email` (UNIQUE), `password_hash`, `created_at`.
* **`sessions`**: `id` (UUID token), `user_id` (FK -> users), `expires_at`, `created_at`.
* **`products`**: `id`, `name`, `description`, `price` (DECIMAL), `stock` (CHECK stock >= 0), `category`, `image_url`, `created_at`.
* **`orders`**: `id`, `user_id` (FK -> users), `total_amount` (DECIMAL), `status`, `customer_name`, `customer_email`, `customer_address`, `customer_city`, `customer_postal`, `customer_phone`, `created_at`.
* **`order_items`**: `id`, `order_id` (FK -> orders ON DELETE CASCADE), `product_id` (FK -> products), `quantity` (CHECK quantity > 0), `price` (historical unit price snapshot at purchase time).

---

## 4. RESTful API Endpoints

### Authentication (`/api/auth`)
* `POST /api/auth/register` — Register a new account (`name`, `email`, `password`).
* `POST /api/auth/login` — Sign in with email & password. Establishes `httpOnly` session.
* `POST /api/auth/logout` — Revokes session in database and clears session cookie.
* `GET /api/auth/me` — Returns authenticated user profile (`id`, `name`, `email`).

### Products (`/api/products`)
* `GET /api/products` — Query catalog with optional `category`, `search`, and `sort` (`newest`, `price_asc`, `price_desc`, `name_asc`, `name_desc`).
* `GET /api/products/categories` — List distinct categories.
* `GET /api/products/:id` — Retrieve single product details with authoritative stock.

### Orders (`/api/orders`) — *Requires Authentication*
* `POST /api/orders` — Create a new order inside an atomic SQLite transaction. Authoritatively calculates order subtotal, checks live inventory, decrements product stock, records historical unit price per item, and saves customer shipping details.
* `GET /api/orders` — List past orders for the authenticated user.
* `GET /api/orders/:id` — Retrieve itemized receipt for an order (strictly isolated to owner).

---

## 5. Security & Transaction Rules

1. **Authoritative Backend Pricing & Stock**: The client cart only transmits `{ productId, quantity }`. All price calculations and stock availability checks are executed strictly server-side against SQLite inside an atomic transaction.
2. **Password Security**: Passwords are encrypted with `bcrypt` (10 rounds). Plaintext passwords and hashes are never exposed via APIs or stored in frontend storage.
3. **Session Management**: Session tokens are cryptographically generated UUIDs stored in the SQLite database and transmitted via `httpOnly`, `SameSite=Lax` cookies.
4. **Data Isolation**: Users can only retrieve orders they created; cross-user lookups return 404.

---

## 6. How to Run & Test

### Installation & Database Initialization
```bash
npm install
npm run seed
```

### Starting the Server
```bash
npm start
# App runs at http://localhost:3000
```

### Running the Full Test Suite
```bash
npm test
```

All 5 test suites (141 tests total) will run in sequence:
* Foundation unit tests (`test:foundation`)
* Auth & Product service tests (`test:phase2`)
* Transactional Order service tests (`test:phase3`)
* End-to-end HTTP API integration tests (`test:api`)
* Automated Frontend Cart logic tests (`test:frontend`)
