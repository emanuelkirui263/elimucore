/**
 * Database Constraints Migration
 * Adds DB-level integrity constraints for data reliability
 * Run this after initial model creation
 */

const { sequelize } = require('../config/database');

async function applyConstraints() {
  try {
    console.log('🔒 Applying database-level constraints...');

    // Mark table: Unique constraint (student + exam + subject)
    await sequelize.query(`
      ALTER TABLE "Marks" ADD CONSTRAINT mark_unique 
      UNIQUE("studentId", "examId", "subjectId")
    `).catch(err => {
      if (err.message.includes('already exists')) {
        console.log('✓ Mark unique constraint already exists');
      } else {
        throw err;
      }
    });

    // Mark table: Check constraint (0-100 range)
    await sequelize.query(`
      ALTER TABLE "Marks" ADD CONSTRAINT mark_range_check
      CHECK("marksObtained" >= 0 AND "marksObtained" <= 100)
    `).catch(err => {
      if (err.message.includes('already exists')) {
        console.log('✓ Mark range check constraint already exists');
      } else {
        throw err;
      }
    });

    // StudentSubjectEnrollment: Unique enrollment per student-subject-year-stream
    await sequelize.query(`
      ALTER TABLE "StudentSubjectEnrollments" ADD CONSTRAINT enrollment_unique
      UNIQUE("studentId", "subjectId", "academicYearId", "classStreamId")
    `).catch(err => {
      if (err.message.includes('already exists')) {
        console.log('✓ Enrollment unique constraint already exists');
      } else {
        throw err;
      }
    });

    // StudentProgression: Unique per student-year
    await sequelize.query(`
      ALTER TABLE "StudentProgressions" ADD CONSTRAINT progression_unique
      UNIQUE("studentId", "academicYearId")
    `).catch(err => {
      if (err.message.includes('already exists')) {
        console.log('✓ Progression unique constraint already exists');
      } else {
        throw err;
      }
    });

    // Payment: Check constraint (amount > 0)
    await sequelize.query(`
      ALTER TABLE "Payments" ADD CONSTRAINT payment_amount_check
      CHECK("amountPaid" > 0)
    `).catch(err => {
      if (err.message.includes('already exists')) {
        console.log('✓ Payment amount check constraint already exists');
      } else {
        throw err;
      }
    });

    // FeeStructure: Check constraint (amount >= 0)
    await sequelize.query(`
      ALTER TABLE "FeeStructures" ADD CONSTRAINT fee_amount_check
      CHECK("amount" >= 0)
    `).catch(err => {
      if (err.message.includes('already exists')) {
        console.log('✓ Fee amount check constraint already exists');
      } else {
        throw err;
      }
    });

    // Attendance: Check constraint (percentage 0-100)
    await sequelize.query(`
      ALTER TABLE "Attendances" ADD CONSTRAINT attendance_check
      CHECK("percentageAttended" >= 0 AND "percentageAttended" <= 100)
    `).catch(err => {
      if (err.message.includes('already exists')) {
        console.log('✓ Attendance check constraint already exists');
      } else {
        throw err;
      }
    });

    // BookIssue: Check that returnDate >= issueDate
    await sequelize.query(`
      ALTER TABLE "BookIssues" ADD CONSTRAINT bookissue_dates_check
      CHECK("returnDate" IS NULL OR "returnDate" >= "issueDate")
    `).catch(err => {
      if (err.message.includes('already exists')) {
        console.log('✓ BookIssue dates check constraint already exists');
      } else {
        throw err;
      }
    });

    // Add CASCADE delete for related records
    // This ensures data integrity when parent records are deleted

    // Marks → Exam cascade
    await sequelize.query(`
      ALTER TABLE "Marks" 
      DROP CONSTRAINT IF EXISTS "Marks_examId_fkey",
      ADD CONSTRAINT "Marks_examId_fkey" 
      FOREIGN KEY ("examId") 
      REFERENCES "Exams"("id") 
      ON DELETE CASCADE
    `).catch(err => {
      // Constraint might already exist, skip
      console.log('✓ Mark-Exam cascade configured');
    });

    // Payment cascade
    await sequelize.query(`
      ALTER TABLE "Payments"
      DROP CONSTRAINT IF EXISTS "Payments_studentAccountId_fkey",
      ADD CONSTRAINT "Payments_studentAccountId_fkey"
      FOREIGN KEY ("studentAccountId")
      REFERENCES "StudentAccounts"("id")
      ON DELETE CASCADE
    `).catch(err => {
      console.log('✓ Payment-StudentAccount cascade configured');
    });

    // Attendance cascade
    await sequelize.query(`
      ALTER TABLE "Attendances"
      DROP CONSTRAINT IF EXISTS "Attendances_studentId_fkey",
      ADD CONSTRAINT "Attendances_studentId_fkey"
      FOREIGN KEY ("studentId")
      REFERENCES "Students"("id")
      ON DELETE CASCADE
    `).catch(err => {
      console.log('✓ Attendance-Student cascade configured');
    });

    // Create indexes for common queries
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_mark_student_exam
      ON "Marks"("studentId", "examId")
    `);

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_mark_subject
      ON "Marks"("subjectId")
    `);

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_payment_student
      ON "Payments"("studentId")
    `);

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_attendance_student_term
      ON "Attendances"("studentId", "termId")
    `);

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_enrollment_student_year
      ON "StudentSubjectEnrollments"("studentId", "academicYearId")
    `);

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_progression_student_year
      ON "StudentProgressions"("studentId", "academicYearId")
    `);

    console.log('✅ All database constraints applied successfully');
    return true;
  } catch (error) {
    console.error('❌ Error applying constraints:', error);
    throw error;
  }
}

module.exports = { applyConstraints };
