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
