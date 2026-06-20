import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import connectDB from './db.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Tag from '../models/Tag.js';
import User from '../models/User.js';

dotenv.config();

const seed = async () => {
  await connectDB();

  // Clear existing
  await Promise.all([
    Product.deleteMany(),
    Category.deleteMany(),
    Tag.deleteMany(),
    User.deleteMany(),
  ]);

  // Admin user
  await User.create({ name: 'Admin', email: 'admin@bellezza.com', password: 'bellezza2025', role: 'admin' });

  // Categories
  const categories = await Category.insertMany([
    { name: 'Skincare', slug: 'skincare', icon: '🧴', image: 'https://images.unsplash.com/photo-1570194065650-d99fb4a2928e?w=200&q=80', description: 'Premium skincare for your best skin', featured: true },
    { name: 'Makeup', slug: 'makeup', icon: '💄', image: 'https://images.unsplash.com/photo-1631214500004-de8a5c4c3b55?w=200&q=80', description: 'Luxury makeup for every look', featured: true },
    { name: 'Bags', slug: 'bags', icon: '👜', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&q=80', description: 'Curated fashion bags', featured: true },
    { name: 'Fashion', slug: 'fashion', icon: '👗', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&q=80', description: 'Modern feminine fashion', featured: true },
    { name: 'K-Beauty', slug: 'k-beauty', icon: '✨', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&q=80', description: 'Korean beauty essentials', featured: true },
  ]);

  // Tags
  const tags = await Tag.insertMany([
    { name: 'Bestseller', slug: 'bestseller', color: '#8FA89A' },
    { name: 'New', slug: 'new', color: '#2D2B30' },
    { name: 'Trending', slug: 'trending', color: '#BFA492' },
    { name: 'Sale', slug: 'sale', color: '#D4A5A0' },
    { name: 'Vegan', slug: 'vegan', color: '#8FA89A' },
    { name: 'Cruelty-Free', slug: 'cruelty-free', color: '#8FA89A' },
    { name: 'Hydrating', slug: 'hydrating', color: '#9CB5C7' },
    { name: 'Brightening', slug: 'brightening', color: '#F5C842' },
  ]);

  const [skincare, makeup, bags, fashion, kbeauty] = categories;
  const [bestseller, newTag, trending, sale] = tags;

  // Products
  await Product.insertMany([
    {
      name: 'Glow Serum Pro',
      slug: 'glow-serum-pro',
      subtitle: 'Advanced Brightening Formula',
      description: 'A powerful vitamin C serum that brightens, firms, and evens skin tone. Formulated with 20% L-Ascorbic Acid and hyaluronic acid for deep hydration and visible glow.',
      category: skincare._id,
      price: 48,
      originalPrice: 65,
      affiliateLink: 'https://amazon.com',
      affiliatePlatform: 'amazon',
      images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80'],
      tags: [bestseller._id],
      featured: true,
      trending: true,
      rating: 4.8,
      reviewCount: 2341,
      productType: 'skincare',
      skinType: ['Dry', 'Normal', 'Combination'],
      benefits: ['Reduces dark spots', 'Boosts collagen', 'Deep hydration', 'Evens skin tone'],
      ingredients: 'Vitamin C (L-Ascorbic Acid) 20%, Niacinamide 5%, Hyaluronic Acid, Ferulic Acid, Vitamin E',
      status: 'active',
    },
    {
      name: 'Cloud Lip Tint',
      slug: 'cloud-lip-tint',
      subtitle: 'Weightless Color & Moisture',
      description: 'A Korean-inspired water tint that delivers buildable, natural-looking color with a dewy finish. Infused with hyaluronic acid for lasting moisture.',
      category: makeup._id,
      price: 22,
      affiliateLink: 'https://amazon.com',
      affiliatePlatform: 'amazon',
      images: ['https://images.unsplash.com/photo-1631214500004-de8a5c4c3b55?w=600&q=80'],
      tags: [newTag._id],
      featured: true,
      trending: true,
      rating: 4.9,
      reviewCount: 891,
      productType: 'makeup',
      shades: ['Rosy Nude', 'Berry Dream', 'Coral Kiss', 'Cherry Blossom'],
      finishType: 'Dewy',
      status: 'active',
    },
    {
      name: 'Mini Tote Luxe',
      slug: 'mini-tote-luxe',
      subtitle: 'Structured Vegan Leather',
      description: 'A sophisticated mini tote crafted from premium vegan leather. The perfect everyday companion with adjustable strap and gold-tone hardware.',
      category: bags._id,
      price: 89,
      originalPrice: 120,
      affiliateLink: 'https://amazon.com',
      affiliatePlatform: 'amazon',
      images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80'],
      tags: [sale._id],
      featured: true,
      rating: 4.7,
      reviewCount: 445,
      productType: 'bag',
      colors: ['Black', 'Nude', 'Sage', 'Cream'],
      status: 'active',
    },
    {
      name: 'Botanical Cream',
      slug: 'botanical-cream',
      subtitle: 'Deep Moisture with Centella',
      description: 'Rich yet lightweight cream infused with Centella Asiatica extract and ceramides. Perfect for repairing skin barrier and delivering 72-hour hydration.',
      category: kbeauty._id,
      price: 35,
      affiliateLink: 'https://amazon.com',
      affiliatePlatform: 'amazon',
      images: ['https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?w=600&q=80'],
      tags: [trending._id],
      trending: true,
      rating: 4.6,
      reviewCount: 1122,
      productType: 'skincare',
      skinType: ['All', 'Sensitive', 'Dry'],
      benefits: ['Barrier repair', '72-hour hydration', 'Soothes redness', 'Plumps skin'],
      status: 'active',
    },
    {
      name: 'Silk Midi Dress',
      slug: 'silk-midi-dress',
      subtitle: 'Fluid & Feminine Silhouette',
      description: 'Effortlessly elegant slip dress in luxurious satin fabric. Features adjustable straps and a flattering bias cut that drapes beautifully.',
      category: fashion._id,
      price: 75,
      originalPrice: 110,
      affiliateLink: 'https://amazon.com',
      affiliatePlatform: 'amazon',
      images: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80'],
      tags: [trending._id],
      trending: true,
      rating: 4.8,
      reviewCount: 667,
      productType: 'clothing',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['Champagne', 'Blush', 'Ivory', 'Black'],
      fabric: '100% Satin Polyester',
      status: 'active',
    },
    {
      name: 'Velvet Foundation',
      slug: 'velvet-foundation',
      subtitle: 'Full Coverage Satin Finish',
      description: 'A buildable, skin-loving foundation with 24-hour wear. Infused with hyaluronic acid and vitamin E for a comfortable, second-skin feel.',
      category: makeup._id,
      price: 42,
      affiliateLink: 'https://amazon.com',
      affiliatePlatform: 'amazon',
      images: ['https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80'],
      tags: [bestseller._id],
      featured: true,
      rating: 4.9,
      reviewCount: 3201,
      productType: 'makeup',
      shades: ['Fair', 'Light', 'Medium', 'Tan', 'Deep', 'Rich'],
      finishType: 'Satin',
      coverage: 'Full',
      status: 'active',
    },
    {
      name: 'Crossbody Kaia',
      slug: 'crossbody-kaia',
      subtitle: 'Minimalist Chain Crossbody',
      description: 'Sleek chain crossbody bag with a minimalist aesthetic. Features a magnetic closure, interior zip pocket, and adjustable chain strap.',
      category: bags._id,
      price: 115,
      affiliateLink: 'https://amazon.com',
      affiliatePlatform: 'amazon',
      images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80'],
      tags: [newTag._id],
      featured: false,
      rating: 4.7,
      reviewCount: 234,
      productType: 'bag',
      colors: ['Black', 'Beige', 'Gold'],
      status: 'active',
    },
    {
      name: 'Vitamin C Glow',
      slug: 'vitamin-c-glow',
      subtitle: 'Brightening Daily Moisturizer',
      description: 'Lightweight daily moisturizer with 10% stabilized Vitamin C. Provides antioxidant protection while visibly improving radiance over time.',
      category: skincare._id,
      price: 29,
      originalPrice: 40,
      affiliateLink: 'https://amazon.com',
      affiliatePlatform: 'amazon',
      images: ['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80'],
      tags: [sale._id],
      rating: 4.5,
      reviewCount: 789,
      productType: 'skincare',
      skinType: ['Normal', 'Combination', 'Oily'],
      benefits: ['Brightens skin', 'Antioxidant protection', 'SPF boost', 'Even tone'],
      status: 'active',
    },
  ]);

  console.log('✅ Database seeded successfully!');
  console.log('👤 Admin: admin@bellezza.com / bellezza2025');
  process.exit(0);
};

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
