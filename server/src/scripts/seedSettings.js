/**
 * Seed script — initialize single organization settings document.
 *
 * Usage:
 *   node src/scripts/seedSettings.js
 *
 * Seeds verified Valluvam organization information if no settings record exists.
 */

const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const { Settings, DEFAULT_SETTINGS } = require('../models/Settings');

async function seed() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB.');

  const existing = await Settings.findOne();
  if (existing) {
    console.log(`Settings document already exists (ID: ${existing._id}). Skipping initial seed.`);
    await mongoose.disconnect();
    process.exit(0);
  }

  const created = await Settings.create(DEFAULT_SETTINGS);
  console.log('Organization settings seeded successfully:', created);

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
