const mongoose = require('mongoose');

/**
 * Connect to MongoDB using the MONGODB_URI environment variable.
 *
 * Call this once at startup — it returns a promise so the server can
 * wait for a successful connection before accepting requests.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  let retries = 5;
  while (retries > 0) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log('Connected to MongoDB successfully.');
      return;
    } catch (error) {
      retries -= 1;
      console.error(`MongoDB connection failed: ${error.message}. Retries left: ${retries}`);
      if (retries === 0) {
        console.error('Exhausted all MongoDB connection attempts. Exiting...');
        process.exit(1);
      }
      // Wait 2 seconds before retrying
      await new Promise((res) => setTimeout(res, 2000));
    }
  }
}

module.exports = connectDB;

