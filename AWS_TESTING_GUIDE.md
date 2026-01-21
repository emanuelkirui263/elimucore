# ELIMUCORE AWS Deployment - Testing Guide

## Phase 1: Pre-Deployment Local Testing

### 1. Test Backend Locally

```bash
cd backend

# Install dependencies
npm install

# Test that it starts
npm start

# In another terminal, test health check
curl http://localhost:3000/api/health
# Expected: { "status": "OK" }

# Test a sample API endpoint
curl http://localhost:3000/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test"}'

# Check logs for errors
# Press Ctrl+C to stop
```

### 2. Test Frontend Locally

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Verify dist folder exists
ls -la dist/

# Start dev server
npm run dev

# Visit http://localhost:5173 in browser
# Check browser console for errors (F12)
```

### 3. Verify Database Connection

```bash
# If using local MySQL
mysql -u root -p

# Connect to database
USE elimucore_dev;

# Check tables
SHOW TABLES;

# Check a sample query
SELECT COUNT(*) FROM users;

# Exit
exit;
```

---

## Phase 2: Pre-Deployment Checks

### 1. Verify Configuration Files

```bash
# Check backend config
cat backend/.ebextensions/01-nodejs.config
cat backend/.ebextensions/02-ssl.config
cat backend/.ebextensions/03-monitoring.config

# Check if scripts are executable
ls -l scripts/deploy*.sh
# Should show -rwxrwxrwx (executable)

# Verify CloudFormation template
cat infrastructure/cloudformation.yaml | head -20
```

### 2. Verify Environment Variables

```bash
# Check template has required vars
grep "DB_HOST\|JWT_SECRET\|CORS_ORIGIN" backend/.env.example

# Verify all required vars are documented
cat AWS_ENV_CONFIGURATION.md | grep -A 50 "Backend (.env)"
```

### 3. Check Package.json

```bash
# Verify backend has required scripts
cat backend/package.json | grep -A 10 '"scripts"'

# Should include: start, dev, test, migrate

# Verify frontend has required scripts
cat frontend/package.json | grep -A 10 '"scripts"'

# Should include: dev, build, preview, test
```

---

## Phase 3: Dry-Run Testing

### 1. Test Deployment Script (Dry-Run)

```bash
# Check what the script will do (don't execute yet)
cat scripts/deploy-aws.sh | head -50

# Verify AWS credentials are configured
aws sts get-caller-identity
# Should show: Account ID, UserId, Arn

# Test AWS CLI connectivity
aws ec2 describe-regions --output table
# Should list AWS regions
```

### 2. Validate CloudFormation Template

```bash
# Validate CloudFormation syntax
aws cloudformation validate-template \
  --template-body file://infrastructure/cloudformation.yaml

# Expected output: TemplateDescription, Parameters, etc.
```

### 3. Test Individual Scripts

```bash
# Check backend deployment script syntax
bash -n scripts/deploy-backend.sh
# No output = syntax OK

# Check frontend deployment script syntax
bash -n scripts/deploy-frontend.sh

# Check main deployment script syntax
bash -n scripts/deploy-aws.sh
```

---

## Phase 4: Quick AWS Deployment Test (Minimal)

If you want to test just one component:

### Option A: Deploy Only Backend to EC2

```bash
# 1. Create EC2 instance manually in AWS Console
#    - Ubuntu 24.04 LTS
#    - t3.micro
#    - Security group allows 22, 3000

# 2. SSH into instance
ssh -i key.pem ubuntu@your-ec2-ip

# 3. Run backend deployment script
# (after uploading or cloning repo)
./scripts/deploy-backend.sh

# 4. Test from local machine
curl http://your-ec2-ip:3000/api/health

# Expected: { "status": "OK" }
```

### Option B: Deploy Only Frontend to S3

```bash
# 1. Configure AWS credentials
aws configure

# 2. Test S3 bucket creation
aws s3 mb s3://elimucore-test-$(date +%s) --region us-east-1

# 3. Run frontend deployment
CLOUDFRONT_DISTRIBUTION_ID="" ./scripts/deploy-frontend.sh

# 4. List files in bucket
aws s3 ls s3://elimucore-test-xxxx/
```

---

## Phase 5: Full Deployment Testing

### 1. Run Full Deployment Script

```bash
# Make script executable (if not already)
chmod +x scripts/deploy-aws.sh

# Set environment
export AWS_REGION=us-east-1
export ENVIRONMENT=production

# Run deployment (this will take ~45 minutes)
./scripts/deploy-aws.sh

# Watch for success messages
# Look for: "Deployment Complete!"
```

### 2. Monitor Deployment Progress

**In another terminal:**

```bash
# Watch Elastic Beanstalk deployment
watch -n 5 'eb status'

# Check EC2 instances
watch -n 5 'aws ec2 describe-instances --query "Reservations[].Instances[].[InstanceId,State.Name,InstanceType]"'

# Check RDS database
watch -n 5 'aws rds describe-db-instances --query "DBInstances[0].[DBInstanceIdentifier,DBInstanceStatus,Endpoint.Address]"'
```

---

## Phase 6: Post-Deployment Verification

### 1. Test Backend API Endpoints

```bash
# Get Elastic Beanstalk URL
API_URL=$(eb open --print-url)

# Test health check
curl $API_URL/api/health
# Expected: { "status": "OK" }

# Test with verbose output
curl -v $API_URL/api/health

# Should see:
# - HTTP/1.1 200 OK
# - Content-Type: application/json
# - { "status": "OK" }
```

### 2. Test Database Connectivity

```bash
# From EC2 instance, test MySQL connection
aws rds describe-db-instances \
  --db-instance-identifier elimucore-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text

# Get endpoint and try connecting
mysql -h elimucore-db.xxxxx.rds.amazonaws.com \
      -u admin \
      -p

# Query database
SHOW DATABASES;
USE elimucore_prod;
SELECT COUNT(*) FROM users;
```

### 3. Test Frontend

```bash
# Visit CloudFront URL in browser
https://app.yourdomain.com

# Or test S3 directly
https://s3.us-east-1.amazonaws.com/elimucore-frontend-prod/index.html

# Check in browser:
# - Page loads without errors
# - No 404 errors
# - CSS loads correctly
# - JavaScript runs (check console F12)
```

### 4. Test API Integration

```bash
# Test authentication endpoint
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test"}' \
  -v

# Should get 200 or 401 (not 500)
```

### 5. Check CloudWatch Logs

```bash
# View EB logs
eb logs

# View specific log lines
eb logs --stream

# View RDS logs
aws logs describe-log-groups
aws logs tail /aws/rds/instance/elimucore-db/error
aws logs tail /aws/rds/instance/elimucore-db/slowquery

# View CloudFront logs (if enabled)
aws cloudfront list-distributions
```

---

## Phase 7: Monitoring & Health Checks

### 1. CloudWatch Metrics

```bash
# Check CPU utilization
aws cloudwatch get-metric-statistics \
  --namespace AWS/EC2 \
  --metric-name CPUUtilization \
  --dimensions Name=AutoScalingGroupName,Value=elimucore-asg \
  --start-time 2024-01-21T00:00:00Z \
  --end-time 2024-01-21T23:59:59Z \
  --period 3600 \
  --statistics Average,Maximum

# Check database connections
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name DatabaseConnections \
  --dimensions Name=DBInstanceIdentifier,Value=elimucore-db \
  --start-time 2024-01-21T00:00:00Z \
  --end-time 2024-01-21T23:59:59Z \
  --period 3600 \
  --statistics Average
```

### 2. Health Check Alarms

```bash
# List all alarms
aws cloudwatch describe-alarms

# Check specific alarm state
aws cloudwatch describe-alarms \
  --alarm-names elimucore-api-cpu-high

# Expected states:
# - OK: Everything normal
# - ALARM: Threshold exceeded
# - INSUFFICIENT_DATA: Not enough data yet
```

### 3. Application Performance

```bash
# Test API response time
time curl https://api.yourdomain.com/api/health

# Should be < 500ms total

# Load test (optional, use ab or wrk)
ab -n 100 -c 10 https://api.yourdomain.com/api/health

# or using wrk
wrk -t4 -c100 -d30s https://api.yourdomain.com/api/health
```

---

## Phase 8: Integration Testing

### 1. Test Login Flow

```bash
# 1. Test login endpoint
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@elimucore.com",
    "password": "InitialPassword123"
  }' -v

# 2. Should get JWT token in response
# 3. Copy token and use for authenticated request

TOKEN="eyJhbGc..."

curl -X GET https://api.yourdomain.com/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -v

# Should return user list (not 401 Unauthorized)
```

### 2. Test Student Management

```bash
# Create student
curl -X POST https://api.yourdomain.com/api/students \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@school.com",
    "admissionNumber": "ADM001"
  }' -v

# Expected: 201 Created with student ID
```

### 3. Test Attendance Marking

```bash
# Mark attendance
curl -X POST https://api.yourdomain.com/api/attendance \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "123",
    "date": "2024-01-21",
    "status": "present"
  }' -v

# Expected: 200 OK or 201 Created
```

### 4. Test Marks Entry

```bash
# Enter marks
curl -X POST https://api.yourdomain.com/api/marks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "123",
    "subjectId": "456",
    "marks": 85,
    "examType": "midterm"
  }' -v

# Expected: 200 OK
```

---

## Phase 9: Frontend Testing

### 1. Manual Testing

Open https://app.yourdomain.com and test:

- [ ] Page loads without errors
- [ ] Navigation works
- [ ] Can login with credentials
- [ ] Dashboard displays correctly
- [ ] Can navigate to student section
- [ ] Can navigate to marks section
- [ ] Can navigate to attendance section
- [ ] Logout works
- [ ] Responsive design (mobile, tablet, desktop)

### 2. Browser Console Testing

Press F12 and check:

```javascript
// Check for console errors (should be none)
console.log(document.readyState)
// Should be "complete"

// Test API connectivity
fetch('https://api.yourdomain.com/api/health')
  .then(r => r.json())
  .then(data => console.log(data))
// Should log: { "status": "OK" }
```

### 3. Performance Testing

```bash
# Test frontend performance
lighthouse https://app.yourdomain.com --view

# Check:
# - Performance score > 80
# - Accessibility score > 80
# - Best practices score > 80
# - SEO score > 80
```

---

## Phase 10: Mobile App Testing

### 1. Connect to API

Update mobile app API endpoint:

```javascript
// In mobile app config
const API_BASE_URL = 'https://api.yourdomain.com/api';
```

### 2. Test Mobile Features

- [ ] Can login
- [ ] Can view student list
- [ ] Can view marks
- [ ] Can view attendance
- [ ] Can submit attendance
- [ ] Can view reports
- [ ] Offline mode works (if implemented)
- [ ] Sync works when back online

### 3. Test on Different Devices

- [ ] iOS device (iPhone)
- [ ] Android device (Android phone)
- [ ] Tablet (iOS/Android)
- [ ] Different network conditions (WiFi, 4G, 3G)

---

## Quick Checklist

### ✅ Before Deployment
- [ ] Backend starts locally without errors
- [ ] Frontend builds successfully
- [ ] Database migrations run without errors
- [ ] Health check endpoint responds
- [ ] AWS credentials configured
- [ ] CloudFormation template validates
- [ ] All scripts are executable

### ✅ During Deployment
- [ ] Elastic Beanstalk environment creates
- [ ] RDS database becomes available
- [ ] S3 bucket created
- [ ] CloudFront distribution created
- [ ] No errors in logs

### ✅ After Deployment
- [ ] API health check passes
- [ ] Database connection successful
- [ ] Frontend loads without errors
- [ ] Login functionality works
- [ ] CRUD operations work (Create, Read, Update, Delete)
- [ ] Mobile app connects to API
- [ ] CloudWatch monitoring shows metrics
- [ ] No errors in CloudWatch logs

---

## Troubleshooting Test Failures

### If health check fails:

```bash
# 1. SSH into EB instance
eb ssh

# 2. Check if app is running
pm2 status

# 3. Check logs
pm2 logs

# 4. Check if port 3000 is listening
netstat -tlnp | grep 3000

# 5. Test locally
curl http://localhost:3000/api/health
```

### If database connection fails:

```bash
# 1. Check database is running
aws rds describe-db-instances \
  --query 'DBInstances[0].DBInstanceStatus'

# 2. Check security group
aws ec2 describe-security-groups \
  --group-names elimucore-db-sg

# 3. Test connection
mysql -h endpoint -u admin -p
```

### If frontend doesn't load:

```bash
# 1. Check S3 bucket
aws s3 ls s3://elimucore-frontend-prod/

# 2. Check CloudFront
aws cloudfront list-distributions

# 3. Check DNS
nslookup app.yourdomain.com

# 4. Clear CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id DISTRIBUTION_ID \
  --paths "/*"
```

---

## Success Criteria

✅ **All tests pass when:**

1. ✅ API health endpoint responds with 200
2. ✅ Database queries return results
3. ✅ Frontend loads without errors
4. ✅ Login/authentication works
5. ✅ CRUD operations functional
6. ✅ Mobile app connects to API
7. ✅ CloudWatch logs show activity
8. ✅ Monitoring alarms configured
9. ✅ HTTPS working on all domains
10. ✅ Response times < 500ms

**If all above pass → Deployment successful! 🎉**

---

## Next Steps

1. ✅ Run all tests
2. ✅ Document any issues
3. ✅ Fix issues using AWS_TROUBLESHOOTING.md
4. ✅ Gather feedback from pilot schools
5. ✅ Monitor for 7 days
6. ✅ Plan Phase 2 expansion
