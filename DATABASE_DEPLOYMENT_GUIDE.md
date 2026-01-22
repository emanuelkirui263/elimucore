# Database Deployment Guide

**Version**: 1.0.0  
**Last Updated**: January 22, 2026  
**Project**: ELIMUCORE School Management System

---

## 📋 Overview

This guide covers database deployment for ELIMUCORE in development, testing, and production environments. The system supports:
- **Production**: PostgreSQL on AWS RDS
- **Development**: SQLite (local)
- **Testing**: SQLite (in-memory)

---

## 🏗️ Database Architecture

```
┌─────────────────────────────────────────┐
│      ELIMUCORE Backend Application      │
│          (Node.js/Express)              │
└────────────────┬────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
   Development        Production
   (SQLite)          (PostgreSQL)
        │                 │
        ▼                 ▼
   Local Storage     AWS RDS
   /tmp/elimucore    elimucore-db
   _dev.db           (Managed)
```

---

## 📊 Database Schema

### 21 Core Tables

**Users & Authentication**
- `Users` - System users (admin, teacher, student)
- `AuditLogs` - Activity logging

**School Structure**
- `Schools` - School information
- `AcademicYears` - Academic year records
- `Terms` - School terms
- `ClassStreams` - Class/stream information
- `Subjects` - Subject definitions

**Students**
- `Students` - Student records
- `StudentAccounts` - Student financial accounts
- `StudentTransfers` - Student transfer records
- `StudentSubjectEnrollments` - Subject enrollment tracking
- `StudentProgression` - Academic progression records

**Academics**
- `Exams` - Examination records
- `Marks` - Student examination marks
- `Timetables` - Class timetables

**Finance**
- `FeeStructures` - Fee setup
- `Payments` - Payment records

**Attendance & Discipline**
- `Attendances` - Attendance records
- `DisciplineCases` - Discipline case records

**Library**
- `Books` - Book inventory
- `BookIssues` - Book issue/return tracking

---

## 🚀 Quick Start (Development)

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Initialize Database

```bash
# Create tables with default SQLite
npm run db:init

# Or with fresh start (drops existing tables)
npm run db:init:force
```

### 3. Seed Demo Data

```bash
npm run db:seed
```

### 4. Start Server

```bash
npm run dev
```

**Result**: 
- ✅ Database ready at `/tmp/elimucore_dev.db`
- ✅ Server running on http://localhost:5000
- ✅ Demo data loaded (admin, teachers, students)

---

## 🐘 PostgreSQL Setup (Local)

### 1. Install PostgreSQL

**Mac (Homebrew)**:
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian)**:
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows**:
- Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- Run installer, default password: `postgres`

### 2. Create Database & User

```bash
# Connect to PostgreSQL
psql -U postgres

# Inside psql:
CREATE USER elimucore_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE elimucore OWNER elimucore_user;
GRANT ALL PRIVILEGES ON DATABASE elimucore TO elimucore_user;
\q
```

### 3. Update Environment Variables

```bash
# .env
NODE_ENV=production
DB_HOST=localhost
DB_PORT=5432
DB_NAME=elimucore
DB_USER=elimucore_user
DB_PASSWORD=your_secure_password
```

### 4. Initialize Database

```bash
npm run db:init
npm run db:seed
```

### 5. Verify Connection

```bash
psql -U elimucore_user -d elimucore -h localhost
```

---

## ☁️ AWS RDS Setup (Production)

### 1. Prerequisites

```bash
# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS credentials
aws configure
```

### 2. Create RDS Instance

```bash
cd /workspaces/elimucore
chmod +x scripts/setup-aws-rds.sh
./scripts/setup-aws-rds.sh
```

**Script will:**
- ✅ Create security group
- ✅ Create PostgreSQL RDS instance (db.t3.micro)
- ✅ Generate secure password
- ✅ Create `.env.production` file
- ✅ Enable automated backups (30 days)
- ✅ Enable encryption at rest
- ✅ Enable CloudWatch logs

**Output Example:**
```
Database Details:
  Instance ID: elimucore-db
  Engine: postgres 15.4
  Class: db.t3.micro
  Storage: 20GB (gp3)
  Endpoint: elimucore-db.c12345.us-east-1.rds.amazonaws.com:5432
  Username: elimucore_admin
```

### 3. Deploy Application

```bash
# Deploy to Elastic Beanstalk
eb create elimucore-env --instance-type t3.small

# Or deploy to existing environment
eb deploy
```

### 4. Initialize Production Database

```bash
# Via Elastic Beanstalk SSH
eb ssh

# Run on server:
npm run db:init
npm run db:seed:prod  # Optional: only if needed
```

---

## 🔄 Database Initialization

### What `npm run db:init` Does

1. **Tests Connection**
   - Validates database connectivity
   - Checks database version compatibility

2. **Creates Schema**
   - Creates all 21 tables
   - Establishes relationships
   - Sets up foreign keys

3. **Applies Constraints**
   - Mark unique constraint: (studentId, examId, subjectId)
   - Mark range check: 0-100 marks
   - Enrollment unique constraint
   - Progression unique constraint
   - Payment unique constraint
   - Academic year unique constraint

4. **Creates Indexes**
   - User email index (fast login)
   - Student school index (queries)
   - Attendance student index
   - Mark exam index
   - Payment student index
   - Audit user index

### Database Constraints

```sql
-- Mark Uniqueness (one mark per student per exam per subject)
ALTER TABLE "Marks" 
ADD CONSTRAINT mark_unique 
UNIQUE("studentId", "examId", "subjectId");

-- Mark Range (0-100)
ALTER TABLE "Marks" 
ADD CONSTRAINT mark_range_check
CHECK("marksObtained" >= 0 AND "marksObtained" <= 100);

-- Enrollment Uniqueness
ALTER TABLE "StudentSubjectEnrollments" 
ADD CONSTRAINT enrollment_unique
UNIQUE("studentId", "subjectId", "academicYearId", "classStreamId");
```

---

## 🌱 Database Seeding

### What Demo Data Is Created

**Users:**
- 1 Admin (admin@elimucore.app / admin@123)
- 1 Teacher (teacher@elimucore.app / teacher@123)

**School Data:**
- 1 School: "ELIMUCORE Demo High School"
- 3 Academic years (2025-2027)
- 3 Terms per year
- 3 Class streams (Form 1A, 1B, Form 4A)
- 8 Subjects (Math, English, Physics, Chemistry, Biology, History, Geography, CS)

**Students:**
- 10 Demo students with realistic names
- Complete enrollment data
- Student accounts with initial balances

**Academics:**
- 3 Exams (Midterm, Final, Mock)
- 80+ Sample marks
- Class attendance records
- Student progression records

**Finance:**
- Student account balances
- Sample payment records

### Run Seeding

```bash
# Development
npm run db:seed

# Production (careful!)
NODE_ENV=production npm run db:seed:prod
```

⚠️ **Warning**: Seeding overwrites existing demo data!

---

## 🔄 Migrations

### Create a Migration

```bash
# Create new migration file
cat > backend/migrations/YYYYMMDD_description.js << 'EOF'
/**
 * Migration: Description
 * Date: YYYY-MM-DD
 */

async function up(sequelize) {
  const queryInterface = sequelize.getQueryInterface();
  
  // Add migration code
  await queryInterface.addColumn('Students', 'newField', {
    type: DataTypes.STRING,
    allowNull: true,
  });
}

async function down(sequelize) {
  const queryInterface = sequelize.getQueryInterface();
  
  // Rollback code
  await queryInterface.removeColumn('Students', 'newField');
}

module.exports = { up, down };
EOF
```

### Run Migrations

```bash
# Development
npm run db:migrate

# Production
npm run db:migrate:prod
```

### Existing Migrations

**001_add_constraints.js** - Database integrity constraints (run on init)

---

## 🔐 Security Best Practices

### Database Password Management

❌ **Don't:**
- Store passwords in code
- Use weak passwords
- Share passwords in messages
- Commit .env to git

✅ **Do:**
- Use 25+ character passwords with special chars
- Store in `.env` file (gitignored)
- Use AWS Secrets Manager for production
- Rotate passwords quarterly

### AWS RDS Security

```bash
# Enable encryption at rest (automatic)
# Enable backup encryption (automatic)
# Enable multi-AZ for production
# Enable CloudWatch monitoring

# Restrict security group to application only
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxx \
  --protocol tcp \
  --port 5432 \
  --cidr 10.0.0.0/8  # Internal VPC only
```

### Connection Security

```bash
# Use SSL for all connections
export PGSSLMODE=require
export PGSSLCERT=/path/to/cert
export PGSSLKEY=/path/to/key
```

---

## 📊 Monitoring & Maintenance

### CloudWatch Logs

```bash
# View RDS logs
aws logs tail /aws/rds/instance/elimucore-db/postgresql --follow

# Search for errors
aws logs filter-log-events \
  --log-group-name /aws/rds/instance/elimucore-db/postgresql \
  --filter-pattern "ERROR"
```

### Database Performance

```bash
# Check slow queries (RDS)
SELECT query_text, calls, mean_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

# Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Backup Strategy

```bash
# Automated backups (enabled by default)
# Retention: 30 days
# Window: Daily 3 AM UTC

# Create manual snapshot
aws rds create-db-snapshot \
  --db-instance-identifier elimucore-db \
  --db-snapshot-identifier elimucore-backup-$(date +%s)

# List snapshots
aws rds describe-db-snapshots \
  --db-instance-identifier elimucore-db

# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier elimucore-db-restored \
  --db-snapshot-identifier elimucore-backup-1234567890
```

---

## 🔧 Troubleshooting

### Connection Issues

**Error**: "connect ECONNREFUSED 127.0.0.1:5432"

```bash
# Solution: PostgreSQL not running
# Linux
sudo systemctl start postgresql

# Mac
brew services start postgresql@15

# Windows
Start PostgreSQL service from Services
```

**Error**: "password authentication failed"

```bash
# Solution: Reset PostgreSQL password
sudo -u postgres psql
\password postgres
# Enter new password
```

### Database Locks

```bash
# Find long-running queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
FROM pg_stat_activity 
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';

# Kill stuck connection
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE pid = <process_id>;
```

### Disk Space Issues

```bash
# Check database size
SELECT pg_size_pretty(pg_database_size('elimucore'));

# Solution: Increase RDS storage
aws rds modify-db-instance \
  --db-instance-identifier elimucore-db \
  --allocated-storage 50 \
  --apply-immediately
```

### Permission Errors

```bash
# Reset user permissions
GRANT ALL PRIVILEGES ON DATABASE elimucore TO elimucore_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO elimucore_user;
GRANT USAGE ON SCHEMA public TO elimucore_user;
```

---

## 📈 Scaling Strategy

### Development → Production

```
Step 1: Local SQLite Testing
  └─ np run db:init:force
  └─ npm run db:seed
  └─ Local testing (npm run dev)

Step 2: Staging (PostgreSQL Local)
  └─ Set NODE_ENV=staging
  └─ Use local PostgreSQL
  └─ Full testing cycle

Step 3: Production (AWS RDS)
  └─ Set NODE_ENV=production
  └─ Use AWS RDS endpoint
  └─ Enable all monitoring
  └─ Deploy to Elastic Beanstalk
```

### Auto-Scaling

```bash
# Enable RDS auto-scaling storage
aws rds modify-db-instance \
  --db-instance-identifier elimucore-db \
  --storage-autoscaling-enabled \
  --max-allocated-storage 1000 \
  --apply-immediately
```

---

## 📝 Scripts Reference

| Script | Purpose | Usage |
|--------|---------|-------|
| `npm run db:init` | Create schema | `npm run db:init` |
| `npm run db:init:force` | Force recreate | `npm run db:init:force` |
| `npm run db:seed` | Load demo data | `npm run db:seed` |
| `npm run db:migrate` | Run migrations | `npm run db:migrate` |
| `./scripts/setup-aws-rds.sh` | Create AWS RDS | `./scripts/setup-aws-rds.sh` |
| `./scripts/run-migrations.sh` | Runner | `./scripts/run-migrations.sh [dev\|prod]` |

---

## ✅ Deployment Checklist

### Pre-Deployment

- [ ] Database initialized locally
- [ ] All seeds applied
- [ ] Migrations tested
- [ ] Environment variables configured
- [ ] Connection string verified
- [ ] Backup strategy in place

### Deployment

- [ ] AWS RDS instance created
- [ ] Security groups configured
- [ ] Database initialized on RDS
- [ ] Backups enabled (30-day retention)
- [ ] CloudWatch logs enabled
- [ ] Application connected
- [ ] Health checks passing

### Post-Deployment

- [ ] Verify table creation
- [ ] Check record counts
- [ ] Monitor CloudWatch logs
- [ ] Test backups
- [ ] Document connection details
- [ ] Set up monitoring alerts

---

## 📞 Support & Documentation

- **PostgreSQL Docs**: https://www.postgresql.org/docs/15/
- **Sequelize Docs**: https://sequelize.org/
- **AWS RDS**: https://aws.amazon.com/rds/postgresql/
- **ELIMUCORE API**: See [API_DOCUMENTATION.md](../docs/API_DOCUMENTATION.md)

---

**Status**: ✅ Production Ready  
**Last Updated**: January 22, 2026  
**Maintainer**: ELIMUCORE Team

Made with ❤️ for Kenyan Schools
