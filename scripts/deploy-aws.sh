#!/bin/bash

# ELIMUCORE AWS Full Stack Deployment Script
# This script deploys backend, frontend, and sets up monitoring

set -e

echo "=========================================="
echo "ELIMUCORE AWS Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION=${AWS_REGION:-us-east-1}
ENVIRONMENT=${ENVIRONMENT:-production}
APP_NAME="elimucore"
TIMESTAMP=$(date +%s)

echo -e "${YELLOW}Configuration:${NC}"
echo "  AWS Region: $AWS_REGION"
echo "  Environment: $ENVIRONMENT"
echo "  App Name: $APP_NAME"
echo ""

# Function to check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"
    
    local missing_tools=()
    
    for tool in aws eb node npm git; do
        if ! command -v $tool &> /dev/null; then
            missing_tools+=("$tool")
        else
            echo "  ✓ $tool"
        fi
    done
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        echo -e "${RED}Missing tools: ${missing_tools[@]}${NC}"
        echo "Please install the missing tools and try again."
        exit 1
    fi
    
    echo -e "${GREEN}All prerequisites met!${NC}\n"
}

# Function to configure AWS credentials
configure_aws() {
    echo -e "${YELLOW}Configuring AWS credentials...${NC}"
    
    if [ -z "$AWS_ACCESS_KEY_ID" ]; then
        echo -e "${RED}AWS_ACCESS_KEY_ID not set${NC}"
        echo "Please run: aws configure"
        exit 1
    fi
    
    echo "  AWS Account ID: $(aws sts get-caller-identity --query Account --output text)"
    echo -e "${GREEN}AWS configured!${NC}\n"
}

# Function to create RDS database
create_rds() {
    echo -e "${YELLOW}Setting up RDS Database...${NC}"
    
    local db_name="${APP_NAME}-db"
    local db_user="admin"
    local db_password=$(openssl rand -base64 12)
    
    # Check if database already exists
    if aws rds describe-db-instances --db-instance-identifier $db_name --region $AWS_REGION &>/dev/null; then
        echo -e "${YELLOW}Database $db_name already exists${NC}"
    else
        echo "Creating RDS instance..."
        
        aws rds create-db-instance \
            --db-instance-identifier $db_name \
            --db-instance-class db.t3.micro \
            --engine mysql \
            --engine-version 8.0 \
            --master-username $db_user \
            --master-user-password "$db_password" \
            --allocated-storage 20 \
            --storage-type gp3 \
            --backup-retention-period 30 \
            --multi-az \
            --enable-iam-database-authentication \
            --enable-cloudwatch-logs-exports error general slowquery \
            --region $AWS_REGION
        
        echo "  Database Name: $db_name"
        echo "  Master User: $db_user"
        echo "  Master Password: $db_password"
        echo ""
        echo -e "${YELLOW}Waiting for database to be ready (this may take 5-10 minutes)...${NC}"
        
        aws rds wait db-instance-available \
            --db-instance-identifier $db_name \
            --region $AWS_REGION
    fi
    
    # Get database endpoint
    DB_ENDPOINT=$(aws rds describe-db-instances \
        --db-instance-identifier $db_name \
        --query 'DBInstances[0].Endpoint.Address' \
        --output text \
        --region $AWS_REGION)
    
    echo -e "${GREEN}RDS Database ready!${NC}"
    echo "  Endpoint: $DB_ENDPOINT"
    echo ""
}

# Function to deploy backend with Elastic Beanstalk
deploy_backend() {
    echo -e "${YELLOW}Deploying Backend with Elastic Beanstalk...${NC}"
    
    local eb_app_name="${APP_NAME}-api"
    local eb_env_name="${APP_NAME}-api-${ENVIRONMENT}"
    
    cd backend
    
    # Initialize EB if not already done
    if [ ! -d ".elasticbeanstalk" ]; then
        echo "Initializing Elastic Beanstalk..."
        eb init -p "Node.js 18 running on 64bit Amazon Linux 2" $eb_app_name \
            --region $AWS_REGION \
            --keyname elimucore-key-pair
    fi
    
    # Create environment if it doesn't exist
    if ! eb status $eb_env_name &>/dev/null; then
        echo "Creating Elastic Beanstalk environment..."
        
        eb create $eb_env_name \
            --instance-type t3.micro \
            --envvars \
            DB_HOST=$DB_ENDPOINT,\
DB_USER=admin,\
DB_PASSWORD=$DB_PASSWORD,\
DB_NAME=elimucore_prod,\
DB_PORT=3306,\
NODE_ENV=production,\
JWT_SECRET=$(openssl rand -hex 32),\
LOG_LEVEL=info
    fi
    
    # Deploy
    echo "Deploying to Elastic Beanstalk..."
    git add .
    git commit -m "AWS deployment: $TIMESTAMP" || true
    eb deploy
    
    # Get environment URL
    EB_URL=$(eb open --print-url)
    
    echo -e "${GREEN}Backend deployed!${NC}"
    echo "  Environment: $eb_env_name"
    echo "  URL: $EB_URL"
    echo ""
    
    cd ..
}

# Function to deploy frontend to S3 + CloudFront
deploy_frontend() {
    echo -e "${YELLOW}Deploying Frontend to S3 + CloudFront...${NC}"
    
    local s3_bucket="${APP_NAME}-frontend-${ENVIRONMENT}"
    
    cd frontend
    
    # Build frontend
    echo "Building frontend..."
    npm run build
    
    # Create S3 bucket if it doesn't exist
    if ! aws s3 ls "s3://$s3_bucket" 2>/dev/null; then
        echo "Creating S3 bucket..."
        aws s3 mb "s3://$s3_bucket" --region $AWS_REGION
        
        # Enable versioning
        aws s3api put-bucket-versioning \
            --bucket $s3_bucket \
            --versioning-configuration Status=Enabled
        
        # Block public access
        aws s3api put-bucket-blocking-public-access \
            --bucket $s3_bucket \
            --blocking-public-access-configuration \
            "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
    fi
    
    # Upload files to S3
    echo "Uploading frontend files to S3..."
    aws s3 sync dist/ "s3://$s3_bucket/" \
        --delete \
        --cache-control "public, max-age=3600" \
        --exclude "index.html"
    
    # Upload index.html with no caching
    aws s3 cp dist/index.html "s3://$s3_bucket/index.html" \
        --cache-control "public, max-age=0, must-revalidate" \
        --content-type "text/html"
    
    echo -e "${GREEN}Frontend deployed!${NC}"
    echo "  S3 Bucket: $s3_bucket"
    echo ""
    
    cd ..
}

# Function to create CloudWatch alarms
setup_monitoring() {
    echo -e "${YELLOW}Setting up CloudWatch Monitoring...${NC}"
    
    # Create SNS topic for alerts
    SNS_TOPIC=$(aws sns create-topic \
        --name ${APP_NAME}-alerts \
        --region $AWS_REGION \
        --query 'TopicArn' \
        --output text)
    
    echo "Created SNS topic: $SNS_TOPIC"
    echo ""
    echo -e "${YELLOW}Please subscribe to the SNS topic:${NC}"
    echo "  aws sns subscribe --topic-arn $SNS_TOPIC --protocol email --notification-endpoint YOUR_EMAIL"
    echo ""
    
    # Create alarms for API health
    aws cloudwatch put-metric-alarm \
        --alarm-name ${APP_NAME}-api-cpu-high \
        --alarm-description "Alert when API CPU > 80%" \
        --metric-name CPUUtilization \
        --namespace AWS/EC2 \
        --statistic Average \
        --period 300 \
        --threshold 80 \
        --comparison-operator GreaterThanThreshold \
        --alarm-actions $SNS_TOPIC \
        --region $AWS_REGION
    
    # Create alarms for database
    aws cloudwatch put-metric-alarm \
        --alarm-name ${APP_NAME}-db-cpu-high \
        --alarm-description "Alert when RDS CPU > 70%" \
        --metric-name CPUUtilization \
        --namespace AWS/RDS \
        --statistic Average \
        --period 300 \
        --threshold 70 \
        --comparison-operator GreaterThanThreshold \
        --alarm-actions $SNS_TOPIC \
        --region $AWS_REGION
    
    echo -e "${GREEN}Monitoring configured!${NC}\n"
}

# Function to create DNS records in Route 53
setup_dns() {
    echo -e "${YELLOW}Configuring DNS Records in Route 53...${NC}"
    echo ""
    echo -e "${YELLOW}Manual steps required:${NC}"
    echo "1. Create hosted zone in Route 53 (if not exists)"
    echo "2. Add CNAME records for:"
    echo "   - api.yourdomain.com → Elastic Beanstalk URL"
    echo "   - app.yourdomain.com → CloudFront URL"
    echo "3. Setup SSL certificates in ACM"
    echo ""
}

# Main execution
main() {
    check_prerequisites
    configure_aws
    
    echo -e "${YELLOW}Starting deployment...${NC}\n"
    
    create_rds
    deploy_backend
    deploy_frontend
    setup_monitoring
    setup_dns
    
    echo -e "${GREEN}=========================================="
    echo "Deployment Complete!"
    echo "==========================================${NC}\n"
    
    echo "Next Steps:"
    echo "1. Subscribe to SNS alerts"
    echo "2. Configure DNS in Route 53"
    echo "3. Request SSL certificates in ACM"
    echo "4. Update CloudFront distribution settings"
    echo "5. Test application endpoints"
    echo ""
    echo "Documentation: AWS_DEPLOYMENT_GUIDE.md"
}

# Run main function
main
