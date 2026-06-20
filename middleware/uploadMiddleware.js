import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import { protect, adminOnly } from './authMiddleware.js';

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

function checkCloudinaryConfig(req, res, next) {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return res.status(500).json({
      message: 'Cloudinary credentials not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to backend/.env',
    });
  }
  configureCloudinary();
  next();
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const createCloudinaryStorage = (folder, allowedFormats = ['jpg', 'jpeg', 'png', 'webp']) => {
  return new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      configureCloudinary();
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 10);
      const publicId = `${folder}/${timestamp}-${randomString}`;
      
      return {
        folder,
        public_id: publicId,
        allowed_formats: allowedFormats,
        transformation: [
          { quality: 'auto:good', fetch_format: 'auto' },
          { width: 1200, height: 1200, crop: 'limit' }
        ],
        resource_type: 'image',
      };
    },
  });
};

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`), false);
  }
};

const uploadSingle = (folder) => {
  const storage = createCloudinaryStorage(folder);
  const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
  });
  return [protect, adminOnly, checkCloudinaryConfig, upload.single('image')];
};

const uploadMultiple = (folder, fieldName = 'images', maxCount = 10) => {
  const storage = createCloudinaryStorage(folder);
  const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE, files: maxCount },
  });
  return [protect, adminOnly, checkCloudinaryConfig, upload.array(fieldName, maxCount)];
};

const uploadFields = (folder, fields) => {
  const storage = createCloudinaryStorage(folder);
  const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
  });
  return [protect, adminOnly, checkCloudinaryConfig, upload.fields(fields)];
};

export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: `Too many files. Maximum is ${err.limit} files` });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: `Unexpected field: ${err.field}` });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  
  if (err.message.includes('Invalid file type')) {
    return res.status(400).json({ message: err.message });
  }
  
  next(err);
};

export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    configureCloudinary();
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

export const extractPublicId = (url) => {
  if (!url) return null;
  const match = url.match(/\/upload\/.*\/(.+)\.(jpg|jpeg|png|webp|gif)/i);
  return match ? match[1] : null;
};

export { uploadSingle, uploadMultiple, uploadFields, checkCloudinaryConfig };
export default { uploadSingle, uploadMultiple, uploadFields, checkCloudinaryConfig, handleUploadError, deleteFromCloudinary, extractPublicId };