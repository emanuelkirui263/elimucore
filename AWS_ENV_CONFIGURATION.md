# AWS Environment Configuration Templates

## Production Environment

### Backend (.env)

```
# Server Configuration
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Database Configuration
DB_HOST=elimucore-db.xxxxx.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_NAME=elimucore_prod
DB_USER=elimucore_app
DB_PASSWORD=your_secure_password_here
DB_POOL_MAX=20
DB_POOL_MIN=5

# Authentication
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRY=7d
REFRESH_TOKEN_EXPIRY=30d

# CORS & Security
CORS_ORIGIN=https://app.yourdomain.com,https://teacher-app.yourdomain.com
CORS_CREDENTIALS=true
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# AWS Services
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Logging & Monitoring
CLOUDWATCH_ENABLED=true
CLOUDWATCH_LOG_GROUP=/elimucore/api
CLOUDWATCH_LOG_STREAM=production

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=noreply@elimucore.io

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_BUCKET=elimucore-uploads

# Session Configuration
SESSION_SECRET=your_session_secret
SESSION_TIMEOUT=3600

# API Configuration
API_VERSION=v1
API_PREFIX=/api/v1
API_TIMEOUT=30000
```

### Frontend (.env)

```
# Vite Environment
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
VITE_ENVIRONMENT=production
VITE_APP_NAME=ELIMUCORE

# Features
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false

# Authentication
VITE_JWT_STORAGE_KEY=elimucore_token
VITE_REFRESH_TOKEN_KEY=elimucore_refresh_token

# Session
VITE_SESSION_TIMEOUT=3600000
VITE_INACTIVITY_TIMEOUT=1800000

# File Upload
VITE_MAX_UPLOAD_SIZE=10485760
VITE_ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx,jpg,jpeg,png
```

## Staging Environment

### Backend (.env.staging)

```
NODE_ENV=staging
PORT=3000
LOG_LEVEL=debug

DB_HOST=elimucore-db-staging.xxxxx.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_NAME=elimucore_staging
DB_USER=elimucore_app_staging
DB_PASSWORD=staging_password

JWT_SECRET=staging_jwt_secret
CORS_ORIGIN=https://staging-app.yourdomain.com

AWS_REGION=us-east-1
CLOUDWATCH_ENABLED=true
CLOUDWATCH_LOG_GROUP=/elimucore/api-staging
```

### Frontend (.env.staging)

```
VITE_API_BASE_URL=https://api-staging.yourdomain.com/api/v1
VITE_ENVIRONMENT=staging
VITE_ENABLE_DEBUG=true
VITE_ENABLE_ANALYTICS=false
```

## Development Environment

### Backend (.env.development)

```
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

DB_HOST=localhost
DB_PORT=3306
DB_NAME=elimucore_dev
DB_USER=root
DB_PASSWORD=password

JWT_SECRET=dev_secret
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

AWS_REGION=us-east-1
CLOUDWATCH_ENABLED=false
```

### Frontend (.env.development)

```
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_ENVIRONMENT=development
VITE_ENABLE_DEBUG=true
VITE_ENABLE_ANALYTICS=false
```

## AWS Secrets Manager Setup

Store sensitive data in AWS Secrets Manager:

```bash
# Create secrets
aws secretsmanager create-secret \
  --name elimucore/prod/db-password \
  --secret-string 'your_secure_password'

aws secretsmanager create-secret \
  --name elimucore/prod/jwt-secret \
  --secret-string 'your_jwt_secret'

aws secretsmanager create-secret \
  --name elimucore/prod/api-keys \
  --secret-string '{
    "stripe_key": "sk_live_...",
    "sendgrid_key": "SG...",
    "aws_access_key": "..."
  }'

# Retrieve secrets
aws secretsmanager get-secret-value \
  --secret-id elimucore/prod/db-password \
  --query SecretString --output text
```

## Elastic Beanstalk Environment Variables

Set in AWS Console or via CLI:

```bash
eb setenv \
  NODE_ENV=production \
  DB_HOST=elimucore-db.xxxxx.rds.amazonaws.com \
  DB_USER=elimucore_app \
  DB_PASSWORD=your_password \
  DB_NAME=elimucore_prod \
  JWT_SECRET=$(openssl rand -hex 32) \
  CORS_ORIGIN=https://app.yourdomain.com \
  LOG_LEVEL=info
```

## Security Best Practices

1. **Never commit .env files** - Add to .gitignore
2. **Use AWS Secrets Manager** for production secrets
3. **Rotate credentials regularly** (quarterly minimum)
4. **Use IAM roles** instead of access keys when possible
5. **Enable encryption** for all sensitive data
6. **Use HTTPS/TLS** for all communications
7. **Implement rate limiting** on API endpoints
8. **Enable CORS** only for trusted origins
9. **Set secure headers** (HSTS, CSP, etc.)
10. **Monitor and audit** all access

## Environment Validation

Create a validation script to ensure all required variables are set:

```bash
#!/bin/bash
# validate-env.sh

required_vars=(
  "NODE_ENV"
  "DB_HOST"
  "DB_USER"
  "DB_PASSWORD"
  "DB_NAME"
  "JWT_SECRET"
  "CORS_ORIGIN"
)

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "Error: $var is not set"
    exit 1
  fi
done

echo "All required environment variables are set!"
```

Use in deployment:
```bash
source .env
./validate-env.sh
npm start
```
