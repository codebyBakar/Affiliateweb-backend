import express from 'express';
import rateLimit from 'express-rate-limit';
import { subscribe } from '../controllers/newsletterController.js';

const router = express.Router();

// Public endpoint — limit abuse: max 5 subscribe attempts per IP per 10 minutes.
const subscribeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { message: 'Too many attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', subscribeLimiter, subscribe);

export default router;
