import express from 'express';
import { getTags, createTag, updateTag, deleteTag } from '../controllers/tagController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getTags);
router.post('/', protect, adminOnly, createTag);
router.put('/:id', protect, adminOnly, updateTag);
router.delete('/:id', protect, adminOnly, deleteTag);

export default router;
