# ELIMUCORE AWS Pre-Deployment Checklist

## Account & IAM Setup

### AWS Account
- [ ] AWS account created
- [ ] Billing information verified
- [ ] Payment method added
- [ ] Monthly budget set (e.g., $100)
- [ ] Billing alerts configured
- [ ] Cost Explorer reviewed

### IAM Configuration
- [ ] Root account MFA enabled
- [ ] IAM user created for deployment
- [ ] Access keys generated and saved securely
- [ ] AWS CLI configured (`aws configure`)
- [ ] IAM user has required permissions:
  - [ ] AmazonEC2FullAccess
  - [ ] AmazonRDSFullAccess
  - [ ] AmazonS3FullAccess
  - [ ] CloudFrontFullAccess
  - [ ] ElasticLoadBalancingFullAccess
  - [ ] CloudWatchFullAccess
  - [ ] AWSElasticBeanstalkFullAccess
  - [ ] AWSSecretsManagerReadWrite
  - [ ] IAMReadOnlyAccess

---

## Infrastructure Preparation

### Domain & DNS
- [ ] Domain name registered
- [ ] DNS registrar account access confirmed
- [ ] Route 53 hosted zone created (optional)
- [ ] Domain nameservers configured

### SSL Certificates
- [ ] AWS Certificate Manager (ACM) access configured
- [ ] SSL certificate requested for:
  - [ ] api.yourdomain.com
  - [ ] app.yourdomain.com
  - [ ] *.yourdomain.com (wildcard)
- [ ] Certificate validation completed
- [ ] Certificate ARN noted

### Networking
- [ ] VPC planned (CIDR blocks: 10.0.0.0/16)
- [ ] Subnet plan created:
  - [ ] Public subnets for ALB/NAT
  - [ ] Private subnets for RDS
- [ ] Security groups defined:
  - [ ] ALB (80, 443 from 0.0.0.0/0)
  - [ ] Backend (3000 from ALB, 22 from limited IPs)
  - [ ] Database (3306 from backend only)
- [ ] Key pair created and saved safely
- [ ] NAT Gateway configured (optional for private subnet access)

---

## Database Preparation

### RDS Configuration
- [ ] RDS instance type selected (db.t3.micro for dev/staging)
- [ ] Storage size planned (20GB minimum)
- [ ] Backup strategy defined (30-day retention)
- [ ] Multi-AZ enabled for production
- [ ] Encryption enabled
- [ ] Enhanced monitoring planned
- [ ] Master username/password stored securely
- [ ] Parameter group configured if needed
- [ ] Option group configured if needed

### Database Credentials
- [ ] Master password generated (12+ characters, special chars)
- [ ] Application user credentials created
- [ ] Credentials stored in AWS Secrets Manager
- [ ] Database initialization script prepared

---

## Backend Deployment Preparation

### Code Preparation
- [ ] Git repository ready
- [ ] All dependencies in package.json
- [ ] Environment variables documented
- [ ] .env files in .gitignore
- [ ] Database migrations created
- [ ] Health check endpoint implemented (`GET /api/health`)
- [ ] Error handling configured
- [ ] Logging configured

### Build & Dependencies
- [ ] `npm install` tested locally
- [ ] `npm run build` succeeds (if needed)
- [ ] `npm start` works correctly
- [ ] Node version specified in package.json
- [ ] All node_modules included or .npmrc configured

### Elastic Beanstalk Configuration
- [ ] Elastic Beanstalk CLI installed
- [ ] .ebextensions directory created with:
  - [ ] 01-nodejs.config
  - [ ] 02-ssl.config
  - [ ] 03-monitoring.config
- [ ] Platform selected (Node.js 18 on 64bit Amazon Linux 2)
- [ ] Instance type chosen (t3.micro for free tier)
- [ ] Load balancer configured
- [ ] Environment variables list prepared

### Alternative: EC2 Deployment
- [ ] EC2 AMI selected (Ubuntu 24.04 LTS)
- [ ] Instance type chosen
- [ ] Security group rules defined
- [ ] SSH key configured
- [ ] Nginx configuration prepared
- [ ] SSL certificate renewal plan (Let's Encrypt)
- [ ] Process manager setup (PM2)

---

## Frontend Deployment Preparation

### Build Configuration
- [ ] React/Vite build configured
- [ ] `npm run build` tested locally
- [ ] dist/ directory contents verified
- [ ] API endpoint updated for production
- [ ] Environment variables configured
- [ ] Asset optimization enabled
- [ ] Source maps disabled for production

### S3 Configuration
- [ ] S3 bucket naming convention decided
- [ ] Bucket versioning enabled
- [ ] Public access blocked
- [ ] Server-side encryption enabled
- [ ] Lifecycle policies planned
- [ ] CORS configured if needed

### CloudFront Configuration
- [ ] Origin Access Identity (OAI) created
- [ ] Distribution settings planned:
  - [ ] Viewer protocol policy (HTTPS redirect)
  - [ ] Default root object (index.html)
  - [ ] Error pages configured
  - [ ] TTL settings optimized
  - [ ] Compression enabled
- [ ] Alternate domain names configured
- [ ] SSL certificate selected
- [ ] Cache invalidation strategy defined

---

## Mobile App Deployment Preparation

### iOS
- [ ] Apple Developer account created
- [ ] Team ID obtained
- [ ] Provisioning profiles created
- [ ] Signing certificate generated
- [ ] Bundle identifier defined
- [ ] App name finalized
- [ ] App icons created (multiple sizes)
- [ ] Screenshots prepared

### Android
- [ ] Google Play Developer account created
- [ ] App signing key generated
- [ ] Keystore file secured
- [ ] Package name defined
- [ ] App icons created
- [ ] Screenshots prepared
- [ ] Privacy policy prepared
- [ ] App category selected

---

## Monitoring & Logging Setup

### CloudWatch
- [ ] Log groups planned
- [ ] Log retention period set (30 days recommended)
- [ ] Metric alarms defined:
  - [ ] CPU utilization > 80%
  - [ ] Database connections high
  - [ ] Error rate > 5%
  - [ ] Response time > 5s
- [ ] SNS topics created
- [ ] Email subscriptions configured
- [ ] Dashboards planned

### Application Logging
- [ ] Logging library configured (winston, bunyan, etc.)
- [ ] Log levels set appropriately
- [ ] CloudWatch integration configured
- [ ] Log aggregation planned

### Health Checks
- [ ] Health check endpoint implemented
- [ ] Response time requirements defined
- [ ] Failure thresholds configured
- [ ] Recovery procedures documented

---

## Security Configuration

### Access & Authentication
- [ ] AWS MFA enabled for all users
- [ ] VPN access configured (optional)
- [ ] SSH key access restricted to specific IPs
- [ ] Bastion host configured (optional)
- [ ] IAM policies follow principle of least privilege
- [ ] Regular access key rotation scheduled

### Network Security
- [ ] VPC Flow Logs enabled
- [ ] Security group rules minimized
- [ ] Network ACLs configured
- [ ] AWS WAF rules planned (optional)
- [ ] DDoS protection reviewed (Shield Standard)

### Data Security
- [ ] Encryption at rest enabled (RDS, S3, EBS)
- [ ] Encryption in transit (TLS/HTTPS)
- [ ] Secrets stored in Secrets Manager
- [ ] Database backups encrypted
- [ ] Database replication encryption enabled
- [ ] S3 bucket encryption enabled

### Compliance
- [ ] CloudTrail enabled for audit logging
- [ ] Data residency requirements reviewed
- [ ] Backup and disaster recovery plan documented
- [ ] Data retention policies set
- [ ] GDPR/local compliance requirements reviewed

---

## Cost Optimization

### Estimated Monthly Costs
- [ ] Compute costs estimated
- [ ] Database costs estimated
- [ ] Storage costs estimated
- [ ] Data transfer costs estimated
- [ ] Budget comparison with alternatives done
- [ ] Cost breakdown documented

### Optimization Strategies
- [ ] Free Tier eligibility confirmed (if applicable)
- [ ] Auto-scaling configured
- [ ] Reserved instances planned for production
- [ ] Spot instances evaluated for non-critical workloads
- [ ] Unused resources identified
- [ ] Cost anomaly detection enabled

---

## Backup & Disaster Recovery

### Backup Strategy
- [ ] RDS automated backups configured
- [ ] Backup retention period set (30+ days)
- [ ] Backup encryption enabled
- [ ] Backup testing scheduled monthly
- [ ] Point-in-time recovery documented
- [ ] Backup cross-region replication planned (production)

### Disaster Recovery
- [ ] RTO (Recovery Time Objective) defined
- [ ] RPO (Recovery Point Objective) defined
- [ ] Failover procedures documented
- [ ] Multi-AZ deployment configured for production
- [ ] Read replicas planned for scaling
- [ ] Disaster recovery drills scheduled

---

## Documentation

### Technical Documentation
- [ ] Architecture diagram created
- [ ] Deployment procedure documented
- [ ] Environment variables documented
- [ ] Database schema documented
- [ ] API endpoint documentation complete
- [ ] Troubleshooting guide prepared

### Operational Documentation
- [ ] Monitoring dashboard link documented
- [ ] Alert handling procedures documented
- [ ] Backup/recovery procedures documented
- [ ] Scaling procedures documented
- [ ] Rollback procedures documented
- [ ] On-call runbook prepared

### Team Knowledge
- [ ] Deployment process documented
- [ ] Team training completed
- [ ] Access credentials securely shared
- [ ] Post-deployment checklist prepared
- [ ] Incident response plan documented

---

## Pre-Deployment Testing

### Local Testing
- [ ] Backend runs locally without errors
- [ ] Frontend builds and runs locally
- [ ] Database connectivity tested
- [ ] API endpoints tested
- [ ] Authentication flow tested
- [ ] Error handling tested

### Staging Environment
- [ ] Staging environment deployed (if applicable)
- [ ] Load testing performed
- [ ] Performance baseline established
- [ ] Security scanning performed
- [ ] User acceptance testing (UAT) completed
- [ ] Mobile app testing completed

### Production Readiness
- [ ] All tests passed
- [ ] Code review completed
- [ ] Security audit passed
- [ ] Performance requirements met
- [ ] Compliance requirements met
- [ ] Stakeholder approval obtained

---

## Deployment Execution

### Pre-Deployment
- [ ] Team notified of deployment
- [ ] Maintenance window scheduled (if needed)
- [ ] Rollback plan confirmed
- [ ] Communication channels ready
- [ ] Monitoring dashboards open
- [ ] Backup verified

### During Deployment
- [ ] Follow deployment procedure step-by-step
- [ ] Monitor logs and metrics
- [ ] Test critical functionality
- [ ] Monitor error rates
- [ ] Document any issues

### Post-Deployment
- [ ] Smoke tests passed
- [ ] User acceptance testing completed
- [ ] Performance metrics verified
- [ ] Error rates acceptable
- [ ] Backups verified
- [ ] Team debriefing completed
- [ ] Issues documented for future improvement

---

## Sign-Off

- [ ] Development Team Lead: __________________ Date: __________
- [ ] DevOps/Infrastructure: __________________ Date: __________
- [ ] Product Owner: __________________ Date: __________
- [ ] Security Officer (if applicable): __________________ Date: __________

---

## Post-Deployment Monitoring (First 7 Days)

- [ ] Day 1: Check error rates, CPU, memory
- [ ] Day 2-3: Monitor database performance
- [ ] Day 4-5: Test failover and recovery
- [ ] Day 6-7: Performance baseline analysis
- [ ] Throughout: Monitor cost trends

---

**Last Updated**: January 21, 2026  
**Next Review**: Before each deployment
