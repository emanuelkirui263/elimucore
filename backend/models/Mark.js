const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Mark = sequelize.define(
  'Mark',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    marksObtained: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    percentage: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    grade: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'),
      defaultValue: 'DRAFT',
    },
    approvedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    enteredBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    studentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    examId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    subjectId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: 'marks',
    timestamps: true,
  }
);

// Calculate grade based on percentage
Mark.calculateGrade = (percentage) => {
  if (percentage >= 80) return 'A+';
  if (percentage >= 75) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 65) return 'B';
  if (percentage >= 60) return 'C+';
  if (percentage >= 55) return 'C';
  if (percentage >= 50) return 'D+';
  if (percentage >= 40) return 'D';
  return 'E';
};

module.exports = Mark;
