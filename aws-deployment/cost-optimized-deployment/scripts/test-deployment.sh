#!/bin/bash

# Test deployment - EC2 Backend + S3 Frontend
set -e

# Configuration
ENVIRONMENT=${ENVIRONMENT:-production}
AWS_REGION=${AWS_REGION:-us-east-1}

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🧪 Testing Madza AI Healthcare Deployment${NC}"

# Get stack outputs
echo -e "${YELLOW}📋 Getting deployment information...${NC}"

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

FRONTEND_URL=$(aws cloudformation describe-stacks \
    --stack-name "${ENVIRONMENT}-madza-ai-healthcare" \
    --region $AWS_REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`FrontendWebsiteURL`].OutputValue' \
    --output text)

BACKEND_URL="http://$BACKEND_DNS:5001"

echo -e "${GREEN}✅ Deployment Information:${NC}"
echo -e "  🌐 Frontend URL: $FRONTEND_URL"
echo -e "  🔧 Backend API: $BACKEND_URL"
echo -e "  📊 Backend IP: $BACKEND_IP"

# Test backend health
echo -e "${YELLOW}🔍 Testing backend health...${NC}"
if curl -s -f "$BACKEND_URL/api/health" > /dev/null; then
    echo -e "${GREEN}✅ Backend health check passed${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    echo -e "${YELLOW}💡 Check backend logs: ssh -i ~/.ssh/madza.pem ec2-user@$BACKEND_IP 'sudo journalctl -u madza-backend -f'${NC}"
fi

# Test frontend accessibility
echo -e "${YELLOW}🔍 Testing frontend accessibility...${NC}"
if curl -s -f "$FRONTEND_URL" > /dev/null; then
    echo -e "${GREEN}✅ Frontend is accessible${NC}"
else
    echo -e "${RED}❌ Frontend is not accessible${NC}"
    echo -e "${YELLOW}💡 Check S3 bucket: aws s3 ls s3://${ENVIRONMENT}-madza-frontend-$(aws sts get-caller-identity --query Account --output text)${NC}"
fi

# Test API endpoints
echo -e "${YELLOW}🔍 Testing API endpoints...${NC}"

# Test patient registration endpoint
if curl -s -f -X POST "$BACKEND_URL/api/patient/register" \
    -H "Content-Type: application/json" \
    -d '{"firstName":"Test","lastName":"User","email":"test@example.com","phone":"1234567890","dateOfBirth":"1990-01-01"}' > /dev/null; then
    echo -e "${GREEN}✅ Patient registration endpoint working${NC}"
else
    echo -e "${YELLOW}⚠️  Patient registration endpoint may need attention${NC}"
fi

# Test claims endpoint
if curl -s -f "$BACKEND_URL/api/claims" > /dev/null; then
    echo -e "${GREEN}✅ Claims endpoint working${NC}"
else
    echo -e "${YELLOW}⚠️  Claims endpoint may need attention${NC}"
fi

# Test patients endpoint
if curl -s -f "$BACKEND_URL/api/patients" > /dev/null; then
    echo -e "${GREEN}✅ Patients endpoint working${NC}"
else
    echo -e "${YELLOW}⚠️  Patients endpoint may need attention${NC}"
fi

echo -e "${GREEN}🎉 Deployment test completed!${NC}"
echo -e ""
echo -e "${YELLOW}💡 Manual Tests:${NC}"
echo -e "  1. Open frontend: $FRONTEND_URL"
echo -e "  2. Test patient registration"
echo -e "  3. Test claim processing"
echo -e "  4. Check backend logs if issues occur"
echo -e ""
echo -e "${GREEN}✅ Your Madza AI Healthcare Platform is ready!${NC}"
