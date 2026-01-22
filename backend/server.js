require('express-async-errors');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const sequelize = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');

// Import models
const User = require('./models/User');
const School = require('./models/School');
const Student = require('./models/Student');
const Subject = require('./models/Subject');
const Exam = require('./models/Exam');
const Mark = require('./models/Mark');
const FeeStructure = require('./models/FeeStructure');
const StudentAccount = require('./models/StudentAccount');
const Payment = require('./models/Payment');
const Attendance = require('./models/Attendance');
const AuditLog = require('./models/AuditLog');

// Initialize factory pattern models
const AcademicYear = require('./models/AcademicYear')(sequelize);
const Term = require('./models/Term')(sequelize);
const ClassStream = require('./models/ClassStream')(sequelize);
const StudentTransfer = require('./models/StudentTransfer')(sequelize);
const DisciplineCase = require('./models/DisciplineCase')(sequelize);
const Timetable = require('./models/Timetable')(sequelize);
const Book = require('./models/Book')(sequelize);
const BookIssue = require('./models/BookIssue')(sequelize);
const StudentSubjectEnrollment = require('./models/StudentSubjectEnrollment')(sequelize);
const StudentProgression = require('./models/StudentProgression')(sequelize);

// Import routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const academicsRoutes = require('./routes/academics');
const financeRoutes = require('./routes/finance');
const attendanceRoutes = require('./routes/attendance');
const payrollRoutes = require('./routes/payroll');
const communicationRoutes = require('./routes/communication');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin');
const calendarRoutes = require('./routes/calendar');
const disciplineRoutes = require('./routes/discipline');
const libraryRoutes = require('./routes/library');
const transfersRoutes = require('./routes/transfers');
const reportsRoutes = require('./routes/reports');
const enrollmentRoutes = require('./routes/enrollment');
const progressionRoutes = require('./routes/progression');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(requestLogger);

// Setup model associations
Mark.belongsTo(Exam);
Mark.belongsTo(Subject);
Mark.belongsTo(Student);
Exam.hasMany(Mark);
Subject.hasMany(Mark);
Student.hasMany(Mark);

StudentAccount.belongsTo(Student);
Student.hasOne(StudentAccount);

Payment.belongsTo(Student);
Student.hasMany(Payment);

Attendance.belongsTo(Student);
Student.hasMany(Attendance);

School.hasMany(User);
User.belongsTo(School);

School.hasMany(Student);
Student.belongsTo(School);

AuditLog.belongsTo(User);
User.hasMany(AuditLog);

// New model associations
Student.belongsTo(AcademicYear);
AcademicYear.hasMany(Student);

Student.belongsTo(ClassStream);
ClassStream.hasMany(Student);

Term.belongsTo(AcademicYear);
AcademicYear.hasMany(Term, { as: 'terms' });

ClassStream.belongsTo(AcademicYear);
ClassStream.belongsTo(School);

StudentTransfer.belongsTo(Student);
Student.hasMany(StudentTransfer);

StudentTransfer.belongsTo(School, { as: 'fromSchool', foreignKey: 'fromSchoolId' });
StudentTransfer.belongsTo(School, { as: 'toSchool', foreignKey: 'toSchoolId' });

DisciplineCase.belongsTo(Student);
Student.hasMany(DisciplineCase);

DisciplineCase.belongsTo(User, { as: 'reportedByUser', foreignKey: 'reportedBy' });
DisciplineCase.belongsTo(User, { as: 'handledByUser', foreignKey: 'handledBy' });

Timetable.belongsTo(ClassStream);
ClassStream.hasMany(Timetable);

Timetable.belongsTo(Term);
Term.hasMany(Timetable);

Timetable.belongsTo(Subject);
Subject.hasMany(Timetable);

Timetable.belongsTo(User, { as: 'teacher', foreignKey: 'teacherId' });

Book.belongsTo(School);
School.hasMany(Book);

BookIssue.belongsTo(Book, { as: 'book' });
Book.hasMany(BookIssue);

BookIssue.belongsTo(Student, { as: 'student' });
Student.hasMany(BookIssue);

BookIssue.belongsTo(User, { as: 'issuedByUser', foreignKey: 'issuedBy' });
BookIssue.belongsTo(User, { as: 'receivedByUser', foreignKey: 'receivedBy' });

// Subject Enrollment associations
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

// Student Progression associations
StudentProgression.belongsTo(Student);
Student.hasMany(StudentProgression);

StudentProgression.belongsTo(AcademicYear, { as: 'academicYear' });
AcademicYear.hasMany(StudentProgression);

StudentProgression.belongsTo(ClassStream, { as: 'classStream' });
ClassStream.hasMany(StudentProgression);

StudentProgression.belongsTo(School);
School.hasMany(StudentProgression);

StudentProgression.belongsTo(User, { as: 'createdByUser', foreignKey: 'createdBy' });

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/academics', academicsRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/calendar', calendarRoutes(sequelize));
app.use('/api/discipline', disciplineRoutes(sequelize));
app.use('/api/library', libraryRoutes(sequelize));
app.use('/api/transfers', transfersRoutes(sequelize));
app.use('/api/reports', reportsRoutes(sequelize));
app.use('/api/academics/enrollment', enrollmentRoutes);
app.use('/api/students', progressionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Global error handler
app.use(errorHandler);

// Database sync and server start
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');

    // Only sync models in production
    if (process.env.NODE_ENV === 'production') {
      await sequelize.sync({ alter: false });
      console.log('Database models synchronized');
    }

    app.listen(PORT, () => {
      console.log(`🚀 ELIMUCORE Server running on port ${PORT}`);
      console.log(`📊 API Documentation: http://localhost:${PORT}/api`);
      console.log(`❤️  Made with love for Kenyan Education`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
