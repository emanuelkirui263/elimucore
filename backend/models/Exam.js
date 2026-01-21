const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Exam = sequelize.define(
  'Exam',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    term: {
      type: DataTypes.ENUM('TERM1', 'TERM2', 'TERM3'),
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    classLevel: {
      type: DataTypes.ENUM('FORM1', 'FORM2', 'FORM3', 'FORM4'),
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'LOCKED'),
      defaultValue: 'DRAFT',
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    lockedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    lockedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    schoolId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    tableName: 'exams',
    timestamps: true,
  }
);

module.exports = Exam;
