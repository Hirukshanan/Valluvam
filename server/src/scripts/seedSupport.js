/**
 * Seed script — initialize default Support options.
 *
 * Usage:
 *   node src/scripts/seedSupport.js
 *
 * Seeds verified Valluvam support options if none exist in the database.
 */

const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const { Support, DEFAULT_SUPPORT_OPTIONS } = require('../models/Support');

async function seed() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB.');

  const existingCount = await Support.countDocuments();
  if (existingCount > 0) {
    console.log(`Support options already exist (${existingCount} found). Skipping initial seed.`);
    await mongoose.disconnect();
    process.exit(0);
  }

  const created = await Support.insertMany(DEFAULT_SUPPORT_OPTIONS);
  console.log(`Successfully seeded ${created.length} support options.`);

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
