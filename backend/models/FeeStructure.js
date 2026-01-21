const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FeeStructure = sequelize.define(
  'FeeStructure',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    classLevel: {
      type: DataTypes.ENUM('FORM1', 'FORM2', 'FORM3', 'FORM4'),
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tuitionFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    boardingFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    activityFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    otherFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    totalFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    termCount: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    schoolId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    tableName: 'fee_structures',
    timestamps: true,
  }
);

module.exports = FeeStructure;
