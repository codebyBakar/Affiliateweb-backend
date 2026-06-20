import SiteSettings from '../models/SiteSettings.js';

export const getSiteSettings = async (req, res) => {
  try {
    const settings = await SiteSettings.getSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateSiteSettings = async (req, res) => {
  try {
    const settings = await SiteSettings.getSettings();
    settings.siteName = req.body.siteName || settings.siteName;
    settings.tagline = req.body.tagline || settings.tagline;
    settings.amazonId = req.body.amazonId || settings.amazonId;
    settings.aliexpressId = req.body.aliexpressId || settings.aliexpressId;
    settings.ebayId = req.body.ebayId || settings.ebayId;
    if (req.body.logo !== undefined) settings.logo = req.body.logo;
    if (req.body.heroBadgeText !== undefined) settings.heroBadgeText = req.body.heroBadgeText;
    if (req.body.heroBoxImage !== undefined) settings.heroBoxImage = req.body.heroBoxImage;
    if (req.body.heroBoxTitle !== undefined) settings.heroBoxTitle = req.body.heroBoxTitle;
    if (req.body.heroBoxDescription !== undefined) settings.heroBoxDescription = req.body.heroBoxDescription;
    const updated = await settings.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};