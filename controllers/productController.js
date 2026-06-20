import Product from '../models/Product.js';
import Tag from '../models/Tag.js';
import slugify from 'slugify';
import { deleteFromCloudinary, extractPublicId } from '../middleware/uploadMiddleware.js';

// GET /api/products
export const getProducts = async (req, res) => {
  try {
    const { category, tag, featured, trending, search, ids, page = 1, limit = 12, sort = '-createdAt' } = req.query;
    const query = { status: 'active' };

    if (category) query.category = category;
    if (featured === 'true') query.featured = true;
    
    // Filter by trending tag
    if (trending === 'true') {
      const trendingTag = await Tag.findOne({ slug: 'trending' });
      if (trendingTag) {
        query.tags = { $in: [trendingTag._id] };
      } else {
        // If trending tag doesn't exist, return empty results
        return res.json({ products: [], page: 1, pages: 0, total: 0 });
      }
    }
    
    if (tag) query.tags = { $in: [tag] };
    if (search) query.$text = { $search: search };
    if (ids) query._id = { $in: ids.split(',') };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate('category', 'name slug icon')
      .populate('tags', 'name slug color')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      products,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/products/:slug
export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, status: 'active' })
      .populate('category', 'name slug icon')
      .populate('tags', 'name slug color');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/products/admin/all  (admin)
export const getAllProductsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, status } = req.query;
    const query = {};
    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('tags', 'name slug color')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    res.json({ products, page: Number(page), pages: Math.ceil(total / Number(limit)), total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/products
export const createProduct = async (req, res) => {
  try {
    const slug = slugify(req.body.name, { lower: true, strict: true });
    
    let images = [];
    if (req.body.images) {
      images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    } else if (req.files && req.files.length > 0) {
      images = req.files.map(file => file.path);
    }
    
    const product = await Product.create({
      name: req.body.name,
      slug,
      subtitle: req.body.subtitle,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      originalPrice: req.body.originalPrice,
      affiliateLink: req.body.affiliateLink,
      affiliatePlatform: req.body.affiliatePlatform,
      images,
      tags: req.body.tags,
      featured: req.body.featured,
      trending: req.body.trending,
      rating: req.body.rating,
      reviewCount: req.body.reviewCount,
      status: req.body.status,
      productType: req.body.productType,
      skinType: req.body.skinType,
      benefits: req.body.benefits,
      ingredients: req.body.ingredients,
      shades: req.body.shades,
      finishType: req.body.finishType,
      coverage: req.body.coverage,
      sizes: req.body.sizes,
      colors: req.body.colors,
      fabric: req.body.fabric,
    });
    await Promise.all([
      product.populate('category', 'name slug'),
      product.populate('tags', 'name slug color'),
    ]);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) return res.status(404).json({ message: 'Product not found' });
    
    let images = existingProduct.images;
    if (req.body.images) {
      images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    } else if (req.files && req.files.length > 0) {
      images = req.files.map(file => file.path);
    }
    
    const allowed = {};
    const fields = [
      'name', 'subtitle', 'description', 'category', 'price', 'originalPrice',
      'affiliateLink', 'affiliatePlatform', 'tags', 'featured', 'trending',
      'rating', 'reviewCount', 'status', 'productType', 'skinType', 'benefits',
      'ingredients', 'shades', 'finishType', 'coverage', 'sizes', 'colors', 'fabric',
    ];
    for (const field of fields) {
      if (req.body[field] !== undefined) {
        allowed[field] = req.body[field];
      }
    }
    if (req.body.name !== undefined) {
      allowed.slug = slugify(req.body.name, { lower: true, strict: true });
    }
    allowed.images = images;
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      allowed,
      { new: true, runValidators: true }
    )
      .populate('category', 'name slug')
      .populate('tags', 'name slug color');
    
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    if (product.images && product.images.length > 0) {
      await Promise.all(
        product.images.map(url => {
          const publicId = extractPublicId(url);
          if (publicId) return deleteFromCloudinary(publicId);
          return Promise.resolve();
        })
      );
    }
    
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/products/:id/images
export const deleteProductImages = async (req, res) => {
  try {
    const { publicIds } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
      return res.status(400).json({ message: 'No public IDs provided' });
    }
    
    await Promise.all(
      publicIds.map(publicId => deleteFromCloudinary(decodeURIComponent(publicId)))
    );
    
    product.images = product.images.filter(url => {
      const publicId = extractPublicId(url);
      return publicId && !publicIds.includes(publicId);
    });
    
    await product.save();
    
    res.json({ message: 'Images deleted successfully', images: product.images });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/products/related/:id
export const getRelatedProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      status: 'active',
    })
      .populate('category', 'name slug')
      .populate('tags', 'name slug color')
      .limit(4);
    res.json(related);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/products/stats
export const getStats = async (req, res) => {
  try {
    const total = await Product.countDocuments();
    const active = await Product.countDocuments({ status: 'active' });
    const trending = await Product.countDocuments({ trending: true });
    const featured = await Product.countDocuments({ featured: true });
    res.json({ total, active, trending, featured });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
