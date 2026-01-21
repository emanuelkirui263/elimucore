const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Term = sequelize.define(
    'Term',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      academicYearId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'academic_years',
          key: 'id',
        },
      },
      termNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '1, 2, or 3',
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'E.g., "Term 1", "First Term"',
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      examStartDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      examEndDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Currently active term',
      },
      status: {
        type: DataTypes.ENUM('PLANNED', 'IN_PROGRESS', 'EXAM', 'COMPLETED', 'LOCKED'),
        defaultValue: 'PLANNED',
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
      tableName: 'terms',
      timestamps: true,
      indexes: [
        { fields: ['academicYearId', 'termNumber'] },
        { fields: ['isActive'] },
        { fields: ['status'] },
      ],
      uniqueKeys: {
        unique_academic_year_term: {
          fields: ['academicYearId', 'termNumber'],
        },
      },
    }
  );

  return Term;
};
