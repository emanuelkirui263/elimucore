# ELIMUCORE Setup Guide

## Prerequisites

Before you begin, ensure you have installed:
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (v12 or higher)
- Git

---

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and update it with your database credentials:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=elimucore
DB_USER=postgres
DB_PASSWORD=your_password

# Server Configuration
NODE_ENV=development
PORT=5000

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRY=7d

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 3. Create Database

```bash
# Create the database
createdb elimucore

# Or using PostgreSQL shell
psql
CREATE DATABASE elimucore;
\q
```

### 4. Start Backend Server

Development mode with auto-reload:
```bash
npm run dev
```

Or production mode:
```bash
npm start
```

The backend server will run on `http://localhost:5000`

---

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

Create `.env.local` file (or use existing):

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start Frontend Dev Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

---

## Demo Credentials

Login with these credentials:

| Field | Value |
|-------|-------|
| Email | admin@elimucore.com |
| Password | password |

---

## Database Seeding (Optional)

To seed demo data (when available):

```bash
cd backend
npm run seed
```

---

## Project Structure

```
elimucore/
├── backend/
│   ├── config/
│   │   ├── database.js       # Sequelize config
│   │   └── roles.js          # RBAC config
│   ├── middleware/
│   │   ├── auth.js           # Authentication
│   │   ├── errorHandler.js   # Error handling
│   │   └── requestLogger.js  # Request logging
│   ├── models/               # Sequelize models
│   ├── routes/               # API endpoints
│   ├── package.json
│   ├── server.js             # Express app
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js     # Axios config
│   │   │   └── endpoints.js  # API services
│   │   ├── store/
│   │   │   └── authStore.js  # Zustand store
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   └── DashboardPage.jsx
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── docs/
│   ├── API_DOCUMENTATION.md
│   ├── DATABASE_SCHEMA.md
│   ├── SETUP_GUIDE.md
│   └── ARCHITECTURE.md
│
└── README.md
```

---

## Running Tests

### Backend Tests

```bash
cd backend
npm run test
```

### Frontend Tests

```bash
cd frontend
npm run test
```

---

## Building for Production

### Backend

No build step needed, deploy `backend/` directory with Node.js runtime.

### Frontend

Build optimized production bundle:

```bash
cd frontend
npm run build
```

Output will be in `frontend/dist/`

---

## Troubleshooting

### Database Connection Error

**Error**: `connect ECONNREFUSED 127.0.0.1:5432`

**Solution**: 
1. Ensure PostgreSQL is running
2. Verify DB credentials in `.env`
3. Check if database exists

### Port Already in Use

**Error**: `Port 5000 is already in use`

**Solution**: 
1. Change PORT in `.env`
2. Or kill the process: `lsof -ti:5000 | xargs kill -9`

### Module Not Found

**Error**: `Cannot find module 'sequelize'`

**Solution**: 
```bash
cd backend
npm install
```

### CORS Error

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
1. Check `CORS_ORIGIN` in backend `.env`
2. Should match frontend URL (http://localhost:5173)

---

## Environment Variables Reference

### Backend (.env)

| Variable | Default | Description |
|----------|---------|-------------|
| DB_HOST | localhost | Database host |
| DB_PORT | 5432 | Database port |
| DB_NAME | elimucore | Database name |
| DB_USER | postgres | Database user |
| DB_PASSWORD | - | Database password |
| NODE_ENV | development | Environment |
| PORT | 5000 | Server port |
| JWT_SECRET | - | JWT signing key |
| JWT_EXPIRY | 7d | Token expiry |
| CORS_ORIGIN | * | CORS origin |

### Frontend (.env.local)

| Variable | Default | Description |
|----------|---------|-------------|
| VITE_API_URL | http://localhost:5000/api | Backend API URL |

---

## API Endpoints Summary

| Module | Endpoints |
|--------|-----------|
| Auth | POST /auth/login, GET /auth/me |
| Students | POST/GET /students, GET/PUT /students/:id, POST /students/:id/approve |
| Academics | POST /academics/exams, POST /academics/marks, GET /academics/results/:id |
| Finance | POST /finance/payments, GET /finance/accounts/:id |
| Attendance | POST /attendance, GET /attendance/report/:id |

---

## Deployment

### Backend (Node.js)

Deploy to services like:
- Heroku
- Railway
- Render
- AWS EC2

### Frontend (React)

Deploy to services like:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

---

## Support

For issues or questions:
- GitHub Issues: Create an issue in the repository
- Email: support@elimucore.com

---

Last Updated: January 2026
Version: 1.0.0
