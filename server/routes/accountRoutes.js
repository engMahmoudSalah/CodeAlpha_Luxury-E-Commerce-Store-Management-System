import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { db } from '../config/database.js';
import bcrypt from 'bcryptjs';

const router = Router();

// Get account details
router.get('/', requireAuth, (req, res, next) => {
  try {
    const user = req.user;
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
});

// Update profile
router.patch('/', requireAuth, (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const userId = req.user.id;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ success: false, error: { message: 'Name is required' } });
    }

    db.prepare('UPDATE users SET name = ?, phone = ? WHERE id = ?').run(name.trim(), phone?.trim() || null, userId);
    
    const updatedUser = db.prepare('SELECT id, name, email, phone, created_at FROM users WHERE id = ?').get(userId);
    
    res.json({ success: true, data: { user: updatedUser }, message: 'Profile updated successfully' });
  } catch (error) {
    next(error);
  }
});

// Change password
router.patch('/password', requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, error: { message: 'New password must be at least 6 characters' } });
    }

    const userRecord = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(userId);
    
    const isValid = await bcrypt.compare(currentPassword, userRecord.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, error: { message: 'Incorrect current password' } });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, userId);
    
    // Invalidate the current session to force re-login after password change
    req.session.destroy((err) => {
      if (err) return next(err);
      res.clearCookie('ecommerce.sid');
      res.json({ success: true, message: 'Password updated successfully. Please log in again.' });
    });
  } catch (error) {
    next(error);
  }
});

// Addresses

// Get all addresses for user
router.get('/addresses', requireAuth, (req, res, next) => {
  try {
    const addresses = db.prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC').all(req.user.id);
    res.json({ success: true, data: { addresses } });
  } catch (error) {
    next(error);
  }
});

// Create address
router.post('/addresses', requireAuth, (req, res, next) => {
  try {
    const { label, recipient_name, phone, address_line1, address_line2, city, state, postal_code, country, is_default } = req.body;
    
    if (!recipient_name || !phone || !address_line1 || !city || !postal_code || !country) {
      return res.status(400).json({ success: false, error: { message: 'Required fields missing' } });
    }

    const isDefaultInt = is_default ? 1 : 0;
    
    db.transaction(() => {
      if (isDefaultInt === 1) {
        db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(req.user.id);
      }
      
      db.prepare(`
        INSERT INTO addresses (user_id, label, recipient_name, phone, address_line1, address_line2, city, state, postal_code, country, is_default)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(req.user.id, label || 'Home', recipient_name, phone, address_line1, address_line2 || null, city, state || null, postal_code, country, isDefaultInt);
    })();
    
    res.status(201).json({ success: true, message: 'Address added successfully' });
  } catch (error) {
    next(error);
  }
});

// Update address
router.patch('/addresses/:id', requireAuth, (req, res, next) => {
  try {
    const addressId = parseInt(req.params.id);
    const { label, recipient_name, phone, address_line1, address_line2, city, state, postal_code, country, is_default } = req.body;

    const existing = db.prepare('SELECT id FROM addresses WHERE id = ? AND user_id = ?').get(addressId, req.user.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: { message: 'Address not found' } });
    }

    const isDefaultInt = is_default ? 1 : 0;

    db.transaction(() => {
      if (isDefaultInt === 1) {
        db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(req.user.id);
      }
      
      db.prepare(`
        UPDATE addresses 
        SET label = ?, recipient_name = ?, phone = ?, address_line1 = ?, address_line2 = ?, city = ?, state = ?, postal_code = ?, country = ?, is_default = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
      `).run(label || 'Home', recipient_name, phone, address_line1, address_line2 || null, city, state || null, postal_code, country, isDefaultInt, addressId, req.user.id);
    })();
    
    res.json({ success: true, message: 'Address updated successfully' });
  } catch (error) {
    next(error);
  }
});

// Delete address
router.delete('/addresses/:id', requireAuth, (req, res, next) => {
  try {
    const addressId = parseInt(req.params.id);
    const result = db.prepare('DELETE FROM addresses WHERE id = ? AND user_id = ?').run(addressId, req.user.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: { message: 'Address not found' } });
    }
    
    res.json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Set address as default
router.post('/addresses/:id/default', requireAuth, (req, res, next) => {
  try {
    const addressId = parseInt(req.params.id);
    
    const existing = db.prepare('SELECT id FROM addresses WHERE id = ? AND user_id = ?').get(addressId, req.user.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: { message: 'Address not found' } });
    }

    db.transaction(() => {
      db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(req.user.id);
      db.prepare('UPDATE addresses SET is_default = 1 WHERE id = ?').run(addressId);
    })();
    
    res.json({ success: true, message: 'Default address updated' });
  } catch (error) {
    next(error);
  }
});

export default router;