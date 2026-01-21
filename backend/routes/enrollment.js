const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');
const router = express.Router();

// POST - Enroll student in subject
router.post('/enrollment', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'ACADEMIC_OFFICER']), async (req, res) => {
  try {
    const { studentId, subjectId, classStreamId, academicYearId, isOptional } = req.body;
    const { schoolId } = req.user;

    if (!studentId || !subjectId || !classStreamId || !academicYearId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify student exists and belongs to school
    const student = await req.app.get('db').Student.findOne({
      where: { id: studentId, schoolId },
    });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Verify subject exists
    const subject = await req.app.get('db').Subject.findOne({
      where: { id: subjectId, schoolId },
    });
    if (!subject) return res.status(404).json({ error: 'Subject not found' });

    // Check if enrollment already exists
    const existing = await req.app.get('db').StudentSubjectEnrollment.findOne({
      where: {
        studentId,
        subjectId,
        academicYearId,
        classStreamId,
      },
    });
    if (existing) {
      return res.status(409).json({ error: 'Student already enrolled in this subject' });
    }

    const enrollment = await req.app.get('db').StudentSubjectEnrollment.create({
      studentId,
      subjectId,
      classStreamId,
      academicYearId,
      isOptional: isOptional || false,
      schoolId,
      createdBy: req.user.id,
    });

    res.status(201).json({
      message: 'Student enrolled successfully',
      enrollment,
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET - List subject enrollments for a student
router.get('/enrollment/:studentId', authenticate, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYearId } = req.query;
    const { schoolId } = req.user;

    const whereClause = { studentId, schoolId };
    if (academicYearId) whereClause.academicYearId = academicYearId;

    const enrollments = await req.app.get('db').StudentSubjectEnrollment.findAll({
      where: whereClause,
      include: [
        { model: req.app.get('db').Subject, as: 'subject' },
        { model: req.app.get('db').AcademicYear, as: 'academicYear' },
        { model: req.app.get('db').ClassStream, as: 'classStream' },
      ],
      order: [['enrolledDate', 'DESC']],
    });

    res.json(enrollments);
  } catch (error) {
    console.error('Fetch enrollments error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET - List all students in a class for a subject (class subject matrix)
router.get('/enrollment/class/:classStreamId', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'ACADEMIC_OFFICER']), async (req, res) => {
  try {
    const { classStreamId } = req.params;
    const { academicYearId } = req.query;
    const { schoolId } = req.user;

    if (!academicYearId) {
      return res.status(400).json({ error: 'academicYearId query parameter required' });
    }

    const enrollments = await req.app.get('db').StudentSubjectEnrollment.findAll({
      where: {
        classStreamId,
        academicYearId,
        schoolId,
      },
      include: [
        { model: req.app.get('db').Student, as: 'student', attributes: ['id', 'firstName', 'lastName', 'admissionNumber'] },
        { model: req.app.get('db').Subject, as: 'subject', attributes: ['id', 'name', 'code'] },
      ],
      order: [['subject', 'name', 'ASC'], ['student', 'firstName', 'ASC']],
    });

    // Group by subject for easier viewing
    const grouped = {};
    enrollments.forEach((e) => {
      const subjectId = e.subjectId;
      if (!grouped[subjectId]) {
        grouped[subjectId] = {
          subject: e.subject,
          students: [],
        };
      }
      grouped[subjectId].students.push({
        studentId: e.studentId,
        student: e.student,
        isOptional: e.isOptional,
        enrollmentStatus: e.enrollmentStatus,
      });
    });

    res.json(grouped);
  } catch (error) {
    console.error('Fetch class enrollments error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Update enrollment status
router.put('/enrollment/:enrollmentId', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'ACADEMIC_OFFICER']), async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { enrollmentStatus, approvalReason } = req.body;
    const { schoolId } = req.user;

    const enrollment = await req.app.get('db').StudentSubjectEnrollment.findOne({
      where: { id: enrollmentId, schoolId },
    });
    if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });

    if (enrollmentStatus) enrollment.enrollmentStatus = enrollmentStatus;
    if (approvalReason) enrollment.approvalReason = approvalReason;

    await enrollment.save();

    res.json({
      message: 'Enrollment updated successfully',
      enrollment,
    });
  } catch (error) {
    console.error('Update enrollment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Drop subject
router.post('/enrollment/:enrollmentId/drop', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'ACADEMIC_OFFICER']), async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { reason } = req.body;
    const { schoolId } = req.user;

    const enrollment = await req.app.get('db').StudentSubjectEnrollment.findOne({
      where: { id: enrollmentId, schoolId },
    });
    if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });

    if (enrollment.enrollmentStatus === 'DROPPED') {
      return res.status(400).json({ error: 'Subject already dropped' });
    }

    enrollment.enrollmentStatus = 'DROPPED';
    enrollment.droppedDate = new Date();
    enrollment.approvalReason = reason || 'Subject dropped';
    await enrollment.save();

    res.json({
      message: 'Subject dropped successfully',
      enrollment,
    });
  } catch (error) {
    console.error('Drop subject error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Substitute subject
router.post('/enrollment/:enrollmentId/substitute', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'ACADEMIC_OFFICER']), async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { replacementSubjectId, reason } = req.body;
    const { schoolId } = req.user;

    if (!replacementSubjectId) {
      return res.status(400).json({ error: 'replacementSubjectId required' });
    }

    const enrollment = await req.app.get('db').StudentSubjectEnrollment.findOne({
      where: { id: enrollmentId, schoolId },
    });
    if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });

    // Verify replacement subject exists
    const replacementSubject = await req.app.get('db').Subject.findOne({
      where: { id: replacementSubjectId, schoolId },
    });
    if (!replacementSubject) {
      return res.status(404).json({ error: 'Replacement subject not found' });
    }

    enrollment.enrollmentStatus = 'SUBSTITUTED';
    enrollment.droppedDate = new Date();
    enrollment.replacementSubjectId = replacementSubjectId;
    enrollment.approvalReason = reason || 'Subject substituted';
    await enrollment.save();

    res.json({
      message: 'Subject substituted successfully',
      enrollment,
    });
  } catch (error) {
    console.error('Substitute subject error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET - List optional subjects available for a class/subject
router.get('/subjects/optional', authenticate, async (req, res) => {
  try {
    const { classStreamId, academicYearId } = req.query;
    const { schoolId } = req.user;

    const whereClause = { schoolId, isOptional: true };

    const subjects = await req.app.get('db').Subject.findAll({
      where: whereClause,
      attributes: ['id', 'name', 'code', 'description'],
      order: [['name', 'ASC']],
    });

    res.json(subjects);
  } catch (error) {
    console.error('Fetch optional subjects error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Student subject enrollment report
router.get('/report/enrollment-status', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'ACADEMIC_OFFICER']), async (req, res) => {
  try {
    const { academicYearId, classStreamId } = req.query;
    const { schoolId } = req.user;

    if (!academicYearId) {
      return res.status(400).json({ error: 'academicYearId query parameter required' });
    }

    const whereClause = { schoolId, academicYearId };
    if (classStreamId) whereClause.classStreamId = classStreamId;

    const enrollments = await req.app.get('db').StudentSubjectEnrollment.findAll({
      where: whereClause,
      include: [
        { model: req.app.get('db').Student, as: 'student' },
        { model: req.app.get('db').Subject, as: 'subject' },
      ],
    });

    // Generate statistics
    const stats = {
      totalEnrollments: enrollments.length,
      activeEnrollments: enrollments.filter(e => e.enrollmentStatus === 'ACTIVE').length,
      droppedEnrollments: enrollments.filter(e => e.enrollmentStatus === 'DROPPED').length,
      substitutedEnrollments: enrollments.filter(e => e.enrollmentStatus === 'SUBSTITUTED').length,
      optionalTaken: enrollments.filter(e => e.isOptional).length,
      byStatus: {},
    };

    enrollments.forEach(e => {
      const status = e.enrollmentStatus;
      if (!stats.byStatus[status]) stats.byStatus[status] = 0;
      stats.byStatus[status]++;
    });

    res.json({
      stats,
      enrollments,
    });
  } catch (error) {
    console.error('Enrollment report error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
