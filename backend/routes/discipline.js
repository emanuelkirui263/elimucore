const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');

module.exports = (db) => {
  const router = express.Router();

  // ========== DISCIPLINE CASE ENDPOINTS ==========

  // Create discipline case
  router.post('/', authenticate, authorize('ADMIN', 'PRINCIPAL', 'DEPUTY_ADMIN', 'CLASS_TEACHER'), async (req, res) => {
    try {
      const { studentId, incidentDate, incidentType, description, witnesses } = req.body;

      if (!studentId || !incidentDate || !incidentType || !description) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const student = await db.models.Student.findByPk(studentId);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const disciplineCase = await db.models.DisciplineCase.create({
        studentId,
        incidentDate: new Date(incidentDate),
        incidentType,
        description,
        witnesses: witnesses || [],
        reportedBy: req.user.id,
        reportDate: new Date(),
      });

      res.status(201).json(disciplineCase);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // List discipline cases
  router.get('/', authenticate, async (req, res) => {
    try {
      const { studentId, status, incidentType } = req.query;
      const where = {};

      if (studentId) where.studentId = studentId;
      if (status) where.status = status;
      if (incidentType) where.incidentType = incidentType;

      const cases = await db.models.DisciplineCase.findAll({
        where,
        include: [
          { model: db.models.Student, as: 'student' },
          { model: db.models.User, as: 'reportedByUser', attributes: ['id', 'email', 'name'] },
          { model: db.models.User, as: 'handledByUser', attributes: ['id', 'email', 'name'] },
        ],
        order: [['incidentDate', 'DESC']],
      });

      res.json(cases);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get discipline case by ID
  router.get('/:id', authenticate, async (req, res) => {
    try {
      const disciplineCase = await db.models.DisciplineCase.findByPk(req.params.id, {
        include: [
          { model: db.models.Student, as: 'student' },
          { model: db.models.User, as: 'reportedByUser', attributes: ['id', 'email', 'name'] },
          { model: db.models.User, as: 'handledByUser', attributes: ['id', 'email', 'name'] },
        ],
      });

      if (!disciplineCase) {
        return res.status(404).json({ error: 'Discipline case not found' });
      }

      res.json(disciplineCase);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update discipline case
  router.put('/:id', authenticate, authorize('ADMIN', 'PRINCIPAL', 'DEPUTY_ADMIN'), async (req, res) => {
    try {
      const disciplineCase = await db.models.DisciplineCase.findByPk(req.params.id);
      if (!disciplineCase) {
        return res.status(404).json({ error: 'Discipline case not found' });
      }

      const {
        action,
        actionDetails,
        suspensionStartDate,
        suspensionEndDate,
        status,
        handledBy,
        remarks,
      } = req.body;

      if (action) disciplineCase.action = action;
      if (actionDetails) disciplineCase.actionDetails = actionDetails;
      if (suspensionStartDate) disciplineCase.suspensionStartDate = suspensionStartDate;
      if (suspensionEndDate) disciplineCase.suspensionEndDate = suspensionEndDate;
      if (status) disciplineCase.status = status;
      if (handledBy) disciplineCase.handledBy = handledBy;
      if (remarks) disciplineCase.remarks = remarks;

      await disciplineCase.save();
      res.json(disciplineCase);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Notify parent
  router.post('/:id/notify-parent', authenticate, authorize('ADMIN', 'PRINCIPAL', 'DEPUTY_ADMIN'), async (req, res) => {
    try {
      const disciplineCase = await db.models.DisciplineCase.findByPk(req.params.id);
      if (!disciplineCase) {
        return res.status(404).json({ error: 'Discipline case not found' });
      }

      disciplineCase.parentNotified = true;
      disciplineCase.parentNotificationDate = new Date();
      await disciplineCase.save();

      // TODO: Send SMS/Email notification to parent

      res.json({ message: 'Parent notification sent', disciplineCase });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Record parent acknowledgment
  router.post('/:id/acknowledge', authenticate, async (req, res) => {
    try {
      const disciplineCase = await db.models.DisciplineCase.findByPk(req.params.id);
      if (!disciplineCase) {
        return res.status(404).json({ error: 'Discipline case not found' });
      }

      disciplineCase.parentAcknowledged = true;
      disciplineCase.parentAcknowledgmentDate = new Date();
      await disciplineCase.save();

      res.json({ message: 'Parent acknowledgment recorded', disciplineCase });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get discipline statistics by student
  router.get('/stats/student/:studentId', authenticate, async (req, res) => {
    try {
      const stats = await db.models.DisciplineCase.count({
        where: { studentId: req.params.studentId },
      });

      const byIncidentType = await db.sequelize.query(
        `SELECT incidentType, COUNT(*) as count FROM discipline_cases WHERE studentId = ? GROUP BY incidentType`,
        {
          replacements: [req.params.studentId],
          type: db.sequelize.QueryTypes.SELECT,
        }
      );

      res.json({ total: stats, byIncidentType });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
