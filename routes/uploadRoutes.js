import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { 
  uploadSingle, 
  uploadMultiple, 
  uploadFields, 
  handleUploadError, 
  deleteFromCloudinary, 
  extractPublicId,
  checkCloudinaryConfig 
} from '../middleware/uploadMiddleware.js';

const router = express.Router();

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

function generateSignature(params, secret) {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});
  const stringToSign = Object.entries(sortedParams)
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  console.log('[Cloudinary] String to sign:', stringToSign);
  return crypto.createHmac('sha1', secret).update(stringToSign).digest('hex');
}

router.get('/signature', protect, adminOnly, checkCloudinaryConfig, (req, res) => {
  try {
    configureCloudinary();
    const { folder = 'bellezza/products', resource_type = 'image' } = req.query;
    const timestamp = Math.round(Date.now() / 1000);
    
    const paramsToSign = {
      folder,
      resource_type,
      timestamp: timestamp.toString(),
    };
    
    const signature = generateSignature(paramsToSign, process.env.CLOUDINARY_API_SECRET);

    console.log('[Cloudinary] Signature generated for:', { folder, resource_type, timestamp });

    res.json({
      signature,
      timestamp: timestamp.toString(),
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder,
      resource_type,
    });
  } catch (err) {
    res.status(500).json({ message: `Signature generation failed: ${err.message}` });
  }
});

router.post('/product-images', ...uploadMultiple('bellezza/products', 'images', 10), handleUploadError, (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    const images = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
      width: file.width,
      height: file.height,
      format: file.format,
      bytes: file.bytes,
    }));

    res.status(201).json({ 
      message: 'Images uploaded successfully', 
      images,
      count: images.length 
    });
  } catch (err) {
    res.status(500).json({ message: `Upload failed: ${err.message}` });
  }
});

router.post('/product-image', ...uploadSingle('bellezza/products'), handleUploadError, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const image = {
      url: req.file.path,
      publicId: req.file.filename,
      width: req.file.width,
      height: req.file.height,
      format: req.file.format,
      bytes: req.file.bytes,
    };

    res.status(201).json({ message: 'Image uploaded successfully', image });
  } catch (err) {
    res.status(500).json({ message: `Upload failed: ${err.message}` });
  }
});

router.post('/category-image', ...uploadSingle('bellezza/categories'), handleUploadError, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const image = {
      url: req.file.path,
      publicId: req.file.filename,
      width: req.file.width,
      height: req.file.height,
      format: req.file.format,
      bytes: req.file.bytes,
    };

    res.status(201).json({ message: 'Category image uploaded successfully', image });
  } catch (err) {
    res.status(500).json({ message: `Upload failed: ${err.message}` });
  }
});

router.post('/category-icon', ...uploadSingle('bellezza/categories/icons'), handleUploadError, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No icon uploaded' });
    }

    const image = {
      url: req.file.path,
      publicId: req.file.filename,
      width: req.file.width,
      height: req.file.height,
      format: req.file.format,
      bytes: req.file.bytes,
    };

    res.status(201).json({ message: 'Category icon uploaded successfully', image });
  } catch (err) {
    res.status(500).json({ message: `Upload failed: ${err.message}` });
  }
});

router.delete('/:publicId', protect, adminOnly, checkCloudinaryConfig, async (req, res) => {
  try {
    const { publicId } = req.params;
    const decodedPublicId = decodeURIComponent(publicId);
    const result = await deleteFromCloudinary(decodedPublicId, 'image');
    
    if (result.result === 'not found') {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    res.json({ message: 'Image deleted successfully', result });
  } catch (err) {
    res.status(500).json({ message: `Delete failed: ${err.message}` });
  }
});

router.delete('/product/:productId/images', protect, adminOnly, checkCloudinaryConfig, async (req, res) => {
  try {
    const { productId } = req.params;
    const { publicIds } = req.body;
    
    if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
      return res.status(400).json({ message: 'No public IDs provided' });
    }

    const results = await Promise.all(
      publicIds.map(publicId => deleteFromCloudinary(decodeURIComponent(publicId), 'image'))
    );

    const notFound = results.some(r => r.result === 'not found');
    if (notFound) {
      return res.status(404).json({ message: 'Some images not found', results });
    }

    res.json({ message: 'Images deleted successfully', results });
  } catch (err) {
    res.status(500).json({ message: `Delete failed: ${err.message}` });
  }
});

export default router;