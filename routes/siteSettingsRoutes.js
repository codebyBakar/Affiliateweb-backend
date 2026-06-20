import express from 'express';
import { getSiteSettings, updateSiteSettings } from '../controllers/siteSettingsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getSiteSettings);
router.put('/', protect, updateSiteSettings);

export default router;