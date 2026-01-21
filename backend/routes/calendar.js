const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');

module.exports = (db) => {
  const router = express.Router();

  // ========== ACADEMIC YEAR ENDPOINTS ==========

  // Create academic year
  router.post('/', authenticate, authorize('ADMIN', 'PRINCIPAL'), async (req, res) => {
    try {
      const { year, startDate, endDate, description } = req.body;

      if (!year || !startDate || !endDate) {
        return res.status(400).json({ error: 'Year, startDate, and endDate are required' });
      }

      const existing = await db.models.AcademicYear.findOne({ where: { year } });
      if (existing) {
        return res.status(409).json({ error: 'Academic year already exists' });
      }

      const academicYear = await db.models.AcademicYear.create({
        year,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        description,
        createdBy: req.user.id,
      });

      res.status(201).json(academicYear);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // List academic years
  router.get('/', authenticate, async (req, res) => {
    try {
      const years = await db.models.AcademicYear.findAll({
        order: [['year', 'DESC']],
      });
      res.json(years);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get academic year by ID
  router.get('/:id', authenticate, async (req, res) => {
    try {
      const year = await db.models.AcademicYear.findByPk(req.params.id, {
        include: [{ model: db.models.Term, as: 'terms' }],
      });

      if (!year) {
        return res.status(404).json({ error: 'Academic year not found' });
      }

      res.json(year);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update academic year
  router.put('/:id', authenticate, authorize('ADMIN', 'PRINCIPAL'), async (req, res) => {
    try {
      const year = await db.models.AcademicYear.findByPk(req.params.id);
      if (!year) {
        return res.status(404).json({ error: 'Academic year not found' });
      }

      const { startDate, endDate, description, isActive, isClosed } = req.body;

      if (startDate) year.startDate = startDate;
      if (endDate) year.endDate = endDate;
      if (description) year.description = description;
      if (isActive !== undefined) year.isActive = isActive;
      if (isClosed !== undefined) year.isClosed = isClosed;

      await year.save();
      res.json(year);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Set active academic year
  router.post('/:id/activate', authenticate, authorize('ADMIN', 'PRINCIPAL'), async (req, res) => {
    try {
      const year = await db.models.AcademicYear.findByPk(req.params.id);
      if (!year) {
        return res.status(404).json({ error: 'Academic year not found' });
      }

      // Deactivate all other years
      await db.models.AcademicYear.update({ isActive: false }, { where: {} });

      // Activate this year
      year.isActive = true;
      await year.save();

      res.json({ message: 'Academic year activated', year });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Lock academic year
  router.post('/:id/lock', authenticate, authorize('ADMIN', 'PRINCIPAL'), async (req, res) => {
    try {
      const year = await db.models.AcademicYear.findByPk(req.params.id);
      if (!year) {
        return res.status(404).json({ error: 'Academic year not found' });
      }

      year.isClosed = true;
      await year.save();

      res.json({ message: 'Academic year locked', year });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== TERM ENDPOINTS ==========

  // Create term
  router.post('/term', authenticate, authorize('ADMIN', 'PRINCIPAL'), async (req, res) => {
    try {
      const { academicYearId, termNumber, name, startDate, endDate, examStartDate, examEndDate } = req.body;

      if (!academicYearId || !termNumber || !name || !startDate || !endDate) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const year = await db.models.AcademicYear.findByPk(academicYearId);
      if (!year) {
        return res.status(404).json({ error: 'Academic year not found' });
      }

      const existing = await db.models.Term.findOne({
        where: { academicYearId, termNumber },
      });

      if (existing) {
        return res.status(409).json({ error: 'Term already exists for this academic year' });
      }

      const term = await db.models.Term.create({
        academicYearId,
        termNumber,
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        examStartDate: examStartDate ? new Date(examStartDate) : null,
        examEndDate: examEndDate ? new Date(examEndDate) : null,
        createdBy: req.user.id,
      });

      res.status(201).json(term);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // List terms for academic year
  router.get('/year/:academicYearId', authenticate, async (req, res) => {
    try {
      const terms = await db.models.Term.findAll({
        where: { academicYearId: req.params.academicYearId },
        order: [['termNumber', 'ASC']],
      });
      res.json(terms);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update term
  router.put('/term/:id', authenticate, authorize('ADMIN', 'PRINCIPAL'), async (req, res) => {
    try {
      const term = await db.models.Term.findByPk(req.params.id);
      if (!term) {
        return res.status(404).json({ error: 'Term not found' });
      }

      const { name, startDate, endDate, examStartDate, examEndDate, isActive, status } = req.body;

      if (name) term.name = name;
      if (startDate) term.startDate = startDate;
      if (endDate) term.endDate = endDate;
      if (examStartDate) term.examStartDate = examStartDate;
      if (examEndDate) term.examEndDate = examEndDate;
      if (isActive !== undefined) term.isActive = isActive;
      if (status) term.status = status;

      await term.save();
      res.json(term);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Set active term
  router.post('/term/:id/activate', authenticate, authorize('ADMIN', 'PRINCIPAL'), async (req, res) => {
    try {
      const term = await db.models.Term.findByPk(req.params.id);
      if (!term) {
        return res.status(404).json({ error: 'Term not found' });
      }

      // Deactivate all other terms in this year
      await db.models.Term.update(
        { isActive: false },
        { where: { academicYearId: term.academicYearId } }
      );

      term.isActive = true;
      await term.save();

      res.json({ message: 'Term activated', term });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
