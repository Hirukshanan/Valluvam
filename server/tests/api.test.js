const http = require('http');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const app = require('../src/app');
const jwt = require('jsonwebtoken');
const User = require('../src/models/User');
const Event = require('../src/models/Event');
const Team = require('../src/models/Team');
const { Support } = require('../src/models/Support');
const Volunteer = require('../src/models/Volunteer');
const Contact = require('../src/models/Contact');
const { authRateLimiter } = require('../src/middleware/rateLimiter');

async function runTestSuite() {
  console.log('Connecting to database for test suite...');
  await connectDB();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}:`, err.message);
      failed++;
    }
  }

  function assert(condition, message) {
    if (!condition) throw new Error(message || 'Assertion failed');
  }

  const admin = await User.findOne({ role: 'admin' });
  assert(admin, 'Admin user must exist in database');

  const adminToken = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

  console.log('\n--- 1. Health & 404 Route Handling ---');
  await test('GET /health returns 200 and success', async () => {
    const res = await fetch(`${baseUrl}/health`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data.success === true, 'Expected success: true');
  });

  await test('GET /health returns expected security headers (Helmet)', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert(res.headers.get('x-content-type-options') === 'nosniff', 'Expected X-Content-Type-Options: nosniff');
    assert(res.headers.get('x-frame-options') === 'SAMEORIGIN', 'Expected X-Frame-Options: SAMEORIGIN');
    assert(res.headers.get('cross-origin-resource-policy') === 'cross-origin', 'Expected Cross-Origin-Resource-Policy: cross-origin');
    assert(res.headers.get('x-powered-by') === null, 'Expected X-Powered-By to be removed');
    const csp = res.headers.get('content-security-policy');
    assert(csp && csp.includes('challenges.cloudflare.com'), 'Expected CSP to allow Cloudflare Turnstile');
    assert(csp && csp.includes('res.cloudinary.com'), 'Expected CSP to allow Cloudinary');
  });

  await test('OPTIONS /health returns CORS headers alongside security headers', async () => {
    const res = await fetch(`${baseUrl}/health`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:5173',
        'Access-Control-Request-Method': 'GET',
      },
    });
    assert(res.status === 204, `Expected 204, got ${res.status}`);
    assert(res.headers.get('access-control-allow-origin') === 'http://localhost:5173', 'Expected CORS allow origin');
    assert(res.headers.get('x-content-type-options') === 'nosniff', 'Expected nosniff on OPTIONS');
    assert(res.headers.get('cross-origin-resource-policy') === 'cross-origin', 'Expected CORP on OPTIONS');
  });

  await test('GET /nonexistent returns 404 JSON (not HTML)', async () => {
    const res = await fetch(`${baseUrl}/nonexistent-route-check`);
    const data = await res.json();
    assert(res.status === 404, `Expected 404, got ${res.status}`);
    assert(data.success === false, 'Expected success: false');
  });

  console.log('\n--- 2. Auth Endpoints & Rate Limiting ---');
  await test('POST /auth/login succeeds with valid credentials (200)', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: admin.email, password: 'admin123' }),
    });
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data.success === true, 'Expected success: true');
    assert(typeof data.token === 'string', 'Expected token string');
    assert(data.data.email === admin.email, 'Expected admin email match');
  });

  await test('POST /auth/login fails without credentials (400)', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    assert(res.status === 400, `Expected 400, got ${res.status}`);
    assert(data.success === false, 'Expected success: false');
    assert(data.message === 'Please provide email and password', 'Expected message match');
  });

  await test('POST /auth/login fails with invalid email without leaking user existence (401)', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent@valluvam.org', password: 'wrong' }),
    });
    const data = await res.json();
    assert(res.status === 401, `Expected 401, got ${res.status}`);
    assert(data.message === 'Invalid credentials', 'Expected generic error message');
  });

  await test('POST /auth/login fails with wrong password (401)', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: admin.email, password: 'wrongpassword' }),
    });
    const data = await res.json();
    assert(res.status === 401, `Expected 401, got ${res.status}`);
    assert(data.message === 'Invalid credentials', 'Expected generic error message');
  });

  await test('POST /auth/login fails on 4th attempt with 401', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: admin.email, password: 'wrongpassword4' }),
    });
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test('POST /auth/login fails on 5th attempt with 401 (max allowed reached)', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: admin.email, password: 'wrongpassword5' }),
    });
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test('POST /auth/login returns 429 when rate limit exceeded on 6th failed attempt', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: admin.email, password: 'wrongpassword6' }),
    });
    const data = await res.json();
    assert(res.status === 429, `Expected 429, got ${res.status}`);
    assert(data.success === false, 'Expected success: false');
    assert(data.message.includes('Too many failed login attempts'), `Expected rate limit message, got "${data.message}"`);
    assert(res.headers.get('ratelimit-limit') === '5', 'Expected RateLimit-Limit: 5');
    assert(res.headers.get('ratelimit-remaining') === '0', 'Expected RateLimit-Remaining: 0');
  });

  await test('GET /auth/me without token returns 401', async () => {
    const res = await fetch(`${baseUrl}/auth/me`);
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test('GET /auth/me with valid token returns user data (unaffected by /auth/login rate limiter)', async () => {
    const res = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data.data.email === admin.email, 'Email should match');
  });

  await test('Resetting rate limiter allows login attempts again', async () => {
    await authRateLimiter.resetKey('127.0.0.1');
    await authRateLimiter.resetKey('::ffff:127.0.0.1');

    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: admin.email, password: 'admin123' }),
    });
    const data = await res.json();
    assert(res.status === 200, `Expected 200 after reset, got ${res.status}`);
    assert(data.success === true, 'Expected success: true after reset');
  });

  console.log('\n--- 3. Admin Dashboard Statistics ---');
  await test('GET /admin/dashboard/stats without token returns 401', async () => {
    const res = await fetch(`${baseUrl}/admin/dashboard/stats`);
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test('GET /admin/dashboard/stats with token returns real statistics', async () => {
    const res = await fetch(`${baseUrl}/admin/dashboard/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(typeof data.data.eventsTotal === 'number', 'eventsTotal must be a number');
    assert(typeof data.data.eventsPublished === 'number', 'eventsPublished must be a number');
    assert(typeof data.data.galleryAlbums === 'number', 'galleryAlbums must be a number');
    assert(typeof data.data.volunteersTotal === 'number', 'volunteersTotal must be a number');
    assert(typeof data.data.contactMessages === 'number', 'contactMessages must be a number');
    assert(typeof data.data.activeTeamMembers === 'number', 'activeTeamMembers must be a number');
  });

  console.log('\n--- 4. Events API ---');
  let testEventId = null;
  await test('GET /events returns published events', async () => {
    const res = await fetch(`${baseUrl}/events`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(data.data), 'Expected array');
  });

  await test('GET /events/admin returns 200 with admin token', async () => {
    const res = await fetch(`${baseUrl}/events/admin`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  await test('GET /events/admin-list returns 200 with admin token', async () => {
    const res = await fetch(`${baseUrl}/events/admin-list`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  await test('GET /events/:id with invalid ObjectId returns 400', async () => {
    const res = await fetch(`${baseUrl}/events/invalid-id`);
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  await test('Admin can create, update, and delete an event', async () => {
    // Create
    const createRes = await fetch(`${baseUrl}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: '__TEST_SUITE_EVENT__',
        description: 'Testing event lifecycle',
        date: new Date().toISOString(),
        location: 'Kalmunai, Sri Lanka',
        status: 'draft',
      }),
    });
    const createData = await createRes.json();
    assert(createRes.status === 201, 'Create should return 201');
    testEventId = createData.data._id;

    // Update
    const updateRes = await fetch(`${baseUrl}/events/${testEventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'published' }),
    });
    assert(updateRes.status === 200, 'Update should return 200');

    // Delete
    const deleteRes = await fetch(`${baseUrl}/events/${testEventId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(deleteRes.status === 200, 'Delete should return 200');
  });

  console.log('\n--- 5. Gallery API ---');
  await test('GET /gallery returns public albums', async () => {
    const res = await fetch(`${baseUrl}/gallery`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  await test('GET /gallery/:id with invalid ObjectId returns 400', async () => {
    const res = await fetch(`${baseUrl}/gallery/invalid-id`);
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  console.log('\n--- 6. Team API ---');
  await test('GET /team returns active team members', async () => {
    const res = await fetch(`${baseUrl}/team`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  await test('GET /team/admin returns 200 with admin token', async () => {
    const res = await fetch(`${baseUrl}/team/admin`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  console.log('\n--- 7. Volunteer Submission & Protection ---');
  const volEmail = `test_vol_${Date.now()}@example.com`;
  let volId = null;

  await test('Volunteer submission succeeds with valid token', async () => {
    const res = await fetch(`${baseUrl}/volunteers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': '198.51.100.10',
      },
      body: JSON.stringify({
        name: 'Jane Doe',
        email: volEmail,
        volunteerArea: 'Teaching & Educational Support',
        availability: 'Weekends',
        message: 'I want to volunteer',
        turnstileToken: 'XXXX.DUMMY.TOKEN.XXXX',
      }),
    });
    const data = await res.json();
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    volId = data.data._id;
  });

  await test('Duplicate volunteer submission within 2 min returns 409', async () => {
    const res = await fetch(`${baseUrl}/volunteers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': '198.51.100.10',
      },
      body: JSON.stringify({
        name: 'Jane Doe',
        email: volEmail,
        volunteerArea: 'Teaching & Educational Support',
        availability: 'Weekends',
        message: 'I want to volunteer',
        turnstileToken: 'XXXX.DUMMY.TOKEN.XXXX',
      }),
    });
    assert(res.status === 409, `Expected 409, got ${res.status}`);
  });

  if (volId) {
    await Volunteer.findByIdAndDelete(volId);
  }

  console.log('\n--- 8. Contact Submission & Protection ---');
  const contactEmail = `test_contact_${Date.now()}@example.com`;
  let contactId = null;

  await test('Contact submission succeeds with valid token', async () => {
    const res = await fetch(`${baseUrl}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': '198.51.100.11',
      },
      body: JSON.stringify({
        name: 'John Smith',
        email: contactEmail,
        subject: 'General Enquiry',
        message: 'Partnering with Valluvam',
        preferredContactMethod: 'email',
        turnstileToken: 'XXXX.DUMMY.TOKEN.XXXX',
      }),
    });
    const data = await res.json();
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    contactId = data.data._id;
  });

  await test('Duplicate contact message within 2 min returns 409', async () => {
    const res = await fetch(`${baseUrl}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': '198.51.100.11',
      },
      body: JSON.stringify({
        name: 'John Smith',
        email: contactEmail,
        subject: 'General Enquiry',
        message: 'Partnering with Valluvam',
        preferredContactMethod: 'email',
        turnstileToken: 'XXXX.DUMMY.TOKEN.XXXX',
      }),
    });
    assert(res.status === 409, `Expected 409, got ${res.status}`);
  });

  if (contactId) {
    await Contact.findByIdAndDelete(contactId);
  }

  console.log('\n--- 9. Settings API ---');
  await test('GET /settings returns organization info', async () => {
    const res = await fetch(`${baseUrl}/settings`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data.data.organizationName === 'Valluvam', 'Org name should be Valluvam');
  });

  console.log('\n--- 10. Support API ---');
  await test('GET /support returns active support options', async () => {
    const res = await fetch(`${baseUrl}/support`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(data.data) && data.data.length > 0, 'Must have support options');
  });

  console.log(`\n========================================`);
  console.log(`Test Suite Results: ${passed} passed, ${failed} failed`);
  console.log(`========================================`);

  server.close();
  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runTestSuite().catch((err) => {
  console.error('Fatal test suite error:', err);
  process.exit(1);
});
