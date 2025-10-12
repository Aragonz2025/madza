#!/bin/bash

# Deploy React Frontend to S3
set -e

# Configuration
ENVIRONMENT=${ENVIRONMENT:-production}
AWS_REGION=${AWS_REGION:-us-east-1}
BACKEND_API_URL=${BACKEND_API_URL:-http://localhost:5001}

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Deploying React Frontend to S3${NC}"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity >/dev/null 2>&1; then
    echo -e "${RED}❌ AWS CLI not configured. Please run 'aws configure' first.${NC}"
    exit 1
fi

# Get AWS Account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
BUCKET_NAME="${ENVIRONMENT}-madza-frontend-${AWS_ACCOUNT_ID}"

echo -e "${YELLOW}📦 Building React application...${NC}"

# Create temporary directory
TEMP_DIR=$(mktemp -d)
cd $TEMP_DIR

# Copy frontend source
cp -r /Users/arpanchowdhury/Desktop/ARPAN/MINI/CODE/AI/madza/src .
cp /Users/arpanchowdhury/Desktop/ARPAN/MINI/CODE/AI/madza/package.json .
cp /Users/arpanchowdhury/Desktop/ARPAN/MINI/CODE/AI/madza/tsconfig.json .
cp -r /Users/arpanchowdhury/Desktop/ARPAN/MINI/CODE/AI/madza/public .

# Create .env file
cat > .env << EOF
REACT_APP_API_URL=${BACKEND_API_URL}
GENERATE_SOURCEMAP=false
EOF

echo -e "${YELLOW}📝 Environment configuration:${NC}"
echo -e "  REACT_APP_API_URL=${BACKEND_API_URL}"

# Install dependencies and build
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

echo -e "${YELLOW}🔨 Building React application...${NC}"
npm run build

# Check if build was successful
if [ ! -d "build" ]; then
    echo -e "${RED}❌ Build failed. No build directory found.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

# Upload files to S3
echo -e "${YELLOW}📤 Uploading files to S3...${NC}"

# Upload all files with appropriate content types
aws s3 sync build/ s3://$BUCKET_NAME/ \
    --region $AWS_REGION \
    --delete \
    --cache-control "public, max-age=31536000" \
    --exclude "*.html"

# Upload HTML files with no-cache
aws s3 sync build/ s3://$BUCKET_NAME/ \
    --region $AWS_REGION \
    --cache-control "no-cache, no-store, must-revalidate" \
    --include "*.html"

# Set proper content types
aws s3 cp s3://$BUCKET_NAME/ s3://$BUCKET_NAME/ \
    --region $AWS_REGION \
    --recursive \
    --metadata-directive REPLACE \
    --content-type "text/html" \
    --exclude "*" \
    --include "*.html"

aws s3 cp s3://$BUCKET_NAME/ s3://$BUCKET_NAME/ \
    --region $AWS_REGION \
    --recursive \
    --metadata-directive REPLACE \
    --content-type "application/javascript" \
    --exclude "*" \
    --include "*.js"

aws s3 cp s3://$BUCKET_NAME/ s3://$BUCKET_NAME/ \
    --region $AWS_REGION \
    --recursive \
    --metadata-directive REPLACE \
    --content-type "text/css" \
    --exclude "*" \
    --include "*.css"

echo -e "${GREEN}✅ Files uploaded to S3${NC}"

# Get website URL
WEBSITE_URL="http://$BUCKET_NAME.s3-website-$AWS_REGION.amazonaws.com"

# Cleanup
rm -rf $TEMP_DIR

echo -e "${GREEN}🎉 Frontend deployment completed!${NC}"
echo -e "${GREEN}📋 Access Information:${NC}"
echo -e "  🌐 Frontend URL: $WEBSITE_URL"
echo -e "  📦 S3 Bucket: $BUCKET_NAME"
echo -e "  🔧 Backend API: $BACKEND_API_URL"
echo -e ""
echo -e "${YELLOW}💡 To update the frontend:${NC}"
echo -e "  Run this script again after making changes to your React code"
echo -e ""
echo -e "${YELLOW}💡 To check S3 bucket contents:${NC}"
echo -e "  aws s3 ls s3://$BUCKET_NAME --region $AWS_REGION"