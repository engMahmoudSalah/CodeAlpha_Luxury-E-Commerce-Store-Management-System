import { Router } from 'express';
import {
  register,
  login,
  logout,
  getCurrentUser,
  demoLogin
} from '../controllers/authController.js';
import {
  validateRegister,
  validateLogin
} from '../middleware/validator.js';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/logout', logout);
router.get('/me', getCurrentUser);
router.post('/demo', demoLogin);
router.get('/demo', demoLogin);

export default router;
