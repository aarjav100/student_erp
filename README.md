# Student ERP System

A comprehensive Enterprise Resource Planning (ERP) platform designed for educational institutions to manage students, faculty, courses, attendance, and administrative workflows.

---

## 📁 Project Structure

```text
├── backend/       # Express.js & MongoDB REST API
│   ├── config/       # Database & environment configurations
│   ├── controllers/  # Route controller logic
│   ├── middleware/   # Authentication & validation middleware
│   ├── models/       # Mongoose data models
│   ├── routes/       # API endpoints
│   └── server.js     # Backend entry point
│
└── frontend/      # React + Vite frontend application
    ├── src/          # React components, pages, and hooks
    ├── public/       # Static assets
    └── vite.config.ts# Vite configuration
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URI)
- Git

---

### 1. Backend Setup

```bash
cd backend
npm install
```

Configure your environment variables in `backend/.env`:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Run the backend development server:
```bash
npm run dev
```

---

### 2. Frontend Setup

In a new terminal window:

```bash
cd frontend
npm install
```

Start the frontend development server:
```bash
npm run dev
```

---

## 🛠 Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, TypeScript
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Authentication:** JWT (JSON Web Tokens), Bcrypt.js

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
