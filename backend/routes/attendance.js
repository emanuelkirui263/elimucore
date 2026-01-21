const express = require('express');
const Joi = require('joi');
const Attendance = require('../models/Attendance');
const { authenticate, authorize } = require('../middleware/auth');
const { PERMISSIONS } = require('../config/roles');

const router = express.Router();

// Record attendance
const recordAttendanceSchema = Joi.object({
  studentId: Joi.string().required(),
  date: Joi.date().required(),
  status: Joi.string()
    .valid('PRESENT', 'ABSENT', 'LATE', 'EXCUSED')
    .required(),
  remarks: Joi.string().optional(),
});

router.post(
  '/',
  authenticate,
  authorize(PERMISSIONS.RECORD_ATTENDANCE),
  async (req, res, next) => {
    try {
      const { error, value } = recordAttendanceSchema.validate(req.body);
      if (error) {
        error.isJoi = true;
        throw error;
      }

      const attendance = await Attendance.create({
        ...value,
        recordedBy: req.user.id,
      });

      res.status(201).json({
        message: 'Attendance recorded successfully',
        attendance,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Bulk attendance upload
router.post(
  '/bulk',
  authenticate,
  authorize(PERMISSIONS.RECORD_ATTENDANCE),
  async (req, res, next) => {
    try {
      const { records } = req.body;

      if (!Array.isArray(records) || records.length === 0) {
        return res
          .status(400)
          .json({ message: 'Records array is required and must not be empty' });
      }

      const attendanceRecords = records.map((record) => ({
        ...record,
        recordedBy: req.user.id,
      }));

      const result = await Attendance.bulkCreate(attendanceRecords, {
        ignoreDuplicates: true,
      });

      res.status(201).json({
        message: 'Bulk attendance uploaded successfully',
        count: result.length,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get attendance report
router.get(
  '/report/:studentId',
  authenticate,
  authorize(PERMISSIONS.VIEW_ATTENDANCE),
  async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;
      const where = { studentId: req.params.studentId };

      if (startDate && endDate) {
        where.date = {
          [require('sequelize').Op.between]: [
            new Date(startDate),
            new Date(endDate),
          ],
        };
      }

      const records = await Attendance.findAll({
        where,
        order: [['date', 'DESC']],
      });

      // Calculate attendance statistics
      const stats = {
        present: records.filter((r) => r.status === 'PRESENT').length,
        absent: records.filter((r) => r.status === 'ABSENT').length,
        late: records.filter((r) => r.status === 'LATE').length,
        excused: records.filter((r) => r.status === 'EXCUSED').length,
        total: records.length,
      };

      res.json({
        records,
        statistics: stats,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
