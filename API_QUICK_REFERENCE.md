# 📘 New API Quick Reference - Phase 1 Extension

**47 New Endpoints Across 6 Modules**

---

## 🗓️ Calendar API (`/api/calendar`)

### Academic Year Management
```bash
POST   /api/calendar
{
  "year": 2025,
  "startDate": "2025-01-13",
  "endDate": "2025-11-28",
  "description": "Main academic year"
}
→ Returns: { id, year, isActive, isClosed, ... }

GET    /api/calendar
→ Returns: [ { year, startDate, endDate, isActive, ... } ]

GET    /api/calendar/:id
→ Returns: { ...year, terms: [ ...] }

PUT    /api/calendar/:id
{ "startDate": "...", "endDate": "...", "description": "..." }

POST   /api/calendar/:id/activate
→ Activates year, deactivates others

POST   /api/calendar/:id/lock
→ Locks year, prevents future changes
```

### Term Management
```bash
POST   /api/calendar/term
{
  "academicYearId": "uuid",
  "termNumber": 1,
  "name": "Term 1",
  "startDate": "2025-01-13",
  "endDate": "2025-04-15",
  "examStartDate": "2025-04-07",
  "examEndDate": "2025-04-15"
}

GET    /api/calendar/year/:academicYearId
→ Returns all terms for year

PUT    /api/calendar/term/:id
{ "name", "startDate", "endDate", "examStartDate", "examEndDate", "status" }

POST   /api/calendar/term/:id/activate
→ Activates term, deactivates others in year
```

---

## 💼 Discipline API (`/api/discipline`)

### Report Incident
```bash
POST   /api/discipline
{
  "studentId": "uuid",
  "incidentDate": "2025-03-10",
  "incidentType": "TRUANCY",  // or ASSAULT, BULLYING, THEFT, etc.
  "description": "Student absent without permission",
  "witnesses": ["John Doe", "Jane Smith"]
}
→ Returns: case with status "UNDER_INVESTIGATION"

Incident Types:
- ACADEMIC_DISHONESTY
- INSUBORDINATION
- TRUANCY
- ASSAULT
- BULLYING
- THEFT
- DRUG_RELATED
- MORAL_TURPITUDE
- PROPERTY_DAMAGE
- OTHER
```

### Case Management
```bash
GET    /api/discipline
Query params: ?studentId=uuid&status=RESOLVED&incidentType=ASSAULT
→ Returns: [ { studentId, incidentType, status, action, ... } ]

GET    /api/discipline/:id
→ Returns full case with related student/user info

PUT    /api/discipline/:id
{
  "action": "SUSPENSION",  // or WARNING, DETENTION, EXPULSION, etc.
  "actionDetails": "5 days suspension",
  "suspensionStartDate": "2025-03-15",
  "suspensionEndDate": "2025-03-20",
  "status": "RESOLVED",
  "remarks": "Student to return with parent letter"
}
```

### Parent Communication
```bash
POST   /api/discipline/:id/notify-parent
→ Sends parent notification (SMS/Email)
→ Sets parentNotified=true, parentNotificationDate=now()

POST   /api/discipline/:id/acknowledge
→ Records parent acknowledgment (via SMS reply/app)
→ Sets parentAcknowledged=true

GET    /api/discipline/stats/student/:studentId
→ Returns: { total: 3, byIncidentType: { TRUANCY: 2, ASSAULT: 1 } }
```

---

## 👥 Transfers API (`/api/transfers`)

### Initiate Transfer Out
```bash
POST   /api/transfers/out
{
  "studentId": "uuid",
  "toSchoolId": "uuid",
  "transferDate": "2025-03-15",
  "reason": "Parent relocation to Nairobi"
}
→ Returns: transfer with status "PENDING"
```

### Receive Transfer In
```bash
POST   /api/transfers/in
{
  "studentId": "uuid",
  "fromSchoolId": "uuid",
  "transferDate": "2025-03-15",
  "reason": "Admission from previous school"
}
→ Returns: transfer with status "PENDING"
```

### Manage Transfers
```bash
GET    /api/transfers
Query params: ?studentId=uuid&transferType=OUT&status=PENDING
→ Returns: [ { studentId, transferType, status, fromSchool, toSchool, ... } ]

GET    /api/transfers/:id
→ Returns full transfer with school details

POST   /api/transfers/:id/approve
→ Sets status="APPROVED", approvedBy=userId, approvalDate=now()
→ Sets student.isTransferred=true

POST   /api/transfers/:id/reject
{ "remarks": "Documentation incomplete" }
→ Sets status="REJECTED"
```

### Alumni Management
```bash
POST   /api/transfers/dropout/:studentId
{ "reason": "Financial constraints" }
→ Sets: isDropout=true, dropoutReason, status="INACTIVE"

POST   /api/transfers/graduate/:studentId
{ "graduationYear": 2025 }
→ Sets: isAlumni=true, graduationYear, status="GRADUATED"

GET    /api/transfers/alumni
→ Returns: [ { ...student, graduationYear, isAlumni: true } ]
```

---

## 📚 Library API (`/api/library`)

### Book Management
```bash
POST   /api/library/books
{
  "isbn": "9784056118529",
  "title": "Physics Form 4",
  "author": "John Smith",
  "publisher": "Educational Press",
  "category": "Physics",
  "acquisitionDate": "2024-01-15",
  "totalCopies": 5,
  "location": "Section A, Shelf 3"
}

GET    /api/library/books
Query params: ?category=Physics&status=AVAILABLE&search=Physics
→ Returns: [ { isbn, title, author, availableCopies, status, ... } ]

GET    /api/library/books/:id
→ Returns full book details

PUT    /api/library/books/:id
{
  "totalCopies": 5,
  "availableCopies": 3,
  "location": "Section B",
  "status": "AVAILABLE"
}
```

### Book Issue Management
```bash
POST   /api/library/issues
{
  "bookId": "uuid",
  "studentId": "uuid",
  "dueDate": "2025-04-15"
}
→ Returns: issue with status "ISSUED"
→ Decrements book.availableCopies

GET    /api/library/issues
Query params: ?studentId=uuid&status=ISSUED
→ Returns: [ { bookId, studentId, issuedDate, dueDate, fineAmount, ... } ]

POST   /api/library/issues/:id/return
{
  "condition": "FAIR",  // or GOOD, POOR, DAMAGED
  "damageDescription": "Torn pages",
  "replacementCost": 500
}
→ Calculates fine: (daysOverdue × 10) KES
→ Updates book.availableCopies
```

### Library Stats & Alerts
```bash
GET    /api/library/student/:studentId/books
→ Returns: [ { bookId, dueDate, ... } ]
→ Shows only ISSUED books for student

GET    /api/library/overdue
→ Returns: overdueBooks where dueDate < today()
→ Shows overdueCount and fine amounts

GET    /api/library/stats
→ Returns: {
    totalBooks: 150,
    totalIssued: 45,
    overdueCount: 8,
    availableBooks: 105,
    categories: [ { category: "Physics", count: 30 }, ... ]
  }
```

---

## 📊 Reports API (`/api/reports`)

### Generate Report Card
```bash
GET    /api/reports/report-card/:studentId/:examId
→ Returns: PDF file download
→ Includes: student info, marks table, grades, average, remarks

Query params: ?includeSignature=true
→ Generates with principal signature space
```

### Generate Fee Statement
```bash
GET    /api/reports/fee-statement/:studentId
→ Returns: PDF file download
→ Includes: account summary, payment status, balance, due date

Content:
- Student name & admission number
- Total due
- Amount paid
- Current balance
- Payment instructions
```

### Batch Generation
```bash
POST   /api/reports/batch/report-cards
{
  "classStreamId": "uuid",
  "examId": "uuid"
}
→ Generates report cards for entire class
→ Returns: { message, count: 45, reports: ["report_card_1.pdf", ...] }
```

### Report Management
```bash
GET    /api/reports
→ Returns: [ { name, path, created, size, ... } ]
→ Lists all generated reports

GET    /api/reports/download/:filename
→ Downloads existing report PDF

// Auto-cleanup: Reports older than 90 days (configurable)
```

---

## 📅 Timetable API (Integrated in `/api/academics`)

### Create Timetable Entry
```bash
POST   /api/academics/timetable
{
  "classStreamId": "uuid",
  "termId": "uuid",
  "dayOfWeek": "MONDAY",  // MONDAY-SUNDAY
  "period": 1,
  "periodName": "08:00-08:45",
  "subjectId": "uuid",
  "teacherId": "uuid",
  "roomNumber": "101"
}

Days: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
```

### View Schedules
```bash
GET    /api/academics/timetable/class/:classStreamId/term/:termId
→ Returns week grid with all periods

GET    /api/academics/timetable/teacher/:teacherId/term/:termId
→ Returns teacher's complete schedule

GET    /api/academics/timetable/class/:classStreamId/day/:dayOfWeek
→ Returns single day's timetable
```

### Manage Entries
```bash
PUT    /api/academics/timetable/:id
{ "status": "CANCELLED", "roomNumber": "102" }

POST   /api/academics/timetable/:id/cancel
→ Sets status="CANCELLED"

POST   /api/academics/timetable/clash-check
{
  "classStreamId": "uuid",
  "teacherId": "uuid",
  "roomNumber": "101",
  "dayOfWeek": "MONDAY",
  "period": 1
}
→ Returns: [ clashes ] or empty if none
```

---

## 🔑 Authentication & Authorization

### All New Endpoints Require

1. **JWT Token** in header: `Authorization: Bearer {token}`
2. **Role Check** - Server verifies user role
3. **Permission Check** - Server verifies user has required permission

### Example Protected Request
```bash
curl -H "Authorization: Bearer eyJhbGc..." \
     -X GET http://localhost:5000/api/library/stats
```

### Error Responses
```json
{
  "error": "Unauthorized"  // 401: No/invalid token
}

{
  "error": "Forbidden"  // 403: No permission
}

{
  "error": "Validation error"  // 400: Bad request
}
```

---

## 📋 Query Parameters

### Filtering
```
GET /api/discipline?studentId=uuid&status=RESOLVED&incidentType=THEFT

GET /api/library/books?category=Physics&status=AVAILABLE&search=Form+4
```

### Pagination (Ready for implementation)
```
GET /api/transfers?page=1&limit=20&sortBy=transferDate&order=DESC
```

### Date Ranges (Some endpoints)
```
GET /api/reports?from=2025-01-01&to=2025-03-31
```

---

## 🧪 Quick Test Examples

### Create Academic Year
```bash
curl -X POST http://localhost:5000/api/calendar \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2025,
    "startDate": "2025-01-13",
    "endDate": "2025-11-28"
  }'
```

### Report Discipline Case
```bash
curl -X POST http://localhost:5000/api/discipline \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "550e8400-e29b-41d4-a716-446655440000",
    "incidentDate": "2025-03-10",
    "incidentType": "TRUANCY",
    "description": "Student absent 3 days"
  }'
```

### Issue Book
```bash
curl -X POST http://localhost:5000/api/library/issues \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookId": "uuid",
    "studentId": "uuid",
    "dueDate": "2025-04-15"
  }'
```

### Download Report Card
```bash
curl -X GET http://localhost:5000/api/reports/report-card/studentId/examId \
  -H "Authorization: Bearer TOKEN" \
  --output report_card.pdf
```

---

## ⚡ Performance Notes

### Optimized Queries
- All frequently accessed fields indexed
- Foreign key relationships optimized
- Batch operations supported for reports

### Rate Limiting (Ready for implementation)
- Not yet implemented in Phase 1 Extension
- Recommended: 100 requests/minute per user

### Pagination (Recommended)
- Large lists should paginate
- Suggested: 20 items per page

---

## 🔄 Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 201 | Created | POST new resource |
| 200 | OK | GET, PUT successful |
| 400 | Bad Request | Missing field, invalid date |
| 401 | Unauthorized | No/expired token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate entry |
| 500 | Server Error | Database error |

---

## 📚 Integration Tips

### Frontend Integration
```javascript
// Use endpoints.js service layer
import { libraryAPI, disciplineAPI, transfersAPI } from '@/api/endpoints';

// Issue book
const response = await libraryAPI.issueBook(bookId, studentId, dueDate);

// Report case
const caseResponse = await disciplineAPI.createCase(studentData);

// Generate report
const pdfBlob = await reportsAPI.generateReportCard(studentId, examId);
```

### Error Handling
```javascript
try {
  const result = await api.call();
} catch (error) {
  if (error.status === 403) {
    // Permission denied
  } else if (error.status === 404) {
    // Resource not found
  }
}
```

---

## 🚀 Deployment Notes

### Environment Requirements
- Node.js 18+
- PostgreSQL 12+
- 100MB disk for reports

### Configuration
```
DATABASE_URL=postgresql://user:pass@localhost:5432/elimucore
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
```

### Initial Setup
```bash
npm install  # Installs pdfkit
npm run dev  # Auto-migrates database
```

---

## 📞 Common Responses

### Success Response
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "ISSUED",
  "issuedDate": "2025-03-10T08:30:00Z",
  "dueDate": "2025-04-15T00:00:00Z",
  "fineAmount": 0
}
```

### Error Response
```json
{
  "error": "No copies available"
}
```

### List Response
```json
[
  { "id": "uuid1", "name": "Book 1", ... },
  { "id": "uuid2", "name": "Book 2", ... }
]
```

---

**Last Updated**: January 21, 2026  
**API Version**: 1.1.0  
**Status**: Production Ready

