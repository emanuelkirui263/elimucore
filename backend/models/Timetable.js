const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Timetable = sequelize.define(
    'Timetable',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      classStreamId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'ClassStreams',
          key: 'id',
        },
      },
      termId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'terms',
          key: 'id',
        },
      },
      dayOfWeek: {
        type: DataTypes.ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'),
        allowNull: false,
      },
      period: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '1, 2, 3, etc.',
      },
      periodName: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'E.g., "08:00-08:45"',
      },
      subjectId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Subjects',
          key: 'id',
        },
      },
      teacherId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      roomNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('ACTIVE', 'CANCELLED', 'RESCHEDULED'),
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
      tableName: 'timetables',
      timestamps: true,
      indexes: [
        { fields: ['classStreamId', 'termId'] },
        { fields: ['teacherId'] },
        { fields: ['subjectId'] },
        { fields: ['dayOfWeek', 'period'] },
      ],
    }
  );

  return Timetable;
};
