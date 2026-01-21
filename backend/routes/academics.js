const express = require('express');
const Joi = require('joi');
const { Op } = require('sequelize');
const Mark = require('../models/Mark');
const Exam = require('../models/Exam');
const Subject = require('../models/Subject');
const { authenticate, authorize } = require('../middleware/auth');
const { PERMISSIONS } = require('../config/roles');

const router = express.Router();

// Create exam
const createExamSchema = Joi.object({
  name: Joi.string().required(),
  term: Joi.string().valid('TERM1', 'TERM2', 'TERM3').required(),
  year: Joi.number().required(),
  classLevel: Joi.string()
    .valid('FORM1', 'FORM2', 'FORM3', 'FORM4')
    .required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
});

router.post(
  '/exams',
  authenticate,
  authorize(PERMISSIONS.CREATE_EXAM),
  async (req, res, next) => {
    try {
      const { error, value } = createExamSchema.validate(req.body);
      if (error) {
        error.isJoi = true;
        throw error;
      }

      const exam = await Exam.create({
        ...value,
        createdBy: req.user.id,
      });

      res.status(201).json({
        message: 'Exam created successfully',
        exam,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Create subject
const createSubjectSchema = Joi.object({
  name: Joi.string().required(),
  code: Joi.string().required(),
  description: Joi.string().optional(),
  maxMarks: Joi.number().default(100),
  isCompulsory: Joi.boolean().default(false),
});

router.post(
  '/subjects',
  authenticate,
  authorize(PERMISSIONS.CREATE_EXAM),
  async (req, res, next) => {
    try {
      const { error, value } = createSubjectSchema.validate(req.body);
      if (error) {
        error.isJoi = true;
        throw error;
      }

      const subject = await Subject.create(value);

      res.status(201).json({
        message: 'Subject created successfully',
        subject,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Enter marks
const enterMarksSchema = Joi.object({
  marksObtained: Joi.number().required(),
  studentId: Joi.string().required(),
  examId: Joi.string().required(),
  subjectId: Joi.string().required(),
  academicYearId: Joi.string().required(),
  remarks: Joi.string().optional(),
});

router.post(
  '/marks',
  authenticate,
  authorize(PERMISSIONS.ENTER_MARKS),
  async (req, res, next) => {
    try {
      const { error, value } = enterMarksSchema.validate(req.body);
      if (error) {
        error.isJoi = true;
        throw error;
      }

      // Verify student is enrolled in this subject for this academic year
      const enrollment = await req.app.get('db').StudentSubjectEnrollment.findOne({
        where: {
          studentId: value.studentId,
          subjectId: value.subjectId,
          academicYearId: value.academicYearId,
          enrollmentStatus: 'ACTIVE',
        },
      });

      if (!enrollment) {
        return res.status(400).json({ 
          error: 'Student is not enrolled in this subject for the selected academic year',
          details: 'Marks can only be entered for subjects the student is actively enrolled in'
        });
      }

      // Get subject to determine max marks
      const subject = await Subject.findByPk(value.subjectId);
      if (!subject) {
        return res.status(404).json({ message: 'Subject not found' });
      }

      // Calculate percentage and grade
      const percentage = (value.marksObtained / subject.maxMarks) * 100;
      const grade = Mark.calculateGrade(percentage);

      const mark = await Mark.create({
        ...value,
        percentage: Math.round(percentage * 100) / 100,
        grade,
        status: 'SUBMITTED',
        enteredBy: req.user.id,
      });

      res.status(201).json({
        message: 'Marks entered successfully',
        mark,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get student results
router.get(
  '/results/:studentId',
  authenticate,
  authorize(PERMISSIONS.VIEW_RESULTS),
  async (req, res, next) => {
    try {
      const marks = await Mark.findAll({
        where: {
          studentId: req.params.studentId,
          status: 'APPROVED',
        },
        include: [
          {
            model: Exam,
            attributes: ['name', 'term', 'year'],
          },
          {
            model: Subject,
            attributes: ['name', 'code'],
          },
        ],
      });

      res.json({ results: marks });
    } catch (error) {
      next(error);
    }
  }
);

// Get class rankings
router.get(
  '/rankings/class/:examId/:classLevel',
  authenticate,
  authorize(PERMISSIONS.VIEW_RESULTS),
  async (req, res, next) => {
    try {
      const marks = await Mark.findAll({
        where: { examId: req.params.examId, status: 'APPROVED' },
        include: [
          {
            model: 'Student',
            attributes: ['id', 'admissionNumber', 'firstName', 'lastName'],
          },
        ],
        order: [['percentage', 'DESC']],
      });

      res.json({ rankings: marks });
    } catch (error) {
      next(error);
    }
  }
);

// Approve marks
router.post(
  '/marks/:id/approve',
  authenticate,
  authorize(PERMISSIONS.APPROVE_MARKS),
  async (req, res, next) => {
    try {
      const mark = await Mark.findByPk(req.params.id);

      if (!mark) {
        return res.status(404).json({ message: 'Mark not found' });
      }

      mark.status = 'APPROVED';
      mark.approvedBy = req.user.id;
      mark.approvedAt = new Date();
      await mark.save();

      res.json({
        message: 'Marks approved successfully',
        mark,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Lock exam
router.post(
  '/exams/:id/lock',
  authenticate,
  authorize(PERMISSIONS.LOCK_EXAM),
  async (req, res, next) => {
    try {
      const exam = await Exam.findByPk(req.params.id);

      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }

      exam.status = 'LOCKED';
      exam.lockedBy = req.user.id;
      exam.lockedAt = new Date();
      await exam.save();

      res.json({
        message: 'Exam locked successfully',
        exam,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
