# AWS Deployment Troubleshooting & FAQ

## Common Issues & Solutions

### 🔴 Backend Issues

#### Issue: Elastic Beanstalk environment fails to create

**Error**: `InsufficientCapacityException` or similar

**Solutions**:
1. Try different instance type: `t3.small` instead of `t3.micro`
2. Check AWS Free Tier eligibility in that region
3. Wait a few minutes and retry
4. Try different availability zone

```bash
# Terminate and recreate
eb terminate
eb create elimucore-api-prod --instance-type t3.small
```

---

#### Issue: Application crashes after deployment

**Check logs**:
```bash
eb logs
eb logs --stream  # Real-time logs

# SSH into instance
eb ssh
pm2 logs
```

**Common causes**:
1. Database connection failed → Check security groups
2. Environment variables missing → Check `eb config`
3. Node version mismatch → Specify version in package.json
4. Missing dependencies → Run `npm ci --production`

**Fix**:
```bash
# Update environment variables
eb setenv DB_HOST=your-endpoint

# Deploy again
eb deploy

# Check status
eb status
```

---

#### Issue: "Cannot connect to database" error

**Diagnose**:
```bash
# SSH into EB instance
eb ssh

# Try to connect to database
mysql -h elimucore-db.xxxxx.rds.amazonaws.com -u admin -p

# Test from your local machine
telnet elimucore-db.xxxxx.rds.amazonaws.com 3306
```

**Solutions**:
1. **Security Group Issue**: Backend security group must be allowed by RDS security group
   ```bash
   # Get backend security group ID
   aws ec2 describe-security-groups \
     --filters "Name=tag:Name,Values=elimucore-backend-sg"
   
   # Add to RDS security group
   aws ec2 authorize-security-group-ingress \
     --group-id sg-xxxxxx \
     --protocol tcp --port 3306 \
     --source-group sg-yyyyyy
   ```

2. **Database not created**: Run migrations
   ```bash
   eb ssh
   cd /var/app/current
   npm run migrate
   ```

3. **Wrong endpoint**: Check if endpoint is correct
   ```bash
   aws rds describe-db-instances --query 'DBInstances[0].Endpoint.Address'
   ```

---

#### Issue: Health check failing

**Error**: Instances marked as "Unhealthy"

**Diagnose**:
```bash
# Check health check path
eb ssh
curl http://localhost:3000/api/health

# Check logs
pm2 logs
```

**Solutions**:
1. Implement health check endpoint if missing:
   ```javascript
   app.get('/api/health', (req, res) => {
     res.status(200).json({ status: 'OK' });
   });
   ```

2. Update health check path in EB config:
   ```yaml
   # .ebextensions/01-nodejs.config
   HealthCheckPath: /api/health
   ```

3. Increase timeout (default 5s):
   ```yaml
   HealthCheckTimeoutSeconds: 10
   ```

---

#### Issue: 502 Bad Gateway error

**Cause**: Application not responding through load balancer

**Solutions**:
```bash
# 1. Check if app is running
eb ssh
pm2 status

# 2. Check if app is listening on port 3000
netstat -tlnp | grep 3000

# 3. Restart application
pm2 restart all

# 4. Check nginx
sudo systemctl status nginx
sudo nginx -t

# 5. Check logs
sudo tail -f /var/log/nginx/error.log
```

---

### 🔴 Frontend Issues

#### Issue: S3 bucket not found

**Error**: `NoSuchBucket`

**Solutions**:
```bash
# Verify bucket exists
aws s3 ls

# Create bucket if missing
aws s3 mb s3://elimucore-frontend-prod

# Check bucket region
aws s3api get-bucket-location --bucket elimucore-frontend-prod
```

---

#### Issue: "Access Denied" when uploading to S3

**Solutions**:
```bash
# Check IAM permissions
aws sts get-caller-identity

# Verify bucket policy
aws s3api get-bucket-policy --bucket elimucore-frontend-prod

# Fix: Grant public access for CloudFront
aws s3api put-bucket-policy --bucket elimucore-frontend-prod \
  --policy file://bucket-policy.json
```

**bucket-policy.json**:
```json
{
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
}
```

---

#### Issue: Frontend returns 403 Forbidden

**Cause**: CloudFront Origin Access is misconfigured

**Solutions**:
1. Verify CloudFront OAI is in bucket policy
2. Recreate OAI:
   ```bash
   aws cloudfront create-cloud-front-origin-access-identity \
     --cloud-front-origin-access-identity-config \
     CallerReference=elimucore-frontend,Comment="ELIMUCORE Frontend OAI"
   ```

3. Update CloudFront distribution with new OAI

---

#### Issue: SPA routing not working (404 on page refresh)

**Solution**: Configure error page handling in CloudFront

**AWS Console**:
```
CloudFront → Distribution → Error Pages
  - Error Code: 404
  - Response Page Path: /index.html
  - HTTP Response Code: 200
```

**Or via CLI**:
```bash
# Create error response config file and update distribution
aws cloudfront update-distribution-config \
  --id DISTRIBUTION_ID \
  --distribution-config file://config.json
```

---

#### Issue: Website not loading through CloudFront

**Troubleshoot**:
```bash
# 1. Check if files are in S3
aws s3 ls s3://elimucore-frontend-prod/

# 2. Verify CloudFront distribution is deployed
aws cloudfront get-distribution-status --id DISTRIBUTION_ID

# 3. Check DNS resolution
nslookup app.yourdomain.com

# 4. Check HTTP vs HTTPS
curl -v https://app.yourdomain.com

# 5. Clear CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id DISTRIBUTION_ID \
  --paths "/*"
```

---

### 🔴 Database Issues

#### Issue: RDS instance won't start

**Solutions**:
```bash
# Check instance status
aws rds describe-db-instances \
  --db-instance-identifier elimucore-db \
  --query 'DBInstances[0].DBInstanceStatus'

# If in failed state, restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier elimucore-db-restored \
  --db-snapshot-identifier snapshot-id

# Or delete and recreate
aws rds delete-db-instance \
  --db-instance-identifier elimucore-db \
  --final-db-snapshot-identifier elimucore-db-final-snapshot
```

---

#### Issue: "Database is full" error

**Solutions**:
```bash
# Check disk space
aws rds describe-db-instances \
  --db-instance-identifier elimucore-db \
  --query 'DBInstances[0].AllocatedStorage'

# Increase storage
aws rds modify-db-instance \
  --db-instance-identifier elimucore-db \
  --allocated-storage 40 \
  --apply-immediately

# Check for large tables
mysql -h endpoint -u admin -p
SELECT table_name, ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.TABLES
WHERE table_schema = 'elimucore_prod'
ORDER BY size_mb DESC;
```

---

#### Issue: High database latency

**Solutions**:
```bash
# 1. Check current connections
mysql> SHOW PROCESSLIST;
mysql> SHOW STATUS LIKE 'Threads%';

# 2. Enable slow query log
aws rds modify-db-instance \
  --db-instance-identifier elimucore-db \
  --enable-cloudwatch-logs-exports slowquery

# 3. Check slow query log
aws logs tail /aws/rds/instance/elimucore-db/slowquery

# 4. Optimize slow queries
mysql> EXPLAIN SELECT ...;
```

---

#### Issue: Cannot restore from backup

**Solutions**:
```bash
# List available snapshots
aws rds describe-db-snapshots \
  --db-instance-identifier elimucore-db

# Restore to new instance
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier elimucore-db-restore \
  --db-snapshot-identifier snapshot-id

# Monitor restoration progress
watch -n 5 'aws rds describe-db-instances \
  --db-instance-identifier elimucore-db-restore \
  --query "DBInstances[0].[DBInstanceStatus,PercentProgress]"'
```

---

### 🔴 Network & DNS Issues

#### Issue: Domain not resolving

**Diagnose**:
```bash
# Check DNS records
dig app.yourdomain.com
nslookup app.yourdomain.com

# Check Route 53
aws route53 list-resource-record-sets \
  --hosted-zone-id ZONE_ID
```

**Solutions**:
1. Verify Route 53 hosted zone
2. Check domain registrar nameservers
3. Wait for DNS propagation (up to 48 hours)
4. Clear DNS cache:
   ```bash
   sudo systemctl restart systemd-resolved
   ```

---

#### Issue: SSL certificate not valid

**Solutions**:
```bash
# Check certificate status
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:region:account:certificate/id

# Request new certificate if needed
aws acm request-certificate \
  --domain-name app.yourdomain.com \
  --subject-alternative-names api.yourdomain.com

# Update Elastic Beanstalk with new cert
eb config
# Update HTTPS certificate ARN
```

---

#### Issue: "Mixed content" warning in browser

**Cause**: HTTPS page loading HTTP resources

**Solutions**:
1. Update frontend to use HTTPS URLs
2. Add security header:
   ```javascript
   // In backend
   app.use((req, res, next) => {
     res.setHeader('Content-Security-Policy', 
       "upgrade-insecure-requests");
     next();
   });
   ```

3. Ensure CloudFront redirects HTTP → HTTPS

---

### 🔴 Monitoring & Logging Issues

#### Issue: CloudWatch logs not appearing

**Solutions**:
```bash
# Verify log group exists
aws logs describe-log-groups

# Create log group if missing
aws logs create-log-group --log-group-name /elimucore/api

# Check if application is writing logs
eb ssh
tail -f /var/log/nodejs/nodejs.log

# Verify IAM permissions for logging
aws iam list-attached-role-policies \
  --role-name aws-elasticbeanstalk-ec2-role
```

---

#### Issue: Alarms not triggering

**Solutions**:
```bash
# List alarms
aws cloudwatch describe-alarms

# Check alarm state
aws cloudwatch describe-alarms \
  --alarm-names elimucore-api-cpu-high

# Check SNS subscription
aws sns list-subscriptions-by-topic \
  --topic-arn arn:aws:sns:region:account:elimucore-alerts

# Test alarm
aws cloudwatch set-alarm-state \
  --alarm-name elimucore-api-cpu-high \
  --state-value ALARM \
  --state-reason "Manual test"
```

---

### 🔴 Cost Issues

#### Issue: Unexpected high costs

**Investigate**:
```bash
# Check EC2 instances
aws ec2 describe-instances \
  --query 'Reservations[].Instances[].[InstanceId,InstanceType,State.Name]'

# Check RDS instances
aws rds describe-db-instances \
  --query 'DBInstances[].[DBInstanceIdentifier,DBInstanceClass]'

# Check unattached volumes
aws ec2 describe-volumes \
  --filters Name=status,Values=available

# Check failed deployments (wasted resources)
aws elasticbeanstalk describe-environments \
  --query 'Environments[].[EnvironmentName,Status]'
```

**Common causes**:
1. Forgot to terminate old environments
2. Unattached EBS volumes
3. Old RDS snapshots
4. High data transfer costs

**Solutions**:
```bash
# Delete unused resources
aws elasticbeanstalk terminate-environment --environment-name old-env

aws ec2 delete-volume --volume-id vol-xxxxx

aws rds delete-db-snapshot --db-snapshot-identifier snapshot-id
```

---

## 📋 Troubleshooting Checklist

### When something breaks:

1. **Identify the issue**
   - [ ] Check CloudWatch logs
   - [ ] Check error logs
   - [ ] Check recent changes

2. **Gather information**
   - [ ] Note exact error message
   - [ ] Check AWS Console status
   - [ ] Check resource metrics

3. **Try quick fixes**
   - [ ] Restart instance/service
   - [ ] Clear cache (CloudFront)
   - [ ] Redeploy application

4. **Check common causes**
   - [ ] Security groups/Network ACLs
   - [ ] Environment variables
   - [ ] Permissions/IAM roles
   - [ ] Resource quotas

5. **Review logs systematically**
   - [ ] Application logs
   - [ ] System logs
   - [ ] Database logs
   - [ ] CloudFront logs

6. **Test connectivity**
   - [ ] Ping endpoints
   - [ ] Connect to database
   - [ ] Check DNS resolution

7. **Document and escalate**
   - [ ] Log the issue and fix
   - [ ] Update runbook
   - [ ] Notify team if necessary

---

## 🆘 When to Escalate

Contact AWS Support if:
1. Resource limits exceeded (quota increase needed)
2. Service unavailability (AWS-side outage)
3. Suspected account compromise
4. Billing disputes or anomalies
5. Complex infrastructure troubleshooting
6. Performance optimization consultation

---

## 📞 Support Contacts

### AWS Support
- **Console**: https://console.aws.amazon.com/support/
- **Phone**: Available with paid support plan
- **Email**: aws-support@amazon.com

### Community
- AWS Forums: https://forums.aws.amazon.com/
- Stack Overflow: Tag `amazon-web-services`
- Reddit: r/aws

### Documentation
- Official Docs: https://docs.aws.amazon.com/
- Blog: https://aws.amazon.com/blogs/
- Training: https://www.aws.training/

---

## 📝 Incident Report Template

```
Date: ________________
Time Started: ________________
Time Resolved: ________________
Duration: ________________

Issue Description:
_________________________________

Root Cause:
_________________________________

Impact:
- [ ] Backend affected
- [ ] Frontend affected
- [ ] Users affected
- [ ] Data affected

Resolution Steps:
1. ________________________
2. ________________________
3. ________________________

Prevention:
- [ ] Update monitoring
- [ ] Update runbook
- [ ] Code changes
- [ ] Infrastructure changes

Lessons Learned:
_________________________________

Sign-off: ________________  Date: ________
```

---

**Last Updated**: January 21, 2026  
**Version**: 1.0  
**Maintained By**: DevOps Team
