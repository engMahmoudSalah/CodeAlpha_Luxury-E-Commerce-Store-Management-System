import { findUserById, resolveUserId } from '../services/authService.js';

/**
 * Authentication Middleware requiring a valid active session or auth token
 */
export function requireAuth(req, res, next) {
  const userId = resolveUserId(req);

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required. Please log in to continue.'
      }
    });
  }

  const user = findUserById(userId);
  if (!user) {
    // Stale session or invalid user ID
    if (req.session) req.session.destroy(() => {});
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'User session is invalid. Please log in again.'
      }
    });
  }

  // Attach verified user to request and sync session if present
  req.user = user;
  if (req.session) req.session.userId = user.id;
  next();
}

/**
 * Optional Authentication Middleware
 * Attaches user to request if session or token exists, but doesn't reject if unauthenticated
 */
export function optionalAuth(req, res, next) {
  const userId = resolveUserId(req);
  if (userId) {
    const user = findUserById(userId);
    if (user) {
      req.user = user;
      if (req.session) req.session.userId = user.id;
    }
  }
  next();
}

