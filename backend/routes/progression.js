const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');
const router = express.Router();

// POST - Create progression record
router.post('/progression', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'ACADEMIC_OFFICER']), async (req, res) => {
  try {
    const {
      studentId,
      academicYearId,
      classLevel,
      classStreamId,
      enrollmentType,
      previousAcademicYearId,
    } = req.body;
    const { schoolId } = req.user;

    if (!studentId || !academicYearId || !classLevel) {
      return res.status(400).json({ error: 'Missing required fields: studentId, academicYearId, classLevel' });
    }

    // Verify student exists
    const student = await req.app.get('db').Student.findOne({
      where: { id: studentId, schoolId },
    });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Check if progression already exists for this student + year
    const existing = await req.app.get('db').StudentProgression.findOne({
      where: {
        studentId,
        academicYearId,
      },
    });
    if (existing) {
      return res.status(409).json({ error: 'Progression record already exists for this student in this year' });
    }

    const progression = await req.app.get('db').StudentProgression.create({
      studentId,
      academicYearId,
      classLevel,
      classStreamId: classStreamId || null,
      enrollmentType: enrollmentType || 'NEW',
      previousAcademicYearId: previousAcademicYearId || null,
      schoolId,
      createdBy: req.user.id,
    });

    res.status(201).json({
      message: 'Progression record created successfully',
      progression,
    });
  } catch (error) {
    console.error('Create progression error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Progression history for a student
router.get('/:studentId/progression-history', authenticate, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { schoolId } = req.user;

    const progressions = await req.app.get('db').StudentProgression.findAll({
      where: { studentId, schoolId },
      include: [
        { model: req.app.get('db').AcademicYear, as: 'academicYear' },
        { model: req.app.get('db').ClassStream, as: 'classStream' },
      ],
      order: [['entryDate', 'ASC']],
    });

    if (progressions.length === 0) {
      return res.status(404).json({ error: 'No progression records found' });
    }

    res.json({
      studentId,
      progressionHistory: progressions,
    });
  } catch (error) {
    console.error('Fetch progression history error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Promote student to next form
router.post('/:studentId/progress-next-form', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'ACADEMIC_OFFICER']), async (req, res) => {
  try {
    const { studentId } = req.params;
    const { fromAcademicYearId, toAcademicYearId, newClassStreamId } = req.body;
    const { schoolId } = req.user;

    if (!fromAcademicYearId || !toAcademicYearId) {
      return res.status(400).json({ error: 'fromAcademicYearId and toAcademicYearId required' });
    }

    // Get current progression
    const currentProgression = await req.app.get('db').StudentProgression.findOne({
      where: { studentId, academicYearId: fromAcademicYearId, schoolId },
    });
    if (!currentProgression) {
      return res.status(404).json({ error: 'Current progression record not found' });
    }

    // Determine next class level
    const levelMap = { FORM_1: 'FORM_2', FORM_2: 'FORM_3', FORM_3: 'FORM_4' };
    const nextLevel = levelMap[currentProgression.classLevel];

    if (!nextLevel) {
      return res.status(400).json({ error: 'Cannot progress beyond Form 4 (student should graduate)' });
    }

    // Mark current progression as exited (graduated)
    currentProgression.exitDate = new Date();
    currentProgression.exitReason = 'PROGRESSED';
    await currentProgression.save();

    // Create new progression for next form
    const newProgression = await req.app.get('db').StudentProgression.create({
      studentId,
      academicYearId: toAcademicYearId,
      classLevel: nextLevel,
      classStreamId: newClassStreamId || currentProgression.classStreamId,
      enrollmentType: 'NEW',
      previousAcademicYearId: fromAcademicYearId,
      schoolId,
      createdBy: req.user.id,
    });

    // Update student's current class level
    const student = await req.app.get('db').Student.findByPk(studentId);
    student.classLevel = nextLevel;
    await student.save();

    res.json({
      message: 'Student promoted successfully',
      newProgression,
    });
  } catch (error) {
    console.error('Promote student error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Repeat form
router.post('/:studentId/repeat-form', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'ACADEMIC_OFFICER']), async (req, res) => {
  try {
    const { studentId } = req.params;
    const { currentAcademicYearId, repeatAcademicYearId, reason } = req.body;
    const { schoolId } = req.user;

    if (!currentAcademicYearId || !repeatAcademicYearId) {
      return res.status(400).json({ error: 'currentAcademicYearId and repeatAcademicYearId required' });
    }

    // Get current progression
    const currentProgression = await req.app.get('db').StudentProgression.findOne({
      where: { studentId, academicYearId: currentAcademicYearId, schoolId },
    });
    if (!currentProgression) {
      return res.status(404).json({ error: 'Current progression record not found' });
    }

    // Form 4 cannot repeat
    if (currentProgression.classLevel === 'FORM_4') {
      return res.status(400).json({ error: 'Form 4 students cannot repeat (must graduate or dropout)' });
    }

    // Mark current as incomplete
    currentProgression.exitDate = new Date();
    currentProgression.exitReason = 'INCOMPLETE';
    await currentProgression.save();

    // Create repeat progression
    const repeatProgression = await req.app.get('db').StudentProgression.create({
      studentId,
      academicYearId: repeatAcademicYearId,
      classLevel: currentProgression.classLevel,
      classStreamId: currentProgression.classStreamId,
      enrollmentType: 'REPEAT',
      previousAcademicYearId: currentAcademicYearId,
      schoolId,
      createdBy: req.user.id,
    });

    res.json({
      message: 'Repeat form created successfully',
      repeatProgression,
    });
  } catch (error) {
    console.error('Repeat form error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Suspend term (student absent due to illness/suspension)
router.post('/:studentId/suspend-term', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'ACADEMIC_OFFICER']), async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYearId, reason } = req.body;
    const { schoolId } = req.user;

    if (!academicYearId) {
      return res.status(400).json({ error: 'academicYearId required' });
    }

    const progression = await req.app.get('db').StudentProgression.findOne({
      where: { studentId, academicYearId, schoolId },
    });
    if (!progression) {
      return res.status(404).json({ error: 'Progression record not found' });
    }

    // Mark as suspended but not exited (will resume later)
    progression.enrollmentType = 'SKIP_TERM_RESUME';
    progression.approvalReason = reason || 'Term suspension';
    await progression.save();

    res.json({
      message: 'Term suspension recorded successfully',
      progression,
    });
  } catch (error) {
    console.error('Suspend term error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Resume after absence
router.post('/:studentId/resume-after-absence', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'ACADEMIC_OFFICER']), async (req, res) => {
  try {
    const { studentId } = req.params;
    const { suspendedAcademicYearId, resumeAcademicYearId } = req.body;
    const { schoolId } = req.user;

    if (!suspendedAcademicYearId || !resumeAcademicYearId) {
      return res.status(400).json({ error: 'suspendedAcademicYearId and resumeAcademicYearId required' });
    }

    // Get suspended progression
    const suspendedProgression = await req.app.get('db').StudentProgression.findOne({
      where: { studentId, academicYearId: suspendedAcademicYearId, schoolId },
    });
    if (!suspendedProgression) {
      return res.status(404).json({ error: 'Suspended progression record not found' });
    }

    // Create resume progression (same class level)
    const resumeProgression = await req.app.get('db').StudentProgression.create({
      studentId,
      academicYearId: resumeAcademicYearId,
      classLevel: suspendedProgression.classLevel,
      classStreamId: suspendedProgression.classStreamId,
      enrollmentType: 'SKIP_TERM_RESUME',
      previousAcademicYearId: suspendedAcademicYearId,
      schoolId,
      createdBy: req.user.id,
    });

    res.json({
      message: 'Student resumed successfully',
      resumeProgression,
    });
  } catch (error) {
    console.error('Resume after absence error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET - List repeaters in a class
router.get('/repeaters/:classStreamId', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'ACADEMIC_OFFICER']), async (req, res) => {
  try {
    const { classStreamId } = req.params;
    const { academicYearId } = req.query;
    const { schoolId } = req.user;

    if (!academicYearId) {
      return res.status(400).json({ error: 'academicYearId query parameter required' });
    }

    const repeaters = await req.app.get('db').StudentProgression.findAll({
      where: {
        classStreamId,
        academicYearId,
        enrollmentType: 'REPEAT',
        schoolId,
      },
      include: [
        { model: req.app.get('db').Student, as: 'student' },
        { model: req.app.get('db').AcademicYear, as: 'academicYear' },
      ],
    });

    res.json({
      classStreamId,
      academicYearId,
      repeaterCount: repeaters.length,
      repeaters,
    });
  } catch (error) {
    console.error('Fetch repeaters error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Progression statistics
router.get('/analytics/progression-stats', authenticate, authorize(['ADMIN', 'PRINCIPAL', 'ACADEMIC_OFFICER']), async (req, res) => {
  try {
    const { academicYearId } = req.query;
    const { schoolId } = req.user;

    if (!academicYearId) {
      return res.status(400).json({ error: 'academicYearId query parameter required' });
    }

    const allProgressions = await req.app.get('db').StudentProgression.findAll({
      where: { academicYearId, schoolId },
    });

    const stats = {
      totalStudents: allProgressions.length,
      byType: {},
      byLevel: {},
      byExitReason: {},
    };

    allProgressions.forEach(p => {
      // By enrollment type
      if (!stats.byType[p.enrollmentType]) stats.byType[p.enrollmentType] = 0;
      stats.byType[p.enrollmentType]++;

      // By class level
      if (!stats.byLevel[p.classLevel]) stats.byLevel[p.classLevel] = 0;
      stats.byLevel[p.classLevel]++;

      // By exit reason
      if (p.exitReason && p.exitReason !== 'NONE') {
        if (!stats.byExitReason[p.exitReason]) stats.byExitReason[p.exitReason] = 0;
        stats.byExitReason[p.exitReason]++;
      }
    });

    stats.percentages = {
      repeating: ((stats.byType['REPEAT'] || 0) / stats.totalStudents * 100).toFixed(2),
      transferred: ((stats.byType['TRANSFER_IN'] || 0) / stats.totalStudents * 100).toFixed(2),
    };

    res.json(stats);
  } catch (error) {
    console.error('Progression stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
