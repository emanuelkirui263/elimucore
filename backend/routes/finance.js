const express = require('express');
const Joi = require('joi');
const FeeStructure = require('../models/FeeStructure');
const StudentAccount = require('../models/StudentAccount');
const Payment = require('../models/Payment');
const { authenticate, authorize } = require('../middleware/auth');
const { PERMISSIONS } = require('../config/roles');

const router = express.Router();

// Create fee structure
const createFeeStructureSchema = Joi.object({
  classLevel: Joi.string()
    .valid('FORM1', 'FORM2', 'FORM3', 'FORM4')
    .required(),
  year: Joi.number().required(),
  tuitionFee: Joi.number().required(),
  boardingFee: Joi.number().optional(),
  activityFee: Joi.number().optional(),
  otherFee: Joi.number().optional(),
  termCount: Joi.number().default(3),
});

router.post(
  '/fee-structures',
  authenticate,
  authorize(PERMISSIONS.CREATE_FEE_STRUCTURE),
  async (req, res, next) => {
    try {
      const { error, value } = createFeeStructureSchema.validate(req.body);
      if (error) {
        error.isJoi = true;
        throw error;
      }

      // Calculate total fee
      const totalFee =
        value.tuitionFee +
        (value.boardingFee || 0) +
        (value.activityFee || 0) +
        (value.otherFee || 0);

      const feeStructure = await FeeStructure.create({
        ...value,
        totalFee,
      });

      res.status(201).json({
        message: 'Fee structure created successfully',
        feeStructure,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get student account
router.get(
  '/accounts/:studentId',
  authenticate,
  authorize(PERMISSIONS.VIEW_FINANCE),
  async (req, res, next) => {
    try {
      const account = await StudentAccount.findOne({
        where: { studentId: req.params.studentId },
      });

      if (!account) {
        return res.status(404).json({ message: 'Student account not found' });
      }

      res.json({ account });
    } catch (error) {
      next(error);
    }
  }
);

// Record payment
const recordPaymentSchema = Joi.object({
  studentId: Joi.string().required(),
  amount: Joi.number().required(),
  paymentMethod: Joi.string()
    .valid('CASH', 'CHEQUE', 'MPESA', 'BANK_TRANSFER')
    .required(),
  transactionId: Joi.string().optional(),
  receiptNumber: Joi.string().required(),
  remarks: Joi.string().optional(),
});

router.post(
  '/payments',
  authenticate,
  authorize(PERMISSIONS.RECORD_PAYMENT),
  async (req, res, next) => {
    try {
      const { error, value } = recordPaymentSchema.validate(req.body);
      if (error) {
        error.isJoi = true;
        throw error;
      }

      const payment = await Payment.create({
        ...value,
        status: 'PENDING',
        recordedBy: req.user.id,
      });

      res.status(201).json({
        message: 'Payment recorded successfully',
        payment,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Verify payment
router.post(
  '/payments/:id/verify',
  authenticate,
  authorize(PERMISSIONS.VERIFY_PAYMENT),
  async (req, res, next) => {
    try {
      const payment = await Payment.findByPk(req.params.id);

      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      payment.status = 'VERIFIED';
      payment.verifiedBy = req.user.id;
      payment.verifiedAt = new Date();
      await payment.save();

      // Update student account
      const account = await StudentAccount.findOne({
        where: { studentId: payment.studentId },
      });
      if (account) {
        account.totalFesPaid += parseFloat(payment.amount);
        account.balance = account.totalFeesDue - account.totalFesPaid;
        account.lastPaymentDate = new Date();
        if (account.balance <= 0) {
          account.status = 'CLEARED';
        } else if (account.totalFesPaid > 0) {
          account.status = 'PARTIAL';
        }
        await account.save();
      }

      res.json({
        message: 'Payment verified successfully',
        payment,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get payment report
router.get(
  '/reports/payments',
  authenticate,
  authorize(PERMISSIONS.VIEW_FINANCE),
  async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;
      const where = {};

      if (startDate && endDate) {
        where.createdAt = {
          [require('sequelize').Op.between]: [
            new Date(startDate),
            new Date(endDate),
          ],
        };
      }

      const payments = await Payment.findAll({
        where,
        order: [['createdAt', 'DESC']],
      });

      res.json({ payments });
    } catch (error) {
      next(error);
    }
  }
);

// Get arrears
router.get(
  '/arrears',
  authenticate,
  authorize(PERMISSIONS.VIEW_FINANCE),
  async (req, res, next) => {
    try {
      const arrears = await StudentAccount.findAll({
        where: { balance: { [require('sequelize').Op.gt]: 0 } },
      });

      res.json({ arrears });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
