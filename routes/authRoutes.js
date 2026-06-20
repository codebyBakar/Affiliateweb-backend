import express from 'express';
import { login, getMe, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import authLimiter from '../middleware/authLimiter.js';
import { validateLoginInput } from '../middleware/validateAuth.js';

const router = express.Router();

router.post('/login', authLimiter, validateLoginInput, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;
