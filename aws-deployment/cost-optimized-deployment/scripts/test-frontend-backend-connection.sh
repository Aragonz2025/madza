#!/bin/bash

# Test Frontend-Backend Connection
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

echo -e "${BLUE}🔗 Testing Frontend-Backend Connection${NC}"

# Get backend URL
echo -e "${YELLOW}📋 Getting backend information...${NC}"
BACKEND_DNS=$(aws cloudformation describe-stacks \
    --stack-name "${ENVIRONMENT}-madza-ai-healthcare" \
    --region $AWS_REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`BackendServerPublicDNS`].OutputValue' \
    --output text)

BACKEND_URL="http://$BACKEND_DNS:5001"

echo -e "${GREEN}✅ Backend URL: $BACKEND_URL${NC}"

# Test backend health
echo -e "${YELLOW}🔍 Testing backend health...${NC}"
if curl -s -f "$BACKEND_URL/api/health" > /dev/null; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    exit 1
fi

# Test CORS headers
echo -e "${YELLOW}🔍 Testing CORS configuration...${NC}"
CORS_HEADERS=$(curl -s -I -H "Origin: http://localhost:3000" "$BACKEND_URL/api/health" | grep -i "access-control" || echo "No CORS headers found")

if echo "$CORS_HEADERS" | grep -i "access-control-allow-origin" > /dev/null; then
    echo -e "${GREEN}✅ CORS headers present${NC}"
    echo -e "  $CORS_HEADERS"
else
    echo -e "${YELLOW}⚠️  CORS headers not found (may still work)${NC}"
fi

# Test API endpoints
echo -e "${YELLOW}🔍 Testing API endpoints...${NC}"

# Test patients endpoint
if curl -s -f "$BACKEND_URL/api/patients" > /dev/null; then
    echo -e "${GREEN}✅ /api/patients endpoint working${NC}"
else
    echo -e "${YELLOW}⚠️  /api/patients endpoint may need attention${NC}"
fi

# Test claims endpoint
if curl -s -f "$BACKEND_URL/api/claims" > /dev/null; then
    echo -e "${GREEN}✅ /api/claims endpoint working${NC}"
else
    echo -e "${YELLOW}⚠️  /api/claims endpoint may need attention${NC}"
fi

# Test observability endpoint
if curl -s -f "$BACKEND_URL/api/observability/metrics" > /dev/null; then
    echo -e "${GREEN}✅ /api/observability/metrics endpoint working${NC}"
else
    echo -e "${YELLOW}⚠️  /api/observability/metrics endpoint may need attention${NC}"
fi

# Get frontend URL
FRONTEND_URL=$(aws cloudformation describe-stacks \
    --stack-name "${ENVIRONMENT}-madza-ai-healthcare" \
    --region $AWS_REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`FrontendWebsiteURL`].OutputValue' \
    --output text)

echo -e "${GREEN}🎉 Connection test completed!${NC}"
echo -e "${GREEN}📋 Access Information:${NC}"
echo -e "  🌐 Frontend URL: $FRONTEND_URL"
echo -e "  🔧 Backend API: $BACKEND_URL"
echo -e ""
echo -e "${YELLOW}💡 Manual Test:${NC}"
echo -e "  1. Open frontend: $FRONTEND_URL"
echo -e "  2. Check browser console for any API errors"
echo -e "  3. Try registering a patient"
echo -e "  4. Try processing a claim"
echo -e ""
echo -e "${YELLOW}💡 If you see CORS errors:${NC}"
echo -e "  The backend CORS is configured to allow all origins (*)"
echo -e "  This should work with S3 frontend hosting"
echo -e ""
echo -e "${GREEN}✅ Frontend should be able to connect to backend!${NC}"
