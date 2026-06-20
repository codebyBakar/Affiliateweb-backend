import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema({
  siteName: { type: String, required: true, default: 'Bellezza', trim: true },
  tagline: { type: String, default: 'Where Natural Beauty Begins', trim: true },
  amazonId: { type: String, default: '', trim: true },
  aliexpressId: { type: String, default: '', trim: true },
  ebayId: { type: String, default: '', trim: true },

  // Site logo
  logo: { type: String, default: '/assets/logo.png', trim: true },

  // Hero section — badge
  heroBadgeText: { type: String, default: 'New arrivals in K-Beauty', trim: true },

  // Hero section — floating product card
  heroBoxImage: { type: String, default: '/assets/serum.avif', trim: true },
  heroBoxTitle: { type: String, default: 'Glow Serum Pro', trim: true },
  heroBoxDescription: { type: String, default: 'Best seller this week', trim: true },
}, {
  timestamps: true,
});

siteSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

export default mongoose.model('SiteSettings', siteSettingsSchema);