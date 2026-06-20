import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  color: { type: String, default: '#BFA492' },
}, {
  timestamps: true,
});

export default mongoose.model('Tag', tagSchema);
