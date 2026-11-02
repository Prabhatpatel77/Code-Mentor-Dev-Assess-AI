import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'codementorai_super_secret_jwt_key_2026';

export const memoryUsers = [];

const generateToken = (res, user) => {
  const payload = { userId: String(user._id || user.id), email: user.email, name: user.name };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  return token;
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check DB if connected
    if (mongoose.connection.readyState === 1) {
      try {
        const userExists = await User.findOne({ email: normalizedEmail }).exec();
        if (userExists) {
          return res.status(400).json({ success: false, message: 'An account with this email already exists. Please log in instead.' });
        }

        const user = await User.create({ name, email: normalizedEmail, password });
        generateToken(res, user);
        return res.status(201).json({
          success: true,
          user: { id: String(user._id), name: user.name, email: user.email, role: user.role }
        });
      } catch (dbErr) {
        console.warn(`[User DB Warning] Falling back to memory user store: ${dbErr.message}`);
      }
    }

    // Memory fallback
    const memExists = memoryUsers.find(u => u.email === normalizedEmail);
    if (memExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists. Please log in instead.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const memUser = {
      _id: `user_mem_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'student'
    };
    memoryUsers.push(memUser);

    generateToken(res, memUser);
    res.status(201).json({
      success: true,
      user: { id: memUser._id, name: memUser.name, email: memUser.email, role: memUser.role }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let foundUser = null;

    if (mongoose.connection.readyState === 1) {
      try {
        foundUser = await User.findOne({ email: normalizedEmail }).exec();
      } catch (dbErr) {}
    }

    if (!foundUser) {
      foundUser = memoryUsers.find(u => u.email === normalizedEmail);
    }

    if (!foundUser) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    let isMatch = false;
    if (foundUser.matchPassword) {
      isMatch = await foundUser.matchPassword(password);
    } else {
      isMatch = await bcrypt.compare(password, foundUser.password);
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    generateToken(res, foundUser);
    res.status(200).json({
      success: true,
      user: { id: String(foundUser._id || foundUser.id), name: foundUser.name, email: foundUser.email, role: foundUser.role }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ success: true, message: 'Successfully logged out' });
};

export const getMe = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    let userProfile = null;

    if (mongoose.connection.readyState === 1) {
      try {
        const dbUser = await User.findById(req.user.userId).select('-password').exec();
        if (dbUser) {
          userProfile = { id: String(dbUser._id), name: dbUser.name, email: dbUser.email, role: dbUser.role };
        }
      } catch (e) {}
    }

    if (!userProfile) {
      const memUser = memoryUsers.find(u => String(u._id) === String(req.user.userId));
      if (memUser) {
        userProfile = { id: String(memUser._id), name: memUser.name, email: memUser.email, role: memUser.role };
      } else {
        userProfile = { id: req.user.userId, name: req.user.name || 'Student', email: req.user.email, role: 'student' };
      }
    }

    res.status(200).json({
      success: true,
      user: userProfile
    });
  } catch (error) {
    next(error);
  }
};
