# ELIMUCORE Quick Reference Guide

## 🚀 Getting Started (5 Minutes)

### Prerequisites
```bash
Node.js v18+
PostgreSQL v12+
npm or yarn
```

### Step 1: Backend
```bash
cd backend
npm install
cp .env.example .env

# Edit .env with:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=elimucore
# DB_USER=postgres
# DB_PASSWORD=your_password

# Create database
createdb elimucore

# Start backend
npm run dev
# → Running on http://localhost:5000
```

### Step 2: Frontend
```bash
cd frontend
npm install
npm run dev
# → Running on http://localhost:5173
```

### Step 3: Login
```
URL: http://localhost:5173
Email: admin@elimucore.com
Password: password
```

---

## 📚 Key Files

### Backend Entry
- `backend/server.js` - Express server
- `backend/config/database.js` - Database connection
- `backend/config/roles.js` - RBAC configuration

### Backend Models
- `backend/models/User.js`
- `backend/models/Student.js`
- `backend/models/Exam.js`
- `backend/models/Mark.js`
- `backend/models/Payment.js`

### Backend Routes
- `backend/routes/auth.js` - Authentication
- `backend/routes/students.js` - Student management
- `backend/routes/academics.js` - Marks & exams
- `backend/routes/finance.js` - Payments & fees
- `backend/routes/attendance.js` - Attendance

### Frontend Entry
- `frontend/src/main.jsx` - React entry
- `frontend/src/App.jsx` - App routing
- `frontend/src/pages/LoginPage.jsx` - Login
- `frontend/src/pages/DashboardPage.jsx` - Dashboard

---

## 🔗 API Endpoints

### Auth
```
POST /api/auth/login
GET /api/auth/me
POST /api/auth/change-password
POST /api/auth/refresh
```

### Students
```
POST /api/students
GET /api/students
GET /api/students/:id
PUT /api/students/:id
POST /api/students/:id/approve
```

### Academics
```
POST /api/academics/exams
POST /api/academics/subjects
POST /api/academics/marks
GET /api/academics/results/:studentId
POST /api/academics/marks/:id/approve
POST /api/academics/exams/:id/lock
```

### Finance
```
POST /api/finance/fee-structures
POST /api/finance/payments
POST /api/finance/payments/:id/verify
GET /api/finance/accounts/:studentId
GET /api/finance/arrears
```

### Attendance
```
POST /api/attendance
GET /api/attendance/report/:studentId
POST /api/attendance/bulk
```

---

## 👥 User Roles

| Role | Type | Permissions |
|------|------|-------------|
| super_admin | Admin | Full access |
| school_admin | Admin | School config |
| principal | Management | Approvals |
| deputy_principal_academics | Management | Marks & exams |
| deputy_principal_administration | Management | Attendance |
| teacher_tsc | Staff | Enter marks |
| teacher_bom | Staff | Enter marks |
| bursar | Finance | Payments |
| student | User | View data |

---

## 📊 Database Models

```
User → School
     → Student
     → AuditLog

Student → Exam (via Mark)
       → Subject (via Mark)
       → Payment
       → Attendance
       → StudentAccount
```

---

## 🔐 Auth Flow

```
1. User logs in (POST /auth/login)
2. Backend validates credentials
3. JWT token generated
4. Token stored in localStorage
5. Token sent with each request
6. Token verified by middleware
7. Access granted/denied
```

---

## 📝 Environment Variables

### Backend (.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=elimucore
DB_USER=postgres
DB_PASSWORD=password
NODE_ENV=development
PORT=5000
JWT_SECRET=your_secret_key
JWT_EXPIRY=7d
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:5000/api
```

---

## 🧪 Testing Workflows

### Register Student
```bash
POST /api/students
{
  "admissionNumber": "ADM001",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "2008-01-15",
  "gender": "MALE",
  "parentName": "Jane",
  "parentEmail": "jane@example.com",
  "parentPhone": "+254712345678",
  "classLevel": "FORM1"
}
```

### Enter Marks
```bash
POST /api/academics/marks
{
  "marksObtained": 85,
  "studentId": "uuid",
  "examId": "uuid",
  "subjectId": "uuid"
}
```

### Record Payment
```bash
POST /api/finance/payments
{
  "studentId": "uuid",
  "amount": 50000,
  "paymentMethod": "MPESA",
  "receiptNumber": "RCP001"
}
```

---

## 📋 Common Tasks

### Create Exam
```javascript
POST /api/academics/exams
{
  "name": "Term 1 Exams",
  "term": "TERM1",
  "year": 2024,
  "classLevel": "FORM1",
  "startDate": "2024-03-01",
  "endDate": "2024-03-15"
}
```

### Set Fee Structure
```javascript
POST /api/finance/fee-structures
{
  "classLevel": "FORM1",
  "year": 2024,
  "tuitionFee": 50000,
  "boardingFee": 30000,
  "termCount": 3
}
```

### Record Attendance
```javascript
POST /api/attendance
{
  "studentId": "uuid",
  "date": "2024-01-15",
  "status": "PRESENT"
}
```

---

## 🐛 Troubleshooting

### Port 5000 in use
```bash
lsof -ti:5000 | xargs kill -9
```

### Database connection error
```bash
# Check PostgreSQL is running
# Verify DB credentials in .env
# Ensure database exists
createdb elimucore
```

### Module not found
```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### CORS error
```bash
# Check FRONTEND_URL in backend .env
# Should match your frontend URL
FRONTEND_URL=http://localhost:5173
```

---

## 📖 Documentation

- **Setup Guide**: `docs/SETUP_GUIDE.md`
- **API Docs**: `docs/API_DOCUMENTATION.md`
- **Database**: `docs/DATABASE_SCHEMA.md`
- **Architecture**: `docs/ARCHITECTURE.md`

---

## 🚀 Production Deployment

### Backend
```bash
# Build (no build needed)
npm install --production
npm start
# or use PM2
pm2 start server.js
```

### Frontend
```bash
npm run build
# Deploy dist/ folder to CDN/server
```

### Environment
```
Set production environment variables
Use managed database (AWS RDS, etc)
Enable HTTPS
Set proper CORS origins
```

---

## 💡 Tips & Tricks

### Use cURL to test API
```bash
TOKEN="your_jwt_token"
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Check logs
```bash
# Backend logs in console
npm run dev

# Frontend errors in browser console
# DevTools → Console tab
```

### Reset database
```bash
dropdb elimucore
createdb elimucore
npm run dev  # Tables auto-created
```

---

## 📞 Need Help?

1. Check **SETUP_GUIDE.md** for setup issues
2. Check **API_DOCUMENTATION.md** for endpoint help
3. Check **ARCHITECTURE.md** for design questions
4. Review **IMPLEMENTATION_SUMMARY.md** for overview

---

## ✅ Verification Checklist

- [ ] Node.js v18+ installed
- [ ] PostgreSQL running
- [ ] Database created
- [ ] Backend dependencies installed
- [ ] Backend server running (localhost:5000)
- [ ] Frontend dependencies installed
- [ ] Frontend dev server running (localhost:5173)
- [ ] Can login with demo credentials
- [ ] Dashboard loads successfully

---

## 🎯 Next Steps

1. **Explore the system** - Login and navigate
2. **Test API endpoints** - Use provided examples
3. **Review code** - Understand structure
4. **Customize** - Add your own features
5. **Deploy** - Follow deployment guide

---

**Version**: 1.0.0
**Last Updated**: January 2026
**Status**: Production Ready
