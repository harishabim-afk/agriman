import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'agroharvest_secure_jwt_secret_key_2026_jwt_token_9988776655';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user (buyer or seller)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, companyName, phone, location } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    // Role safety: cannot self-register as admin
    const assignedRole = role === 'seller' ? 'seller' : 'buyer';

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const newUser = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role: assignedRole,
      companyName: companyName || '',
      phone: phone || '',
      location: location || { address: '', city: '', state: '', pincode: '' },
      verifiedSeller: false,
      status: 'active',
    });

    const token = generateToken(newUser);

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: newUser.toJSON(),
    });
  } catch (err) {
    console.error('[Register Error]:', err);
    res.status(500).json({ message: err.message || 'Server error creating account.' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'This account has been suspended by an administrator.' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Signed in successfully.',
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    console.error('[Login Error]:', err);
    res.status(500).json({ message: 'Server error during sign in.' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current authenticated user profile
router.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user });
});

// @route   PUT /api/auth/profile
// @desc    Update current user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, companyName, phone, location, bio } = req.body;

    if (name) req.user.name = name;
    if (companyName !== undefined) req.user.companyName = companyName;
    if (phone !== undefined) req.user.phone = phone;
    if (location) req.user.location = { ...req.user.location, ...location };
    if (bio !== undefined) req.user.bio = bio;

    await req.user.save();

    res.json({
      message: 'Profile updated successfully.',
      user: req.user.toJSON(),
    });
  } catch (err) {
    console.error('[Update Profile Error]:', err);
    res.status(500).json({ message: 'Server error updating profile.' });
  }
});

export default router;
