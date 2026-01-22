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

    // 3. Sync database (create tables if not exist)
    console.log('\n📊 Syncing database schema...');
    await sequelize.sync({ alter: true });
    console.log('✓ Models synced');

    // 4. Apply constraints only in production (for SQLite, skip)
    if (process.env.NODE_ENV === 'production') {
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
        try {
          await sequelize.query(index);
        } catch (err) {
          if (!err.message.includes('already exists')) {
            console.log('ℹ️  Index creation info:', err.message.split('\n')[0]);
          }
        }
      }

      console.log('✓ Database indexes created');
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Database initialization completed successfully!');
    console.log('='.repeat(50) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }

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

      // 3. Sync database (create tables if not exist)
      console.log('\n📊 Syncing database schema...');
      await sequelize.sync({ alter: true });
      console.log('✓ Models synced');

    // 4. Skip constraint application for SQLite (use production only)
    if (process.env.NODE_ENV === 'production') {
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
      try {
        await sequelize.query(index);
      } catch (err) {
        if (!err.message.includes('already exists')) {
          console.log('ℹ️  Index creation info:', err.message.split('\n')[0]);
        }
      }
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
