import { db } from '../server/config/database.js';

export function runMigrations() {
  // 1. Add phone column to users table if it doesn't exist
  try {
    const columns = db.pragma('table_info(users)');
    const hasPhone = columns.some(col => col.name === 'phone');
    if (!hasPhone) {
      db.prepare('ALTER TABLE users ADD COLUMN phone TEXT').run();
      console.log('Migration: Added phone column to users table.');
    }
  } catch (error) {
    console.error('Migration error (users.phone):', error);
  }

  // 2. Create addresses table
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS addresses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        label TEXT NOT NULL,
        recipient_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        address_line1 TEXT NOT NULL,
        address_line2 TEXT,
        city TEXT NOT NULL,
        state TEXT,
        postal_code TEXT NOT NULL,
        country TEXT NOT NULL,
        is_default INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
    `);
    console.log('Migration: Addresses table ensured.');
  } catch (error) {
    console.error('Migration error (addresses table):', error);
  }
}
