import express from 'express';
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { uploadFields, handleUploadError } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);
const categoryUploadFields = uploadFields('bellezza/categories', [
  { name: 'image', maxCount: 1 },
  { name: 'icon', maxCount: 1 },
]);
router.post('/', protect, adminOnly, categoryUploadFields, handleUploadError, createCategory);
router.put('/:id', protect, adminOnly, categoryUploadFields, handleUploadError, updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

export default router;
