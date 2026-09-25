# Valluvam

> "Let all your thoughts be set on high aspirations"

**Valluvam** is a registered nonprofit organization established on 28 March 2025, based in Pandiruppu, Kalmunai, Ampara District, Sri Lanka.

Valluvam mainly supports children, students, poor families and rural communities through educational and humanitarian activities.

## Tech Stack

| Layer    | Technology                  |
| -------- | --------------------------- |
| Frontend | React.js, Vite, Tailwind CSS |
| Backend  | Node.js, Express.js         |
| Database | MongoDB, Mongoose            |

## Project Structure

```
valluvam/
├── client/          # React + Vite frontend
├── server/          # Express.js backend
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Hirukshanan/Valluvam.git
   cd valluvam
   ```

2. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

4. **Set up environment variables**
   ```bash
   cp server/.env.example server/.env
   ```

### Running the Application

**Start the frontend** (runs on http://localhost:5173):
```bash
cd client
npm run dev
```

**Start the backend** (runs on http://localhost:5000):
```bash
cd server
npm start
```

## API Endpoints

| Method | Endpoint       | Description         |
| ------ | -------------- | ------------------- |
| GET    | `/api/health`  | API health check    |
| POST   | `/api/auth/login` | Admin login (rate-limited) |
| GET    | `/api/auth/me` | Authenticated user profile |
| GET    | `/api/events`  | Public events list  |
| GET    | `/api/gallery` | Public gallery albums |
| GET    | `/api/team`    | Public active team members |
| POST   | `/api/volunteers` | Volunteer application submission (Turnstile & rate-limited) |
| POST   | `/api/contact` | Contact message submission (Turnstile & rate-limited) |
| GET    | `/api/support` | Public active support options |
| GET    | `/api/settings`| Organization settings |
| GET    | `/api/admin/dashboard/stats` | Admin dashboard metrics |

---

## Production Deployment & Handover Guide

This section outlines the exact steps and requirements to take the Valluvam MERN application from a completed development state to a live production environment and client handover.

### 1. Project Architecture

The repository is organized as a decoupled MERN stack:

```
valluvam/
├── client/          # React (Vite) Single Page Application (Tailwind CSS, Client-side routing)
└── server/          # Node.js + Express REST API (Mongoose, Helmet, Rate Limiter, Cloudinary SDK)
```

- **Frontend (`client/`)**: Built into static HTML/CSS/JS assets (`npm run build`) and served via modern CDN/JAMstack hosting.
- **Backend (`server/`)**: Long-running Node.js process exposing `/api/*` REST endpoints and connecting to MongoDB Atlas and Cloudinary.

---

### 2. Required Production Services

Before deploying, ensure client-owned accounts are provisioned for the following infrastructure:

| Service | Purpose | Recommended Platform |
| :--- | :--- | :--- |
| **Database** | Stores events, albums, team, messages, volunteer applications, and settings | [MongoDB Atlas](https://www.mongodb.com/atlas) (M0 or dedicated cluster) |
| **Media Storage** | Secure cloud storage and CDN delivery for uploaded photos | [Cloudinary](https://cloudinary.com) |
| **Bot Protection** | Privacy-friendly CAPTCHA challenge for Contact & Volunteer forms | [Cloudflare Turnstile](https://dash.cloudflare.com) |
| **Backend Hosting** | Executes the Express.js application with automatic restarts & SSL | Render, Railway, DigitalOcean App Platform, or VPS |
| **Frontend Hosting** | Global edge hosting with automated preview and production builds | Vercel, Netlify, or Cloudflare Pages |
| **Domain Registrar** | Primary domain (e.g., `valluvam.org`) and API subdomain (`api.valluvam.org`) | Cloudflare Registrar, Namecheap, GoDaddy |

---

### 3. Environment Variables Reference

Use the placeholders below to configure production environments.

#### A. Backend Variables (`server/.env`)

These variables are defined in the backend hosting dashboard (e.g. Render/Railway environment settings):

```env
# Application Port & Environment
PORT=5000
NODE_ENV=production

# MongoDB Production Connection
# Format: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
MONGODB_URI=mongodb+srv://prod_user:prod_password@cluster0.xxxxx.mongodb.net/valluvam?retryWrites=true&w=majority

# JWT Authentication (generate a secure 64+ char random string)
JWT_SECRET=your_super_secret_high_entropy_jwt_key_at_least_64_characters

# Cloudinary Production Credentials
CLOUDINARY_CLOUD_NAME=your_production_cloud_name
CLOUDINARY_API_KEY=your_production_api_key
CLOUDINARY_API_SECRET=your_production_api_secret

# Cloudflare Turnstile Production Secret
TURNSTILE_SECRET_KEY=0x4AAAAAA...your_production_turnstile_secret_key

# CORS Frontend Whitelist (Exact production frontend origin, no trailing slash)
CLIENT_URL=https://valluvam.org

# Optional Initial Admin Seed Credentials
ADMIN_SEED_NAME=Admin
ADMIN_SEED_EMAIL=admin@valluvam.org
ADMIN_SEED_PASSWORD=your_initial_secure_admin_password
```

#### B. Frontend Variables (`client/.env`)

These variables are defined in the frontend hosting dashboard (e.g. Vercel/Netlify environment settings) and baked into static bundles during build time:

```env
# Backend API Base URL (must point to production backend API, with /api suffix)
VITE_API_URL=https://api.valluvam.org/api

# Cloudflare Turnstile Public Site Key
VITE_TURNSTILE_SITE_KEY=0x4AAAAAA...your_production_turnstile_site_key
```

---

### 4. Variable Security & Placement Rules

| Variable | Target Location | Visibility | Security Requirement |
| :--- | :--- | :--- | :--- |
| `MONGODB_URI` | Backend Only | **Strictly Secret** | Never expose in frontend or client-side code; contains database credentials. |
| `JWT_SECRET` | Backend Only | **Strictly Secret** | Used to sign session tokens; must be high-entropy. |
| `CLOUDINARY_API_SECRET` | Backend Only | **Strictly Secret** | Full administrative API access to media storage; keep server-side. |
| `TURNSTILE_SECRET_KEY` | Backend Only | **Strictly Secret** | Server-to-server token verification with Cloudflare; keep server-side. |
| `CLIENT_URL` | Backend Only | Server Configuration | Whitelists the production frontend domain for CORS headers. |
| `PORT`, `NODE_ENV` | Backend Only | Server Configuration | Standard Node.js runtime configuration. |
| `VITE_API_URL` | Frontend Only | **Public** | Baked into client JS; points browser requests to backend API. |
| `VITE_TURNSTILE_SITE_KEY` | Frontend Only | **Public** | Public widget key visible in HTML; safe for client-side embedding. |

> [!WARNING]
> Vite embeds all variables starting with `VITE_` directly into the compiled client JavaScript. **Never prefix secrets with `VITE_`**.

---

### 5. Production Deployment Order

Follow this deployment sequence:

```
1. Client-Owned Service Accounts
   ↓
2. MongoDB Atlas Setup (Create cluster, user, network access)
   ↓
3. Cloudinary Setup (Create production cloud, copy API keys)
   ↓
4. Cloudflare Turnstile Setup (Create widget, set production domain)
   ↓
5. Backend Deployment (Deploy server, inject env vars, verify /api/health)
   ↓
6. Initial Database Seeding / Migration (Seed initial admin & baseline content)
   ↓
7. Frontend Deployment (Deploy client with VITE_API_URL and VITE_TURNSTILE_SITE_KEY)
   ↓
8. Custom Domain & DNS Mapping (Map domains, configure SSL/HTTPS)
   ↓
9. End-to-End Verification & Testing
```

---

### 6. Database Migration & Initialization

1. **Option A: Fresh Production Database with Seed Scripts**
   If starting with clean production data, run the provided seed scripts from the backend repository once connected to the production database:
   ```bash
   npm run seed:admin      # Creates initial administrator account
   npm run seed:settings   # Seeds organization metadata (name, contact, address)
   npm run seed:support    # Seeds baseline support/donation tiers
   npm run seed:team       # Seeds initial active leadership team
   ```
2. **Option B: Migrating Development Data to Production**
   If development records (events, albums, settings) should carry over to production:
   - Export development database using `mongodump`:
     ```bash
     mongodump --uri="<DEV_MONGODB_URI>" --out=./backup
     ```
   - Restore to production MongoDB Atlas using `mongorestore`:
     ```bash
     mongorestore --uri="<PROD_MONGODB_URI>" ./backup/<database_name>
     ```
   - Verify all collections (`events`, `galleries`, `teams`, `users`, `settings`, `supports`) exist in the production database.

---

### 7. Cloudinary Media Migration

Images stored on Cloudinary do **not** automatically migrate when changing Cloudinary credentials:

1. **Separate Client Cloudinary Account**:
   - If the client creates a separate Cloudinary account, images uploaded during development will remain in the developer's development cloud.
2. **Re-uploading / Migration Steps**:
   - Manually re-upload essential organization photos (team member portraits, event covers, gallery albums) through the Valluvam Admin Dashboard (`/admin/gallery`, `/admin/events`, `/admin/team`).
   - Alternatively, use Cloudinary's migration tools or scripts to copy folders (`valluvam/events`, `valluvam/gallery`, `valluvam/team`) to the client's cloud, and update image URLs in MongoDB if IDs change.

---

### 8. Cloudflare Turnstile Production Setup

The development environment utilizes Cloudflare's dummy test credentials (`1x0000000000000000000000000000000AA` / `XXXX.DUMMY.TOKEN.XXXX`). In production, real bot protection must be activated:

1. Log into the client's [Cloudflare Dashboard](https://dash.cloudflare.com).
2. Navigate to **Turnstile** → **Add Site / Widget**.
3. **Widget Name**: `Valluvam Public Forms`.
4. **Domains**: Add the exact production domain (e.g. `valluvam.org`, `www.valluvam.org`).
5. **Widget Mode**: *Managed* (recommended) or *Non-interactive*.
6. Copy the generated keys:
   - Set **Site Key** as `VITE_TURNSTILE_SITE_KEY` in frontend hosting.
   - Set **Secret Key** as `TURNSTILE_SECRET_KEY` in backend hosting.
7. Redeploy both frontend and backend to apply the keys.

---

### 9. Client Ownership & Account Governance

To ensure long-term autonomy and security, the following assets should be directly owned by the client organization:

- **Domain Registrar**: Client owns the domain registration and DNS control.
- **Cloudflare Account**: Client owns the DNS, CDN, and Turnstile configurations.
- **MongoDB Atlas Account**: Client organization owns the cloud database and billing.
- **Cloudinary Account**: Client owns media storage and bandwidth.
- **Hosting Accounts**: Client owns Vercel/Netlify/Render billing accounts.
- **GitHub Repository**: Client organization owns the repository.

*Tip for Developers*: Request collaborator/team-member access on client-owned accounts rather than hosting production workloads under personal developer accounts.

---

### 10. Final Deployment Testing Checklist

Before marking the deployment complete, verify the following:

- [ ] **Health Endpoint**: `GET https://api.valluvam.org/api/health` returns HTTP 200 with `"status": "healthy"`, `"database": "connected"`.
- [ ] **Security Headers**: Inspect response headers for `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and absence of `X-Powered-By`.
- [ ] **Public Pages**:
  - [ ] Home page renders properly, hero image loads above-the-fold, "Who We Are" aligned cleanly.
  - [ ] About page displays history, mission, and leadership team with photos.
  - [ ] Our Work, Events, Gallery, Support, and Contact pages render without errors.
- [ ] **Admin Authentication**:
  - [ ] Admin login at `/admin/login` succeeds with valid credentials and sets JWT.
  - [ ] Rate limiting triggers on 6th failed attempt returning HTTP 429.
  - [ ] Admin logout clears storage and redirects to `/admin/login`.
- [ ] **Admin Modules**:
  - [ ] Events: create new event, upload image to Cloudinary, edit, delete, publish toggle.
  - [ ] Gallery: create album, upload photo assets, delete photo, verify ordering.
  - [ ] Team: add member, upload avatar, toggle active status.
  - [ ] Messages: view submitted contact messages.
  - [ ] Volunteers: view volunteer submissions.
  - [ ] Settings: update address, phone, email, and social links.
- [ ] **Public Forms & Bot Verification**:
  - [ ] Volunteer form displays Turnstile, validates required fields, submits successfully.
  - [ ] Contact form validates contact methods (Email, WhatsApp, Phone), displays Turnstile, submits successfully.
  - [ ] Submitting duplicate messages within 2 minutes returns expected 409 conflict message.
- [ ] **Language Switching**: Toggle between English and Tamil across public pages.
- [ ] **Mobile & Tablet Responsiveness**: Verify layout on mobile, tablet, and desktop viewports across public and admin interfaces.
- [ ] **Error Boundary**: Intentional rendering glitches are caught with a clean Valluvam-styled error screen.

---

### 11. Security Checklist

- [ ] `.env` and `.env.local` files are strictly included in `.gitignore` and never committed to Git.
- [ ] No API keys, secrets, or database credentials exist in client-side code (`client/src`).
- [ ] CORS is restricted to the legitimate production frontend origin via `CLIENT_URL`.
- [ ] Centralized error handling masks stack traces and internal database errors in production mode (`NODE_ENV=production`).
- [ ] SSL/TLS is active across both frontend (`https://valluvam.org`) and backend (`https://api.valluvam.org`).

---

### 12. Client Handover Checklist

Upon completion, provide the client leadership with a secure handover package containing:

1. **Production URLs**:
   - Public Website: `https://valluvam.org`
   - Admin Login: `https://valluvam.org/admin/login`
   - Backend API: `https://api.valluvam.org`
   - Health Monitor: `https://api.valluvam.org/api/health`
2. **Access Credentials & Accounts**:
   - Initial Admin credentials (email + temporary secure password) with instructions to update upon first login.
   - Primary ownership transfer for MongoDB Atlas, Cloudinary, Cloudflare, and hosting accounts.
   - Domain registrar login or DNS delegation confirmation.
3. **Source Code**:
   - Access to client GitHub repository or archived source release.
4. **Basic Admin Usage Guide**:
   - How to access the Admin Dashboard.
   - How to publish new events and post-event summaries.
   - How to create photo albums in the Gallery.
   - How to manage active team member listings.
   - How to view incoming volunteer applications and contact inquiries.
   - How to update organizational address, contact numbers, and social links in Settings.

---

## Contact

📧 valluvamofficial@gmail.com

## License

This project is developed for Valluvam nonprofit organization.

## Developer

Developed by Hirukshanan



