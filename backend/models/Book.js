const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Book = sequelize.define(
    'Book',
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
      isbn: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      author: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      publisher: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'E.g., Fiction, Mathematics, Biology',
      },
      acquisitionDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      totalCopies: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      availableCopies: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Shelf/Section location',
      },
      status: {
        type: DataTypes.ENUM('AVAILABLE', 'OUT_OF_STOCK', 'DAMAGED'),
        defaultValue: 'AVAILABLE',
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
      tableName: 'books',
      timestamps: true,
      indexes: [
        { fields: ['schoolId'] },
        { fields: ['title'] },
        { fields: ['category'] },
        { fields: ['status'] },
      ],
    }
  );

  return Book;
};
