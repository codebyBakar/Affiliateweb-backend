import Category from '../models/Category.js';
import slugify from 'slugify';
import { deleteFromCloudinary, extractPublicId } from '../middleware/uploadMiddleware.js';

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort('sortOrder');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const slug = slugify(req.body.name, { lower: true, strict: true });
    
    let image = req.body.image;
    let icon = req.body.icon;
    
    if (req.files) {
      if (req.files.image && req.files.image.length > 0) {
        image = req.files.image[0].path;
      }
      if (req.files.icon && req.files.icon.length > 0) {
        icon = req.files.icon[0].path;
      }
    }
    
    const category = await Category.create({
      name: req.body.name,
      slug,
      description: req.body.description,
      icon,
      image,
      featured: req.body.featured,
      sortOrder: req.body.sortOrder,
    });
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const existingCategory = await Category.findById(req.params.id);
    if (!existingCategory) return res.status(404).json({ message: 'Category not found' });
    
    let image = existingCategory.image;
    let icon = existingCategory.icon;
    
    if (req.files) {
      if (req.files.image && req.files.image.length > 0) {
        if (existingCategory.image) {
          const publicId = extractPublicId(existingCategory.image);
          if (publicId) await deleteFromCloudinary(publicId);
        }
        image = req.files.image[0].path;
      }
      if (req.files.icon && req.files.icon.length > 0) {
        if (existingCategory.icon) {
          const publicId = extractPublicId(existingCategory.icon);
          if (publicId) await deleteFromCloudinary(publicId);
        }
        icon = req.files.icon[0].path;
      }
    } else {
      if (req.body.image) image = req.body.image;
      if (req.body.icon) icon = req.body.icon;
    }
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        ...(req.body.name !== undefined && { name: req.body.name }),
        ...(req.body.name !== undefined && { slug: slugify(req.body.name, { lower: true, strict: true }) }),
        ...(req.body.description !== undefined && { description: req.body.description }),
        ...(req.body.featured !== undefined && { featured: req.body.featured }),
        ...(req.body.sortOrder !== undefined && { sortOrder: req.body.sortOrder }),
        image,
        icon,
      },
      { new: true, runValidators: true }
    );
    
    res.json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    
    if (category.image) {
      const publicId = extractPublicId(category.image);
      if (publicId) await deleteFromCloudinary(publicId);
    }
    if (category.icon) {
      const publicId = extractPublicId(category.icon);
      if (publicId) await deleteFromCloudinary(publicId);
    }
    
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
