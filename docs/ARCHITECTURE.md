# ELIMUCORE Architecture

## System Overview

ELIMUCORE is a role-based, integrated digital system for managing Kenyan secondary schools. It follows a modern three-tier architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│         React.js Frontend (Vite + Tailwind CSS)             │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│   │  Login   │  │Dashboard │  │Academics │  │ Finance  │  │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                          │
│        Express.js Backend (Node.js + Sequelize)            │
│   ┌──────────────────────────────────────────────────────┐  │
│   │                  API Routes                          │  │
│   │  Auth | Students | Academics | Finance | Attendance │  │
│   └──────────────────────────────────────────────────────┘  │
│   ┌──────────────────────────────────────────────────────┐  │
│   │              Business Logic Layer                    │  │
│   │  • Authentication & Authorization                    │  │
│   │  • Marks Calculation & Grading                       │  │
│   │  • Finance Management                               │  │
│   │  • Attendance Processing                            │  │
│   └──────────────────────────────────────────────────────┘  │
│   ┌──────────────────────────────────────────────────────┐  │
│   │              Middleware Layer                        │  │
│   │  • JWT Authentication                                │  │
│   │  • Role-Based Access Control (RBAC)                 │  │
│   │  • Error Handling                                    │  │
│   │  • Request Logging                                   │  │
│   └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↓ SQL
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                               │
│              PostgreSQL Database                            │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│   │ Students │  │  Exams   │  │ Payments │  │Attendance│  │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **ORM**: Sequelize 6.x
- **Database**: PostgreSQL 12+
- **Authentication**: JWT (jsonwebtoken)
- **Password**: bcryptjs
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
- **Primary**: PostgreSQL
- **Caching**: Redis (future)
- **Search**: Elasticsearch (future)

---

## Core Architecture Patterns

### 1. Model-View-Controller (MVC)

```
Models (Sequelize)
    ↓
Routes (Express endpoints)
    ↓
Business Logic
    ↓
Response
```

### 2. Role-Based Access Control (RBAC)

```
User (Role) → Permissions → API Endpoint Access
    ↓
admin_role → all permissions → all endpoints
student_role → limited permissions → student endpoints
```

### 3. RESTful API Design

```
Method | Endpoint           | Action
-------|-------------------|----------------------------
POST   | /api/students     | Create student
GET    | /api/students     | List students
GET    | /api/students/:id | Get specific student
PUT    | /api/students/:id | Update student
POST   | /api/students/:id/approve | Approve student
```

---

## Data Flow

### Authentication Flow

```
1. User enters credentials
   ↓
2. Frontend: LoginPage → useAuthStore.login()
   ↓
3. Frontend: axios POST /api/auth/login
   ↓
4. Backend: Route handler validates credentials
   ↓
5. Backend: Password comparison (bcrypt)
   ↓
6. Backend: Generate JWT token
   ↓
7. Frontend: Store token & user in localStorage
   ↓
8. Subsequent requests include token in Authorization header
   ↓
9. Backend middleware: Verify JWT token
   ↓
10. Request continues if token valid
```

### Student Registration Flow

```
1. Admin/Staff fills student form
   ↓
2. POST /api/students
   ↓
3. Backend validates data (Joi)
   ↓
4. Backend checks duplicate admission number
   ↓
5. Backend creates Student record (status: PENDING)
   ↓
6. Backend creates StudentAccount record
   ↓
7. Frontend receives success response
   ↓
8. Principal approves student
   ↓
9. POST /api/students/:id/approve
   ↓
10. Backend updates status to APPROVED
    ↓
11. Student can now be assigned marks, attendance, etc
```

### Marks & Grading Flow

```
1. Teacher enters marks for exam and subject
   ↓
2. POST /api/academics/marks
   ↓
3. Backend validates marks (not exceeding max)
   ↓
4. Backend calculates:
   - Percentage = (marks/maxMarks) * 100
   - Grade = Grade.calculateGrade(percentage)
   ↓
5. Mark record created with status: SUBMITTED
   ↓
6. Deputy Principal reviews and approves
   ↓
7. POST /api/academics/marks/:id/approve
   ↓
8. Mark status changed to APPROVED
   ↓
9. Student can view results
```

---

## Security Architecture

### Authentication

```
plaintext password
        ↓
bcrypt.hash() → stored as hash
        ↓
login attempt → bcrypt.compare() → match/no match
```

### Authorization

```
Request with JWT token
        ↓
middleware: verify JWT signature
        ↓
Extract user role and permissions
        ↓
Check if user has required permission
        ↓
Allow/Deny endpoint access
```

### Data Protection

```
- Password: bcrypt (10 salt rounds)
- Tokens: JWT with expiration
- SQL Injection: Sequelize ORM parameterization
- CORS: Whitelist specific origins
- Helmet: HTTP security headers
- Sensitive fields: Encrypted in DB (future phase)
```

---

## Database Architecture

### Relationships

```
User
  ├── (1) → Many Students
  ├── (1) → Many Exams
  ├── (1) → Many Payments
  └── (1) → Many AuditLogs

Student
  ├── (Many) → (1) School
  ├── (1) → (1) StudentAccount
  ├── (1) → Many Marks
  ├── (1) → Many Payments
  └── (1) → Many Attendance

Exam
  └── (1) → Many Marks

Subject
  └── (1) → Many Marks

FeeStructure
  └── (1) → Many StudentAccounts (implicit)
```

### Indexes for Performance

```
- students(status, classLevel)
- marks(studentId, examId, status)
- attendance(studentId, date) UNIQUE
- payments(studentId, status)
- users(email, role)
- audit_logs(userId, createdAt)
```

---

## API Architecture

### Request Lifecycle

```
Request
   ↓
CORS middleware
   ↓
Helmet security headers
   ↓
Request logger (morgan)
   ↓
Body parser
   ↓
Route matching
   ↓
Authentication middleware (if protected)
   ↓
Authorization middleware (if required)
   ↓
Route handler/controller
   ↓
Business logic
   ↓
Database query (Sequelize)
   ↓
Response formatting
   ↓
Response sent to client
   ↓
Error handler (if error occurred)
```

### Response Format

```json
{
  "success": true/false,
  "message": "...",
  "data": {...},
  "error": "..." (if error)
}
```

---

## Frontend Architecture

### State Management (Zustand)

```
useAuthStore
  ├── user: User object
  ├── token: JWT token
  ├── isLoading: Loading state
  ├── error: Error message
  ├── login(): Login user
  ├── logout(): Logout user
  └── changePassword(): Change password
```

### Component Structure

```
App
├── BrowserRouter
│   ├── LoginPage
│   │   └── useAuthStore
│   └── ProtectedRoute
│       ├── DashboardPage
│       │   ├── Navbar
│       │   ├── QuickStats
│       │   └── ModuleCards
│       └── Other protected pages
```

### API Client

```
axios client
  ├── Base URL: API_URL env
  ├── Request Interceptor
  │   └── Add JWT token to headers
  └── Response Interceptor
      └── Handle 401 errors (redirect to login)
```

---

## Role-Based Access Control (RBAC)

### Roles & Permissions Matrix

| Role | Create Student | Enter Marks | Approve Marks | View Finance | Record Payment |
|------|---|---|---|---|---|
| Super Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| School Admin | ✅ | ❌ | ❌ | ✅ | ❌ |
| Principal | ❌ | ❌ | ✅ | ✅ | ❌ |
| Teacher | ❌ | ✅ | ❌ | ❌ | ❌ |
| Bursar | ❌ | ❌ | ❌ | ✅ | ✅ |
| Student | ❌ | ❌ | ❌ | ✅ | ❌ |

### Implementation

```javascript
// config/roles.js
PERMISSIONS = {
  CREATE_STUDENT: 'create:student',
  ENTER_MARKS: 'enter:marks',
  // ...
}

ROLE_PERMISSIONS = {
  super_admin: [all permissions],
  school_admin: [limited permissions],
  // ...
}
```

```javascript
// middleware/auth.js
authorize(...requiredPermissions)
  → Check if user.role has all required permissions
  → Allow/Deny access
```

---

## Deployment Architecture

### Development

```
Frontend (Vite dev server)
  localhost:5173
  ↓ (proxy)
Backend (Express + Nodemon)
  localhost:5000
  ↓ (SQL)
PostgreSQL (local)
  localhost:5432
```

### Production

```
┌─────────────────────────────────────────┐
│          CDN / Load Balancer            │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│      Frontend (Static Assets)           │
│  (Vercel/Netlify/S3 + CloudFront)      │
└──────────────────┬──────────────────────┘
                   ↓ (API calls)
┌─────────────────────────────────────────┐
│      Backend (Node.js Container)        │
│  (Docker on Kubernetes/AWS/Railway)     │
└──────────────────┬──────────────────────┘
                   ↓ (SQL)
┌─────────────────────────────────────────┐
│    PostgreSQL Database (RDS/Cloud SQL)  │
└─────────────────────────────────────────┘
```

---

## Scalability Considerations

### Horizontal Scaling

```
Multiple backend instances behind load balancer
  ├── Instance 1 (API server)
  ├── Instance 2 (API server)
  └── Instance 3 (API server)
         ↓ (read/write)
    Shared PostgreSQL database
```

### Caching Layer

```
API Request
  ↓
Redis Cache (future)
  ├── User sessions
  ├── Frequently accessed data
  └── Query results
```

### Database Optimization

```
- Connection pooling (already in Sequelize)
- Query optimization (select specific fields)
- Indexes on frequently queried columns
- Read replicas for reporting (future)
```

---

## Error Handling Strategy

### Levels

```
1. Validation Error (400)
   → Invalid input data

2. Authentication Error (401)
   → Missing/invalid JWT token

3. Authorization Error (403)
   → Insufficient permissions

4. Not Found Error (404)
   → Resource doesn't exist

5. Server Error (500)
   → Unexpected error in backend
```

### Implementation

```
Try/Catch blocks
  ↓
Error classification
  ↓
Appropriate HTTP status code
  ↓
Error message to client
  ↓
Logging to audit trail
```

---

## Audit & Compliance

### Audit Logging

```
User Action
  ↓
Log entry created (entityType, entityId, changes)
  ↓
Store in audit_logs table
  ↓
Include: userId, timestamp, IP, action, changes
```

### Compliance

- Kenya Data Protection Act (2019)
- TSC Teacher Management Standards
- MoE Curriculum Framework
- BOM Financial Reporting Standards

---

Last Updated: January 2026
Version: 1.0.0 (MVP)
