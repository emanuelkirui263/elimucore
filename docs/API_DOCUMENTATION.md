# ELIMUCORE - Kenyan High School Management Information System
## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All endpoints (except login) require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Login
**POST** `/auth/login`

Request Body:
```json
{
  "email": "admin@elimucore.com",
  "password": "password"
}
```

Response:
```json
{
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "admin@elimucore.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "super_admin"
  }
}
```

### Get Current User
**GET** `/auth/me`

Response:
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@elimucore.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "super_admin",
    "status": "ACTIVE"
  }
}
```

### Change Password
**POST** `/auth/change-password`

Request Body:
```json
{
  "oldPassword": "password",
  "newPassword": "newPassword",
  "confirmPassword": "newPassword"
}
```

### Refresh Token
**POST** `/auth/refresh`

Response:
```json
{
  "token": "eyJhbGc..."
}
```

---

## Student Management Endpoints

### Create Student
**POST** `/students`

Permissions: `create:student`

Request Body:
```json
{
  "admissionNumber": "ADM001",
  "firstName": "John",
  "lastName": "Doe",
  "middleName": "Joseph",
  "dateOfBirth": "2008-01-15",
  "gender": "MALE",
  "parentName": "Jane Doe",
  "parentEmail": "jane@example.com",
  "parentPhone": "+254712345678",
  "classLevel": "FORM1",
  "stream": "A"
}
```

### List Students
**GET** `/students?classLevel=FORM1&status=ACTIVE&page=1&limit=10`

Permissions: `view:student`

### Get Student
**GET** `/students/:id`

Permissions: `view:student`

### Update Student
**PUT** `/students/:id`

Permissions: `edit:student`

### Approve Student
**POST** `/students/:id/approve`

Permissions: `approve:student`

---

## Academic Endpoints

### Create Exam
**POST** `/academics/exams`

Permissions: `create:exam`

Request Body:
```json
{
  "name": "Term 1 Exams",
  "term": "TERM1",
  "year": 2024,
  "classLevel": "FORM1",
  "startDate": "2024-03-01",
  "endDate": "2024-03-15"
}
```

### Create Subject
**POST** `/academics/subjects`

Permissions: `create:exam`

Request Body:
```json
{
  "name": "Mathematics",
  "code": "MATH001",
  "description": "Core Mathematics",
  "maxMarks": 100,
  "isCompulsory": true
}
```

### Enter Marks
**POST** `/academics/marks`

Permissions: `enter:marks`

Request Body:
```json
{
  "marksObtained": 85,
  "studentId": "uuid",
  "examId": "uuid",
  "subjectId": "uuid",
  "remarks": "Good performance"
}
```

### Get Results
**GET** `/academics/results/:studentId`

Permissions: `view:results`

### Get Class Rankings
**GET** `/academics/rankings/class/:examId/:classLevel`

Permissions: `view:results`

### Approve Marks
**POST** `/academics/marks/:id/approve`

Permissions: `approve:marks`

### Lock Exam
**POST** `/academics/exams/:id/lock`

Permissions: `lock:exam`

---

## Finance Endpoints

### Create Fee Structure
**POST** `/finance/fee-structures`

Permissions: `create:fee_structure`

Request Body:
```json
{
  "classLevel": "FORM1",
  "year": 2024,
  "tuitionFee": 50000,
  "boardingFee": 30000,
  "activityFee": 5000,
  "otherFee": 5000,
  "termCount": 3
}
```

### Get Student Account
**GET** `/finance/accounts/:studentId`

Permissions: `view:finance`

### Record Payment
**POST** `/finance/payments`

Permissions: `record:payment`

Request Body:
```json
{
  "studentId": "uuid",
  "amount": 50000,
  "paymentMethod": "MPESA",
  "transactionId": "SAG123456",
  "receiptNumber": "RCP001",
  "remarks": "Partial payment"
}
```

### Verify Payment
**POST** `/finance/payments/:id/verify`

Permissions: `verify:payment`

### Payment Report
**GET** `/finance/reports/payments?startDate=2024-01-01&endDate=2024-12-31`

Permissions: `view:finance`

### Get Arrears
**GET** `/finance/arrears`

Permissions: `view:finance`

---

## Attendance Endpoints

### Record Attendance
**POST** `/attendance`

Permissions: `record:attendance`

Request Body:
```json
{
  "studentId": "uuid",
  "date": "2024-01-15",
  "status": "PRESENT",
  "remarks": "Optional note"
}
```

### Bulk Attendance Upload
**POST** `/attendance/bulk`

Permissions: `record:attendance`

Request Body:
```json
{
  "records": [
    {
      "studentId": "uuid1",
      "date": "2024-01-15",
      "status": "PRESENT"
    },
    {
      "studentId": "uuid2",
      "date": "2024-01-15",
      "status": "ABSENT"
    }
  ]
}
```

### Get Attendance Report
**GET** `/attendance/report/:studentId?startDate=2024-01-01&endDate=2024-12-31`

Permissions: `view:attendance`

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Validation error",
  "details": [
    {
      "field": "email",
      "message": "email must be a valid email"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "An unexpected error occurred"
}
```

---

## Grade Calculation
Marks are automatically converted to grades and percentages:

- **A+**: 80-100%
- **A**: 75-79%
- **B+**: 70-74%
- **B**: 65-69%
- **C+**: 60-64%
- **C**: 55-59%
- **D+**: 50-54%
- **D**: 40-49%
- **E**: Below 40%

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Example API Flow

### 1. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@elimucore.com","password":"password"}'
```

### 2. Create Student (with token)
```bash
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "admissionNumber": "ADM001",
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "2008-01-15",
    "gender": "MALE",
    "parentName": "Jane Doe",
    "parentEmail": "jane@example.com",
    "parentPhone": "+254712345678",
    "classLevel": "FORM1"
  }'
```

---

Last Updated: January 2026
Version: 1.0.0 (MVP)
