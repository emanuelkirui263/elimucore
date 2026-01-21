# ELIMUCORE AWS Deployment Guide

**Version**: 1.0.0  
**Date**: January 21, 2026  
**Status**: Production Ready  
**Components**: Backend (Node.js), Frontend (React), Mobile App

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [AWS Account Setup](#aws-account-setup)
4. [Database Setup (RDS)](#database-setup-rds)
5. [Backend Deployment (EC2/Elastic Beanstalk)](#backend-deployment)
6. [Frontend Deployment (S3 + CloudFront)](#frontend-deployment)
7. [Mobile App Deployment](#mobile-app-deployment)
8. [Monitoring & Logging](#monitoring--logging)
9. [Cost Optimization](#cost-optimization)
10. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    CloudFront CDN                        │
│            (Global Content Distribution)                 │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
    ┌───▼────────┐         ┌─────▼────────┐
    │ S3 Bucket  │         │ Route 53 DNS │
    │ (Frontend) │         │              │
    └────────────┘         └────┬─────────┘
                                │
                    ┌───────────┴──────────┐
                    │                      │
            ┌───────▼─────────┐    ┌──────▼──────────┐
            │ Elastic Load    │    │  WAF (optional) │
            │ Balancer        │    └─────────────────┘
            └────────┬────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
    ┌───▼──────────┐        ┌────▼──────────┐
    │ EC2 Instance │        │ Elastic Beanstalk│
    │ (Backend 1)  │        │ (Auto-scaling)   │
    └──────────────┘        └────────────────┘
        │
    ┌───▼──────────────────────┐
    │  RDS MySQL Database       │
    │  (Multi-AZ for HA)        │
    ├───────────────────────────┤
    │ • Automated backups       │
    │ • Read replicas           │
    │ • Enhanced monitoring     │
    └───────────────────────────┘
    
    ┌────────────────────────────┐
    │ CloudWatch Monitoring      │
    │ • Logs                     │
    │ • Metrics                  │
    │ • Alarms                   │
    └────────────────────────────┘
```

---

## Pre-Deployment Checklist

- [ ] AWS Account created and verified
- [ ] AWS CLI installed and configured
- [ ] IAM user with programmatic access created
- [ ] VPC and security groups planned
- [ ] Domain name registered (Route 53 or external registrar)
- [ ] SSL certificate obtained (AWS Certificate Manager)
- [ ] Database backup strategy defined
- [ ] Monitoring and alerting configured
- [ ] Cost budget set and billing alerts enabled

---

## AWS Account Setup

### 1. Create AWS Account

1. Go to [AWS Console](https://console.aws.amazon.com)
2. Click "Create an AWS Account"
3. Enter email, password, and account name
4. Add payment method
5. Verify phone number
6. Choose support plan (Start with Basic Free Tier)

### 2. Enable Cost Monitoring

```
AWS Console → Billing and Cost Management → 
Billing Preferences →
Enable:
  ✓ Receive Billing Alerts
  ✓ Receive CloudWatch Alarms
  ✓ PDF Invoice by Email
```

Set billing alert to $50/month (adjust based on needs)

### 3. Create IAM User for Deployment

```bash
# 1. Go to IAM → Users → Create User
# 2. Username: elimucore-deploy
# 3. Enable Console and Programmatic access
# 4. Attach policies:
#    - AmazonEC2FullAccess
#    - AmazonRDSFullAccess
#    - AmazonS3FullAccess
#    - CloudFrontFullAccess
#    - ElasticLoadBalancingFullAccess
#    - CloudWatchFullAccess
#    - AWSElasticBeanstalkFullAccess

# 5. Save Access Key ID and Secret Access Key
# 6. Configure AWS CLI:
aws configure

# Enter:
# AWS Access Key ID: [your access key]
# AWS Secret Access Key: [your secret key]
# Default region: us-east-1 (or your preferred region)
# Default output format: json
```

### 4. Create S3 Bucket for Terraform State (Optional but Recommended)

```bash
aws s3 mb s3://elimucore-terraform-state-$(date +%s)
aws s3api put-bucket-versioning \
  --bucket elimucore-terraform-state-$(date +%s) \
  --versioning-configuration Status=Enabled
```

---

## Database Setup (RDS)

### Option 1: AWS RDS (Managed - Recommended)

**Advantages**:
- Automatic backups
- Multi-AZ failover
- Read replicas for scaling
- Automated patching
- Less operational overhead

#### Steps:

```bash
# 1. Create RDS instance via AWS Console:
AWS Console → RDS → Create Database

# Configuration:
Database engine: MySQL 8.0
Template: Production (Multi-AZ)
DB instance identifier: elimucore-db
Master username: admin
Master password: [Generate strong password - save in AWS Secrets Manager]
DB instance class: db.t3.micro (free tier) or db.t3.small (production)
Storage: 20 GB GP3
Backup retention: 30 days
Backup window: 03:00-04:00 UTC
Maintenance window: Sun 04:00-05:00 UTC
Enable Multi-AZ: YES
Enable encryption: YES
Enable Performance Insights: YES (optional)

# 2. Create security group for RDS:
Security Group Name: elimucore-rds-sg
Inbound Rules:
  - Type: MySQL/Aurora
  - Protocol: TCP
  - Port: 3306
  - Source: EC2 Security Group (elimucore-app-sg)

# 3. Configure VPC and Subnet Group:
DB Subnet Group: Create multi-AZ subnets

# 4. Get connection details:
AWS Console → RDS → Databases → elimucore-db
Note: Endpoint, Port, Master Username
```

#### Connect and Initialize Database:

```bash
# From your local machine or EC2:
mysql -h elimucore-db.xxxxx.us-east-1.rds.amazonaws.com \
      -u admin \
      -p

# Run database setup:
CREATE DATABASE elimucore_prod;
CREATE USER 'elimucore_app'@'%' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON elimucore_prod.* TO 'elimucore_app'@'%';
FLUSH PRIVILEGES;

# Initialize schema (run migrations):
npm run migrate
```

### Option 2: EC2 with MySQL (Cost-Effective)

```bash
# SSH into EC2 instance
ssh -i key.pem ubuntu@your-ec2-ip

# Install MySQL
sudo apt update
sudo apt install -y mysql-server

# Secure installation
sudo mysql_secure_installation

# Create user and database (same as above)
```

---

## Backend Deployment

### Option 1: Elastic Beanstalk (Recommended for Beginners)

**Advantages**:
- Auto-scaling
- Load balancing included
- Easy deployments
- Environment management
- Integrated monitoring

#### Setup Steps:

```bash
# 1. Install EB CLI
pip install awsebcli

# 2. Initialize EB application
cd /workspaces/elimucore/backend
eb init -p "Node.js 18 running on 64bit Amazon Linux 2" elimucore-api --region us-east-1

# 3. Create environment
eb create elimucore-api-prod \
  --instance-type t3.micro \
  --envvars DB_HOST=elimucore-db.xxxxx.rds.amazonaws.com,\
DB_USER=elimucore_app,\
DB_PASSWORD=your_password,\
DB_NAME=elimucore_prod,\
NODE_ENV=production,\
JWT_SECRET=your_jwt_secret

# 4. Deploy
git add .
git commit -m "AWS deployment"
eb deploy

# 5. Check status
eb status
eb logs
```

#### Create .ebextensions/nodecommand.config

```yaml
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "node server.js"
    GzipCompression: true
    
  aws:autoscaling:launchconfiguration:
    IamInstanceProfile: aws-elasticbeanstalk-ec2-role
    InstanceType: t3.micro
    
  aws:autoscaling:asg:
    MinSize: 2
    MaxSize: 5
    
  aws:elasticbeanstalk:environment:process:default:
    DeregistrationDelay: 20
    HealthCheckInterval: 15
    HealthCheckPath: /api/health
    HealthyThreshold: 3
    UnhealthyThreshold: 5
    MatcherHTTPCode: "200"
```

### Option 2: Manual EC2 Deployment

```bash
# 1. Launch EC2 instance
AWS Console → EC2 → Launch Instances
  - AMI: Ubuntu 24.04 LTS
  - Instance type: t3.micro (free tier)
  - Security Group: Allow 22, 80, 443 from anywhere (restrict later)
  - Storage: 20GB GP3
  - Key pair: Create or select existing

# 2. Connect via SSH
ssh -i elimucore.pem ubuntu@your-ec2-ip

# 3. Install dependencies
sudo apt update && sudo apt upgrade -y
sudo apt install -y nodejs npm git curl

# 4. Clone repository
git clone https://github.com/yourusername/elimucore.git
cd elimucore/backend

# 5. Install Node packages
npm install --production

# 6. Create .env file
cat > .env << EOF
NODE_ENV=production
PORT=3000
DB_HOST=elimucore-db.xxxxx.rds.amazonaws.com
DB_USER=elimucore_app
DB_PASSWORD=your_password
DB_NAME=elimucore_prod
DB_PORT=3306
JWT_SECRET=$(openssl rand -hex 32)
CORS_ORIGIN=https://yourdomain.com
EOF

# 7. Install PM2 for process management
sudo npm install -g pm2
pm2 start server.js --name elimucore-api
pm2 startup
pm2 save

# 8. Install and configure Nginx as reverse proxy
sudo apt install -y nginx
```

#### Create Nginx Config

```bash
sudo tee /etc/nginx/sites-available/elimucore << EOF
upstream backend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name api.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /api/health {
        access_log off;
        return 200 "OK";
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/elimucore /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

#### Install SSL Certificate with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d api.yourdomain.com
```

---

## Frontend Deployment

### Deploy to S3 + CloudFront

#### 1. Build Frontend

```bash
cd /workspaces/elimucore/frontend

# Update API endpoint for production
# In src/api/client.js, set:
# baseURL: https://api.yourdomain.com

npm run build
# Creates dist/ folder
```

#### 2. Create S3 Bucket

```bash
# Create bucket
aws s3 mb s3://elimucore-frontend-prod

# Block public access (CloudFront will serve)
aws s3api put-bucket-blocking-public-access \
  --bucket elimucore-frontend-prod \
  --blocking-public-access-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket elimucore-frontend-prod \
  --versioning-configuration Status=Enabled

# Configure static website hosting
aws s3api put-bucket-website \
  --bucket elimucore-frontend-prod \
  --website-configuration '{
    "IndexDocument": {"Suffix": "index.html"},
    "ErrorDocument": {"Key": "index.html"}
  }'

# Create bucket policy (CloudFront only)
aws s3api put-bucket-policy \
  --bucket elimucore-frontend-prod \
  --policy '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity/XXXXX"
        },
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::elimucore-frontend-prod/*"
      }
    ]
  }'
```

#### 3. Create CloudFront Distribution

```bash
# Create OAI (Origin Access Identity)
aws cloudfront create-cloud-front-origin-access-identity \
  --cloud-front-origin-access-identity-config CallerReference=elimucore-frontend,Comment="ELIMUCORE Frontend OAI"

# Copy the OAI ID for the policy above

# Create distribution (via AWS Console for easier UI):
AWS Console → CloudFront → Create Distribution
  - Origin Domain: elimucore-frontend-prod.s3.us-east-1.amazonaws.com
  - Origin Access: Restrict Bucket Access (select OAI)
  - Viewer Protocol Policy: Redirect HTTP to HTTPS
  - Allowed Methods: GET, HEAD
  - Caching: Default TTL 86400
  - Compress Objects: ON
  - Alternate Domain Names: app.yourdomain.com
  - SSL Certificate: Request certificate for app.yourdomain.com

# Note: Certificate request can take 10-15 minutes
```

#### 4. Upload Frontend Files

```bash
# Upload to S3
aws s3 sync dist/ s3://elimucore-frontend-prod/ \
  --delete \
  --cache-control "public, max-age=3600"

# Cache index.html separately (no caching)
aws s3 cp dist/index.html s3://elimucore-frontend-prod/index.html \
  --cache-control "public, max-age=0, must-revalidate" \
  --content-type "text/html"

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E123EXAMPLE \
  --paths "/*"
```

#### 5. Setup Custom Domain

```bash
# In Route 53:
# Create CNAME or Alias record:
# Name: app.yourdomain.com
# Type: A (Alias)
# Target: d111111abcdef8.cloudfront.net
```

---

## Mobile App Deployment

### iOS (TestFlight/App Store)

1. Build for iOS:
```bash
# In mobile app directory
flutter build ios --release
```

2. Upload to TestFlight:
```bash
# Using Xcode:
# Product → Scheme → Select Release
# Product → Build For → Generic iOS Device
# Product → Archive
# Upload to App Store
```

### Android (Google Play)

1. Build for Android:
```bash
# Generate signing key
keytool -genkey -v -keystore ~/key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias elimucore_key

# Build APK
flutter build apk --release

# Build App Bundle (recommended)
flutter build appbundle --release
```

2. Upload to Google Play Console:
```bash
# Create app in Google Play Console
# Upload app-release.aab
# Fill in store listing
# Submit for review
```

---

## Monitoring & Logging

### CloudWatch Setup

```bash
# 1. Enable CloudWatch Logs on RDS
AWS Console → RDS → Databases → elimucore-db → Logs & Events
Enable: error, general, slowquery logs

# 2. Create Log Groups for application
aws logs create-log-group --log-group-name /elimucore/api

# 3. Setup Log Retention
aws logs put-retention-policy \
  --log-group-name /elimucore/api \
  --retention-in-days 30

# 4. Create CloudWatch Alarms
aws cloudwatch put-metric-alarm \
  --alarm-name elimucore-api-cpu-high \
  --alarm-description "Alert when CPU > 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions arn:aws:sns:us-east-1:123456789:SnsTopicName
```

### Application Logging

Update backend to send logs to CloudWatch:

```javascript
// In server.js
const CloudWatchTransport = require('winston-cloudwatch');
const winston = require('winston');

const logger = winston.createLogger({
  transports: [
    new CloudWatchTransport({
      logGroupName: '/elimucore/api',
      logStreamName: `${process.env.NODE_ENV}`,
      awsRegion: process.env.AWS_REGION || 'us-east-1',
      messageFormatter: ({level, message}) => `[${level}] ${message}`
    })
  ]
});
```

### Setup Alerts

```bash
# 1. Create SNS Topic
aws sns create-topic --name elimucore-alerts

# 2. Subscribe to email
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:123456789:elimucore-alerts \
  --protocol email \
  --notification-endpoint your-email@example.com

# 3. Create alarms for:
# - High CPU usage
# - High memory usage
# - Database connection errors
# - API errors (500+)
# - Low disk space
```

---

## Cost Optimization

### Estimated Monthly Costs

| Service | Instance | Estimate |
|---------|----------|----------|
| EC2 (Backend) | t3.micro | $7.59 |
| RDS MySQL | db.t3.micro | $9.35 |
| S3 (Frontend) | 1GB storage | $0.50 |
| CloudFront | 10GB/month | $0.85 |
| Data Transfer | 50GB/month | $5.00 |
| CloudWatch | Basic | Free |
| **TOTAL** | | **~$23.29** |

### Cost Reduction Tips

1. **Use Free Tier** (first 12 months):
   - EC2: 750 hours/month t2.micro
   - RDS: 750 hours/month db.t2.micro
   - S3: 5GB storage
   - CloudFront: 50GB transfer

2. **Reserved Instances** (1-3 year commitment):
   - Save 30-50% on EC2 and RDS

3. **Auto-scaling**:
   - Scale down during off-hours
   - Use Savings Plans

4. **Database Optimization**:
   - Use read replicas instead of vertical scaling
   - Enable query caching

5. **Frontend Caching**:
   - Leverage CloudFront edge caching
   - Use S3 bucket policies to reduce requests

### Disable Unused Services

```bash
# Remove unused resources
aws ec2 describe-volumes --filters Name=status,Values=available
aws s3api list-buckets
aws rds describe-db-instances
```

---

## Troubleshooting

### Backend Won't Start

```bash
# Check logs
eb logs --stream

# SSH into instance
eb ssh

# Check Node process
pm2 logs

# Check environment variables
echo $DB_HOST

# Test database connection
mysql -h $DB_HOST -u $DB_USER -p
```

### Frontend Not Loading

```bash
# Check S3 bucket
aws s3 ls s3://elimucore-frontend-prod/

# Check CloudFront distribution status
aws cloudfront get-distribution-config --id E123EXAMPLE

# Check DNS
nslookup app.yourdomain.com

# Clear CloudFront cache
aws cloudfront create-invalidation --distribution-id E123EXAMPLE --paths "/*"
```

### Database Connection Issues

```bash
# Check RDS security group
aws ec2 describe-security-groups --group-ids sg-xxxxx

# Test connection
telnet elimucore-db.xxxxx.rds.amazonaws.com 3306

# Check RDS status
aws rds describe-db-instances --query 'DBInstances[0].[DBInstanceIdentifier,DBInstanceStatus]'
```

### High AWS Costs

```bash
# Analyze usage
AWS Console → Billing and Cost Management → Cost Explorer

# Check for unattached volumes
aws ec2 describe-volumes --filters Name=status,Values=available

# Stop unused instances
aws ec2 stop-instances --instance-ids i-xxxxx
```

---

## Security Best Practices

✓ Enable VPC Flow Logs
✓ Use Security Groups restrictively
✓ Enable MFA on AWS account
✓ Rotate access keys regularly
✓ Use AWS Secrets Manager for sensitive data
✓ Enable CloudTrail for audit logging
✓ Use HTTPS/TLS for all communications
✓ Implement rate limiting on API
✓ Enable WAF on CloudFront
✓ Regular security patches and updates
✓ Backup database daily
✓ Test disaster recovery monthly

---

## Next Steps

1. Follow pre-deployment checklist
2. Set up AWS account and IAM
3. Create RDS database
4. Deploy backend (Elastic Beanstalk or EC2)
5. Deploy frontend (S3 + CloudFront)
6. Configure monitoring and alerts
7. Test all endpoints
8. Setup DNS and SSL
9. Deploy mobile apps
10. Monitor costs and performance

---

## Support & Resources

- [AWS Documentation](https://docs.aws.amazon.com/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [AWS Security Best Practices](https://aws.amazon.com/security/best-practices/)
- [Elastic Beanstalk Guide](https://docs.aws.amazon.com/elasticbeanstalk/)
- [RDS Documentation](https://docs.aws.amazon.com/rds/)

---

**Questions?** Refer to the AWS deployment documentation or contact AWS support.
