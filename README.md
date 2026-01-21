# ELIMUCORE - Kenyan High School Management Information System

> A comprehensive, role-based, integrated digital system designed to manage academics, finance, staff, payroll, administration, and analytics for Kenyan secondary schools.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/emanuelkirui263/elimucore)
[![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18-blue.svg)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-12+-blue.svg)](https://www.postgresql.org/)

---

## 📚 System Overview

ELIMUCORE is a comprehensive solution aligned with:
- ✅ **TSC** (Teachers Service Commission) requirements
- ✅ **BOM** (Board of Management) standards
- ✅ **MoE** (Ministry of Education) framework
- ✅ **KCSE** (Kenya Certificate of Secondary Education) standards

---

## 🎯 Core Features

### Implemented (Phase 1 - MVP) ✅
- ✅ **Authentication & RBAC** - Multi-role access control (9 roles)
- ✅ **Student Management** - Registration, enrollment, approval workflow
- ✅ **Academic Module** - Exams, marks entry, automatic ranking
- ✅ **Finance Module** - Fee structures, payment tracking, arrears management
- ✅ **Attendance** - Student & staff attendance tracking
- ✅ **Audit Logging** - Complete system activity tracking

### Planned (Phase 2-3)
- 🔄 **Payroll** - TSC & BOM salary management
- 🔄 **Communication** - SMS, in-app notifications, circulars
- 🔄 **Advanced Analytics** - Dashboards, trends, reports
- 🔄 **Mobile App** - Flutter mobile application
- 🔄 **National Integration** - TSC & KCSE API integration

---

## 👥 User Roles

| Role | Permissions | Access |
|------|-----------|--------|
| Super Admin | Full system control | Web Portal |
| School Admin | User setup, configuration | Web Portal |
| Principal | Approvals, locking, visibility | Web Portal |
| Deputy Principal (Academics) | Exams, marks, curriculum | Web Portal |
| Deputy Principal (Administration) | Discipline, attendance, operations | Web Portal |
| Teachers (TSC & BOM) | Marks entry, attendance | Web Portal |
| Bursar | Finance, payroll | Web Portal |
| Parents | Results, fees, attendance (Read-only) | Web Portal |
| Students | Results, timetable, announcements | Web Portal |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL 12+
- Git

### Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your database credentials

# 4. Create database
createdb elimucore

# 5. Start development server
npm run dev
```

Server runs on `http://localhost:5000`

### Frontend Setup

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev
```

UI runs on `http://localhost:5173`

---

## 📊 Demo Credentials

```
Email: admin@elimucore.com
Password: password
```

---

## 📋 API Endpoints Summary

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Students
- `POST /api/students` - Register student
- `GET /api/students` - List students
- `GET /api/students/:id` - Get student
- `PUT /api/students/:id` - Update student
- `POST /api/students/:id/approve` - Approve student

### Academics
- `POST /api/academics/exams` - Create exam
- `POST /api/academics/marks` - Enter marks
- `GET /api/academics/results/:studentId` - Get results
- `GET /api/academics/rankings/class/:examId/:classLevel` - Get rankings
- `POST /api/academics/marks/:id/approve` - Approve marks
- `POST /api/academics/exams/:id/lock` - Lock exam

### Finance
- `POST /api/finance/fee-structures` - Create fee structure
- `POST /api/finance/payments` - Record payment
- `POST /api/finance/payments/:id/verify` - Verify payment
- `GET /api/finance/accounts/:studentId` - Get student account
- `GET /api/finance/arrears` - Outstanding fees

### Attendance
- `POST /api/attendance` - Record attendance
- `GET /api/attendance/report/:studentId` - Get attendance report
- `POST /api/attendance/bulk` - Bulk attendance upload

---

## 🏗️ Project Structure

```
elimucore/
├── backend/
│   ├── config/              # Configuration files
│   │   ├── database.js      # Sequelize setup
│   │   └── roles.js         # RBAC configuration
│   ├── middleware/          # Express middleware
│   │   ├── auth.js          # Authentication & authorization
│   │   ├── errorHandler.js  # Global error handling
│   │   └── requestLogger.js # Request logging
│   ├── models/              # Sequelize ORM models
│   │   ├── User.js
│   │   ├── Student.js
│   │   ├── Exam.js
│   │   ├── Mark.js
│   │   ├── Subject.js
│   │   ├── FeeStructure.js
│   │   ├── StudentAccount.js
│   │   ├── Payment.js
│   │   ├── Attendance.js
│   │   ├── AuditLog.js
│   │   └── School.js
│   ├── routes/              # API endpoints
│   │   ├── auth.js
│   │   ├── students.js
│   │   ├── academics.js
│   │   ├── finance.js
│   │   ├── attendance.js
│   │   ├── payroll.js       # Stub
│   │   ├── communication.js # Stub
│   │   ├── dashboard.js     # Stub
│   │   └── admin.js         # Stub
│   ├── package.json
│   ├── server.js
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js    # Axios configuration
│   │   │   └── endpoints.js # API service layer
│   │   ├── store/
│   │   │   └── authStore.js # Zustand auth store
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   └── DashboardPage.jsx
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── Navbar.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.local
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

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **ORM**: Sequelize 6.x
- **Database**: PostgreSQL 12+
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: Joi
- **Security**: Helmet, CORS

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 5
- **State Management**: Zustand
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS 3
- **Icons**: React Icons

### Database
- **Primary**: PostgreSQL 12+
- **Migrations**: Sequelize CLI (optional)

---

## 📊 Database Models

### Core Entities
- **User** - System users (teachers, admins, parents, students)
- **School** - School information
- **Student** - Student records with enrollment tracking
- **Exam** - Exam definitions and status
- **Mark** - Student marks with grading
- **Subject** - Subjects offered
- **FeeStructure** - Fee definitions per class
- **StudentAccount** - Student fee accounts
- **Payment** - Payment records
- **Attendance** - Attendance records
- **AuditLog** - All system changes

---

## 🔐 Security Features

- ✅ JWT-based authentication with expiration
- ✅ Role-Based Access Control (RBAC)
- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ Audit logging for all actions
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ SQL injection prevention (Sequelize ORM)
- ✅ Request validation (Joi)
- ⏳ Encrypted sensitive fields (Phase 2)

---

## 📈 Grade Calculation Formula

Marks are automatically converted to grades:

| Grade | Range |
|-------|-------|
| A+ | 80-100% |
| A | 75-79% |
| B+ | 70-74% |
| B | 65-69% |
| C+ | 60-64% |
| C | 55-59% |
| D+ | 50-54% |
| D | 40-49% |
| E | Below 40% |

---

## 📋 Development Phases

### Phase 1 - MVP (Current) ✅
- Core users & roles
- Student & academic modules
- Marks calculator & ranking
- Finance (fees only)
- Attendance tracking

### Phase 2 - Expansion 🔄
- Payroll module
- Parent & student portals
- Communication system
- Advanced reports

### Phase 3 - Optimization 🎯
- Mobile offline mode
- Advanced analytics & dashboards
- National TSC/KCSE integration
- Biometric integration

---

## 🧪 Testing

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

## 📖 Documentation

- [API Documentation](docs/API_DOCUMENTATION.md) - Complete API reference
- [Database Schema](docs/DATABASE_SCHEMA.md) - Database design
- [Setup Guide](docs/SETUP_GUIDE.md) - Detailed setup instructions
- [Architecture](docs/ARCHITECTURE.md) - System architecture & design patterns

---

## 🚢 Deployment

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

**Backend:**
```
No build step required. Deploy backend/ directory with Node.js runtime.
```

### Deployment Options

- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Backend**: Heroku, Railway, Render, AWS EC2, DigitalOcean
- **Database**: AWS RDS, Azure Database, Heroku PostgreSQL

---

## 📞 Support

For issues or questions:

- **GitHub Issues**: Create an issue in this repository
- **Email**: support@elimucore.com

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 👨‍💻 Author

**KIRUINEXUS** - Full-Stack Developer

---

## 📝 Acknowledgments

- Kenyan Ministry of Education
- Teachers Service Commission (TSC)
- Board of Management (BOM)
- All educators and administrators

---

## 🙏 Made with ❤️ for Kenyan Education

This system is built to improve educational management and make quality education more accessible across Kenyan secondary schools.

---

**Last Updated**: January 2026
**Version**: 1.0.0 (MVP)
**Status**: Active Development
