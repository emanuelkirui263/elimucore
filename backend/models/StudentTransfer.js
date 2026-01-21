const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StudentTransfer = sequelize.define(
    'StudentTransfer',
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
      transferType: {
        type: DataTypes.ENUM('OUT', 'IN'),
        allowNull: false,
        comment: 'Transfer out or transfer in',
      },
      fromSchoolId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Schools',
          key: 'id',
        },
        comment: 'School student is transferring from',
      },
      toSchoolId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Schools',
          key: 'id',
        },
        comment: 'School student is transferring to',
      },
      transferDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      reason: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Reason for transfer',
      },
      documents: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Transfer letter, form 2 copies, etc.',
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'),
        defaultValue: 'PENDING',
      },
      approvedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      approvalDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      remarks: {
        type: DataTypes.TEXT,
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
      tableName: 'student_transfers',
      timestamps: true,
      indexes: [
        { fields: ['studentId'] },
        { fields: ['transferType'] },
        { fields: ['status'] },
        { fields: ['transferDate'] },
      ],
    }
  );

  return StudentTransfer;
};
