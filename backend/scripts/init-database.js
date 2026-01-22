#!/usr/bin/env node

/**
 * Database Initialization Script
 * Initializes all database tables and applies constraints
 * Usage: node scripts/init-database.js
 */

require('dotenv').config();
const sequelize = require('../config/database');

// Import all models
const User = require('../models/User');
const School = require('../models/School');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Exam = require('../models/Exam');
const Mark = require('../models/Mark');
const FeeStructure = require('../models/FeeStructure');
const StudentAccount = require('../models/StudentAccount');
const Payment = require('../models/Payment');
const Attendance = require('../models/Attendance');
const AuditLog = require('../models/AuditLog');
const AcademicYear = require('../models/AcademicYear')(sequelize);
const Term = require('../models/Term')(sequelize);
const ClassStream = require('../models/ClassStream')(sequelize);
const StudentTransfer = require('../models/StudentTransfer')(sequelize);
const DisciplineCase = require('../models/DisciplineCase')(sequelize);
const Timetable = require('../models/Timetable')(sequelize);
const Book = require('../models/Book')(sequelize);
const BookIssue = require('../models/BookIssue')(sequelize);
const StudentSubjectEnrollment = require('../models/StudentSubjectEnrollment')(sequelize);
const StudentProgression = require('../models/StudentProgression')(sequelize);

// Define all associations
function setupAssociations() {
  // Mark associations
  Mark.belongsTo(Exam);
  Mark.belongsTo(Subject);
  Mark.belongsTo(Student);
  Exam.hasMany(Mark);
  Subject.hasMany(Mark);
  Student.hasMany(Mark);

  // Account associations
  StudentAccount.belongsTo(Student);
  Student.hasOne(StudentAccount);

  // Payment associations
  Payment.belongsTo(Student);
  Student.hasMany(Payment);

  // Attendance associations
  Attendance.belongsTo(Student);
  Student.hasMany(Attendance);

  // School associations
  School.hasMany(User);
  User.belongsTo(School);

  School.hasMany(Student);
  Student.belongsTo(School);

  // Audit associations
  AuditLog.belongsTo(User);
  User.hasMany(AuditLog);

  // Academic year associations
  Student.belongsTo(AcademicYear);
  AcademicYear.hasMany(Student);

  Student.belongsTo(ClassStream);
  ClassStream.hasMany(Student);

  Term.belongsTo(AcademicYear);
  AcademicYear.hasMany(Term, { as: 'terms' });

  ClassStream.belongsTo(AcademicYear);
  ClassStream.belongsTo(School);

  // Transfer associations
  StudentTransfer.belongsTo(Student);
  Student.hasMany(StudentTransfer);

  StudentTransfer.belongsTo(School, { as: 'fromSchool', foreignKey: 'fromSchoolId' });
  StudentTransfer.belongsTo(School, { as: 'toSchool', foreignKey: 'toSchoolId' });

  // Discipline associations
  DisciplineCase.belongsTo(Student);
  Student.hasMany(DisciplineCase);

  DisciplineCase.belongsTo(User, { as: 'reportedByUser', foreignKey: 'reportedBy' });
  DisciplineCase.belongsTo(User, { as: 'handledByUser', foreignKey: 'handledBy' });

  // Timetable associations
  Timetable.belongsTo(ClassStream);
  ClassStream.hasMany(Timetable);

  Timetable.belongsTo(Term);
  Term.hasMany(Timetable);

  Timetable.belongsTo(Subject);
  Subject.hasMany(Timetable);

  Timetable.belongsTo(User, { as: 'teacher', foreignKey: 'teacherId' });

  // Library associations
  Book.belongsTo(School);
  School.hasMany(Book);

  BookIssue.belongsTo(Book, { as: 'book' });
  Book.hasMany(BookIssue);

  BookIssue.belongsTo(Student, { as: 'student' });
  Student.hasMany(BookIssue);

  BookIssue.belongsTo(User, { as: 'issuedByUser', foreignKey: 'issuedBy' });
  BookIssue.belongsTo(User, { as: 'receivedByUser', foreignKey: 'receivedBy' });

  // Subject enrollment associations
  StudentSubjectEnrollment.belongsTo(Student);
  Student.hasMany(StudentSubjectEnrollment);

  StudentSubjectEnrollment.belongsTo(Subject, { as: 'subject' });
  Subject.hasMany(StudentSubjectEnrollment);

  StudentSubjectEnrollment.belongsTo(ClassStream, { as: 'classStream' });
  ClassStream.hasMany(StudentSubjectEnrollment);

  StudentSubjectEnrollment.belongsTo(AcademicYear, { as: 'academicYear' });
  AcademicYear.hasMany(StudentSubjectEnrollment);

  StudentSubjectEnrollment.belongsTo(School);
  School.hasMany(StudentSubjectEnrollment);

  StudentSubjectEnrollment.belongsTo(User, { as: 'createdByUser', foreignKey: 'createdBy' });

  // Student progression associations
  StudentProgression.belongsTo(Student);
  Student.hasMany(StudentProgression);

  StudentProgression.belongsTo(AcademicYear, { as: 'academicYear' });
  AcademicYear.hasMany(StudentProgression);

  StudentProgression.belongsTo(ClassStream, { as: 'classStream' });
  ClassStream.hasMany(StudentProgression);

  StudentProgression.belongsTo(School);
  School.hasMany(StudentProgression);

  StudentProgression.belongsTo(User, { as: 'createdByUser', foreignKey: 'createdBy' });
}

async function initializeDatabase() {
  try {
    console.log('\n🔧 ELIMUCORE Database Initialization');
    console.log('='.repeat(50));

    // 1. Test connection
    console.log('\n📡 Testing database connection...');
    await sequelize.authenticate();
    console.log('✓ Database connection successful');

    // 2. Setup associations
    console.log('\n🔗 Setting up model associations...');
    setupAssociations();
    console.log('✓ Associations configured');

    // 3. Sync database
    console.log('\n📊 Synchronizing database schema...');
    const force = process.argv.includes('--force');
    if (force) {
      console.log('⚠️  Using --force flag: Dropping existing tables');
    }
    
    await sequelize.sync({ force, alter: !force });
    console.log('✓ Database schema synchronized');

    // 4. Apply database constraints
    console.log('\n🔒 Applying database-level constraints...');
    
    // Mark unique constraint
    await sequelize.query(`
      ALTER TABLE "Marks" ADD CONSTRAINT IF NOT EXISTS mark_unique 
      UNIQUE("studentId", "examId", "subjectId")
    `).catch(err => {
      if (!err.message.includes('already exists')) {
        console.log('ℹ️  Mark unique constraint:', err.message.split('\n')[0]);
      }
    });

    // Mark range check
    await sequelize.query(`
      ALTER TABLE "Marks" ADD CONSTRAINT IF NOT EXISTS mark_range_check
      CHECK("marksObtained" >= 0 AND "marksObtained" <= 100)
    `).catch(err => {
      if (!err.message.includes('already exists')) {
        console.log('ℹ️  Mark range check:', err.message.split('\n')[0]);
      }
    });

    // Enrollment unique constraint
    await sequelize.query(`
      ALTER TABLE "StudentSubjectEnrollments" ADD CONSTRAINT IF NOT EXISTS enrollment_unique
      UNIQUE("studentId", "subjectId", "academicYearId", "classStreamId")
    `).catch(err => {
      if (!err.message.includes('already exists')) {
        console.log('ℹ️  Enrollment unique constraint:', err.message.split('\n')[0]);
      }
    });

    console.log('✓ Database constraints applied');

    // 5. Create indexes for performance
    console.log('\n⚡ Creating database indexes...');
    
    const indexes = [
      `CREATE INDEX IF NOT EXISTS idx_user_email ON "Users"("email")`,
      `CREATE INDEX IF NOT EXISTS idx_student_school ON "Students"("schoolId")`,
      `CREATE INDEX IF NOT EXISTS idx_attendance_student ON "Attendances"("studentId")`,
      `CREATE INDEX IF NOT EXISTS idx_mark_exam ON "Marks"("examId")`,
      `CREATE INDEX IF NOT EXISTS idx_payment_student ON "Payments"("studentId")`,
      `CREATE INDEX IF NOT EXISTS idx_audit_user ON "AuditLogs"("userId")`,
    ];

    for (const index of indexes) {
      await sequelize.query(index).catch(err => {
        if (!err.message.includes('already exists')) {
          console.log('ℹ️  Index creation info:', err.message.split('\n')[0]);
        }
      });
    }
    
    console.log('✓ Database indexes created');

    console.log('\n' + '='.repeat(50));
    console.log('✅ Database initialization completed successfully!');
    console.log('='.repeat(50) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();
