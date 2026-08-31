import { Router } from 'express';
import {
  register,
  login,
  getMe,
  googleAuth,
  googleCallback,
  googleMockAuth
} from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, getMe);

// Google OAuth Routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.post('/google/mock', googleMockAuth);

export default router;
