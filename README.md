# TaskFlow — Premium Full Stack Task Management System

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)

A stunning, state-of-the-art **Full Stack Task Management System** designed and built for software engineering internship assessments. The application features stateless **JWT authentication with automatic refresh token rotation**, **user data isolation**, full **CRUD operations**, **case-insensitive search**, **multi-dimensional filtering**, **due-date sorting**, **pagination**, a **real-time productivity dashboard**, and an ultra-premium **Vanilla CSS design system** with a persistent **Dark / Light Mode toggle**.

---

## ✨ Features & Capabilities

### 🔐 1. Authentication & Security (Phase 1 & Phase 4)
- **Stateless JWT Authentication**: Issues short-lived Access Tokens (`15m`) and secure Refresh Tokens (`7d`).
- **Automatic Token Rotation**: Frontend Axios interceptors automatically detect expired tokens (`401 Unauthorized`), request a fresh token via `/api/auth/refresh`, and seamlessly retry the original request.
- **Strict Data Ownership & Isolation**: Every task is bound to its creator (`userId`). Users can never view, edit, or delete another user's tasks (`403 Forbidden`).
- **Dynamic Password Strength Meter**: Real-time 3-segment visual progress bar (*Weak*, *Medium*, *Strong*) on the registration form.

### 📊 2. Real-Time Productivity Dashboard (Phase 4)
- **Personalized Greeting**: Welcomes returning users with their profile name and motivational status.
- **Interactive Stat Cards**: Live counts for **Total Tasks**, **Completed Tasks** (with completion percentage), **Pending Tasks**, and **In Progress Tasks**.
- **Priority Breakdown Widget**: Visual horizontal progress bars illustrating the distribution of *High*, *Medium*, and *Low* priority items.

### 📋 3. Tasks Workspace — CRUD, Search, Filter, Sort & Pagination (Phase 2 & Phase 5)
- **Full Task CRUD**: Create, read, update, and delete tasks with required `title` and `dueDate` validation.
- **Custom Search & Filtering Bar**:
  - **Title Search**: Case-insensitive regex matching.
  - **Status Filter**: Dropdown for `Pending`, `In Progress`, and `Completed`.
  - **Priority Filter**: Dropdown for `High`, `Medium`, and `Low`.
  - **Due-Date Sorting**: Toggle between `Earliest First` (`asc`) and `Latest First` (`desc`).
- **Quick Status Toggle Badge (Bonus UX)**: Instantly change any task's status directly from its card badge without opening a modal.
- **Pagination Controls**: Configurable per-page sizes (`5`, `10`, `20`, `50`) with numbered page navigation.

### 🎨 4. Rich Vanilla CSS Design System (Phase 3)
- **Glassmorphism & HSL Color Tokens**: Tailored HSL color variables with subtle glowing borders, gradients, and keyframe micro-animations.
- **Persistent Dark / Light Mode**: One-click theme switcher in the navbar saved to `localStorage`.
- **Responsive Layouts**: Seamlessly adapts across mobile phones, tablets, and desktop displays.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Vite | SPA Framework & fast bundling |
| **Styling** | Vanilla CSS (`index.css`) | Custom HSL Design System, Dark Mode & animations |
| **Routing & HTTP** | React Router DOM v6 + Axios | Client-side routing & JWT interceptor injections |
| **Backend** | Node.js + Express.js | RESTful API server & middleware pipeline |
| **Database** | MongoDB + Mongoose | Schema validation, indexes, and document queries |
| **Testing** | Jest + Supertest + Memory Server | 23 automated unit and integration tests |
| **DevOps** | Docker + Docker Compose + Nginx | Multi-container Dockerization & static proxy serving |

---

## 🚀 Quickstart & Setup Guide

### Option A: Local Run with One Command (`npm run dev`)
1. **Prerequisites**: Ensure you have **Node.js (v18+)** and a running MongoDB instance (or free [MongoDB Atlas URL](https://www.mongodb.com/cloud/atlas)).
2. **Install all dependencies** (root, backend, and frontend):
   ```bash
   npm run install-all
   ```
3. **Start both Backend and Frontend dev servers simultaneously**:
   ```bash
   npm run dev
   ```
4. **Open your browser**:
   - Frontend Web App: [http://localhost:3000](http://localhost:3000)
   - Backend API Health Check: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

### Option B: Using Docker & Docker Compose
1. **Prerequisites**: Ensure **Docker** and **Docker Compose** are installed and running.
2. **Build and start all 3 containers** (`mongodb`, `backend`, and `frontend`):
   ```bash
   docker-compose up --build -d
   ```
3. **Access the application**:
   - Web Application: [http://localhost:3000](http://localhost:3000) (or `http://localhost:80`)
   - API Server: [http://localhost:5000/api/health](http://localhost:5000/api/health)
4. **To stop containers**:
   ```bash
   docker-compose down
   ```

---

## 🧪 Automated Verification & Test Suite

We have created an automated test suite (`backend/tests/auth.test.js` and `backend/tests/tasks.test.js`) using Jest, Supertest, and `mongodb-memory-server` that tests all API routes, authentication workflows, search, filters, sorting, pagination, and user ownership isolation.

To run the complete test suite:
```bash
npm test --prefix backend
```

**Test Breakdown (23/23 Passing):**
- **10 Auth Tests**: Registration, email uniqueness, bcrypt hashing, login verification, `/me` middleware protection, token refreshing, and logout.
- **13 Task Tests**: Creation validation, strict user ownership isolation, case-insensitive title search, status & priority filters, due-date sorting, pagination math, dashboard aggregation stats, and unauthorized modification rejections (`403 Forbidden`).

---

## 📬 Postman API Collection

A complete Postman Collection is included in the root `/postman` directory:
- **File**: `postman/Task_Management_System.postman_collection.json`
- **How to Use**:
  1. Open Postman -> click **Import** -> select `Task_Management_System.postman_collection.json`.
  2. Run **Register User** or **Login User**. Postman test scripts will automatically capture and save `{{token}}`, `{{refreshToken}}`, and created `{{taskId}}` into your collection variables!
  3. Explore all 14 authentication and task management endpoints seamlessly.

---

## 📂 Project Architecture & Directory Structure

```text
├── backend/
│   ├── src/
│   │   ├── config/db.js              # MongoDB Mongoose connection
│   │   ├── controllers/              # authController.js, taskController.js
│   │   ├── middleware/               # authMiddleware.js, errorMiddleware.js
│   │   ├── models/                   # User.js, Task.js (Mongoose Schemas)
│   │   ├── routes/                   # authRoutes.js, taskRoutes.js
│   │   ├── utils/generateToken.js    # Access & Refresh token issuers
│   │   ├── app.js                    # Express app & route mounting
│   │   └── server.js                 # HTTP Server startup
│   ├── tests/                        # auth.test.js, tasks.test.js
│   ├── .env & .env.example           # Environment variables
│   ├── Dockerfile                    # Node 20 Alpine server image
│   └── package.json                  # Backend dependencies & test scripts
├── frontend/
│   ├── src/
│   │   ├── components/               # Navbar, Footer, Alert, ProtectedRoute, TaskModal, DeleteModal
│   │   ├── context/AuthContext.jsx   # Global Auth & Dark/Light mode theme switcher
│   │   ├── pages/                    # Login.jsx, Register.jsx, Dashboard.jsx, Tasks.jsx
│   │   ├── services/api.js           # Axios client with automatic JWT token rotation
│   │   ├── App.jsx & main.jsx        # React Router DOM v6 setup
│   │   └── index.css                 # Vanilla CSS HSL Design System
│   ├── nginx.conf                    # Nginx SPA & API proxy configuration
│   ├── Dockerfile                    # Multi-stage Node + Nginx build
│   └── package.json                  # React 18 + Vite dependencies
├── postman/
│   └── Task_Management_System.postman_collection.json  # Postman API Collection
├── docker-compose.yml                # Multi-container Docker orchestration
├── DEMO_GUIDE.md                     # 3–5 Minute Video Walkthrough Script
├── package.json                      # Root Concurrently workspace scripts
└── README.md                         # Comprehensive documentation
```