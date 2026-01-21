# AWS Deployment Architecture Decision Record

## Overview

This document outlines the recommended AWS architecture for ELIMUCORE deployment and the rationale behind key decisions.

---

## Deployment Options Evaluated

### Option 1: Elastic Beanstalk (Recommended for MVP)

**Recommended**: ✅ YES

**Pros**:
- Automatic scaling and load balancing
- Easy deployment (git push)
- Integrated monitoring
- Cost-effective for small teams
- No infrastructure management
- Rollback capability
- Environment management
- Free tier eligible

**Cons**:
- Less control over infrastructure
- Potential vendor lock-in
- Limited customization

**Estimated Cost**: $20-50/month

**When to use**: Development, staging, pilot deployment

**Decision Rationale**: Best for getting schools online quickly with minimal operational overhead.

---

### Option 2: EC2 + RDS + ALB

**Recommended**: ⚠️ OPTIONAL (For more control)

**Pros**:
- Complete infrastructure control
- Cost optimization options
- Manual scaling for specific needs
- Can mix instance types
- Greater customization

**Cons**:
- More operational overhead
- Requires DevOps expertise
- Manual scaling
- More services to manage

**Estimated Cost**: $30-80/month

**When to use**: High-traffic deployments, specific compliance requirements

**Decision Rationale**: Consider after MVP success and requirement to scale.

---

### Option 3: ECS/Fargate (Containerized)

**Recommended**: ❌ NOT NOW

**Why Not**:
- Overkill for current deployment
- Adds complexity
- Requires Docker expertise
- Higher learning curve
- Could reconsider for multi-school deployment

**When to reconsider**: When managing 50+ school instances

---

## Recommended Architecture: MVP (Elastic Beanstalk)

```
┌─────────────────────────────────────────────────┐
│            CloudFront CDN                        │
│        (Frontend Distribution)                   │
└──────────────────┬──────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
    ┌───▼────────┐    ┌──────▼──────┐
    │ S3 Bucket  │    │ Route 53    │
    │ (Frontend) │    │ (DNS)       │
    └────────────┘    └──────┬──────┘
                             │
                  ┌──────────┴──────────┐
                  │                     │
            ┌─────▼──────┐      ┌──────▼─────┐
            │    ALB     │      │ ACM Cert   │
            │  (HTTPS)   │      │ (SSL/TLS)  │
            └─────┬──────┘      └────────────┘
                  │
        ┌─────────▼─────────┐
        │ Elastic Beanstalk │
        │ Environment       │
        ├───────────────────┤
        │ • 2-4 t3.micro    │
        │ • Auto-scaling    │
        │ • Health checks   │
        └─────────┬─────────┘
                  │
        ┌─────────▼─────────┐
        │  RDS MySQL        │
        │  (Multi-AZ)       │
        ├───────────────────┤
        │ • db.t3.micro     │
        │ • 20GB GP3 SSD    │
        │ • Automated backup│
        │ • 30-day retain   │
        └───────────────────┘
        
    ┌───────────────────────┐
    │ CloudWatch Monitoring │
    ├───────────────────────┤
    │ • Logs                │
    │ • Metrics             │
    │ • Alarms              │
    │ • SNS Notifications   │
    └───────────────────────┘
```

---

## Technology Stack Decisions

### Database: AWS RDS MySQL

**Decision**: ✅ RDS (Managed)

**Rationale**:
1. Automatic backups and patching
2. Multi-AZ failover capability
3. Read replicas for scaling
4. Monitoring and performance insights
5. Encryption at rest and in transit
6. Fully managed (no server maintenance)
7. Cost-effective for pilot (free tier: db.t3.micro)

**Alternative Considered**: Self-managed EC2 MySQL
- ❌ Rejected: Requires manual backups, patching, higher maintenance

---

### Backend Runtime: Node.js 18 on Elastic Beanstalk

**Decision**: ✅ Elastic Beanstalk

**Rationale**:
1. Easy deployment from Git
2. Automatic scaling
3. Environment management
4. Load balancer included
5. Health check automation
6. Rolling deployments with zero downtime
7. Integrated with CloudWatch
8. Free tier eligible

**Platform Choice**: "Node.js 18 running on 64bit Amazon Linux 2"

---

### Frontend Hosting: S3 + CloudFront

**Decision**: ✅ S3 + CloudFront

**Rationale**:
1. Cheap storage ($0.023/GB)
2. Global CDN distribution
3. DDoS protection
4. Highly available (99.99% uptime SLA)
5. Easy cache invalidation
6. HTTPS/TLS standard
7. Cost-effective for single-page apps
8. Free tier eligible

**Alternative Considered**: Elastic Beanstalk static files
- ❌ Rejected: Wastes compute resources, higher cost

---

### DNS: AWS Route 53

**Decision**: ✅ Route 53

**Rationale**:
1. Integrated with other AWS services
2. Health-based routing
3. Geolocation routing
4. Supports all DNS record types
5. Health checks available
6. Simple to manage with existing infrastructure
7. Can point to CloudFront, ALB, S3 easily

**Alternative**: External registrar
- ⚠️ Acceptable: Use existing domain registrar if preferred
- Route 53 recommended for simplicity

---

### SSL/TLS Certificates: AWS Certificate Manager (ACM)

**Decision**: ✅ ACM (Free)

**Rationale**:
1. Completely free
2. Automatic renewal
3. Easy integration with CloudFront, ALB, API Gateway
4. No certificate management overhead
5. Instant issuance for verified domains

---

## Scaling Strategy

### Current (MVP Phase - 5-10 Schools)

```
Frontend: Single S3 bucket + CloudFront
Backend: Elastic Beanstalk (2-4 t3.micro instances)
Database: RDS db.t3.micro with Multi-AZ
```

**Expected capacity**: 1,000-5,000 concurrent users

---

### Phase 2 (10-50 Schools)

```
Frontend: S3 + CloudFront (no change)
Backend: Upgrade to t3.small (2-8 instances)
Database: Upgrade to db.t3.small
Caching: Add ElastiCache for session/data
```

**Expected capacity**: 10,000-50,000 concurrent users

---

### Phase 3 (100+ Schools)

```
Frontend: S3 + CloudFront (no change)
Backend: Multi-region Elastic Beanstalk
Database: RDS with read replicas + Aurora
Caching: ElastiCache cluster
CDN: Enhanced CloudFront configuration
```

**Expected capacity**: 100,000+ concurrent users

---

## Cost Analysis

### MVP Setup (First Year)

| Component | Monthly | Annual |
|-----------|---------|--------|
| Elastic Beanstalk (2 t3.micro) | $7.59 | $91.08 |
| RDS (db.t3.micro) | $9.35 | $112.20 |
| S3 Storage (1GB) | $0.50 | $6.00 |
| CloudFront (10GB) | $0.85 | $10.20 |
| Route 53 | $0.50 | $6.00 |
| **Total** | **$18.79** | **$225.48** |

*Note: Assuming AWS Free Tier eligibility (750 hours/month of compute, 5GB S3, etc.)*

### With 10-20 Schools

| Component | Monthly | Annual |
|-----------|---------|--------|
| Elastic Beanstalk (4 t3.small) | $57.50 | $690.00 |
| RDS (db.t3.small) | $31.10 | $373.20 |
| S3 Storage (50GB) | $1.25 | $15.00 |
| CloudFront (100GB) | $8.50 | $102.00 |
| Data Transfer | $15.00 | $180.00 |
| Route 53 | $0.50 | $6.00 |
| **Total** | **$113.85** | **$1,366.20** |

---

## Security Architecture

### Defense in Depth

1. **Network Level**
   - VPC with public/private subnets
   - Security groups restrict traffic
   - NACLs for subnet-level control

2. **Application Level**
   - HTTPS/TLS enforced
   - WAF rules (optional)
   - Rate limiting on API

3. **Database Level**
   - Encryption at rest (AWS-managed keys)
   - Encryption in transit (TLS)
   - Database subnet group (private)
   - IAM database authentication option
   - Automated backups with encryption

4. **Data Level**
   - S3 encryption enabled
   - Server-side encryption
   - Access logging enabled

5. **Audit & Compliance**
   - CloudTrail enabled
   - CloudWatch logs retention
   - VPC Flow Logs
   - RDS audit logs

---

## High Availability & Disaster Recovery

### MVP (Single Region)

```
Availability: 99.9% uptime SLA
RTO: < 15 minutes (Elastic Beanstalk auto-recovery)
RPO: < 5 minutes (RDS automated backup)
```

### Phase 2 (Multi-AZ)

```
Availability: 99.99% uptime SLA
RTO: < 5 minutes (automatic failover)
RPO: < 1 minute (continuous replication)
```

### Phase 3 (Multi-Region)

```
Availability: 99.999% uptime SLA
RTO: < 1 minute (DNS failover)
RPO: 0 (active-active replication)
```

---

## Monitoring & Alerting

### Key Metrics

1. **Application**
   - Response time (p50, p95, p99)
   - Error rate (5xx errors)
   - Request rate (per minute)
   - Active connections

2. **Infrastructure**
   - CPU utilization
   - Memory usage
   - Disk usage
   - Network I/O

3. **Database**
   - Connection count
   - Query latency
   - Slow query log
   - CPU and memory

4. **Business**
   - User logins
   - Feature usage
   - Data modification operations

### Alert Thresholds

| Alert | Threshold | Action |
|-------|-----------|--------|
| CPU > 80% | 5 min | Scale up |
| Memory > 85% | 5 min | Restart/Scale |
| Error rate > 5% | 1 min | Page on-call |
| Response time > 2s | 5 min | Investigate |
| DB connections > 75 | 1 min | Scale up |
| Disk space < 10% | 1 min | Alert |

---

## CI/CD Pipeline Recommendation

### Recommended: GitHub Actions + AWS

```
1. Developer pushes to branch
2. GitHub Actions runs tests
3. Merge to main triggers deployment
4. Staging environment updated automatically
5. Manual approval for production
6. Elastic Beanstalk deployment
7. Health checks verify deployment
8. Slack notification of status
```

### Alternative: AWS CodePipeline

```
Advantages:
- Native AWS integration
- Highly available
- Cost: Free for first deployment per month

Disadvantages:
- More configuration needed
- Less flexible than GitHub Actions
```

---

## Decision: GitHub Actions for MVP

**Rationale**:
1. Already familiar with GitHub (hosting code)
2. Free for public repos
3. Easy YAML configuration
4. Good documentation
5. Can migrate to CodePipeline later

---

## Deployment Strategy

### Rolling Deployment (Zero Downtime)

**Configuration**:
```
Elastic Beanstalk Rolling Update:
- Max batch size: 1 instance
- Min instances in service: 1
- Timeout: 30 minutes
- Health check: /api/health
```

**Benefits**:
- No downtime
- Automatic rollback if health check fails
- Can be monitored live

---

## Future Considerations

### Ready for Future Expansion

1. **Multi-Tenancy**
   - Database design supports separate schemas per school
   - Can deploy separate Elastic Beanstalk environment per tenant

2. **Mobile App**
   - API already designed for mobile
   - Can deploy to App Store/Play Store independently

3. **Offline Support**
   - SQLite sync-to-cloud architecture
   - Works with current API

4. **International Expansion**
   - Use CloudFront for global distribution
   - Deploy to additional AWS regions as needed
   - Multi-currency support in application

---

## Post-Deployment Roadmap

### 3 Months
- Monitor costs and usage
- Collect performance metrics
- Gather school feedback
- Plan Phase 2 scaling

### 6 Months
- Evaluate scaling needs
- Consider read replicas for database
- Implement caching layer
- Upgrade instance types if needed

### 12 Months
- Assess multi-region needs
- Plan for 100+ school architecture
- Consider managed Kubernetes (EKS)
- Implement advanced monitoring

---

## Conclusion

The recommended MVP architecture using **Elastic Beanstalk + RDS + S3 + CloudFront** provides:

✅ **Cost-Effective**: ~$20-25/month during free tier  
✅ **Scalable**: Grows with demand  
✅ **Secure**: Enterprise-grade security  
✅ **Reliable**: 99.9% uptime SLA  
✅ **Maintainable**: Minimal operational overhead  
✅ **Future-Proof**: Easy to expand  

**Next Steps**:
1. Follow AWS deployment checklist
2. Deploy to staging first
3. Run load testing
4. Gather pilot school feedback
5. Plan Phase 2 scaling

---

**Document Version**: 1.0  
**Last Updated**: January 21, 2026  
**Next Review**: When deploying Phase 2 or after 3 months in production
