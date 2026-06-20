import express from 'express';
import {
  getProducts,
  getProductBySlug,
  getAllProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  getRelatedProducts,
  getStats,
  deleteProductImages,
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { uploadMultiple, uploadSingle, handleUploadError } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/stats', protect, adminOnly, getStats);
router.get('/admin/all', protect, adminOnly, getAllProductsAdmin);
router.get('/related/:id', getRelatedProducts);
router.get('/:slug', getProductBySlug);
router.post('/', protect, adminOnly, uploadMultiple('bellezza/products', 'images', 10), handleUploadError, createProduct);
router.put('/:id', protect, adminOnly, uploadMultiple('bellezza/products', 'images', 10), handleUploadError, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
router.delete('/:id/images', protect, adminOnly, deleteProductImages);

export default router;