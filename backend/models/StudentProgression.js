const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StudentProgression = sequelize.define('StudentProgression', {
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
    academicYearId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'AcademicYears',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    classLevel: {
      type: DataTypes.ENUM('FORM_1', 'FORM_2', 'FORM_3', 'FORM_4'),
      allowNull: false,
    },
    classStreamId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'ClassStreams',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    enrollmentType: {
      type: DataTypes.ENUM('NEW', 'REPEAT', 'TRANSFER_IN', 'SKIP_TERM_RESUME'),
      defaultValue: 'NEW',
      allowNull: false,
    },
    previousAcademicYearId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'AcademicYears',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    entryDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    exitDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    exitReason: {
      type: DataTypes.ENUM(
        'GRADUATED',
        'TRANSFERRED',
        'DROPOUT',
        'INCOMPLETE',
        'SUSPENDED',
        'NONE'
      ),
      defaultValue: 'NONE',
      allowNull: false,
    },
    marksLockedDate: {
      type: DataTypes.DATE,
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
    tableName: 'StudentProgressions',
    timestamps: true,
    indexes: [
      {
        fields: ['studentId', 'academicYearId'],
        unique: true,
        name: 'idx_progression_unique',
      },
      {
        fields: ['studentId'],
        name: 'idx_progression_student',
      },
      {
        fields: ['classStreamId', 'academicYearId'],
        name: 'idx_progression_class_year',
      },
      {
        fields: ['schoolId'],
        name: 'idx_progression_school',
      },
    ],
  });

  return StudentProgression;
};
