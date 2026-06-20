import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+loginAttempts +lockUntil +password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(429).json({
        message: `Account temporarily locked. Try again in ${remaining} minute(s).`,
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      user.loginAttempts += 1;

      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000;
        user.loginAttempts = 0;
        await user.save();
        return res.status(429).json({
          message: 'Account temporarily locked due to too many failed attempts. Try again in 15 minutes.',
        });
      }

      await user.save();
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: 'Authentication failed. Please try again.' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.body.name) {
      const sanitizedName = req.body.name.replace(/<[^>]*>/g, '').trim();
      if (sanitizedName.length > 50) {
        return res.status(422).json({ message: 'Name is too long' });
      }
      user.name = sanitizedName;
    }

    if (req.body.email) {
      const email = req.body.email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(422).json({ message: 'Invalid email format' });
      }
      user.email = email;
    }

    if (req.body.password) {
      if (req.body.password.length < 8) {
        return res.status(422).json({ message: 'Password must be at least 8 characters' });
      }
      if (req.body.password.length > 128) {
        return res.status(422).json({ message: 'Password is too long' });
      }
      user.password = req.body.password;
    }

    const updated = await user.save();
    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      token: generateToken(updated._id),
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
