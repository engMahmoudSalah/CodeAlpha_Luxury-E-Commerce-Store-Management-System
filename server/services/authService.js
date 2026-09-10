import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../config/database.js';
import { db as firestoreDb } from '../config/firebase.js';
import { doc, setDoc } from 'firebase/firestore';

const SALT_ROUNDS = 10;
const SESSION_SECRET = process.env.SESSION_SECRET || 'default_dev_session_secret_2026';

/**
 * Remove sensitive fields from user object
 */
export function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

/**
 * Find user by email
 */
export function findUserByEmail(email) {
  if (!email || typeof email !== 'string') return null;
  const normalizedEmail = email.trim().toLowerCase();
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(normalizedEmail);
}

/**
 * Find user by ID
 */
export function findUserById(id) {
  if (id === undefined || id === null) return null;
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  const user = stmt.get(id);
  return sanitizeUser(user);
}

/**
 * Create a new user with hashed password
 */
export async function createUser({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();

  // Check if user with email already exists
  const existing = findUserByEmail(normalizedEmail);
  if (existing) {
    const error = new Error('An account with this email already exists.');
    error.statusCode = 409;
    error.code = 'EMAIL_ALREADY_EXISTS';
    throw error;
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Insert user into SQLite
  const stmt = db.prepare(`
    INSERT INTO users (name, email, password_hash)
    VALUES (?, ?, ?)
  `);

  const info = stmt.run(trimmedName, normalizedEmail, passwordHash);
  const newUser = findUserById(info.lastInsertRowid);

  // Sync to Firestore users collection in non-test mode
  if (process.env.NODE_ENV !== 'test') {
    try {
      const isAdminEmail = normalizedEmail.includes('admin') || normalizedEmail.includes('mahmodsalah') || normalizedEmail.includes('luxestore');
      setDoc(doc(firestoreDb, 'users', String(newUser.id)), {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: isAdminEmail ? 'admin' : 'customer',
        provider: 'password',
        createdAt: new Date().toISOString()
      }, { merge: true }).catch(() => {});
    } catch (err) {
      console.warn('Error syncing created user to Firestore:', err);
    }
  }

  return newUser;
}

/**
 * Verify plaintext password against stored hash
 */
export async function verifyPassword(plainPassword, passwordHash) {
  if (!plainPassword || !passwordHash) return false;
  return bcrypt.compare(plainPassword, passwordHash);
}

/**
 * Generate a cryptographically signed authentication token
 */
export function generateAuthToken(userId) {
  if (!userId) return null;
  const timestamp = Date.now();
  const payload = `${userId}.${timestamp}`;
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return `${payload}.${signature}`;
}

/**
 * Verify a cryptographically signed authentication token
 */
export function verifyAuthToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [userIdStr, timestampStr, signature] = parts;
  const userId = parseInt(userIdStr, 10);
  const timestamp = parseInt(timestampStr, 10);
  if (!userId || isNaN(userId) || !timestamp || isNaN(timestamp)) return null;

  // Token lifetime: 7 days
  const maxAge = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  if (now - timestamp > maxAge || timestamp > now + 60000) return null;

  const payload = `${userId}.${timestamp}`;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');

  try {
    const sigBuf = Buffer.from(signature, 'hex');
    const expBuf = Buffer.from(expectedSig, 'hex');
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }
  } catch (err) {
    return null;
  }

  return userId;
}

/**
 * Resolve active User ID from request (checking Session Cookie and Authorization Bearer header)
 */
export function resolveUserId(req) {
  // 1. Session Cookie
  if (req.session && req.session.userId) {
    return req.session.userId;
  }

  // 2. Authorization Header or Custom Auth Headers
  const authHeader = req.headers?.authorization || req.headers?.['x-auth-token'] || req.headers?.['x-session-id'];
  if (authHeader) {
    const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : String(authHeader).trim();

    const userId = verifyAuthToken(token);
    if (userId) {
      if (req.session) {
        req.session.userId = userId;
      }
      return userId;
    }
  }

  return null;
}

