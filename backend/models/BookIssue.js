const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BookIssue = sequelize.define(
    'BookIssue',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      bookId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Books',
          key: 'id',
        },
      },
      studentId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Students',
          key: 'id',
        },
      },
      issuedDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      returnedDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('ISSUED', 'RETURNED', 'OVERDUE', 'LOST', 'DAMAGED'),
        defaultValue: 'ISSUED',
      },
      condition: {
        type: DataTypes.ENUM('GOOD', 'FAIR', 'POOR', 'DAMAGED'),
        allowNull: true,
        comment: 'Condition when returned',
      },
      damageDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      replacementCost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'If lost or severely damaged',
      },
      fineAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        comment: 'Late return fine',
      },
      finePaid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      issuedBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        comment: 'Librarian',
      },
      receivedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id',
        },
        comment: 'Librarian who received return',
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
      tableName: 'book_issues',
      timestamps: true,
      indexes: [
        { fields: ['bookId'] },
        { fields: ['studentId'] },
        { fields: ['status'] },
        { fields: ['issuedDate'] },
        { fields: ['dueDate'] },
        { fields: ['issuedBy'] },
      ],
    }
  );

  return BookIssue;
};
