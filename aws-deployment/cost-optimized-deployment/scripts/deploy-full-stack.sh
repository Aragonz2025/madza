#!/bin/bash

# Deploy Full Stack - EC2 Backend + S3 Frontend
set -e

# Configuration
ENVIRONMENT=${ENVIRONMENT:-production}
AWS_REGION=${AWS_REGION:-us-east-1}
KEY_PAIR_NAME=${KEY_PAIR_NAME:-madza}

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Deploying Full Stack - EC2 Backend + S3 Frontend${NC}"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity >/dev/null 2>&1; then
    echo -e "${RED}❌ AWS CLI not configured. Please run 'aws configure' first.${NC}"
    exit 1
fi

# Check if key pair exists
if ! aws ec2 describe-key-pairs --key-names $KEY_PAIR_NAME --region $AWS_REGION >/dev/null 2>&1; then
    echo -e "${RED}❌ Key pair '$KEY_PAIR_NAME' not found. Please create it first.${NC}"
    echo -e "${YELLOW}💡 Create key pair: aws ec2 create-key-pair --key-name $KEY_PAIR_NAME --region $AWS_REGION${NC}"
    exit 1
fi

# Step 1: Deploy infrastructure
echo -e "${YELLOW}🏗️  Step 1/3: Deploying infrastructure...${NC}"
aws cloudformation deploy \
    --template-file /Users/arpanchowdhury/Desktop/ARPAN/MINI/CODE/AI/madza/aws-deployment/cost-optimized-deployment/cloudformation/separate-instances.yaml \
    --stack-name "${ENVIRONMENT}-madza-ai-healthcare" \
    --parameter-overrides \
        Environment=$ENVIRONMENT \
        KeyPairName=$KEY_PAIR_NAME \
    --region $AWS_REGION \
    --capabilities CAPABILITY_IAM

echo -e "${GREEN}✅ Infrastructure deployed${NC}"

# Step 2: Get backend URL
echo -e "${YELLOW}📋 Step 2/3: Getting backend information...${NC}"
BACKEND_IP=$(aws cloudformation describe-stacks \
    --stack-name "${ENVIRONMENT}-madza-ai-healthcare" \
    --region $AWS_REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`BackendServerPublicIP`].OutputValue' \
    --output text)

BACKEND_DNS=$(aws cloudformation describe-stacks \
    --stack-name "${ENVIRONMENT}-madza-ai-healthcare" \
    --region $AWS_REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`BackendServerPublicDNS`].OutputValue' \
    --output text)

BACKEND_URL="http://$BACKEND_DNS:5001"

echo -e "${GREEN}✅ Backend URL: $BACKEND_URL${NC}"

# Step 3: Deploy frontend to S3
echo -e "${YELLOW}📦 Step 3/3: Deploying frontend to S3...${NC}"
export BACKEND_API_URL=$BACKEND_URL
echo -e "${GREEN}✅ Backend URL for frontend: $BACKEND_URL${NC}"
cd /Users/arpanchowdhury/Desktop/ARPAN/MINI/CODE/AI/madza/aws-deployment/cost-optimized-deployment/scripts
./deploy-s3-frontend.sh

# Get frontend URL
FRONTEND_URL=$(aws cloudformation describe-stacks \
    --stack-name "${ENVIRONMENT}-madza-ai-healthcare" \
    --region $AWS_REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`FrontendWebsiteURL`].OutputValue' \
    --output text)

echo -e "${GREEN}🎉 Full stack deployment completed!${NC}"
echo -e "${GREEN}📋 Access Information:${NC}"
echo -e "  🌐 Frontend URL: $FRONTEND_URL"
echo -e "  🔧 Backend API: $BACKEND_URL"
echo -e "  📊 Backend IP: $BACKEND_IP"
echo -e ""
echo -e "${YELLOW}💡 To check backend status:${NC}"
echo -e "  ssh -i ~/.ssh/$KEY_PAIR_NAME.pem ec2-user@$BACKEND_IP 'sudo systemctl status madza-backend'"
echo -e ""
echo -e "${YELLOW}💡 To view backend logs:${NC}"
echo -e "  ssh -i ~/.ssh/$KEY_PAIR_NAME.pem ec2-user@$BACKEND_IP 'sudo journalctl -u madza-backend -f'"
echo -e ""
echo -e "${YELLOW}💡 To update frontend:${NC}"
echo -e "  cd aws-deployment/cost-optimized-deployment/scripts && ./deploy-s3-frontend.sh"
echo -e ""
echo -e "${GREEN}✅ Your Madza AI Healthcare Platform is now live!${NC}"
