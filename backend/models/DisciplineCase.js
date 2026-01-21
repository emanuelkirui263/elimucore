const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DisciplineCase = sequelize.define(
    'DisciplineCase',
    {
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
      },
      incidentDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      incidentType: {
        type: DataTypes.ENUM(
          'ACADEMIC_DISHONESTY',
          'INSUBORDINATION',
          'TRUANCY',
          'ASSAULT',
          'BULLYING',
          'THEFT',
          'DRUG_RELATED',
          'MORAL_TURPITUDE',
          'PROPERTY_DAMAGE',
          'OTHER'
        ),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      witnesses: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Names/IDs of witnesses',
      },
      reportedBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      reportDate: {
        type: DataTypes.DATE,
        allowValue: false,
        defaultValue: DataTypes.NOW,
      },
      action: {
        type: DataTypes.ENUM(
          'WARNING',
          'DETENTION',
          'SUSPENSION',
          'EXPULSION',
          'COMMUNITY_SERVICE',
          'DISMISSED'
        ),
        allowNull: true,
      },
      actionDetails: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Duration, conditions, etc.',
      },
      suspensionStartDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      suspensionEndDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      parentNotified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      parentNotificationDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      parentAcknowledged: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      parentAcknowledgmentDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('UNDER_INVESTIGATION', 'RESOLVED', 'APPEAL_PENDING', 'CLOSED'),
        defaultValue: 'UNDER_INVESTIGATION',
      },
      handledBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id',
        },
        comment: 'Usually Deputy Administrator',
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
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
      tableName: 'discipline_cases',
      timestamps: true,
      indexes: [
        { fields: ['studentId'] },
        { fields: ['incidentType'] },
        { fields: ['status'] },
        { fields: ['incidentDate'] },
        { fields: ['handledBy'] },
      ],
    }
  );

  return DisciplineCase;
};
