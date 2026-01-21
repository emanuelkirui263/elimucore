const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { ReportCardGenerator, FeeStatementGenerator } = require('../utils/pdfGenerator');
const fs = require('fs');
const path = require('path');

module.exports = (db) => {
  const router = express.Router();

  // Generate report card PDF
  router.get('/report-card/:studentId/:examId', authenticate, async (req, res) => {
    try {
      const { studentId, examId } = req.params;

      // Verify access
      const student = await db.models.Student.findByPk(studentId);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const exam = await db.models.Exam.findByPk(examId);
      if (!exam) {
        return res.status(404).json({ error: 'Exam not found' });
      }

      // Get marks
      const marks = await db.models.Mark.findAll({
        where: {
          studentId,
          examId,
          status: 'APPROVED',
        },
        include: [
          { model: db.models.Subject, as: 'subject' },
          {
            model: db.models.User,
            attributes: ['firstName', 'lastName'],
            as: 'teacher',
          },
        ],
      });

      if (marks.length === 0) {
        return res.status(400).json({ error: 'No approved marks found for this exam' });
      }

      const school = await db.models.School.findByPk(student.schoolId);
      const marksData = marks.map((mark) => ({
        subjectName: mark.subject.name,
        marksObtained: mark.marksObtained,
        grade: mark.grade,
        teacherName: mark.teacher ? `${mark.teacher.firstName} ${mark.teacher.lastName}` : 'N/A',
      }));

      const generator = new ReportCardGenerator();
      const filepath = await generator.generateReportCard(student.toJSON(), marksData, school.toJSON());

      res.download(filepath, `report_card_${studentId}.pdf`, (err) => {
        if (err) console.error('Download error:', err);
        // Optionally delete after download
        // fs.unlink(filepath, () => {});
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Generate fee statement PDF
  router.get('/fee-statement/:studentId', authenticate, async (req, res) => {
    try {
      const { studentId } = req.params;

      const student = await db.models.Student.findByPk(studentId);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const account = await db.models.StudentAccount.findOne({
        where: { studentId },
      });

      if (!account) {
        return res.status(400).json({ error: 'No fee account found' });
      }

      const school = await db.models.School.findByPk(student.schoolId);

      const generator = new FeeStatementGenerator();
      const filepath = await generator.generateFeeStatement(
        student.toJSON(),
        account.toJSON(),
        school.toJSON()
      );

      res.download(filepath, `fee_statement_${studentId}.pdf`, (err) => {
        if (err) console.error('Download error:', err);
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all reports list
  router.get('/', authenticate, authorize('ADMIN', 'PRINCIPAL', 'BURSAR'), async (req, res) => {
    try {
      const reportsDir = path.join(__dirname, '../reports');

      if (!fs.existsSync(reportsDir)) {
        return res.json({ reports: [] });
      }

      const files = fs.readdirSync(reportsDir);
      const reports = files
        .filter((file) => file.endsWith('.pdf'))
        .map((file) => ({
          name: file,
          path: `/api/reports/download/${file}`,
          created: fs.statSync(path.join(reportsDir, file)).birthtime,
        }))
        .sort((a, b) => b.created - a.created);

      res.json({ reports });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Download report
  router.get('/download/:filename', authenticate, (req, res) => {
    try {
      const { filename } = req.params;
      const filepath = path.join(__dirname, '../reports', filename);

      // Prevent directory traversal
      if (!filepath.startsWith(path.join(__dirname, '../reports'))) {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (!fs.existsSync(filepath)) {
        return res.status(404).json({ error: 'Report not found' });
      }

      res.download(filepath);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Batch reports (e.g., all report cards for a class)
  router.post('/batch/report-cards', authenticate, authorize('ADMIN', 'PRINCIPAL', 'DEPUTY_ACADEMIC'), async (req, res) => {
    try {
      const { classStreamId, examId } = req.body;

      if (!classStreamId || !examId) {
        return res.status(400).json({ error: 'classStreamId and examId are required' });
      }

      const students = await db.models.Student.findAll({
        where: { classStreamId },
      });

      if (students.length === 0) {
        return res.status(400).json({ error: 'No students found in this class' });
      }

      const reportPaths = [];

      for (const student of students) {
        try {
          const marks = await db.models.Mark.findAll({
            where: { studentId: student.id, examId, status: 'APPROVED' },
            include: [{ model: db.models.Subject, as: 'subject' }],
          });

          if (marks.length > 0) {
            const school = await db.models.School.findByPk(student.schoolId);
            const marksData = marks.map((mark) => ({
              subjectName: mark.subject.name,
              marksObtained: mark.marksObtained,
              grade: mark.grade,
            }));

            const generator = new ReportCardGenerator();
            const filepath = await generator.generateReportCard(student.toJSON(), marksData, school.toJSON());
            reportPaths.push(filepath);
          }
        } catch (err) {
          console.error(`Error generating report for student ${student.id}:`, err);
        }
      }

      res.json({
        message: `${reportPaths.length} report cards generated`,
        count: reportPaths.length,
        reports: reportPaths.map((p) => path.basename(p)),
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
