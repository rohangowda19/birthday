const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const requireAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) return res.status(401).json({ message: 'Not authenticated' });

  req.user = user;
  next();
});

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };