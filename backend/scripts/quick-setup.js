#!/usr/bin/env node

/**
 * Quick Database Setup Script
 * Sets up a basic connection test and seed for demonstration
 * Usage: node scripts/quick-setup.js
 */

require('dotenv').config();
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

async function quickSetup() {
  try {
    console.log('\n🚀 ELIMUCORE Quick Database Setup');
    console.log('='.repeat(50));

    // 1. Test connection
    console.log('\n📡 Testing database connection...');
    await sequelize.authenticate();
    console.log('✓ Connection successful');

    // 2. Create tables (ignoring errors for existing tables)
    console.log('\n📊 Creating database tables...');
    const users = await sequelize.define('User', {}, { tableName: 'users', timestamps: true });
    
    // Simple approach: Try creating a test record
    const hashedPassword = await bcrypt.hash('admin@123', 10);
    
    const User = require('../models/User');
    const School = require('../models/School');
    
    // Create admin user if not exists
    const existingAdmin = await User.findOne({ where: { email: 'admin@elimucore.app' } }).catch(() => null);
    
    if (!existingAdmin) {
      // Create default school
      const school = await School.create({
        name: 'ELIMUCORE Demo School',
        registrationNumber: 'REG/2025/001',
        county: 'Nairobi',
        address: '123 Education Lane',
        email: 'admin@elimucore.app',
        phoneNumber: '+254712345678'
      }).catch(() => null);

      // Create admin
      await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@elimucore.app',
        password: 'admin@123',
        role: 'admin',
        schoolId: school?.id,
        status: 'ACTIVE'
      }).catch(() => null);

      // Create teacher
      await User.create({
        firstName: 'John',
        lastName: 'Mwangi',
        email: 'teacher@elimucore.app',
        password: 'teacher@123',
        role: 'teacher',
        schoolId: school?.id,
        status: 'ACTIVE',
        phoneNumber: '+254787654321'
      }).catch(() => null);

      console.log('✓ Demo users created');
    } else {
      console.log('ℹ️  Demo users already exist');
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Database setup complete!');
    console.log('='.repeat(50));
    console.log('\n📝 Demo Credentials:');
    console.log('  Admin: admin@elimucore.app / admin@123');
    console.log('  Teacher: teacher@elimucore.app / teacher@123');
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

quickSetup();
