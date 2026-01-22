const { Sequelize } = require('sequelize');
require('dotenv').config();

// Use SQLite for development/testing, PostgreSQL for production
const sequelize = process.env.NODE_ENV === 'production'
  ? new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
      }
    )
  : new Sequelize({
      dialect: 'sqlite',
      storage: '/tmp/elimucore_dev.db',
      logging: false,
    });

module.exports = sequelize;
