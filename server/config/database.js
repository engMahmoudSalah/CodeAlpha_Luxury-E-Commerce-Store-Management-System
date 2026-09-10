import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root directory
const ROOT_DIR = path.resolve(__dirname, '../../');
const DB_DIR = path.join(ROOT_DIR, 'database');
const DB_PATH = path.join(DB_DIR, 'ecommerce.db');
const SCHEMA_PATH = path.join(DB_DIR, 'schema.sql');

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Open SQLite Database instance using native node:sqlite
let rawDb;

try {
  rawDb = new DatabaseSync(DB_PATH);
} catch (error) {
  console.error('Failed to initialize SQLite database:', error);
  throw error;
}

let inTransaction = false;

class DatabaseWrapper {
  constructor(dbInstance) {
    this._db = dbInstance;
  }

  prepare(sql) {
    const stmt = this._db.prepare(sql);
    return {
      get: (...params) => {
        const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        return stmt.get(...flatParams);
      },
      all: (...params) => {
        const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        return stmt.all(...flatParams);
      },
      run: (...params) => {
        const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        const res = stmt.run(...flatParams);
        return {
          changes: res.changes,
          lastInsertRowid: Number(res.lastInsertRowid),
        };
      },
    };
  }

  exec(sql) {
    return this._db.exec(sql);
  }

  pragma(str, options = {}) {
    if (options && options.simple) {
      try {
        const row = this._db.prepare(`PRAGMA ${str}`).get();
        if (row && typeof row === 'object') {
          const val = Object.values(row)[0];
          return typeof val === 'bigint' ? Number(val) : val;
        }
        return undefined;
      } catch {
        return undefined;
      }
    }

    if (str.includes('=')) {
      this._db.exec(`PRAGMA ${str};`);
      return;
    }

    try {
      return this._db.prepare(`PRAGMA ${str}`).all();
    } catch {
      this._db.exec(`PRAGMA ${str};`);
      return [];
    }
  }

  transaction(fn) {
    return (...args) => {
      if (inTransaction) {
        return fn(...args);
      }
      inTransaction = true;
      this._db.exec('BEGIN');
      try {
        const result = fn(...args);
        this._db.exec('COMMIT');
        inTransaction = false;
        return result;
      } catch (err) {
        try {
          this._db.exec('ROLLBACK');
        } catch (_) {}
        inTransaction = false;
        throw err;
      }
    };
  }

  close() {
    return this._db.close();
  }
}

const db = new DatabaseWrapper(rawDb);

// Configure SQLite settings for performance, data integrity, and foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('synchronous = NORMAL');

/**
 * Initializes the database schema idempotently using schema.sql
 */
export function initDatabase() {
  try {
    if (!fs.existsSync(SCHEMA_PATH)) {
      throw new Error(`Schema file not found at: ${SCHEMA_PATH}`);
    }
    const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    db.exec(schemaSql);
    return true;
  } catch (error) {
    console.error('Database schema initialization error:', error);
    throw error;
  }
}

export { db, DB_PATH };
export default db;
