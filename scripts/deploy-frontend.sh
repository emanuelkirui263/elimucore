#!/bin/bash

# Frontend deployment script to S3 + CloudFront

set -e

echo "=========================================="
echo "ELIMUCORE Frontend Deployment"
echo "=========================================="

ENVIRONMENT=${ENVIRONMENT:-production}
AWS_REGION=${AWS_REGION:-us-east-1}
S3_BUCKET="elimucore-frontend-${ENVIRONMENT}"
DISTRIBUTION_ID=${CLOUDFRONT_DISTRIBUTION_ID:-}

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Configuration:${NC}"
echo "  Environment: $ENVIRONMENT"
echo "  AWS Region: $AWS_REGION"
echo "  S3 Bucket: $S3_BUCKET"
echo ""

# Check prerequisites
if ! command -v aws &> /dev/null; then
    echo -e "${RED}AWS CLI not found${NC}"
    exit 1
fi

# Build frontend
echo -e "${YELLOW}Building frontend...${NC}"
cd frontend
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}Build failed - dist directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}Build successful!${NC}\n"

# Create S3 bucket if it doesn't exist
echo -e "${YELLOW}Checking S3 bucket...${NC}"
if ! aws s3 ls "s3://$S3_BUCKET" 2>/dev/null; then
    echo "Creating S3 bucket: $S3_BUCKET"
    aws s3 mb "s3://$S3_BUCKET" --region $AWS_REGION
    
    # Configure bucket
    aws s3api put-bucket-versioning \
        --bucket $S3_BUCKET \
        --versioning-configuration Status=Enabled
    
    aws s3api put-bucket-blocking-public-access \
        --bucket $S3_BUCKET \
        --blocking-public-access-configuration \
        "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
    
    echo -e "${GREEN}Bucket created and configured${NC}"
else
    echo -e "${GREEN}Bucket exists${NC}"
fi

# Upload files to S3
echo -e "${YELLOW}Uploading files to S3...${NC}"
aws s3 sync dist/ "s3://$S3_BUCKET/" \
    --delete \
    --cache-control "public, max-age=3600" \
    --exclude "index.html" \
    --region $AWS_REGION

# Upload index.html with no caching
aws s3 cp dist/index.html "s3://$S3_BUCKET/index.html" \
    --cache-control "public, max-age=0, must-revalidate" \
    --content-type "text/html" \
    --region $AWS_REGION

echo -e "${GREEN}Files uploaded!${NC}\n"

# Invalidate CloudFront cache if distribution ID provided
if [ ! -z "$DISTRIBUTION_ID" ]; then
    echo -e "${YELLOW}Invalidating CloudFront cache...${NC}"
    aws cloudfront create-invalidation \
        --distribution-id $DISTRIBUTION_ID \
        --paths "/*" \
        --region $AWS_REGION
    echo -e "${GREEN}Cache invalidated!${NC}"
fi

echo -e "${GREEN}=========================================="
echo "Frontend deployment complete!"
echo "==========================================${NC}\n"
echo "S3 Bucket: s3://$S3_BUCKET"
echo "Website URL: https://app.yourdomain.com"
