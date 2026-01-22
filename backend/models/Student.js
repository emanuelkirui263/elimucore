const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Student = sequelize.define(
  'Student',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    admissionNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    middleName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER'),
      allowNull: false,
    },
    parentName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    parentEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    parentPhone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    classLevel: {
      type: DataTypes.ENUM('FORM1', 'FORM2', 'FORM3', 'FORM4'),
      allowNull: false,
    },
    stream: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    enrollmentDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM(
        'PENDING',
        'APPROVED',
        'ACTIVE',
        'INACTIVE',
        'GRADUATED',
        'REJECTED'
      ),
      defaultValue: 'PENDING',
    },
    approvedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    schoolId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    academicYearId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Current academic year',
    },
    classStreamId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    isTransferred: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isDropout: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    dropoutReason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isAlumni: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    graduationYear: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: 'students',
    timestamps: true,
  }
);

module.exports = Student;
