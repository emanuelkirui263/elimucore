# Testing ELIMUCORE with XAMPP

**Date**: January 21, 2026  
**Purpose**: Complete guide to test ELIMUCORE using XAMPP's MySQL  
**Status**: All systems compatible with XAMPP

---

## 🔍 Quick Answer

**Can ELIMUCORE work with XAMPP?**
- ✅ **YES** - XAMPP's MySQL works perfectly
- ⚠️ **BUT** - You still need Node.js (XAMPP provides Apache/PHP, not Node)
- ✅ **Result** - Backend runs separately, MySQL from XAMPP

---

## 📋 What You Need

### XAMPP Provides:
- ✅ **MySQL** (database) - ELIMUCORE uses this
- ❌ **Apache/PHP** (web server) - We don't use this (we have Express.js)

### You Still Need:
- ✅ **Node.js** 14+ (for Express backend)
- ✅ **npm** (for dependencies)
- ✅ **Git** (to pull code)

---

## 🚀 Step-by-Step Setup

### Step 1: Install XAMPP
```bash
# Download from https://www.apachefriends.org/
# Choose your OS (Windows, Mac, Linux)
# Install with default settings
```

### Step 2: Start XAMPP MySQL
```bash
# Open XAMPP Control Panel
# Click "Start" next to MySQL
# Wait for it to say "Running"

# Verify MySQL is running
mysql -u root -p
# Password: (leave blank, just press Enter)
# If successful, you'll see: mysql>
# Exit with: exit
```

### Step 3: Install Node.js (if not already installed)
```bash
# Download from https://nodejs.org/
# Choose LTS version
# Install with default settings

# Verify installation
node --version   # Should show v14+ 
npm --version    # Should show 8+
```

### Step 4: Clone ELIMUCORE
```bash
# Create a folder for development
mkdir ~/Projects
cd ~/Projects

# Clone the repository
git clone https://github.com/emanuelkirui263/elimucore.git
cd elimucore
```

### Step 5: Setup Backend
```bash
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env for XAMPP MySQL
nano .env
```

**Update `.env` to use XAMPP MySQL:**
```dotenv
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=elimucore
DB_USER=root
DB_PASSWORD=              # Leave blank (XAMPP default)

# Server Configuration
NODE_ENV=development
PORT=5000

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRY=7d
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRY=30d

# API Configuration
API_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173

# Logging
LOG_LEVEL=debug

# CORS
CORS_ORIGIN=http://localhost:5173

# Demo Credentials
DEMO_EMAIL=admin@elimucore.com
DEMO_PASSWORD=password
```

### Step 6: Create Database in MySQL
```bash
# Login to MySQL
mysql -u root

# Run these commands in MySQL shell:
CREATE DATABASE IF NOT EXISTS elimucore;
USE elimucore;
SHOW TABLES;
# Should show empty (tables will be created when app starts)
exit
```

### Step 7: Start Backend Server
```bash
# In backend folder, run:
npm run dev

# You should see:
# ✓ Server running on port 5000
# ✓ Database connected
# ✓ Models synced
```

**If you see errors:**
```
Error: connect ECONNREFUSED 127.0.0.1:3306
→ MySQL not running. Start it in XAMPP Control Panel

Error: ER_ACCESS_DENIED_FOR_USER
→ Check .env password field (should be blank for XAMPP)

Error: Error: listen EADDRINUSE :::5000
→ Port 5000 already in use. Stop other Node apps or change PORT in .env
```

### Step 8: Setup Frontend (New Terminal Window)
```bash
cd elimucore/frontend

# Install dependencies
npm install

# Start development server
npm run dev

# You should see:
# ✓ Local: http://localhost:5173
```

### Step 9: Access the Application
```
Open browser: http://localhost:5173
Login with:
  Email: admin@elimucore.com
  Password: password
```

---

## ✅ Testing Checklist

### Test 1: Can Login?
```
✓ Navigate to http://localhost:5173
✓ Enter demo credentials
✓ Click Login
✓ Should see Dashboard
```

**If login fails:**
- Check backend console for errors
- Verify MySQL is running
- Check .env DATABASE settings

### Test 2: Create a Student
```
1. Click "Students" in left menu
2. Click "Add Student"
3. Fill in:
   - First Name: John
   - Last Name: Doe
   - Admission Number: ADM001
   - Gender: MALE
   - Date of Birth: 2009-01-15
4. Click "Save"
5. Should see "Student created successfully"
```

**If save fails:**
- Check backend console for error message
- Verify MySQL tables were created
- Check student data validation

### Test 3: Check MySQL Data
```bash
# Open MySQL from Terminal:
mysql -u root elimucore

# Run queries to verify data:
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM students;
SELECT COUNT(*) FROM schools;

# Should show data if students were created
exit
```

### Test 4: Test Subject Enrollment (v1.2.0)
```
1. Click "Academics" menu
2. Click "Enrollment"
3. Select a student
4. Select subjects to enroll in
5. Click "Save"
6. Should see "Student enrolled in subjects"

# Verify in MySQL:
mysql -u root elimucore
SELECT * FROM "StudentSubjectEnrollments" LIMIT 5;
```

### Test 5: Check Database Tables
```bash
# Check if all tables created
mysql -u root elimucore
SHOW TABLES;

# Should see 21 tables including:
# - Students
# - Marks
# - StudentSubjectEnrollments (NEW)
# - StudentProgression (NEW)
# - AcademicYears
# - etc.

# Check StudentSubjectEnrollment table structure:
DESCRIBE StudentSubjectEnrollments;

# Check StudentProgression table:
DESCRIBE StudentProgressions;
```

---

## 🔧 Troubleshooting

### Issue: "Can't connect to MySQL server"
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solution:**
1. Open XAMPP Control Panel
2. Look for MySQL row
3. If not running, click "Start"
4. Wait 5-10 seconds
5. Try again

**Alternative - Start MySQL from command line:**
```bash
# Windows
C:\xampp\mysql\bin\mysqld.exe

# Mac
/Applications/XAMPP/xamppfiles/bin/mysqld_safe

# Linux
/opt/lampp/bin/mysqld_safe
```

### Issue: "Access denied for user 'root'@'localhost'"
```
Error: ER_ACCESS_DENIED_FOR_USER
```

**Solution:**
1. Check .env file
2. Verify `DB_PASSWORD=` (empty, not "password")
3. If XAMPP MySQL has password, update .env:
   ```
   DB_PASSWORD=your_xampp_password
   ```

### Issue: "Unknown database 'elimucore'"
```
Error: ER_BAD_DB_ERROR
```

**Solution:**
1. Create database manually:
   ```bash
   mysql -u root
   CREATE DATABASE elimucore;
   exit
   ```
2. Restart backend server
3. Server will auto-create tables

### Issue: Port 5000 already in use
```
Error: listen EADDRINUSE :::5000
```

**Solution - Option 1: Kill process using port**
```bash
# Mac/Linux
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Solution - Option 2: Use different port**
```bash
# Edit .env:
PORT=5001

# Or run with:
PORT=5001 npm run dev
```

### Issue: "Tables not creating"
```
Backend starts but no tables in MySQL
```

**Solution:**
1. Check backend console for errors
2. Verify Sequelize is configured correctly
3. Manually run migrations:
   ```bash
   npm run migrate
   ```
4. Restart backend server

### Issue: Frontend can't reach backend
```
CORS error when trying to login
```

**Solution:**
1. Check backend is running on port 5000
2. Verify CORS in backend/server.js is configured
3. Check FRONTEND_URL in .env matches actual frontend URL
4. Edit backend/.env:
   ```
   CORS_ORIGIN=http://localhost:5173
   ```
5. Restart backend

### Issue: XAMPP MySQL takes too long to start
```
MySQL shows "Running" but very slow
```

**Solution:**
1. Close XAMPP and restart
2. Or increase timeout in XAMPP settings
3. Or increase MySQL memory allocation
4. Check system has enough resources (RAM, disk)

---

## 🧪 Testing Workflows

### Complete Login → Create Student → Enroll Workflow
```bash
# Terminal 1: Start MySQL (XAMPP)
# Terminal 2: Start Backend
cd backend && npm run dev

# Terminal 3: Start Frontend
cd frontend && npm run dev

# Browser: http://localhost:5173
1. Login (admin@elimucore.com / password)
2. Go to Students
3. Add Student (John Doe, ADM001)
4. Go to Academics → Enrollment
5. Find John Doe
6. Enroll in subjects
7. Go to Academics → Marks
8. Add marks for John's enrolled subjects
9. Should be able to save marks
10. Should NOT be able to add marks for non-enrolled subjects
```

**Expected Results:**
✅ Enrollment successful  
✅ Subject enrollment saved to DB  
✅ Mark entry validates enrollment  
✅ Can see mark in database  

### Database Verification Workflow
```bash
# While application is running

# Terminal 4: Check database
mysql -u root elimucore

# Check students created
SELECT COUNT(*) FROM students;
# Should show: 1 (John Doe)

# Check enrollment
SELECT * FROM "StudentSubjectEnrollments";
# Should show John enrolled in subjects

# Check marks
SELECT * FROM marks;
# Should show mark entry

# Verify constraints work
INSERT INTO marks (studentId, examId, subjectId, marksObtained, totalMarks)
VALUES (1, 1, 1, 150, 100);
# Should ERROR: Check constraint failed (marks > 100)

exit
```

---

## 📊 Monitoring Backend

### While Testing, Monitor These Logs:

**Backend Console Should Show:**
```
✓ Listening on port 5000
✓ Database connection successful
✓ Models synced with database
```

**When You Create Student:**
```
Executing (default): INSERT INTO users...
Executing (default): INSERT INTO students...
Sequelize: INSERT INTO schools...
```

**When You Enroll in Subjects:**
```
Executing (default): INSERT INTO "StudentSubjectEnrollments"...
Executing (default): INSERT INTO marks...
```

**If Error Occurs:**
```
❌ Validation error: [ValidationError: Validation error]
❌ Constraint error: ER_DUP_ENTRY
❌ Type error: Cannot read property 'x' of undefined
```

### Enable Debug Mode:
```bash
# Edit backend/.env:
LOG_LEVEL=debug

# Restart backend
npm run dev

# Will show detailed SQL queries
```

---

## 🔌 API Testing (Optional)

If you want to test API endpoints directly:

### Test Login Endpoint
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@elimucore.com","password":"password"}'

# Response should be:
{
  "message": "Login successful",
  "user": {...},
  "token": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Test Create Student
```bash
curl -X POST http://localhost:5000/api/students \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName":"Jane",
    "lastName":"Smith",
    "admissionNumber":"ADM002",
    "gender":"FEMALE",
    "dateOfBirth":"2009-06-15"
  }'
```

### Test Enrollment
```bash
curl -X POST http://localhost:5000/api/academics/enrollment \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId":"...",
    "subjectId":"...",
    "isOptional":false
  }'
```

---

## 📋 Pre-Testing Checklist

Before you start testing:

- [ ] XAMPP installed
- [ ] MySQL started (XAMPP Control Panel)
- [ ] Node.js installed
- [ ] Code cloned from GitHub
- [ ] Backend dependencies installed (`npm install`)
- [ ] `.env` file created with correct DB settings
- [ ] Database created (`CREATE DATABASE elimucore`)
- [ ] Frontend dependencies installed
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Can access http://localhost:5173 in browser

---

## ✅ Success Indicators

**You'll know it's working when:**

1. ✅ Backend console shows "Database connected"
2. ✅ Browser shows login page (http://localhost:5173)
3. ✅ Can login with demo credentials
4. ✅ Dashboard loads without errors
5. ✅ Can create a student
6. ✅ Can view students in list
7. ✅ Can enroll student in subjects
8. ✅ Can enter marks for enrolled subjects
9. ✅ Data persists after page refresh
10. ✅ MySQL shows tables with data

**Each ✅ means that component is working:**
- ✅ 1-2: MySQL + Node.js + Sequelize
- ✅ 3-4: Frontend React + Authentication
- ✅ 5-6: API endpoints working
- ✅ 7-8: Business logic (enrollment validation)
- ✅ 9: Database persistence
- ✅ 10: Data integrity

---

## 🎯 Common Test Scenarios

### Scenario 1: Test KCSE Subject Enrollment
```
1. Create Student → Form 3
2. Go to Enrollment
3. Enroll in: English, Kiswahili, Math, Science, Social, CRE
4. Add optional: Computer Studies
5. Verify 8 total (7 mandatory + 1 optional)
6. Try to add 2nd optional → should error
7. ✅ System working
```

### Scenario 2: Test Progression
```
1. Create Student → Form 1
2. View progression
3. Mark as "Repeat Form 2"
4. Verify progression history shows both years
5. Try to view marks for both forms
6. ✅ System working
```

### Scenario 3: Test Data Integrity
```
1. Try to create 2 students with same admission number
2. Should error: "Admission number must be unique"
3. Try to enter mark > 100
4. Should error: "Mark must be 0-100"
5. ✅ System working
```

---

## 📞 Getting Help

**If something doesn't work:**

1. **Check backend console** - Look for error message
2. **Check browser console** - Press F12, look for red errors
3. **Check MySQL** - Verify database and tables exist
4. **Check ports** - Make sure 5000 and 5173 are not in use
5. **Check .env** - Verify all settings correct
6. **Restart everything** - Kill all processes and restart fresh

**Common error solutions:**
| Error | Solution |
|-------|----------|
| Port 5000 in use | Change PORT in .env or kill process |
| MySQL won't start | Restart XAMPP or check system resources |
| Can't login | Check database was created and backend running |
| Blank dashboard | Check browser console for errors (F12) |
| Data not saving | Check MySQL error in backend console |

---

## 🚀 Next Steps After Testing

Once you confirm everything works:

1. **Run all tests:**
   ```bash
   npm run test
   ```

2. **Check endpoints:**
   - Login/Logout
   - Create student
   - Enroll in subjects
   - Enter marks
   - View reports

3. **Test with real data:**
   - Create 10+ students
   - Enroll all in subjects
   - Enter marks for exams
   - Generate reports

4. **Monitor performance:**
   - Check backend response times (should be < 100ms)
   - Check database query logs
   - Check frontend load times

5. **Then deploy:**
   - To staging server
   - To pilot schools (5-10)
   - To production (20+ schools)

---

## ✨ Summary

**Can you test ELIMUCORE with XAMPP?**

✅ **YES**
- Use XAMPP's MySQL (works perfectly)
- Use Node.js for backend (separate from XAMPP)
- Use React dev server for frontend (separate)
- System is fully compatible

**Simple setup:**
1. Start XAMPP MySQL
2. Clone code
3. Setup backend (`npm install` + `.env`)
4. Setup frontend (`npm install`)
5. Run backend & frontend in separate terminals
6. Access http://localhost:5173
7. Login & test

**You'll know it works when:**
- Backend console: "Database connected" ✓
- Frontend: Login page loads ✓
- Can create students ✓
- Data saves to MySQL ✓

---

**Ready to test? Start with Step 1: Install XAMPP!**

