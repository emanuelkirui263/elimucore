const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StudentAccount = sequelize.define(
  'StudentAccount',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    studentId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    totalFeesDue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    totalFesPaid: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('CLEARED', 'PARTIAL', 'ARREARS'),
      defaultValue: 'PARTIAL',
    },
    lastPaymentDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'student_accounts',
    timestamps: true,
  }
);

module.exports = StudentAccount;
