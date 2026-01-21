# Database Schema

## Entity Relationship Diagram

```
User (1) ---- (Many) School
       |
       (Many) Student
       |
       (Many) Exam
       |
       (Many) Mark
       |
       (Many) Attendance
       |
       (Many) Payment
       |
       (Many) AuditLog

School (1) ---- (Many) Student
      |
      (Many) Subject
      |
      (Many) FeeStructure

Exam (1) ---- (Many) Mark
Subject (1) ---- (Many) Mark
Student (1) ---- (Many) Mark
                  |
           (1) Student
           |
           (1) StudentAccount

Student (1) ---- (Many) Payment
Student (1) ---- (Many) Attendance
```

---

## Tables

### 1. schools
Stores school information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| name | STRING | NOT NULL, UNIQUE | School name |
| registrationNumber | STRING | NOT NULL, UNIQUE | TSC registration number |
| county | STRING | NOT NULL | County location |
| subcounty | STRING | NOT NULL | Sub-county location |
| phone | STRING | NULLABLE | Contact phone |
| email | STRING | NULLABLE, UNIQUE | Contact email |
| address | TEXT | NULLABLE | Physical address |
| principalName | STRING | NULLABLE | Principal name |
| schoolType | ENUM | DEFAULT 'PUBLIC' | PUBLIC or PRIVATE |
| studentCapacity | INTEGER | NULLABLE | Maximum students |
| isActive | BOOLEAN | DEFAULT true | Active status |
| createdAt | TIMESTAMP | DEFAULT NOW | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW | Update timestamp |

---

### 2. users
System users (administrators, teachers, staff, etc.)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| email | STRING | NOT NULL, UNIQUE | Email address |
| password | STRING | NOT NULL | Hashed password |
| firstName | STRING | NOT NULL | First name |
| lastName | STRING | NOT NULL | Last name |
| phoneNumber | STRING | NULLABLE | Phone number |
| role | STRING | NOT NULL, DEFAULT 'student' | User role |
| department | STRING | NULLABLE | Department |
| employeeNumber | STRING | NULLABLE, UNIQUE | TSC employee number |
| tscNumber | STRING | NULLABLE, UNIQUE | TSC teacher number |
| status | ENUM | DEFAULT 'ACTIVE' | ACTIVE, INACTIVE, SUSPENDED |
| lastLogin | TIMESTAMP | NULLABLE | Last login timestamp |
| passwordChangedAt | TIMESTAMP | NULLABLE | Password change timestamp |
| schoolId | UUID | FOREIGN KEY | School reference |
| createdAt | TIMESTAMP | DEFAULT NOW | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW | Update timestamp |

---

### 3. students
Student records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| admissionNumber | STRING | NOT NULL, UNIQUE | Admission number |
| firstName | STRING | NOT NULL | First name |
| lastName | STRING | NOT NULL | Last name |
| middleName | STRING | NULLABLE | Middle name |
| dateOfBirth | DATE | NOT NULL | Date of birth |
| gender | ENUM | NOT NULL | MALE, FEMALE, OTHER |
| parentName | STRING | NOT NULL | Parent/guardian name |
| parentEmail | STRING | NOT NULL | Parent email |
| parentPhone | STRING | NOT NULL | Parent phone |
| classLevel | ENUM | NOT NULL | FORM1, FORM2, FORM3, FORM4 |
| stream | STRING | NULLABLE | Class stream (A, B, C) |
| enrollmentDate | DATE | DEFAULT NOW | Enrollment date |
| status | ENUM | DEFAULT 'PENDING' | PENDING, APPROVED, ACTIVE, INACTIVE, GRADUATED, REJECTED |
| approvedBy | UUID | NULLABLE | User ID who approved |
| schoolId | UUID | FOREIGN KEY | School reference |
| userId | UUID | NULLABLE | User reference (for login) |
| createdAt | TIMESTAMP | DEFAULT NOW | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW | Update timestamp |

---

### 4. subjects
Subject offerings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| name | STRING | NOT NULL | Subject name |
| code | STRING | NOT NULL, UNIQUE | Subject code |
| description | TEXT | NULLABLE | Description |
| maxMarks | INTEGER | DEFAULT 100 | Maximum marks |
| isCompulsory | BOOLEAN | DEFAULT false | Mandatory subject |
| schoolId | UUID | NULLABLE | School reference |
| createdAt | TIMESTAMP | DEFAULT NOW | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW | Update timestamp |

---

### 5. exams
Examination definitions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| name | STRING | NOT NULL | Exam name |
| term | ENUM | NOT NULL | TERM1, TERM2, TERM3 |
| year | INTEGER | NOT NULL | Academic year |
| classLevel | ENUM | NOT NULL | FORM1, FORM2, FORM3, FORM4 |
| startDate | DATE | NOT NULL | Exam start date |
| endDate | DATE | NOT NULL | Exam end date |
| status | ENUM | DEFAULT 'DRAFT' | DRAFT, IN_PROGRESS, COMPLETED, LOCKED |
| createdBy | UUID | NULLABLE | User ID who created |
| lockedBy | UUID | NULLABLE | User ID who locked |
| lockedAt | TIMESTAMP | NULLABLE | Lock timestamp |
| schoolId | UUID | NULLABLE | School reference |
| createdAt | TIMESTAMP | DEFAULT NOW | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW | Update timestamp |

---

### 6. marks
Student marks/scores.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| marksObtained | FLOAT | NOT NULL | Marks scored |
| percentage | FLOAT | NULLABLE | Percentage score |
| grade | STRING | NULLABLE | Letter grade |
| remarks | TEXT | NULLABLE | Comments |
| status | ENUM | DEFAULT 'DRAFT' | DRAFT, SUBMITTED, APPROVED, REJECTED |
| approvedBy | UUID | NULLABLE | User ID who approved |
| approvedAt | TIMESTAMP | NULLABLE | Approval timestamp |
| enteredBy | UUID | NULLABLE | User ID who entered marks |
| studentId | UUID | NOT NULL, FOREIGN KEY | Student reference |
| examId | UUID | NOT NULL, FOREIGN KEY | Exam reference |
| subjectId | UUID | NOT NULL, FOREIGN KEY | Subject reference |
| createdAt | TIMESTAMP | DEFAULT NOW | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW | Update timestamp |

---

### 7. fee_structures
Fee structure definitions per class.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| classLevel | ENUM | NOT NULL | FORM1, FORM2, FORM3, FORM4 |
| year | INTEGER | NOT NULL | Academic year |
| tuitionFee | DECIMAL(10,2) | NOT NULL | Tuition amount |
| boardingFee | DECIMAL(10,2) | NULLABLE | Boarding amount |
| activityFee | DECIMAL(10,2) | NULLABLE | Activity amount |
| otherFee | DECIMAL(10,2) | NULLABLE | Other fees |
| totalFee | DECIMAL(10,2) | NOT NULL | Total fee amount |
| termCount | INTEGER | DEFAULT 3 | Number of terms |
| isActive | BOOLEAN | DEFAULT true | Active status |
| schoolId | UUID | NULLABLE | School reference |
| createdAt | TIMESTAMP | DEFAULT NOW | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW | Update timestamp |

---

### 8. student_accounts
Student fee accounts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| studentId | UUID | NOT NULL, UNIQUE, FOREIGN KEY | Student reference |
| totalFeesDue | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | Total fees due |
| totalFesPaid | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | Total fees paid |
| balance | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | Balance/arrears |
| status | ENUM | DEFAULT 'PARTIAL' | CLEARED, PARTIAL, ARREARS |
| lastPaymentDate | TIMESTAMP | NULLABLE | Last payment date |
| createdAt | TIMESTAMP | DEFAULT NOW | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW | Update timestamp |

---

### 9. payments
Payment records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| studentId | UUID | NOT NULL, FOREIGN KEY | Student reference |
| amount | DECIMAL(10,2) | NOT NULL | Payment amount |
| paymentMethod | ENUM | DEFAULT 'CASH' | CASH, CHEQUE, MPESA, BANK_TRANSFER |
| transactionId | STRING | NULLABLE, UNIQUE | External transaction ID |
| receiptNumber | STRING | NOT NULL, UNIQUE | Receipt number |
| paymentDate | DATE | DEFAULT NOW | Payment date |
| status | ENUM | DEFAULT 'PENDING' | PENDING, VERIFIED, REJECTED |
| verifiedBy | UUID | NULLABLE | User ID who verified |
| verifiedAt | TIMESTAMP | NULLABLE | Verification timestamp |
| remarks | TEXT | NULLABLE | Comments |
| recordedBy | UUID | NULLABLE | User ID who recorded |
| createdAt | TIMESTAMP | DEFAULT NOW | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW | Update timestamp |

---

### 10. attendance
Attendance records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| studentId | UUID | NOT NULL, FOREIGN KEY | Student reference |
| date | DATE | NOT NULL | Attendance date |
| status | ENUM | NOT NULL | PRESENT, ABSENT, LATE, EXCUSED |
| remarks | TEXT | NULLABLE | Comments |
| recordedBy | UUID | NULLABLE | User ID who recorded |
| schoolId | UUID | NULLABLE | School reference |
| createdAt | TIMESTAMP | DEFAULT NOW | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW | Update timestamp |
| UNIQUE(studentId, date) | INDEX | | One record per student per day |

---

### 11. audit_logs
System audit trail.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| userId | UUID | NOT NULL, FOREIGN KEY | User reference |
| action | STRING | NOT NULL | Action performed |
| entityType | STRING | NOT NULL | Entity type (Student, Mark, etc) |
| entityId | UUID | NOT NULL | Entity reference |
| changes | JSON | NULLABLE | What changed |
| ipAddress | STRING | NULLABLE | IP address |
| userAgent | TEXT | NULLABLE | Browser/client info |
| createdAt | TIMESTAMP | DEFAULT NOW | Creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW | Update timestamp |

---

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_class ON students(classLevel);
CREATE INDEX idx_marks_exam ON marks(examId);
CREATE INDEX idx_marks_student ON marks(studentId);
CREATE INDEX idx_attendance_student_date ON attendance(studentId, date);
CREATE INDEX idx_payments_student ON payments(studentId);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_audit_user ON audit_logs(userId);
```

---

Last Updated: January 2026
