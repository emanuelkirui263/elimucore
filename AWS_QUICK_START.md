# AWS Deployment Quick Start

## 5-Minute Setup Overview

### 1. Prerequisites Installation

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Install Elastic Beanstalk CLI
pip install awsebcli --upgrade --user

# Verify installations
aws --version
eb --version
```

### 2. AWS Account Configuration

```bash
# Configure AWS credentials
aws configure

# Enter:
# AWS Access Key ID: [from IAM user]
# AWS Secret Access Key: [from IAM user]
# Default region: us-east-1
# Default output format: json

# Verify configuration
aws sts get-caller-identity
```

### 3. Create RDS Database

```bash
# Set variables
export AWS_REGION=us-east-1
export DB_PASSWORD=$(openssl rand -base64 12)
export DB_NAME="elimucore-db"

# Create database
aws rds create-db-instance \
  --db-instance-identifier $DB_NAME \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --engine-version 8.0 \
  --master-username admin \
  --master-user-password $DB_PASSWORD \
  --allocated-storage 20 \
  --region $AWS_REGION

# Wait for database to be ready (5-10 minutes)
aws rds wait db-instance-available \
  --db-instance-identifier $DB_NAME \
  --region $AWS_REGION

# Get database endpoint
aws rds describe-db-instances \
  --db-instance-identifier $DB_NAME \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text
```

### 4. Deploy Backend with Elastic Beanstalk

```bash
cd backend

# Initialize Elastic Beanstalk
eb init -p "Node.js 18 running on 64bit Amazon Linux 2" elimucore-api \
  --region us-east-1

# Create and deploy environment
eb create elimucore-api-prod \
  --instance-type t3.micro \
  --envvars \
  DB_HOST=elimucore-db.xxxxx.rds.amazonaws.com,\
DB_USER=admin,\
DB_PASSWORD=$DB_PASSWORD,\
DB_NAME=elimucore_prod,\
NODE_ENV=production,\
JWT_SECRET=$(openssl rand -hex 32)

# Deploy
git add .
git commit -m "Initial deployment"
eb deploy

# Check status
eb status
eb open
```

### 5. Deploy Frontend to S3 + CloudFront

```bash
cd ../frontend

# Build frontend
npm run build

# Create S3 bucket
export S3_BUCKET="elimucore-frontend-prod"
aws s3 mb s3://$S3_BUCKET

# Upload files
aws s3 sync dist/ s3://$S3_BUCKET/ \
  --delete \
  --cache-control "public, max-age=3600"

# Cache index.html separately (no caching)
aws s3 cp dist/index.html s3://$S3_BUCKET/index.html \
  --cache-control "public, max-age=0, must-revalidate" \
  --content-type "text/html"

# Note: CloudFront setup requires AWS Console for certificate selection
```

### 6. Setup Monitoring & Alerts

```bash
# Create SNS topic for alerts
aws sns create-topic --name elimucore-alerts

# Subscribe to alerts
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:YOUR_ACCOUNT_ID:elimucore-alerts \
  --protocol email \
  --notification-endpoint your-email@example.com
```

---

## Key AWS Console Steps

### 1. Request SSL Certificate

```
AWS Console → Certificate Manager → Request Public Certificate
  - Domain: api.yourdomain.com, app.yourdomain.com, *.yourdomain.com
  - Validation: Email or DNS
  - Copy Certificate ARN
```

### 2. Create CloudFront Distribution

```
AWS Console → CloudFront → Create Distribution
  - Origin: S3 bucket (elimucore-frontend-prod)
  - Origin Access: Restrict to OAI
  - Viewer Protocol: Redirect HTTP to HTTPS
  - Alternate Domain: app.yourdomain.com
  - SSL Certificate: Select created certificate
  - Default Root Object: index.html
  - Custom Error: 404 → /index.html (SPA routing)
```

### 3. Setup Route 53 DNS

```
AWS Console → Route 53 → Hosted Zones
  - Create CNAME or Alias for api.yourdomain.com → ALB
  - Create Alias for app.yourdomain.com → CloudFront
  - Update domain registrar nameservers if needed
```

---

## Deployment Verification

```bash
# 1. Test API endpoint
curl https://api.yourdomain.com/api/health

# 2. Test frontend
curl https://app.yourdomain.com

# 3. Check API logs
eb logs

# 4. Check CloudWatch metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ElasticBeanstalk \
  --metric-name InstanceHealth \
  --dimensions Name=EnvironmentName,Value=elimucore-api-prod \
  --start-time 2024-01-21T00:00:00Z \
  --end-time 2024-01-21T23:59:59Z \
  --period 3600 \
  --statistics Average
```

---

## Estimated Deployment Time

| Task | Time |
|------|------|
| AWS Account Setup | 10 min |
| Database Creation | 10 min |
| Backend Deployment | 15 min |
| Frontend Deployment | 5 min |
| DNS/CloudFront Setup | 15 min |
| Testing | 15 min |
| **Total** | **~70 min** |

*Note: Database creation and EB initialization are automated; you can start backend deployment while database is creating.*

---

## Cost During Deployment

- **Free Tier**: First 12 months include:
  - 750 hours EC2 (t2.micro)
  - 750 hours RDS (db.t2.micro)
  - 5GB S3 storage
  - 50GB CloudFront transfer
  - 12-month free data transfer out

- **Total First Year**: ~$50-100 (most services covered by free tier)
- **Monthly After Year 1**: ~$25-50 (base configuration)

---

## Important Commands Reference

```bash
# Elastic Beanstalk
eb create <env-name>           # Create environment
eb deploy                       # Deploy changes
eb status                      # Check status
eb logs                        # View logs
eb terminate                   # Delete environment
eb open                        # Open in browser

# AWS RDS
aws rds create-db-instance     # Create database
aws rds delete-db-instance     # Delete database
aws rds describe-db-instances  # List databases
aws rds create-db-snapshot     # Backup database

# S3
aws s3 mb s3://bucket-name     # Create bucket
aws s3 sync dir/ s3://bucket   # Upload files
aws s3 ls s3://bucket          # List files
aws s3 rm s3://bucket/file     # Delete file

# CloudFront
aws cloudfront create-invalidation --distribution-id <id> --paths "/*"
```

---

## Troubleshooting

### Backend Won't Start

```bash
# Check EB logs
eb logs

# SSH into instance
eb ssh

# Check Node process
pm2 logs

# Check environment variables
echo $DB_HOST
```

### Database Connection Error

```bash
# Check RDS status
aws rds describe-db-instances --db-instance-identifier elimucore-db

# Test connection
mysql -h <db-endpoint> -u admin -p

# Check security group
aws ec2 describe-security-groups --group-names elimucore-db-sg
```

### Frontend Not Loading

```bash
# Check S3 bucket
aws s3 ls s3://elimucore-frontend-prod/

# Check CloudFront distribution
aws cloudfront list-distributions

# Clear CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id <DISTRIBUTION_ID> \
  --paths "/*"
```

---

## Next Steps After Deployment

1. ✅ Test all endpoints manually
2. ✅ Verify HTTPS working on all domains
3. ✅ Check CloudWatch metrics
4. ✅ Test user authentication
5. ✅ Run mobile app against new API
6. ✅ Monitor error logs for issues
7. ✅ Set up regular backup testing
8. ✅ Schedule security audit
9. ✅ Plan scaling strategy
10. ✅ Gather stakeholder feedback

---

## Security Checklist After Deployment

- [ ] Enable MFA on AWS account
- [ ] Set up CloudTrail for audit logging
- [ ] Enable VPC Flow Logs
- [ ] Review security group rules
- [ ] Test backup restoration
- [ ] Verify encryption enabled on RDS
- [ ] Check S3 bucket policies
- [ ] Review CloudFront access logs
- [ ] Set up WAF rules (optional)
- [ ] Test disaster recovery procedure

---

## Support Resources

- [AWS Documentation](https://docs.aws.amazon.com/)
- [Elastic Beanstalk CLI Reference](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3.html)
- [RDS User Guide](https://docs.aws.amazon.com/rds/)
- [CloudFront Distribution Configuration](https://docs.aws.amazon.com/cloudfront/latest/developerguide/)
- [Route 53 Hosted Zones](https://docs.aws.amazon.com/route53/)

---

**Created**: January 21, 2026  
**Version**: 1.0  
**Next Update**: After first production deployment
