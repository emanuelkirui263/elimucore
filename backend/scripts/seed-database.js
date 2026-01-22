#!/usr/bin/env node

/**
 * Database Seeder Script
 * Seeds database with demo data for testing
 * Usage: node scripts/seed-database.js
 */

require('dotenv').config();
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

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

async function seedDatabase() {
  try {
    console.log('\n🌱 ELIMUCORE Database Seeder');
    console.log('='.repeat(50));

    // 1. Create demo school
    console.log('\n📚 Creating demo school...');
    const school = await School.create({
      name: 'ELIMUCORE Demo High School',
      registrationNumber: 'REG/2025/001',
      county: 'Nairobi',
      subcounty: 'Nairobi',
      address: '123 Education Lane, Nairobi',
      phone: '+254712345678',
      email: 'admin@elimucore-demo.edu.ke',
      principalName: 'Dr. John Kamau',
    });
    console.log('✓ School created:', school.name);

    // 2. Create academic year
    console.log('\n📅 Creating academic year...');
    const academicYear = await AcademicYear.create({
      year: 2025,
      startDate: new Date('2025-01-13'),
      endDate: new Date('2025-12-19'),
      isActive: true,
    });
    console.log('✓ Academic year created:', academicYear.year);

    // 3. Create terms
    console.log('\n📋 Creating terms...');
    const term1 = await Term.create({
      name: 'Term 1',
      startDate: new Date('2025-01-13'),
      endDate: new Date('2025-04-04'),
      academicYearId: academicYear.id,
    });
    const term2 = await Term.create({
      name: 'Term 2',
      startDate: new Date('2025-04-21'),
      endDate: new Date('2025-08-15'),
      academicYearId: academicYear.id,
    });
    const term3 = await Term.create({
      name: 'Term 3',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2025-12-19'),
      academicYearId: academicYear.id,
    });
    console.log('✓ Terms created: Term 1, Term 2, Term 3');

    // 4. Create class streams
    console.log('\n🏫 Creating class streams...');
    const classStreams = await Promise.all([
      ClassStream.create({
        name: 'Form 1A',
        form: 1,
        capacity: 50,
        academicYearId: academicYear.id,
        schoolId: school.id,
      }),
      ClassStream.create({
        name: 'Form 1B',
        form: 1,
        capacity: 50,
        academicYearId: academicYear.id,
        schoolId: school.id,
      }),
      ClassStream.create({
        name: 'Form 4A',
        form: 4,
        capacity: 45,
        academicYearId: academicYear.id,
        schoolId: school.id,
      }),
    ]);
    console.log('✓ Class streams created:', classStreams.map(cs => cs.name).join(', '));

    // 5. Create subjects
    console.log('\n📖 Creating subjects...');
    const subjects = await Promise.all([
      Subject.create({ name: 'Mathematics', code: 'MATH', maxMarks: 100 }),
      Subject.create({ name: 'English', code: 'ENG', maxMarks: 100 }),
      Subject.create({ name: 'Physics', code: 'PHY', maxMarks: 100 }),
      Subject.create({ name: 'Chemistry', code: 'CHEM', maxMarks: 100 }),
      Subject.create({ name: 'Biology', code: 'BIO', maxMarks: 100 }),
      Subject.create({ name: 'History', code: 'HIST', maxMarks: 100 }),
      Subject.create({ name: 'Geography', code: 'GEO', maxMarks: 100 }),
      Subject.create({ name: 'Computer Science', code: 'CS', maxMarks: 100 }),
    ]);
    console.log('✓ Subjects created:', subjects.map(s => s.name).join(', '));

    // 6. Create admin user
    console.log('\n👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin@123', 10);
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@elimucore.app',
      password: hashedPassword,
      phoneNumber: '+254712345678',
      role: 'admin',
      schoolId: school.id,
      isActive: true,
    });
    console.log('✓ Admin user created:', admin.email);

    // 7. Create teacher user
    console.log('\n👨‍🏫 Creating teacher user...');
    const teacherPassword = await bcrypt.hash('teacher@123', 10);
    const teacher = await User.create({
      firstName: 'John',
      lastName: 'Mwangi',
      email: 'teacher@elimucore.app',
      password: teacherPassword,
      phoneNumber: '+254787654321',
      role: 'teacher',
      schoolId: school.id,
      isActive: true,
    });
    console.log('✓ Teacher user created:', teacher.email);

    // 8. Create students
    console.log('\n👨‍🎓 Creating demo students...');
    const students = [];
    const names = [
      { first: 'Peter', last: 'Kamau' },
      { first: 'Mary', last: 'Wanjiru' },
      { first: 'James', last: 'Kipchoge' },
      { first: 'Alice', last: 'Omondi' },
      { first: 'David', last: 'Muriuki' },
      { first: 'Sarah', last: 'Muthoni' },
      { first: 'Michael', last: 'Kiplagat' },
      { first: 'Jessica', last: 'Otieno' },
      { first: 'Kevin', last: 'Koech' },
      { first: 'Lisa', last: 'Mutua' },
    ];

    for (let i = 0; i < names.length; i++) {
      const student = await Student.create({
        admissionNumber: `ADM/2025/${1001 + i}`,
        firstName: names[i].first,
        lastName: names[i].last,
        dateOfBirth: new Date('2005-06-15'),
        gender: i % 2 === 0 ? 'M' : 'F',
        parentName: names[i].first + ' (Parent)',
        parentPhoneNumber: '+254700000000',
        schoolId: school.id,
        classStreamId: classStreams[Math.floor(i / 5)].id,
        academicYearId: academicYear.id,
      });
      students.push(student);
    }
    console.log(`✓ Created ${students.length} demo students`);

    // 9. Create exams
    console.log('\n📝 Creating exams...');
    const exams = await Promise.all([
      Exam.create({
        name: 'Term 1 Midterm',
        examType: 'midterm',
        date: new Date('2025-02-15'),
        totalMarks: 100,
      }),
      Exam.create({
        name: 'Term 1 Final',
        examType: 'final',
        date: new Date('2025-03-28'),
        totalMarks: 100,
      }),
      Exam.create({
        name: 'Mock Exams',
        examType: 'mock',
        date: new Date('2025-11-01'),
        totalMarks: 100,
      }),
    ]);
    console.log('✓ Exams created:', exams.map(e => e.name).join(', '));

    // 10. Create sample marks
    console.log('\n📊 Creating sample marks...');
    let markCount = 0;
    for (const student of students.slice(0, 5)) {
      for (const exam of exams.slice(0, 2)) {
        for (const subject of subjects.slice(0, 4)) {
          await Mark.create({
            studentId: student.id,
            examId: exam.id,
            subjectId: subject.id,
            marksObtained: Math.floor(Math.random() * 100) + 1,
            gradePoint: Math.floor(Math.random() * 9) + 1,
          });
          markCount++;
        }
      }
    }
    console.log(`✓ Created ${markCount} sample marks`);

    // 11. Create sample attendance
    console.log('\n✅ Creating sample attendance...');
    let attendanceCount = 0;
    for (const student of students.slice(0, 5)) {
      for (let day = 1; day <= 20; day++) {
        await Attendance.create({
          studentId: student.id,
          date: new Date(2025, 0, day),
          status: Math.random() > 0.1 ? 'present' : 'absent',
          remarks: Math.random() > 0.95 ? 'Late arrival' : null,
        });
        attendanceCount++;
      }
    }
    console.log(`✓ Created ${attendanceCount} attendance records`);

    // 12. Create student accounts
    console.log('\n💰 Creating student accounts...');
    for (const student of students.slice(0, 5)) {
      await StudentAccount.create({
        studentId: student.id,
        accountNumber: `ACC/2025/${student.id}`,
        balance: Math.random() * 50000,
        totalDeposits: 50000,
        totalWithdrawals: Math.random() * 50000,
      });
    }
    console.log('✓ Student accounts created');

    // 13. Create audit logs
    console.log('\n📋 Creating audit logs...');
    await AuditLog.create({
      userId: admin.id,
      action: 'DATABASE_SEEDING',
      tableName: 'multiple',
      recordId: null,
      oldValue: null,
      newValue: 'Database seeding completed with demo data',
      ipAddress: '127.0.0.1',
      userAgent: 'Seeding Script',
    });
    console.log('✓ Audit logs created');

    console.log('\n' + '='.repeat(50));
    console.log('✅ Database seeding completed successfully!');
    console.log('='.repeat(50));
    console.log('\n📚 Demo Credentials:');
    console.log('  Admin Email: admin@elimucore.app');
    console.log('  Admin Password: admin@123');
    console.log('  Teacher Email: teacher@elimucore.app');
    console.log('  Teacher Password: teacher@123');
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database seeding failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
