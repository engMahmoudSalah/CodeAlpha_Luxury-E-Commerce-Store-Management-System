import express from 'express';
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

import { initDatabase, DB_PATH } from './config/database.js';
import { seed } from '../database/seed.js';
import { runMigrations } from '../database/migrations.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import geminiRoutes from './routes/geminiRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

// Initialize database schema and verify seed products
initDatabase();
runMigrations();
seed();

const app = express();
app.set('trust proxy', true);
const PORT = 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'fakhama_dev_session_secret_2026';

if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
  console.warn('WARNING: SESSION_SECRET is not set in production. Using fallback secret.');
}

// Body and Cookie Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(SESSION_SECRET));

const SQLiteStore = connectSqlite3(session);

// Express Session configuration
app.use(
  session({
    store: new SQLiteStore({
      db: 'sessions.db',
      dir: path.dirname(DB_PATH)
    }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: 'ecommerce.sid',
    cookie: {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
  })
);

// Environment-adaptive cookie configuration
export function adaptSessionCookie(req) {
  if (req.session && req.session.cookie) {
    const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https' || req.headers['x-forwarded-ssl'] === 'on';
    if (isHttps) {
      req.session.cookie.secure = true;
      req.session.cookie.sameSite = 'none';
    } else {
      req.session.cookie.secure = false;
      req.session.cookie.sameSite = 'lax';
    }
  }
}

app.use((req, res, next) => {
  adaptSessionCookie(req);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    },
    message: 'E-Commerce API is running smoothly'
  });
});

// Firebase configuration & status endpoint
app.get('/api/firebase/info', (req, res) => {
  try {
    const config = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'firebase-applet-config.json'), 'utf8'));
    res.status(200).json({
      success: true,
      data: {
        projectId: config.projectId,
        databaseId: config.firestoreDatabaseId,
        authDomain: config.authDomain,
        storageBucket: config.storageBucket,
        integrated: true
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Mount API Routers
app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/gemini', geminiRoutes);

// API 404 Catch-all Handler
app.use('/api', notFoundHandler);

// Vite middleware for development & SPA static fallback for production
if (process.env.NODE_ENV !== 'test') {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(ROOT_DIR, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }
}

// Global Error Handler
app.use(errorHandler);

// Start server if run directly as main entrypoint
let server;
const isMainModule = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule && process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`===========================================`);
    console.log(`🚀 E-Commerce Store Server is Live!`);
    console.log(`📡 Listening on: http://0.0.0.0:${PORT}`);
    console.log(`🏥 Health Check: http://0.0.0.0:${PORT}/api/health`);
    console.log(`===========================================`);
  });
}

export { app, server };
export default app;
