const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ClassStream = sequelize.define(
    'ClassStream',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      schoolId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Schools',
          key: 'id',
        },
      },
      academicYearId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'academic_years',
          key: 'id',
        },
      },
      classLevel: {
        type: DataTypes.ENUM('FORM_1', 'FORM_2', 'FORM_3', 'FORM_4'),
        allowNull: false,
        comment: 'Class level',
      },
      streamName: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'E.g., "A", "B", "C"',
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 40,
      },
      enrollment: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Current number of students',
      },
      classTeacherId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id',
        },
        comment: 'Form teacher',
      },
      status: {
        type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
        defaultValue: 'ACTIVE',
      },
      createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW,
      },
    },
    {
      tableName: 'class_streams',
      timestamps: true,
      indexes: [
        { fields: ['schoolId', 'academicYearId', 'classLevel', 'streamName'] },
        { fields: ['classTeacherId'] },
      ],
      uniqueKeys: {
        unique_class_stream: {
          fields: ['schoolId', 'academicYearId', 'classLevel', 'streamName'],
        },
      },
    }
  );

  return ClassStream;
};
