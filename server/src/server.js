const dotenv = require('dotenv');

// Load environment variables before anything else.
dotenv.config();

const connectDB = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5000;

/**
 * Start-up sequence:
 *   1. Connect to MongoDB.
 *   2. Start the Express server only after a successful connection.
 */
async function start() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Valluvam server is running on port ${PORT}`);
  });
}

start();

