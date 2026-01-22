const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'student',
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    employeeNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    tscNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED'),
      defaultValue: 'ACTIVE',
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    passwordChangedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
          user.passwordChangedAt = new Date();
        }
      },
    },
  }
);

User.prototype.comparePassword = async function (passwordAttempt) {
  return await bcrypt.compare(passwordAttempt, this.password);
};

module.exports = User;
