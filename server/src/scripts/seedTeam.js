/**
 * Seed script — create initial leadership team roles.
 *
 * Usage:
 *   node src/scripts/seedTeam.js
 *
 * Only seeds if the team collection is currently empty, or inserts
 * missing roles without creating any fake people or fake information.
 */

const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const Team = require('../models/Team');

const initialRoles = [
  {
    role: 'President',
    name: '',
    photo: '',
    photoPublicId: '',
    bio: '',
    displayOrder: 1,
    active: true,
  },
  {
    role: 'Secretary',
    name: '',
    photo: '',
    photoPublicId: '',
    bio: '',
    displayOrder: 2,
    active: true,
  },
  {
    role: 'Treasurer',
    name: '',
    photo: '',
    photoPublicId: '',
    bio: '',
    displayOrder: 3,
    active: true,
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB.');

  const existingCount = await Team.countDocuments();
  if (existingCount > 0) {
    console.log(`Team members already exist (${existingCount} found). Skipping initial seed.`);
    await mongoose.disconnect();
    process.exit(0);
  }

  for (const item of initialRoles) {
    const created = await Team.create(item);
    console.log(`Seeded role: ${created.role} (order: ${created.displayOrder})`);
  }

  console.log('Initial team roles seeded successfully with no placeholder fake people.');
  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
