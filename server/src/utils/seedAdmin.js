// One-off script: creates the first admin account from .env values.
// Run with: npm run seed:admin
require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const mongoose = require('mongoose');

async function run() {
  await connectDB();

  const { SEED_ADMIN_NAME, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD } = process.env;
  if (!SEED_ADMIN_EMAIL || !SEED_ADMIN_PASSWORD) {
    console.error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env before seeding.');
    process.exit(1);
  }

  const existing = await User.findOne({ email: SEED_ADMIN_EMAIL.toLowerCase() });
  if (existing) {
    console.log(`Admin already exists: ${existing.email}`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await User.hashPassword(SEED_ADMIN_PASSWORD);
  const admin = await User.create({
    name: SEED_ADMIN_NAME || 'Admin',
    email: SEED_ADMIN_EMAIL.toLowerCase(),
    passwordHash,
    role: 'admin',
  });

  console.log(`Created admin: ${admin.email}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
