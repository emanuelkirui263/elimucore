const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StudentSubjectEnrollment = sequelize.define('StudentSubjectEnrollment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    studentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Students',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    subjectId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Subjects',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    classStreamId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'ClassStreams',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    academicYearId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'AcademicYears',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    isOptional: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    enrollmentStatus: {
      type: DataTypes.ENUM('ACTIVE', 'DROPPED', 'SUBSTITUTED'),
      defaultValue: 'ACTIVE',
      allowNull: false,
    },
    enrolledDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    droppedDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    replacementSubjectId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Subjects',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    approvalReason: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    schoolId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Schools',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'RESTRICT',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'StudentSubjectEnrollments',
    timestamps: true,
    indexes: [
      {
        fields: ['studentId', 'subjectId', 'academicYearId', 'classStreamId'],
        unique: true,
        name: 'idx_enrollment_unique',
      },
      {
        fields: ['studentId', 'academicYearId'],
        name: 'idx_student_year_enrollment',
      },
      {
        fields: ['classStreamId', 'academicYearId'],
        name: 'idx_class_year_enrollment',
      },
      {
        fields: ['schoolId'],
        name: 'idx_enrollment_school',
      },
    ],
  });

  return StudentSubjectEnrollment;
};
