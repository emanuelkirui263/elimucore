const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AcademicYear = sequelize.define(
    'AcademicYear',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        comment: 'E.g., 2025, 2026',
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Academic year start date',
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Academic year end date',
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Currently active academic year',
      },
      isClosed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Marks locked, no changes allowed',
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
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
      tableName: 'academic_years',
      timestamps: true,
      indexes: [
        { fields: ['year'] },
        { fields: ['isActive'] },
        { fields: ['isClosed'] },
      ],
    }
  );

  return AcademicYear;
};
