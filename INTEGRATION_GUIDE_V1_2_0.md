# Subject Enrollment & Progression - Integration Guide

## Implementation Summary

**Features Implemented** (v1.2.0):
✅ StudentSubjectEnrollment model with CBC support
✅ StudentProgression model with repeat/skip/transfer logic
✅ 17 new API endpoints (8 enrollment + 9 progression)
✅ Database-level integrity constraints
✅ Marks validation (checks enrollment before creating)
✅ Comprehensive analytics & reporting
✅ Full documentation & testing guide

**Time to Deploy**: ~2 hours (DB sync + migration + testing)

---

## 🔧 Integration Steps

### Step 1: Database Sync
```javascript
// server.js already has auto-sync enabled
// When started with NODE_ENV=development:
await sequelize.sync({ alter: true });
// This will:
// - Create StudentSubjectEnrollment table
// - Create StudentProgression table
// - Create necessary indexes
```

### Step 2: Apply Constraints (Optional but Recommended)
```bash
cd backend
node -e "
const sequelize = require('./config/database');
const { applyConstraints } = require('./migrations/001_add_constraints');
(async () => {
  await sequelize.authenticate();
  await applyConstraints();
  console.log('✅ Constraints applied');
  process.exit(0);
})();
"
```

### Step 3: Test Endpoints

#### 3a. Create Subject Enrollments
```bash
# Enroll student in Math
curl -X POST http://localhost:5000/api/academics/enrollment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "studentId": "STUDENT_UUID",
    "subjectId": "MATH_UUID",
    "classStreamId": "CLASS_STREAM_UUID",
    "academicYearId": "2024_UUID",
    "isOptional": false
  }'

# Expected Response:
{
  "message": "Student enrolled successfully",
  "enrollment": {
    "id": "enrollment-uuid",
    "studentId": "...",
    "subjectId": "...",
    "enrollmentStatus": "ACTIVE",
    "isOptional": false,
    "enrolledDate": "2025-01-21T10:00:00.000Z"
  }
}
```

#### 3b. Create Student Progression
```bash
curl -X POST http://localhost:5000/api/students/progression \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "studentId": "STUDENT_UUID",
    "academicYearId": "2024_UUID",
    "classLevel": "FORM_2",
    "classStreamId": "STREAM_UUID",
    "enrollmentType": "NEW"
  }'

# Expected Response:
{
  "message": "Progression record created successfully",
  "progression": {
    "id": "progression-uuid",
    "studentId": "...",
    "academicYearId": "...",
    "classLevel": "FORM_2",
    "enrollmentType": "NEW",
    "entryDate": "2025-01-21T10:00:00.000Z"
  }
}
```

#### 3c. Enter Marks (Now with Validation)
```bash
curl -X POST http://localhost:5000/api/academics/marks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "studentId": "STUDENT_UUID",
    "examId": "EXAM_UUID",
    "subjectId": "MATH_UUID",
    "academicYearId": "2024_UUID",
    "marksObtained": 82
  }'

# Validation checks:
# 1. Subject enrollment exists? ✓ YES → mark created
#                                ✗ NO → ERROR
# 2. Marks in 0-100 range? ✓ YES → saved
#                           ✗ NO → DB constraint error
```

### Step 4: Verify Data Quality
```sql
-- Check StudentSubjectEnrollment table
SELECT COUNT(*) FROM "StudentSubjectEnrollments";
-- Should show records for all student-subject combinations

-- Check StudentProgression table
SELECT COUNT(*) FROM "StudentProgressions";
-- Should show one record per student per academic year

-- Verify constraints
SELECT * FROM information_schema.table_constraints 
WHERE constraint_type = 'UNIQUE' AND table_name IN (
  'StudentSubjectEnrollments', 'StudentProgressions', 'Marks'
);
```

---

## 📊 Data Migration (If Existing Students)

### For Schools With Existing Students

If you already have students & marks in the system:

```javascript
// 1. Get all students & academic years
const students = await Student.findAll();
const academicYears = await AcademicYear.findAll();

// 2. For each student-year, create progression records
for (const year of academicYears) {
  for (const student of students) {
    await StudentProgression.create({
      studentId: student.id,
      academicYearId: year.id,
      classLevel: student.classLevel,  // from existing Student record
      classStreamId: student.classStreamId,
      enrollmentType: 'NEW',
      schoolId: student.schoolId,
      createdBy: req.user.id,
    });
  }
}

// 3. For each mark in system, create enrollment record
const marks = await Mark.findAll({ raw: true });
const uniqueEnrollments = new Set();

for (const mark of marks) {
  const key = `${mark.studentId}:${mark.subjectId}`;
  if (!uniqueEnrollments.has(key)) {
    uniqueEnrollments.add(key);
    
    await StudentSubjectEnrollment.create({
      studentId: mark.studentId,
      subjectId: mark.subjectId,
      classStreamId: student.classStreamId,  // from Student record
      academicYearId: academicYear.id,
      isOptional: false,  // assume mandatory for existing marks
      schoolId: student.schoolId,
      createdBy: req.user.id,
    });
  }
}

console.log('✅ Migration complete');
```

---

## 🧪 Testing Scenarios

### Test 1: Complete Student Workflow
```javascript
// 1. Create progression
POST /api/students/progression
{ "studentId": "S1", "academicYearId": "2024", "classLevel": "FORM_2", ... }

// 2. Enroll in 8 mandatory subjects + 1 optional
POST /api/academics/enrollment (8 times with isOptional: false)
POST /api/academics/enrollment (1 time with isOptional: true)

// 3. Enter marks for all 9 subjects
POST /api/academics/marks (9 times)
// ✅ All succeed - student enrolled in all

// 4. Try to enter mark for non-enrolled subject
POST /api/academics/marks { subjectId: "NOT_ENROLLED" }
// ❌ Error: "Student not enrolled in this subject"
```

### Test 2: Subject Drop Workflow
```javascript
// 1. Student drops Physics mid-year
POST /api/academics/enrollment/ENROLLMENT_UUID/drop
{ "reason": "Performance issues" }

// 2. Substitute with Agriculture
POST /api/academics/enrollment/OLD_ENROLLMENT_UUID/substitute
{ "replacementSubjectId": "AGRICULTURE_UUID" }

// 3. Report shows Physics dropped, Agriculture active
GET /api/academics/report/enrollment-status
// stats.droppedEnrollments: 1
// stats.substitutedEnrollments: 1
```

### Test 3: Class Repeat Workflow
```javascript
// 1. Student fails Form 2 in 2024
POST /api/students/uuid/exit
{ "exitReason": "INCOMPLETE", "exitDate": "2024-11-30" }

// 2. Create repeat record for 2025
POST /api/students/progression
{ 
  "classLevel": "FORM_2", 
  "enrollmentType": "REPEAT",
  "previousAcademicYearId": "2024_UUID"
}

// 3. List all repeaters in Form 2
GET /api/academics/repeaters/STREAM_UUID?academicYearId=2025_UUID
// repeaters: [ { student: "John Doe", ... } ]
```

### Test 4: Term Suspension & Resume
```javascript
// 1. Mark student as absent due to illness
POST /api/students/uuid/suspend-term
{ "academicYearId": "2024", "reason": "Hospitalization" }

// 2. Next year, create resume record (same form)
POST /api/students/uuid/resume-after-absence
{ 
  "suspendedAcademicYearId": "2024",
  "resumeAcademicYearId": "2025"
}

// 3. History shows the gap
GET /api/students/uuid/progression-history
// [
//   { year: 2024, status: SUSPENDED },
//   { year: 2025, status: ACTIVE }
// ]
```

---

## 🚨 Common Errors & Solutions

### Error: "Student not enrolled in this subject"
**Cause**: Mark entry missing enrollment record  
**Solution**: Create enrollment first
```javascript
// Create enrollment
POST /api/academics/enrollment
{ "studentId": "S1", "subjectId": "MATH", ... }

// Then try marks again
POST /api/academics/marks
{ "studentId": "S1", "subjectId": "MATH", ... }
```

### Error: "Enrollment already exists"
**Cause**: Trying to enroll student in same subject twice  
**Solution**: Check if already enrolled
```javascript
GET /api/academics/enrollment/STUDENT_ID
// Check response - if already exists, update instead of create
```

### Error: "Cannot progress beyond Form 4"
**Cause**: Trying to promote Form 4 to Form 5  
**Solution**: Mark as graduated instead
```javascript
// Don't promote Form 4
// Instead, mark as exited
PUT /api/students/STUDENT_ID/exit
{ "exitReason": "GRADUATED" }

// Student becomes Alumni
UPDATE Students SET status = 'ALUMNI' WHERE id = 'S1'
```

### Error: "Marks duplicate" (from DB)
**Cause**: Trying to enter marks twice for same exam-student-subject  
**Solution**: This is prevented by DB constraint
```javascript
// First entry succeeds
POST /api/academics/marks { "studentId": "S1", "examId": "E1", "subjectId": "M" }
// ✅ Status: 201

// Second entry fails (prevented at DB level)
POST /api/academics/marks { "studentId": "S1", "examId": "E1", "subjectId": "M" }
// ❌ Status: 409 (Conflict) - already exists
```

---

## 📈 Performance Testing

After deployment, verify performance:

```bash
# Test 1: Create 100 enrollments (should be < 5 seconds)
ab -n 100 -c 10 \
  -H "Authorization: Bearer TOKEN" \
  -p enrollment.json \
  http://localhost:5000/api/academics/enrollment

# Test 2: Query 1000 enrollments (should be < 50ms)
curl "http://localhost:5000/api/academics/enrollment/STUDENT_ID" \
  -H "Authorization: Bearer TOKEN"

# Test 3: Generate report (should be < 100ms)
curl "http://localhost:5000/api/academics/report/enrollment-status?academicYearId=UUID" \
  -H "Authorization: Bearer TOKEN"
```

---

## ✅ Deployment Checklist

- [ ] Database synced with new tables created
- [ ] Indexes created for performance
- [ ] Constraints applied (if recommended)
- [ ] Test basic enrollment workflow
- [ ] Test marks entry with validation
- [ ] Test progression creation
- [ ] Verify no errors in server logs
- [ ] Test all 17 new endpoints
- [ ] Verify RBAC permissions working
- [ ] Backup database before going live
- [ ] Document custom business rules (if any)
- [ ] Train admins on subject enrollment process

---

## 📞 Support

**Common Questions**:

Q: What if I enter marks before creating enrollment?
A: You'll get error: "Student not enrolled". Create enrollment first.

Q: Can I change student's class level mid-year?
A: No, progression is per academic year. Must exit and create new progression.

Q: What happens if I delete a subject?
A: All StudentSubjectEnrollment records cascade delete. Marks remain (for audit).

Q: How do I handle mid-year transfers?
A: Create StudentTransfer record + exit current progression + create new progression.

Q: Can Form 4 repeat?
A: No - constraint prevents it. Form 4 can only graduate or dropout.

---

**Next Phase**: Implement bulk CSV import & exam moderation workflows

