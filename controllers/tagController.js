import Tag from '../models/Tag.js';
import slugify from 'slugify';

export const getTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort('name');
    res.json(tags);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createTag = async (req, res) => {
  try {
    const slug = slugify(req.body.name, { lower: true, strict: true });
    const tag = await Tag.create({
      name: req.body.name,
      slug,
      color: req.body.color,
    });
    res.status(201).json(tag);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateTag = async (req, res) => {
  try {
    const tag = await Tag.findByIdAndUpdate(
      req.params.id,
      {
        ...(req.body.name !== undefined && { name: req.body.name, slug: slugify(req.body.name, { lower: true, strict: true }) }),
        ...(req.body.color !== undefined && { color: req.body.color }),
      },
      { new: true, runValidators: true }
    );
    if (!tag) return res.status(404).json({ message: 'Tag not found' });
    res.json(tag);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findByIdAndDelete(req.params.id);
    if (!tag) return res.status(404).json({ message: 'Tag not found' });
    res.json({ message: 'Tag deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
