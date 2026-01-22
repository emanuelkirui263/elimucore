#!/bin/bash

# AWS RDS Database Setup Script
# Sets up PostgreSQL RDS instance for ELIMUCORE
# Usage: ./scripts/setup-aws-rds.sh

set -e

echo "=========================================="
echo "ELIMUCORE AWS RDS Setup Script"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
AWS_REGION=${AWS_REGION:-us-east-1}
DB_INSTANCE_IDENTIFIER="elimucore-db"
DB_CLASS="db.t3.micro"
DB_ENGINE="postgres"
DB_ENGINE_VERSION="15.4"
DB_USERNAME="elimucore_admin"
DB_ALLOCATED_STORAGE=20
DB_BACKUP_RETENTION=30
SECURITY_GROUP_NAME="elimucore-db-sg"
SECURITY_GROUP_DESCRIPTION="Security group for ELIMUCORE RDS database"

# Function to print colored output
print_status() {
  echo -e "${BLUE}→${NC} $1"
}

print_success() {
  echo -e "${GREEN}✓${NC} $1"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

# Check prerequisites
check_prerequisites() {
  print_status "Checking prerequisites..."
  
  if ! command -v aws &> /dev/null; then
    print_error "AWS CLI not found. Please install AWS CLI v2"
    exit 1
  fi
  
  if ! command -v jq &> /dev/null; then
    print_warning "jq not found. Installing jq..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
      sudo apt-get update && sudo apt-get install -y jq
    elif [[ "$OSTYPE" == "darwin"* ]]; then
      brew install jq
    fi
  fi
  
  print_success "Prerequisites met"
}

# Verify AWS credentials
verify_aws_credentials() {
  print_status "Verifying AWS credentials..."
  
  if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials not configured or invalid"
    echo "Run: aws configure"
    exit 1
  fi
  
  ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
  CALLER=$(aws sts get-caller-identity --query Arn --output text)
  
  print_success "AWS credentials verified"
  echo "  Account ID: $ACCOUNT_ID"
  echo "  Caller: $CALLER"
}

# Generate database password
generate_password() {
  print_status "Generating secure database password..."
  DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
  print_success "Password generated (length: ${#DB_PASSWORD})"
}

# Create security group
create_security_group() {
  print_status "Setting up security group..."
  
  # Get VPC ID (default VPC)
  VPC_ID=$(aws ec2 describe-vpcs \
    --filters Name=isDefault,Values=true \
    --query 'Vpcs[0].VpcId' \
    --region $AWS_REGION \
    --output text)
  
  if [ "$VPC_ID" == "None" ] || [ -z "$VPC_ID" ]; then
    print_error "Could not find default VPC"
    exit 1
  fi
  
  print_status "Using VPC: $VPC_ID"
  
  # Check if security group already exists
  SG_ID=$(aws ec2 describe-security-groups \
    --filters Name=group-name,Values=$SECURITY_GROUP_NAME \
    --query 'SecurityGroups[0].GroupId' \
    --region $AWS_REGION \
    --output text 2>/dev/null || echo "")
  
  if [ "$SG_ID" != "None" ] && [ -n "$SG_ID" ]; then
    print_warning "Security group already exists: $SG_ID"
  else
    print_status "Creating security group..."
    SG_ID=$(aws ec2 create-security-group \
      --group-name $SECURITY_GROUP_NAME \
      --description "$SECURITY_GROUP_DESCRIPTION" \
      --vpc-id $VPC_ID \
      --region $AWS_REGION \
      --output text)
    print_success "Security group created: $SG_ID"
  fi
  
  # Add inbound rule for PostgreSQL (from anywhere - adjust as needed)
  aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 5432 \
    --cidr 0.0.0.0/0 \
    --region $AWS_REGION \
    2>/dev/null || print_warning "Inbound rule already exists"
  
  print_success "Security group configured"
}

# Create RDS instance
create_rds_instance() {
  print_status "Creating RDS PostgreSQL instance..."
  
  # Check if instance already exists
  EXISTING=$(aws rds describe-db-instances \
    --db-instance-identifier $DB_INSTANCE_IDENTIFIER \
    --region $AWS_REGION \
    --query 'DBInstances[0].DBInstanceIdentifier' \
    --output text 2>/dev/null || echo "")
  
  if [ "$EXISTING" == "$DB_INSTANCE_IDENTIFIER" ]; then
    print_warning "RDS instance already exists: $DB_INSTANCE_IDENTIFIER"
    DB_ENDPOINT=$(aws rds describe-db-instances \
      --db-instance-identifier $DB_INSTANCE_IDENTIFIER \
      --region $AWS_REGION \
      --query 'DBInstances[0].Endpoint.Address' \
      --output text)
    print_status "Current endpoint: $DB_ENDPOINT"
    return
  fi
  
  print_status "Launching RDS instance (this may take 5-10 minutes)..."
  
  aws rds create-db-instance \
    --db-instance-identifier $DB_INSTANCE_IDENTIFIER \
    --db-instance-class $DB_CLASS \
    --engine $DB_ENGINE \
    --engine-version $DB_ENGINE_VERSION \
    --master-username $DB_USERNAME \
    --master-user-password "$DB_PASSWORD" \
    --allocated-storage $DB_ALLOCATED_STORAGE \
    --storage-type gp3 \
    --storage-encrypted \
    --backup-retention-period $DB_BACKUP_RETENTION \
    --enable-iam-database-authentication \
    --enable-cloudwatch-logs-exports postgresql \
    --vpc-security-group-ids $SG_ID \
    --db-parameter-group-name default.postgres15 \
    --region $AWS_REGION \
    --no-publicly-accessible
  
  print_success "RDS instance creation initiated"
  print_status "Waiting for instance to be available..."
  
  # Wait for instance to be available
  aws rds wait db-instance-available \
    --db-instance-identifier $DB_INSTANCE_IDENTIFIER \
    --region $AWS_REGION
  
  print_success "RDS instance is now available"
}

# Get RDS endpoint
get_rds_endpoint() {
  print_status "Retrieving RDS endpoint information..."
  
  DB_ENDPOINT=$(aws rds describe-db-instances \
    --db-instance-identifier $DB_INSTANCE_IDENTIFIER \
    --region $AWS_REGION \
    --query 'DBInstances[0].Endpoint.Address' \
    --output text)
  
  DB_PORT=$(aws rds describe-db-instances \
    --db-instance-identifier $DB_INSTANCE_IDENTIFIER \
    --region $AWS_REGION \
    --query 'DBInstances[0].Endpoint.Port' \
    --output text)
  
  print_success "RDS endpoint: $DB_ENDPOINT:$DB_PORT"
}

# Save configuration
save_configuration() {
  print_status "Saving configuration..."
  
  # Save to AWS credentials file structure
  ENV_FILE=".env.production"
  
  cat > $ENV_FILE << EOF
# ELIMUCORE Production Environment Configuration
# Generated by setup-aws-rds.sh

# Database Configuration (AWS RDS PostgreSQL)
DB_HOST=$DB_ENDPOINT
DB_PORT=$DB_PORT
DB_NAME=elimucore
DB_USER=$DB_USERNAME
DB_PASSWORD=$DB_PASSWORD

# Server Configuration
NODE_ENV=production
PORT=3000

# AWS Configuration
AWS_REGION=$AWS_REGION
AWS_RDS_IDENTIFIER=$DB_INSTANCE_IDENTIFIER

# JWT Configuration
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRY=7d
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_EXPIRY=30d

# API Configuration
API_URL=https://api.elimucore.app
FRONTEND_URL=https://elimucore.app

# Logging
LOG_LEVEL=info

# CORS
CORS_ORIGIN=https://elimucore.app

# Email Configuration (if needed)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASSWORD=your-app-password
EOF
  
  print_success "Configuration saved to: $ENV_FILE"
  echo ""
  print_warning "⚠️  Important: Review and update JWT secrets and email configuration in $ENV_FILE"
}

# Display summary
display_summary() {
  echo ""
  echo "=========================================="
  echo -e "${GREEN}AWS RDS Setup Complete!${NC}"
  echo "=========================================="
  echo ""
  echo "Database Details:"
  echo "  Instance ID: $DB_INSTANCE_IDENTIFIER"
  echo "  Engine: $DB_ENGINE $DB_ENGINE_VERSION"
  echo "  Class: $DB_CLASS"
  echo "  Storage: ${DB_ALLOCATED_STORAGE}GB (gp3)"
  echo "  Endpoint: $DB_ENDPOINT:$DB_PORT"
  echo "  Username: $DB_USERNAME"
  echo "  Region: $AWS_REGION"
  echo ""
  echo "Next Steps:"
  echo "  1. Update your application configuration with the endpoints above"
  echo "  2. Initialize database: npm run db:init"
  echo "  3. Seed sample data: npm run db:seed"
  echo "  4. Deploy application to Elastic Beanstalk"
  echo ""
  echo "Backup & Recovery:"
  echo "  - Automated backups enabled (${DB_BACKUP_RETENTION} days retention)"
  echo "  - Enable automated minor version upgrades: aws rds modify-db-instance --db-instance-identifier $DB_INSTANCE_IDENTIFIER --auto-minor-version-upgrade --apply-immediately"
  echo "  - Create manual snapshot: aws rds create-db-snapshot --db-instance-identifier $DB_INSTANCE_IDENTIFIER --db-snapshot-identifier elimucore-backup-\$(date +%s)"
  echo ""
  echo "Monitoring:"
  echo "  - CloudWatch logs enabled"
  echo "  - View logs: aws logs tail /aws/rds/instance/$DB_INSTANCE_IDENTIFIER/postgresql --follow"
  echo ""
  echo "Security:"
  echo "  - Encryption at rest: Enabled"
  echo "  - IAM database authentication: Enabled"
  echo "  - Security group: $SG_ID"
  echo "  - Publicly accessible: No"
  echo ""
  echo "Cost Optimization:"
  echo "  - DB Instance: db.t3.micro (~$15/month)"
  echo "  - Storage: 20GB gp3 (~$2/month)"
  echo "  - Backup storage: Included in retention"
  echo "  - Estimated: ~$17-20 per month"
  echo ""
}

# Main execution
main() {
  check_prerequisites
  echo ""
  verify_aws_credentials
  echo ""
  generate_password
  echo ""
  create_security_group
  echo ""
  create_rds_instance
  echo ""
  get_rds_endpoint
  echo ""
  save_configuration
  echo ""
  display_summary
}

# Run main function
main
