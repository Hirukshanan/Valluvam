<div align="center">

<img
  src="https://raw.githubusercontent.com/Hirukshanan/Valluvam/main/client/src/assets/logo.jpg"
  alt="Valluvam Logo"
  width="260"
/>

# Valluvam

### *Let all your thoughts be set on high aspirations.*

**A MERN-based nonprofit organization website and administration platform for Valluvam, Sri Lanka.**

<br />

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-9-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5?logo=cloudinary&logoColor=white)](https://cloudinary.com/)

<br />

[Facebook](https://www.facebook.com/share/1Hw92m6QP2/)
&nbsp;&nbsp;•&nbsp;&nbsp;
[Instagram](https://www.instagram.com/valluvam_official_?stkn=bHRjMzZiNzc4ZTZr)

</div>

---

## ✨ About

**Valluvam** is a registered nonprofit organization established on **28 March 2025** in Pandiruppu, Kalmunai, Ampara District, Sri Lanka.

The organization supports students, children, families, and rural communities through educational and humanitarian activities.

### What Valluvam works on

- Educational resources and past papers
- Books and learning materials
- Student assistance
- Rural education
- Community relief

---

## 🌐 What This Project Provides

This project includes both a **public-facing website** and a **protected administration system**.

### Public Website

- 🏠 Home
- ℹ️ About Us
- 🎯 Our Work
- 📅 Events
- 🖼️ Gallery
- 🙋 Volunteer
- 🤝 Support Us
- ✉️ Contact

### Admin Dashboard

- 🔐 Admin authentication
- 📊 Dashboard statistics
- 📅 Event management
- 🖼️ Gallery album management
- 👥 Team management
- 🙋 Volunteer submissions
- ✉️ Contact messages
- 🤝 Support content
- ⚙️ Organization settings

---

## 🧩 Main Features

| Area | Features |
|---|---|
| **Events** | Create, edit, publish, delete and manage event images |
| **Gallery** | Album-based galleries, multiple photos, cover images and photo management |
| **Team** | Manage leadership/team members and display order |
| **Volunteers** | Public applications with admin management |
| **Contact** | Public contact messages with admin management |
| **Support** | Manage public support options and ordering |
| **Settings** | Centralized organization information |
| **Language** | English / Tamil interface |
| **Authentication** | JWT-based admin authentication |
| **Media** | Cloudinary image uploads |
| **Protection** | Cloudflare Turnstile, rate limiting and duplicate-submission protection |

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router

### Backend

- Node.js
- Express
- Mongoose
- MongoDB
- JWT
- bcryptjs

### Services

- Cloudinary — image storage and delivery
- Cloudflare Turnstile — bot protection

---

## 📁 Project Structure

```text
Valluvam/
├── client/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── ...
│   ├── tests/
│   └── package.json
│
├── .gitignore
└── README.md

```

## Local Setup

### Requirements

- Node.js 22.12 or later and npm
- Git
- A local MongoDB instance or MongoDB Atlas connection
- Cloudinary credentials for image uploads
- Cloudflare Turnstile site and secret keys for protected public forms

### Clone the Repository

```bash
git clone https://github.com/Hirukshanan/Valluvam.git
cd Valluvam
```

### Backend

1. Copy `server/.env.example` to `server/.env`.
2. Configure the following values:
   - `MONGODB_URI`: your MongoDB connection string
   - `JWT_SECRET`: a strong secret for authentication
   - `PORT=5000`
   - `CLIENT_URL=http://localhost:5173`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`
   - `TURNSTILE_SECRET_KEY`: your Turnstile secret key
3. Add `ADMIN_SEED_NAME`, `ADMIN_SEED_EMAIL`, and a strong
   `ADMIN_SEED_PASSWORD` to `server/.env`.
4. Ensure MongoDB is running or your Atlas database is accessible.
5. From the repository root, run:

```bash
cd server
npm install
npm run seed:admin
npm run dev
```

The backend runs at `http://localhost:5000`.

The seed command creates the initial admin account. If the email already
exists, it does not update the existing account or its password.

### Frontend

1. Open a second terminal at the repository root.
2. Copy `client/.env.example` to `client/.env`.
3. Set `VITE_API_URL=http://localhost:5000/api`.
4. Set `VITE_TURNSTILE_SITE_KEY` to the site key matching your backend
   secret key. Configure Turnstile to allow your local development hostname.
5. Run:

```bash
cd client
npm install
npm run dev
```

Keep both the frontend and backend running.

- Website: `http://localhost:5173`
- Admin login: `http://localhost:5173/admin/login`

Log in using the admin credentials configured before running the seed command.
If Vite selects another port, use the address printed in its terminal.

