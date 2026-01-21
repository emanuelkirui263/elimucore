const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');

module.exports = (db) => {
  const router = express.Router();

  // Request transfer out
  router.post('/out', authenticate, authorize('ADMIN', 'PRINCIPAL'), async (req, res) => {
    try {
      const { studentId, toSchoolId, transferDate, reason } = req.body;

      if (!studentId || !toSchoolId || !transferDate) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const student = await db.models.Student.findByPk(studentId);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const transfer = await db.models.StudentTransfer.create({
        studentId,
        transferType: 'OUT',
        fromSchoolId: student.schoolId,
        toSchoolId,
        transferDate: new Date(transferDate),
        reason,
        createdBy: req.user.id,
      });

      res.status(201).json(transfer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Request transfer in
  router.post('/in', authenticate, authorize('ADMIN', 'PRINCIPAL'), async (req, res) => {
    try {
      const { studentId, fromSchoolId, transferDate, reason } = req.body;

      if (!studentId || !fromSchoolId || !transferDate) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const student = await db.models.Student.findByPk(studentId);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const transfer = await db.models.StudentTransfer.create({
        studentId,
        transferType: 'IN',
        fromSchoolId,
        toSchoolId: student.schoolId,
        transferDate: new Date(transferDate),
        reason,
        createdBy: req.user.id,
      });

      res.status(201).json(transfer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // List transfers
  router.get('/', authenticate, async (req, res) => {
    try {
      const { studentId, transferType, status } = req.query;
      const where = {};

      if (studentId) where.studentId = studentId;
      if (transferType) where.transferType = transferType;
      if (status) where.status = status;

      const transfers = await db.models.StudentTransfer.findAll({
        where,
        include: [
          { model: db.models.Student, as: 'student' },
          { model: db.models.School, as: 'fromSchool', attributes: ['id', 'name'] },
          { model: db.models.School, as: 'toSchool', attributes: ['id', 'name'] },
        ],
        order: [['transferDate', 'DESC']],
      });

      res.json(transfers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get transfer by ID
  router.get('/:id', authenticate, async (req, res) => {
    try {
      const transfer = await db.models.StudentTransfer.findByPk(req.params.id, {
        include: [
          { model: db.models.Student, as: 'student' },
          { model: db.models.School, as: 'fromSchool' },
          { model: db.models.School, as: 'toSchool' },
        ],
      });

      if (!transfer) {
        return res.status(404).json({ error: 'Transfer not found' });
      }

      res.json(transfer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Approve transfer
  router.post('/:id/approve', authenticate, authorize('ADMIN', 'PRINCIPAL'), async (req, res) => {
    try {
      const transfer = await db.models.StudentTransfer.findByPk(req.params.id);

      if (!transfer) {
        return res.status(404).json({ error: 'Transfer not found' });
      }

      transfer.status = 'APPROVED';
      transfer.approvedBy = req.user.id;
      transfer.approvalDate = new Date();
      await transfer.save();

      // Update student transfer flag
      const student = await db.models.Student.findByPk(transfer.studentId);
      student.isTransferred = true;
      await student.save();

      res.json({ message: 'Transfer approved', transfer });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Reject transfer
  router.post('/:id/reject', authenticate, authorize('ADMIN', 'PRINCIPAL'), async (req, res) => {
    try {
      const { remarks } = req.body;
      const transfer = await db.models.StudentTransfer.findByPk(req.params.id);

      if (!transfer) {
        return res.status(404).json({ error: 'Transfer not found' });
      }

      transfer.status = 'REJECTED';
      transfer.remarks = remarks;
      transfer.approvedBy = req.user.id;
      transfer.approvalDate = new Date();
      await transfer.save();

      res.json({ message: 'Transfer rejected', transfer });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Record dropout
  router.post('/dropout/:studentId', authenticate, authorize('ADMIN', 'PRINCIPAL'), async (req, res) => {
    try {
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({ error: 'Dropout reason is required' });
      }

      const student = await db.models.Student.findByPk(req.params.studentId);

      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      student.isDropout = true;
      student.dropoutReason = reason;
      student.status = 'INACTIVE';
      await student.save();

      res.json({ message: 'Student marked as dropout', student });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Record graduation/alumni
  router.post('/graduate/:studentId', authenticate, authorize('ADMIN', 'PRINCIPAL'), async (req, res) => {
    try {
      const { graduationYear } = req.body;

      if (!graduationYear) {
        return res.status(400).json({ error: 'Graduation year is required' });
      }

      const student = await db.models.Student.findByPk(req.params.studentId);

      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      student.isAlumni = true;
      student.graduationYear = graduationYear;
      student.status = 'GRADUATED';
      await student.save();

      res.json({ message: 'Student marked as alumni', student });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get alumni list
  router.get('/alumni', authenticate, async (req, res) => {
    try {
      const alumni = await db.models.Student.findAll({
        where: { isAlumni: true },
        include: [{ model: db.models.School, as: 'school' }],
        order: [['graduationYear', 'DESC']],
      });

      res.json(alumni);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
