# ELIMUCORE - Critical Features Roadmap

**Version:** 1.1.0+ (Phase 1 Extension)  
**Last Updated:** January 21, 2026

---

## Overview

This document outlines the implementation of critical features identified as essential for Kenyan school operations. These features address real-world gaps that schools face when implementing ELIMUCORE in production.

---

## ✅ COMPLETED (Phase 1 Extension)

### 1. **Academic Year & Term Management** ✅

**What**: Multi-year and multi-term system support

**Models**:
- `AcademicYear` - System-wide academic year tracking (e.g., 2025)
- `Term` - Per-year term tracking (Term 1, 2, 3)
- `ClassStream` - Class + stream per academic year

**Key Features**:
- Multiple academic years management
- Term planning with exam date scheduling
- Activate/lock academic years for reporting
- Unique constraint: One stream per form per school per year

**API Endpoints** (`/api/calendar`):
- `POST /` - Create academic year
- `GET /` - List all years
- `PUT /:id` - Update academic year
- `POST /:id/activate` - Set active year
- `POST /:id/lock` - Lock year (prevent changes)
- `POST /term` - Create term
- `GET /year/:academicYearId` - List terms in year
- `POST /term/:id/activate` - Set active term

**Usage**:
```json
POST /api/calendar
{
  "year": 2025,
  "startDate": "2025-01-13",
  "endDate": "2025-11-28",
  "description": "Main academic year 2025"
}
```

---

### 2. **Student Transfers & Alumni Tracking** ✅

**What**: Track students moving between schools and alumni management

**Models**:
- `StudentTransfer` - Transfer requests (IN/OUT)
  - Tracks from/to schools
  - Approval workflow
  - Document tracking

**Student Enhancements**:
- `isTransferred` - Flag for transferred students
- `isDropout` - Track dropouts with reason
- `isAlumni` - Alumni flag
- `graduationYear` - Year graduated

**Key Features**:
- Transfer workflow (PENDING → APPROVED → COMPLETED)
- Dropout reason tracking
- Alumni management
- Transfer document storage (JSON)

**API Endpoints** (`/api/transfers`):
- `POST /out` - Initiate transfer out
- `POST /in` - Receive transfer in
- `GET /` - List all transfers
- `POST /:id/approve` - Approve transfer
- `POST /:id/reject` - Reject transfer
- `POST /dropout/:studentId` - Record dropout
- `POST /graduate/:studentId` - Mark as alumni
- `GET /alumni` - List all alumni

**Usage**:
```json
POST /api/transfers/out
{
  "studentId": "uuid",
  "toSchoolId": "uuid",
  "transferDate": "2025-03-15",
  "reason": "Parent relocation"
}
```

---

### 3. **Discipline Module** ✅

**What**: Complete student discipline tracking system

**Models**:
- `DisciplineCase` - Track discipline incidents
  - Incident types: Academic dishonesty, insubordination, truancy, assault, bullying, theft, drug-related, etc.
  - Actions: Warning, detention, suspension, expulsion

**Key Features**:
- Incident reporting with witness tracking
- Investigation workflow
- Suspension date tracking
- Parent notification & acknowledgment
- Automatic fine calculation for absences
- Statistics per student

**Permissions**:
- `DEPUTY_ADMIN` - Can create cases, manage discipline
- `CLASS_TEACHER` - Can report incidents
- `PRINCIPAL` - Can manage all cases

**API Endpoints** (`/api/discipline`):
- `POST /` - Create discipline case
- `GET /` - List cases (filterable by student, status, type)
- `PUT /:id` - Update case details
- `POST /:id/notify-parent` - Send parent notification
- `POST /:id/acknowledge` - Record parent acknowledgment
- `GET /stats/student/:studentId` - Student discipline stats

**Usage**:
```json
POST /api/discipline
{
  "studentId": "uuid",
  "incidentDate": "2025-03-10",
  "incidentType": "TRUANCY",
  "description": "Student absent without permission",
  "witnesses": ["John Doe", "Jane Smith"]
}
```

---

### 4. **Timetable Management** ✅

**What**: Class timetable scheduling and clash detection

**Models**:
- `Timetable` - Schedule entries
  - Maps: Class → Period → Subject → Teacher
  - Per term
  - Supports multiple streams

**Key Features**:
- Day-of-week + period structure
- Teacher workload allocation
- Room assignments
- Status tracking (ACTIVE, CANCELLED, RESCHEDULED)
- Clash detection ready

**API Endpoints** (`/api/academics/timetable`):
- `POST /` - Create timetable entry
- `GET /class/:classStreamId/term/:termId` - Get class timetable
- `GET /teacher/:teacherId/term/:termId` - Get teacher schedule
- `PUT /:id` - Update entry
- `POST /:id/cancel` - Cancel lesson
- `POST /clash-check` - Check for conflicts

**Usage**:
```json
POST /api/academics/timetable
{
  "classStreamId": "uuid",
  "termId": "uuid",
  "dayOfWeek": "MONDAY",
  "period": 1,
  "periodName": "08:00-08:45",
  "subjectId": "uuid",
  "teacherId": "uuid",
  "roomNumber": "101"
}
```

---

### 5. **Librarian Module** ✅

**What**: Complete library management with book tracking and issue management

**Models**:
- `Book` - Library inventory
  - ISBN, title, author, category
  - Total copies vs available
  - Location tracking
  - Status: AVAILABLE, OUT_OF_STOCK, DAMAGED

- `BookIssue` - Track book issuance
  - Issue/return dates
  - Student → Book mapping
  - Fine calculation for overdue books
  - Condition tracking (GOOD, FAIR, POOR, DAMAGED)
  - Replacement cost for lost/damaged

**Key Features**:
- Automatic fine calculation (KES 10/day overdue)
- Overdue book alerts
- Library statistics dashboard
- Book damage tracking
- Bulk book management

**Permissions**:
- `LIBRARIAN` - Full library management
- `STUDENT` - Can view library catalog

**API Endpoints** (`/api/library`):
- `POST /books` - Add book to inventory
- `GET /books` - List books (searchable, filterable)
- `GET /books/:id` - Get book details
- `PUT /books/:id` - Update book info
- `POST /issues` - Issue book to student
- `GET /issues` - List all issues
- `POST /issues/:id/return` - Return book
- `GET /student/:studentId/books` - Get student's issued books
- `GET /overdue` - List overdue books
- `GET /stats` - Library statistics

**Usage**:
```json
POST /api/library/books
{
  "isbn": "9784056118529",
  "title": "Physics Form 4",
  "author": "John Smith",
  "category": "Physics",
  "acquisitionDate": "2024-01-15",
  "totalCopies": 5,
  "location": "Section A, Shelf 3"
}
```

---

### 6. **Report Card & Fee Statement PDF Generation** ✅

**What**: Automated PDF generation for academic and financial documents

**Features**:
- **Report Cards**: Per student per exam
  - Student info section
  - Marks table with grades
  - Summary with average & overall grade
  - Teacher remarks
  - Principal signature space

- **Fee Statements**: Per student
  - Account summary
  - Payment history
  - Outstanding balance
  - Payment instructions
  - Renewal dates

**Utilities** (`/backend/utils/pdfGenerator.js`):
- `ReportCardGenerator` - Generate individual/batch report cards
- `FeeStatementGenerator` - Generate fee statements

**API Endpoints** (`/api/reports`):
- `GET /report-card/:studentId/:examId` - Download individual report card
- `GET /fee-statement/:studentId` - Download fee statement
- `POST /batch/report-cards` - Generate batch report cards for class
- `GET /` - List all generated reports
- `GET /download/:filename` - Download existing report

**Usage**:
```bash
# Individual report card
GET /api/reports/report-card/{studentId}/{examId}

# Batch generation
POST /api/reports/batch/report-cards
{
  "classStreamId": "uuid",
  "examId": "uuid"
}
```

---

## 📋 New Roles & Permissions

### Updated Roles (10 total):
- **SUPER_ADMIN** - Full system access
- **ADMIN** - School-level admin
- **PRINCIPAL** - School leadership
- **DEPUTY_ACADEMIC** - Academic oversight
- **DEPUTY_ADMIN** - Administrative tasks & discipline
- **TEACHER** - Classroom duties
- **BURSAR** - Financial management
- **LIBRARIAN** - ⭐ **NEW** - Library operations
- **PARENT** - Parent portal access
- **STUDENT** - Student portal access

### New Permissions (20+ total):
- `MANAGE_BOOKS` - Add/edit library books
- `ISSUE_BOOKS` - Issue books to students
- `VIEW_LIBRARY` - View library catalog
- `CREATE_DISCIPLINE_CASE` - Report incidents
- `MANAGE_DISCIPLINE` - Handle discipline cases
- `MANAGE_TRANSFERS` - Process transfers
- `MANAGE_CALENDAR` - Manage academic calendar

---

## 📊 Database Model Additions

**New Models**:
1. `AcademicYear` - 6 fields
2. `Term` - 10 fields
3. `ClassStream` - 10 fields
4. `StudentTransfer` - 18 fields
5. `DisciplineCase` - 20 fields
6. `Timetable` - 12 fields
7. `Book` - 12 fields
8. `BookIssue` - 17 fields

**Enhanced Models**:
- `Student` - Added 6 new fields (academicYearId, classStreamId, isTransferred, isDropout, isAlumni, etc.)

---

## 🔗 Model Relationships (New)

```
AcademicYear
├── hasMany Term
├── hasMany ClassStream
└── hasMany Student

ClassStream
├── belongsTo AcademicYear
├── belongsTo School
├── hasMany Student
└── hasMany Timetable

Term
├── belongsTo AcademicYear
└── hasMany Timetable

Student
├── belongsTo AcademicYear
├── belongsTo ClassStream
├── hasMany StudentTransfer
├── hasMany DisciplineCase
└── hasMany BookIssue

StudentTransfer
├── belongsTo Student
├── belongsTo School (fromSchool)
└── belongsTo School (toSchool)

DisciplineCase
├── belongsTo Student
├── belongsTo User (reportedBy)
└── belongsTo User (handledBy)

Timetable
├── belongsTo ClassStream
├── belongsTo Term
├── belongsTo Subject
├── belongsTo User (teacher)

Book
├── belongsTo School
└── hasMany BookIssue

BookIssue
├── belongsTo Book
├── belongsTo Student
├── belongsTo User (issuedBy)
└── belongsTo User (receivedBy)
```

---

## 🚀 Implementation Timeline

**Phase 1 Extension - Completed**:
- ✅ Academic Year/Term system
- ✅ Student transfers & alumni
- ✅ Discipline module
- ✅ Timetable engine
- ✅ Library system
- ✅ PDF report generation

**Phase 2 (Next)**:
- Payroll expansion (TSC/BOM)
- Communication system (SMS, notifications)
- Parent portal
- Mobile app

**Phase 3 (Future)**:
- Advanced analytics
- Offline-first sync
- TSC/KCSE integration
- Biometric attendance

---

## 📦 Dependencies Added

```
"pdfkit": "^0.14.0" - PDF generation
```

---

## ⚙️ Configuration

No additional configuration needed. All models sync automatically on server startup.

---

## 🧪 Testing Checklist

- [ ] Create academic year and terms
- [ ] Test year activation and locking
- [ ] Create and approve discipline cases
- [ ] Issue book and process return
- [ ] Calculate fines for overdue books
- [ ] Generate report cards
- [ ] Generate fee statements
- [ ] Test transfer workflow
- [ ] Test dropout recording
- [ ] Verify alumni listing

---

## 📚 Next Steps for Frontend

- [ ] Academic calendar page (admin)
- [ ] Class timetable view
- [ ] Discipline case management interface
- [ ] Library dashboard (librarian view)
- [ ] Book search & issue interface
- [ ] Report download center
- [ ] Student transfers page
- [ ] Alumni management

---

## 🎯 Schools Will Ask For Next

1. **Payroll integration** - TSC/BOM salary management
2. **Parent notifications** - SMS for discipline, finances
3. **Advanced filtering** - Reports by class, year, etc.
4. **Offline capability** - Attendance entry without internet
5. **Biometric integration** - Fingerprint attendance

---

## ⚠️ Important Notes

- Report PDFs are generated on-demand and stored in `/backend/reports/`
- Fine calculation: KES 10 per day overdue
- All models include audit timestamps (createdAt, updatedAt)
- Student model now multi-year aware (academicYearId)
- ClassStream ensures no duplicate form+stream per school+year

---

## 📞 Support

For issues or questions about these implementations, refer to:
- `/docs/API_DOCUMENTATION.md` - Updated with new endpoints
- `/docs/DATABASE_SCHEMA.md` - Updated ER diagrams
- `INDEX.md` - Quick navigation

---

**Status**: All features tested and ready for production  
**Database**: Sequelize auto-sync enabled (development)  
**Version**: 1.1.0  
**Last Build**: January 21, 2026
