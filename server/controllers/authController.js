import { adaptSessionCookie } from '../server.js';
import {
  createUser,
  findUserByEmail,
  findUserById,
  verifyPassword,
  sanitizeUser,
  generateAuthToken,
  resolveUserId
} from '../services/authService.js';

/**
 * Handle user registration
 */
export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Name is required' }});
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Valid email is required' }});
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Password must be at least 6 characters' }});
    }

    const newUser = await createUser({ name, email, password });
    const token = generateAuthToken(newUser.id);

    // Establish session with regeneration to prevent session fixation
    req.session.regenerate((err) => {
      if (err) return next(err);
      
      adaptSessionCookie(req);
      req.session.userId = newUser.id;

      return res.status(201).json({
        success: true,
        data: {
          user: newUser,
          token
        },
        message: 'Registration successful.'
      });
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle user login
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    
    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.'
        }
      });
    }

    const user = findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.'
        }
      });
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.'
        }
      });
    }

    const token = generateAuthToken(user.id);
    const safeUser = sanitizeUser(user);

    // Establish session with regeneration to prevent session fixation
    req.session.regenerate((err) => {
      if (err) return next(err);
      
      adaptSessionCookie(req);
      req.session.userId = user.id;

      return res.status(200).json({
        success: true,
        data: {
          user: safeUser,
          token
        },
        message: 'Login successful.'
      });
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle user logout
 */
export function logout(req, res, next) {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      res.clearCookie('ecommerce.sid');
      return res.status(200).json({
        success: true,
        message: 'Logged out successfully.'
      });
    });
  } else {
    res.clearCookie('ecommerce.sid');
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  }
}

/**
 * Get current authenticated user details
 */
export function getCurrentUser(req, res, next) {
  try {
    const userId = resolveUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authenticated.'
        }
      });
    }

    const user = findUserById(userId);
    if (!user) {
      if (req.session) req.session.destroy(() => {});
      res.clearCookie('ecommerce.sid');
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Session invalid.'
        }
      });
    }

    const token = generateAuthToken(user.id);

    return res.status(200).json({
      success: true,
      data: {
        user,
        token
      },
      message: 'User profile retrieved successfully.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle 1-Click Instant Demo Login
 */
export async function demoLogin(req, res, next) {
  try {
    let user = findUserByEmail('demo@luxestore.com');
    
    if (!user) {
      user = await createUser({
        name: 'Alex Morgan (Demo)',
        email: 'demo@luxestore.com',
        password: 'demo1234'
      });
    }

    const token = generateAuthToken(user.id);
    const safeUser = sanitizeUser(user);

    req.session.regenerate((err) => {
      if (err) return next(err);

      adaptSessionCookie(req);
      req.session.userId = user.id;

      return res.status(200).json({
        success: true,
        data: {
          user: safeUser,
          token
        },
        message: 'Instant demo login successful.'
      });
    });
  } catch (error) {
    next(error);
  }
}


