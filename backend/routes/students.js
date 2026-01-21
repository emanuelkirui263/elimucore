const express = require('express');
const Joi = require('joi');
const Student = require('../models/Student');
const StudentAccount = require('../models/StudentAccount');
const User = require('../models/User');
const { authenticate, authorize, authorizeRoles } = require('../middleware/auth');
const { ROLES, PERMISSIONS } = require('../config/roles');

const router = express.Router();

// Validation schema for creating student
const createStudentSchema = Joi.object({
  admissionNumber: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  middleName: Joi.string().optional(),
  dateOfBirth: Joi.date().required(),
  gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER').required(),
  parentName: Joi.string().required(),
  parentEmail: Joi.string().email().required(),
  parentPhone: Joi.string().required(),
  classLevel: Joi.string()
    .valid('FORM1', 'FORM2', 'FORM3', 'FORM4')
    .required(),
  stream: Joi.string().optional(),
});

// Create student
router.post(
  '/',
  authenticate,
  authorize(PERMISSIONS.CREATE_STUDENT),
  async (req, res, next) => {
    try {
      const { error, value } = createStudentSchema.validate(req.body);
      if (error) {
        error.isJoi = true;
        throw error;
      }

      // Check if student already exists
      const existingStudent = await Student.findOne({
        where: { admissionNumber: value.admissionNumber },
      });
      if (existingStudent) {
        return res.status(400).json({ message: 'Admission number already exists' });
      }

      // Create student
      const student = await Student.create({
        ...value,
        status: 'PENDING',
      });

      // Create student account
      await StudentAccount.create({
        studentId: student.id,
        totalFeesDue: 0,
        totalFesPaid: 0,
        balance: 0,
        status: 'CLEARED',
      });

      res.status(201).json({
        message: 'Student registered successfully',
        student,
      });
    } catch (error) {
      next(error);
    }
  }
);

// List students
router.get(
  '/',
  authenticate,
  authorize(PERMISSIONS.VIEW_STUDENT),
  async (req, res, next) => {
    try {
      const { classLevel, status, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (classLevel) where.classLevel = classLevel;
      if (status) where.status = status;

      const { rows, count } = await Student.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        order: [['createdAt', 'DESC']],
      });

      res.json({
        data: rows,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get student by ID
router.get(
  '/:id',
  authenticate,
  authorize(PERMISSIONS.VIEW_STUDENT),
  async (req, res, next) => {
    try {
      const student = await Student.findByPk(req.params.id, {
        include: [StudentAccount],
      });

      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      res.json({ student });
    } catch (error) {
      next(error);
    }
  }
);

// Update student
router.put(
  '/:id',
  authenticate,
  authorize(PERMISSIONS.EDIT_STUDENT),
  async (req, res, next) => {
    try {
      const student = await Student.findByPk(req.params.id);

      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      await student.update(req.body);

      res.json({
        message: 'Student updated successfully',
        student,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Approve student
router.post(
  '/:id/approve',
  authenticate,
  authorize(PERMISSIONS.APPROVE_STUDENT),
  async (req, res, next) => {
    try {
      const student = await Student.findByPk(req.params.id);

      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      student.status = 'APPROVED';
      student.approvedBy = req.user.id;
      await student.save();

      res.json({
        message: 'Student approved successfully',
        student,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
