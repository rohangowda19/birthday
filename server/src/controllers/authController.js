const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (!user || !user.isActive) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signToken(user);
  setAuthCookie(res, token);
  res.json({ token, user });
}

// POST /api/auth/logout
async function logout(req, res) {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
}

// GET /api/auth/me
async function me(req, res) {
  res.json({ user: req.user });
}

// POST /api/auth/invite  (admin only) - creates a trusted member account
async function invite(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return res.status(409).json({ message: 'A user with that email already exists' });
  }

  const passwordHash = await User.hashPassword(password);
  const member = await User.create({
    name,
    email: normalizedEmail,
    passwordHash,
    role: 'member',
    invitedBy: req.user._id,
  });

  res.status(201).json({ user: member });
}

module.exports = { login, logout, me, invite };
