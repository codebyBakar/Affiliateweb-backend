import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String },
  icon: { type: String },
  image: { type: String },
  featured: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
}, {
  timestamps: true,
});

export default mongoose.model('Category', categorySchema);
