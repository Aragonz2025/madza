#!/bin/bash

# Deploy Backend Only - EC2 with SQLite
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

echo -e "${BLUE}🚀 Deploying Backend Only - EC2 with SQLite${NC}"

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

# Check if stack exists
if ! aws cloudformation describe-stacks --stack-name "${ENVIRONMENT}-madza-ai-healthcare" --region $AWS_REGION >/dev/null 2>&1; then
    echo -e "${RED}❌ Infrastructure stack not found. Please run full deployment first.${NC}"
    echo -e "${YELLOW}💡 Run: ./deploy-full-stack.sh${NC}"
    exit 1
fi

# Get backend information
echo -e "${YELLOW}📋 Getting backend information...${NC}"
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

echo -e "${GREEN}✅ Backend Information:${NC}"
echo -e "  📊 Backend IP: $BACKEND_IP"
echo -e "  🌐 Backend DNS: $BACKEND_DNS"

# Create temporary directory for backend code
echo -e "${YELLOW}📦 Preparing backend code...${NC}"
TEMP_DIR=$(mktemp -d)
cd $TEMP_DIR

# Copy backend source
cp -r ../../../backend/* .

# Create requirements.txt if it doesn't exist
if [ ! -f "requirements.txt" ]; then
    cat > requirements.txt << 'EOF'
flask==3.0.0
flask-cors==4.0.0
flask-sqlalchemy==3.1.1
boto3==1.34.0
python-dotenv==1.0.0
alembic==1.16.5
flask-migrate==4.0.5
pytest==7.4.3
pytest-flask==1.3.0
gunicorn==21.2.0
EOF
fi

# Create .env file
cat > .env << EOF
FLASK_ENV=production
FLASK_APP=main.py
DATABASE_URL=sqlite:///opt/madza/backend/healthcare.db
AWS_REGION=us-east-1
FRONTEND_URL=*
EOF

# Create deployment script for EC2
cat > deploy_backend.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Deploying Madza AI Healthcare Backend..."

# Stop service
sudo systemctl stop madza-backend || true

# Backup existing code
sudo mv /opt/madza/backend /opt/madza/backend.backup.$(date +%Y%m%d_%H%M%S) || true

# Create new directory
sudo mkdir -p /opt/madza/backend

# Copy new code
sudo cp -r backend/* /opt/madza/backend/

# Set ownership
sudo chown -R ec2-user:ec2-user /opt/madza/

# Install Python dependencies with memory optimization
cd /opt/madza/backend
pip3.11 install --no-cache-dir -r requirements.txt

# Create .env file
cat > .env << 'ENVEOF'
FLASK_ENV=production
FLASK_APP=main.py
DATABASE_URL=sqlite:///opt/madza/backend/healthcare.db
AWS_REGION=us-east-1
FRONTEND_URL=*
ENVEOF

# Start service
sudo systemctl start madza-backend

# Check service status
echo "📊 Backend Service Status:"
sudo systemctl status madza-backend --no-pager -l

echo "✅ Backend deployment completed!"
echo "🌐 Backend API should be available at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):5001"
EOF

chmod +x deploy_backend.sh

# Create deployment package
tar -czf backend-deployment.tar.gz backend deploy_backend.sh

# Upload and deploy
echo -e "${YELLOW}📤 Uploading backend to EC2...${NC}"
scp -i ~/.ssh/$KEY_PAIR_NAME.pem -o StrictHostKeyChecking=no backend-deployment.tar.gz ec2-user@$BACKEND_IP:/tmp/

echo -e "${YELLOW}🔧 Running backend deployment on EC2...${NC}"
ssh -i ~/.ssh/$KEY_PAIR_NAME.pem -o StrictHostKeyChecking=no ec2-user@$BACKEND_IP << EOF
cd /tmp
tar -xzf backend-deployment.tar.gz
chmod +x deploy_backend.sh
./deploy_backend.sh
EOF

# Cleanup
rm -rf $TEMP_DIR

# Test deployment
echo -e "${YELLOW}🧪 Testing backend deployment...${NC}"
BACKEND_URL="http://$BACKEND_DNS:5001"

if curl -s -f "$BACKEND_URL/api/health" > /dev/null; then
    echo -e "${GREEN}✅ Backend health check passed${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    echo -e "${YELLOW}💡 Check backend logs: ssh -i ~/.ssh/$KEY_PAIR_NAME.pem ec2-user@$BACKEND_IP 'sudo journalctl -u madza-backend -f'${NC}"
fi

echo -e "${GREEN}🎉 Backend deployment completed!${NC}"
echo -e "${GREEN}📋 Access Information:${NC}"
echo -e "  🔧 Backend API: $BACKEND_URL"
echo -e "  📊 Backend IP: $BACKEND_IP"
echo -e ""
echo -e "${YELLOW}💡 To check backend status:${NC}"
echo -e "  ssh -i ~/.ssh/$KEY_PAIR_NAME.pem ec2-user@$BACKEND_IP 'sudo systemctl status madza-backend'"
echo -e ""
echo -e "${YELLOW}💡 To view backend logs:${NC}"
echo -e "  ssh -i ~/.ssh/$KEY_PAIR_NAME.pem ec2-user@$BACKEND_IP 'sudo journalctl -u madza-backend -f'"
echo -e ""
echo -e "${YELLOW}💡 To restart backend:${NC}"
echo -e "  ssh -i ~/.ssh/$KEY_PAIR_NAME.pem ec2-user@$BACKEND_IP 'sudo systemctl restart madza-backend'"
echo -e ""
echo -e "${GREEN}✅ Your backend is now updated!${NC}"
