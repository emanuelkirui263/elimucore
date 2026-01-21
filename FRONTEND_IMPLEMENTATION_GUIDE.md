# Frontend Implementation Guide - Critical Features

**Target**: React components and pages for Phase 1 Extension features

---

## 📱 New Pages to Create

### 1. **Librarian Dashboard** (`/pages/LibrarianPage.jsx`)

```jsx
// Key Components:
- BookInventory (table, add, search)
- StudentIssues (active issues, overdue alerts)
- LibraryStats (dashboard cards)
- BookIssueForm (issue new book)
- ReturnBookForm (record return with condition)

// Key Data:
- Total books
- Available copies
- Overdue issues
- Fines pending
- Popular books
```

**Features**:
- Search books by title/author/ISBN
- Issue book to student (with due date)
- Return book with condition check
- Calculate fines automatically
- View student's book history
- Overdue alerts

**API Calls**:
```javascript
GET    /api/library/books
POST   /api/library/books
GET    /api/library/issues
POST   /api/library/issues
POST   /api/library/issues/:id/return
GET    /api/library/overdue
GET    /api/library/stats
GET    /api/library/student/:studentId/books
```

---

### 2. **Academic Calendar Page** (`/pages/AcademicCalendarPage.jsx`)

```jsx
// Key Components:
- YearSelector (create, activate year)
- TermCalendar (term timeline view)
- TermForm (create term with exam dates)
- ClassStreamSetup (manage class streams)

// Key Data:
- Current academic year
- All terms with dates
- Class streams per year
```

**Features**:
- View all academic years
- Activate current year
- Create terms with start/end dates
- Set exam date ranges
- Create class streams
- Lock year for archive

**API Calls**:
```javascript
GET    /api/calendar/
POST   /api/calendar/
PUT    /api/calendar/:id
POST   /api/calendar/:id/activate
POST   /api/calendar/:id/lock

POST   /api/calendar/term
GET    /api/calendar/year/:academicYearId
PUT    /api/calendar/term/:id
POST   /api/calendar/term/:id/activate
```

---

### 3. **Timetable Management** (`/pages/TimetableManagerPage.jsx`)

```jsx
// Key Components:
- ClassTimetable (week view grid)
- AddLessonForm (period, subject, teacher)
- TeacherSchedule (individual teacher view)
- ClashDetector (conflicts alert)

// Key Data:
- Weekly schedule grid
- Subject list
- Teacher list
- Room availability
```

**Features**:
- View class timetable by day/week
- Add lesson entries
- Assign teachers to periods
- Check room conflicts
- View teacher workload
- Cancel/reschedule lessons

**API Calls**:
```javascript
POST   /api/academics/timetable
GET    /api/academics/timetable/class/:classStreamId/term/:termId
GET    /api/academics/timetable/teacher/:teacherId/term/:termId
PUT    /api/academics/timetable/:id
POST   /api/academics/timetable/:id/cancel
POST   /api/academics/timetable/clash-check
```

---

### 4. **Discipline Management** (`/pages/DisciplineManagerPage.jsx`)

```jsx
// Key Components:
- CaseList (filterable list, status badges)
- CaseForm (report incident)
- CaseDetail (full details, actions)
- ParentNotificationForm
- DisciplineStatistics (per student)

// Key Data:
- Incident types
- Students
- Assigned handlers
```

**Features**:
- Report discipline incident
- Add witnesses
- Set action (warning, suspension, expulsion)
- Track suspension dates
- Notify parents with records
- View case history
- Statistics by incident type

**API Calls**:
```javascript
POST   /api/discipline/
GET    /api/discipline/
GET    /api/discipline/:id
PUT    /api/discipline/:id
POST   /api/discipline/:id/notify-parent
POST   /api/discipline/:id/acknowledge
GET    /api/discipline/stats/student/:studentId
```

---

### 5. **Student Transfers** (`/pages/StudentTransfersPage.jsx`)

```jsx
// Key Components:
- TransferList (pending, approved, rejected)
- TransferForm (out/in form)
- TransferDetail (view, approve, reject)
- TransferDocuments (upload)
- AlumniDirectory (searchable)

// Key Data:
- Students
- Schools (from/to)
- Transfer status
```

**Features**:
- Initiate transfer out
- Receive transfer in
- Approve/reject transfers
- Attach documents
- Track dropouts
- Graduate students to alumni
- View alumni directory

**API Calls**:
```javascript
POST   /api/transfers/out
POST   /api/transfers/in
GET    /api/transfers/
GET    /api/transfers/:id
POST   /api/transfers/:id/approve
POST   /api/transfers/:id/reject
POST   /api/transfers/dropout/:studentId
POST   /api/transfers/graduate/:studentId
GET    /api/transfers/alumni
```

---

### 6. **Report Generator** (`/pages/ReportGeneratorPage.jsx`)

```jsx
// Key Components:
- ReportTypeSelector (report card, fee statement)
- ParameterForm (student, exam, date range)
- BatchReportForm (class, term)
- GeneratedReports (download list)

// Key Data:
- Students/classes
- Exams
- Academic years
```

**Features**:
- Generate individual report card PDF
- Generate individual fee statement PDF
- Batch generate for entire class
- Download generated reports
- View report history
- Auto-delete old reports

**API Calls**:
```javascript
GET    /api/reports/report-card/:studentId/:examId
GET    /api/reports/fee-statement/:studentId
POST   /api/reports/batch/report-cards
GET    /api/reports/
GET    /api/reports/download/:filename
```

---

## 🎨 UI Component Updates

### Updated Navbar (`Navbar.jsx`)
```jsx
// Add new menu items:
- Librarian (if user.role === 'LIBRARIAN')
- Calendar (if ADMIN/PRINCIPAL)
- Discipline (if has permission)
- Reports (if has permission)
- Transfers (if ADMIN/PRINCIPAL)
```

### Updated Dashboard (`DashboardPage.jsx`)
```jsx
// New role-specific cards:
- Librarian: "Overdue Books", "Total Issues"
- Admin: "Active Terms", "Class Streams"
- Bursar: "Outstanding Balances"
- Anyone: "Quick Reports" (link to generator)
```

---

## 📊 Navigation Flow

```
Dashboard
├── Librarian [LIBRARIAN]
│   ├── Book Inventory
│   ├── Issue Books
│   ├── Overdue Management
│   └── Library Stats
│
├── Academic Calendar [ADMIN/PRINCIPAL]
│   ├── Years
│   ├── Terms
│   └── Class Streams
│
├── Timetable [TEACHER/DEPUTY_ACADEMIC]
│   ├── Class Schedule
│   ├── Teacher Schedule
│   └── Clash Detection
│
├── Discipline [ADMIN/DEPUTY_ADMIN]
│   ├── Incident Reports
│   ├── Case Management
│   └── Statistics
│
├── Transfers [ADMIN/PRINCIPAL]
│   ├── Transfer Requests
│   ├── Alumni Directory
│   └── Dropouts
│
└── Reports [ADMIN/PRINCIPAL/BURSAR]
    ├── Report Cards
    ├── Fee Statements
    └── Batch Generate
```

---

## 🔑 Key Form Validations

### Book Issue Form
- Student must be ACTIVE
- Book must have available copies
- Due date must be in future
- Max 10 books per student

### Discipline Report
- Incident date cannot be future
- At least one witness recommended
- Action required for RESOLVED cases
- Parent notification mandatory for suspension

### Transfer Request
- Student must be ACTIVE
- Cannot transfer to current school
- Transfer date must be reasonable

### Report Generation
- Exam must exist
- Student must have marks for that exam
- Marks must be APPROVED status
- At least one subject required

---

## 💾 Local Storage Updates

```javascript
// Add to authStore:
- userPermissions (array of granted permissions)
- userRole (current role)
- schoolId (school context)

// Usage:
if (hasPermission('MANAGE_BOOKS')) {
  // Show librarian menu
}
```

---

## 🧪 Testing Priority

1. **Librarian Flow**: Book add → Issue → Return → Fine
2. **Calendar**: Create year → Add terms → Activate
3. **Discipline**: Report → Notify parent → Approve
4. **Transfers**: Request → Approve → Complete
5. **Reports**: Generate → Download → Verify PDF

---

## 📦 Additional Dependencies Needed

```json
{
  "react-calendar": "^4.2.1",
  "react-table": "^8.9.1",
  "pdfjs-dist": "^4.0.0"
}
```

---

## 🚀 Implementation Order

1. **Librarian Page** (highest user demand)
2. **Academic Calendar** (foundational)
3. **Report Generator** (immediate business value)
4. **Discipline Manager** (compliance)
5. **Timetable Manager** (operational)
6. **Student Transfers** (administrative)

---

## 📝 Notes for Frontend Dev

- All new pages need `ProtectedRoute` wrapper
- Role checks: Use `authStore.getUserRole()`
- Permission checks: Implement `hasPermission()` utility
- All API calls should use `/src/api/endpoints.js`
- Keep consistent styling with existing Tailwind theme
- Add loading states for API calls
- Error boundaries for each page

---

## 🎯 Success Criteria

- [ ] All pages load without errors
- [ ] Role-based access working
- [ ] PDF downloads functional
- [ ] Forms validate correctly
- [ ] API error messages displayed
- [ ] Mobile responsive
- [ ] Search/filter working
- [ ] Pagination implemented

---

**Estimated Frontend Effort**: 40-50 hours  
**Estimated Testing**: 10-15 hours  
**Target Completion**: 1-2 weeks (with full team)

