/**
 * Seed script — create the initial admin user.
 *
 * Usage:
 *   node src/scripts/seedAdmin.js
 *
 * Environment variables must be loaded (the script loads .env automatically).
 *
 * If an admin with the given email already exists, the script exits without
 * creating a duplicate.
 */

const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const User = require('../models/User');

// ---------------------------------------------------------------------------
// Configuration — change these values for your initial admin
// ---------------------------------------------------------------------------
const ADMIN_NAME = process.env.ADMIN_SEED_NAME || 'Admin';
const ADMIN_EMAIL = process.env.ADMIN_SEED_EMAIL || 'admin@valluvam.org';
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD || 'admin123';

async function seed() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB.');

  // Check if admin already exists
  const existing = await User.findOne({ email: ADMIN_EMAIL });

  if (existing) {
    console.log(`Admin user already exists: ${ADMIN_EMAIL}`);
    await mongoose.disconnect();
    process.exit(0);
  }

  const admin = await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: 'admin',
  });

  console.log('Admin user created successfully:');
  console.log(`  Name:  ${admin.name}`);
  console.log(`  Email: ${admin.email}`);
  console.log(`  Role:  ${admin.role}`);

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});

