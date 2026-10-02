/**
 * Netlify Function adapter for the Valluvam Express API.
 *
 * Wraps the existing Express app with serverless-http so every API route
 * works inside a Netlify Function without changes to controllers, routes,
 * or middleware.
 *
 * MongoDB connection is established once per cold start and reused across
 * warm invocations via Mongoose's built-in connection state tracking.
 */

const mongoose = require('mongoose');
const serverless = require('serverless-http');

// Load the existing Express app (routes, middleware, error handling — everything)
const app = require('../../src/app');

// ---------------------------------------------------------------------------
// MongoDB serverless connection reuse
// ---------------------------------------------------------------------------
// Mongoose maintains a module-level connection singleton.  We only call
// connect() when the connection is not already open (readyState !== 1) and
// not in the process of connecting (readyState !== 2).  This avoids creating
// a brand-new connection on every warm function invocation.
// ---------------------------------------------------------------------------
let connectionPromise = null;

async function ensureDbConnected() {
  const state = mongoose.connection.readyState;

  // 1 = connected, 2 = connecting — nothing to do
  if (state === 1 || state === 2) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in Netlify environment variables.');
  }

  // Cache the promise so concurrent invocations during a cold start share
  // the same connection attempt instead of racing.
  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 5000 })
      .then(() => {
        console.log('[Netlify Function] Connected to MongoDB.');
      })
      .catch((err) => {
        connectionPromise = null; // allow retry on next invocation
        throw err;
      });
  }

  return connectionPromise;
}

// ---------------------------------------------------------------------------
// Serverless handler
// ---------------------------------------------------------------------------
const serverlessHandler = serverless(app);

exports.handler = async (event, context) => {
  // Prevent Lambda from waiting for the event loop to drain (keeps the
  // MongoDB connection alive for the next warm invocation).
  context.callbackWaitsForEmptyEventLoop = false;

  await ensureDbConnected();

  return serverlessHandler(event, context);
};
