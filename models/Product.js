import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  subtitle: { type: String, trim: true },
  description: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, min: 0 },
  affiliateLink: { type: String, required: true },
  affiliatePlatform: { type: String, enum: ['amazon', 'ebay', 'aliexpress', 'other'], default: 'amazon' },
  images: [{ type: String }],
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
  featured: { type: Boolean, default: false },
  trending: { type: Boolean, default: false },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'draft', 'archived'], default: 'draft' },
  productType: { type: String, enum: ['skincare', 'makeup', 'bag', 'clothing', 'other'], default: 'other' },
  // Skincare fields
  skinType: [{ type: String }],
  benefits: [{ type: String }],
  ingredients: { type: String },
  // Makeup fields
  shades: [{ type: String }],
  finishType: { type: String },
  coverage: { type: String },
  // Fashion/bag fields
  sizes: [{ type: String }],
  colors: [{ type: String }],
  fabric: { type: String },
}, {
  timestamps: true,
});

productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ trending: 1 });

export default mongoose.model('Product', productSchema);
