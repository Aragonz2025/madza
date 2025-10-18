# Madza AI Healthcare - Complete Deployment Instructions

This document provides step-by-step commands to deploy the Madza AI Healthcare platform on AWS.

## 🎯 Quick Start

```bash
# 1. Clone repository
git clone https://github.com/Aragonz2025/madza.git
cd madza

# 2. Run complete deployment
chmod +x deploy-madza.sh
./deploy-madza.sh
```

## 📋 Prerequisites

### Required Software
```bash
# Check AWS CLI
aws --version
aws sts get-caller-identity

# Check Node.js
node --version
npm --version

# Check Python
python3 --version
pip3 --version

# Check Git
git --version
```

### AWS Account Setup
```bash
# Configure AWS CLI (if not already done)
aws configure

# Verify access to required services
aws ec2 describe-regions --region us-east-1
aws s3 ls
aws iam get-user
aws bedrock list-foundation-models --region us-east-1
```

## 🚀 Complete Deployment Process

### Step 1: Environment Setup

```bash
# Set deployment variables
export AWS_REGION="us-east-1"
export KEY_PAIR_NAME="madza"
export STACK_NAME="production-madza-ai-healthcare"
export PROJECT_DIR=$(pwd)

echo "Deployment variables set:"
echo "AWS_REGION: $AWS_REGION"
echo "KEY_PAIR_NAME: $KEY_PAIR_NAME"
echo "STACK_NAME: $STACK_NAME"
echo "PROJECT_DIR: $PROJECT_DIR"
```

### Step 2: Create AWS Key Pair

```bash
# Create key pair for EC2 access
aws ec2 create-key-pair \
    --key-name $KEY_PAIR_NAME \
    --region $AWS_REGION \
    --query 'KeyMaterial' \
    --output text > ~/.ssh/$KEY_PAIR_NAME.pem

# Set proper permissions
chmod 400 ~/.ssh/$KEY_PAIR_NAME.pem

# Verify key creation
aws ec2 describe-key-pairs \
    --key-names $KEY_PAIR_NAME \
    --region $AWS_REGION

echo "✅ Key pair created: ~/.ssh/$KEY_PAIR_NAME.pem"
```

### Step 3: Deploy Infrastructure

```bash
# Navigate to deployment scripts
cd aws-deployment/cost-optimized-deployment/scripts

# Make scripts executable
chmod +x *.sh

# Deploy full stack
./deploy-full-stack.sh

echo "✅ Infrastructure deployment initiated"
```

### Step 4: Wait for Infrastructure

```bash
# Wait for CloudFormation stack to complete
echo "Waiting for CloudFormation stack to complete..."
aws cloudformation wait stack-create-complete \
    --stack-name $STACK_NAME \
    --region $AWS_REGION

# Get stack outputs
BACKEND_IP=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`BackendServerPublicIP`].OutputValue' \
    --output text \
    --region $AWS_REGION)

FRONTEND_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`FrontendWebsiteURL`].OutputValue' \
    --output text \
    --region $AWS_REGION)

echo "✅ Infrastructure deployed"
echo "Backend IP: $BACKEND_IP"
echo "Frontend URL: $FRONTEND_URL"
```

### Step 5: Configure IAM Permissions

```bash
# Create IAM role for Bedrock access
aws iam create-role \
    --role-name MadzaBedrockRole \
    --assume-role-policy-document '{
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Principal": {"Service": "ec2.amazonaws.com"},
            "Action": "sts:AssumeRole"
        }]
    }' \
    --region $AWS_REGION

# Attach Bedrock permissions
aws iam attach-role-policy \
    --role-name MadzaBedrockRole \
    --policy-arn arn:aws:iam::aws:policy/AmazonBedrockFullAccess \
    --region $AWS_REGION

# Create instance profile
aws iam create-instance-profile \
    --instance-profile-name MadzaBedrockInstanceProfile \
    --region $AWS_REGION

# Add role to instance profile
aws iam add-role-to-instance-profile \
    --instance-profile-name MadzaBedrockInstanceProfile \
    --role-name MadzaBedrockRole \
    --region $AWS_REGION

# Get EC2 instance ID
INSTANCE_ID=$(aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=production-madza-backend" \
    --query 'Reservations[0].Instances[0].InstanceId' \
    --output text \
    --region $AWS_REGION)

# Attach instance profile to EC2
aws ec2 associate-iam-instance-profile \
    --instance-id $INSTANCE_ID \
    --iam-instance-profile Name=MadzaBedrockInstanceProfile \
    --region $AWS_REGION

echo "✅ IAM permissions configured"
```

### Step 6: Configure Backend Environment

```bash
# Create .env file on EC2
ssh -i ~/.ssh/$KEY_PAIR_NAME.pem ec2-user@$BACKEND_IP 'cd /opt/madza/backend && cat > .env << EOF
FLASK_ENV=production
FLASK_APP=main.py
DATABASE_URL=sqlite:////opt/madza/backend/healthcare.db
AWS_REGION=us-east-1
FRONTEND_URL=*
EOF'

# Create database file
ssh -i ~/.ssh/$KEY_PAIR_NAME.pem ec2-user@$BACKEND_IP 'cd /opt/madza/backend && python3 -c "import sqlite3; conn = sqlite3.connect(\"healthcare.db\"); conn.close(); print(\"Database created\")"'

# Initialize database schema
ssh -i ~/.ssh/$KEY_PAIR_NAME.pem ec2-user@$BACKEND_IP 'cd /opt/madza/backend && python3 -c "
from app.database import db
from app.models import Patient
from app import create_app
app = create_app()
with app.app_context():
    db.create_all()
    print(\"Database schema initialized\")
"'

# Restart backend service
ssh -i ~/.ssh/$KEY_PAIR_NAME.pem ec2-user@$BACKEND_IP 'sudo systemctl restart madza-backend'

echo "✅ Backend environment configured"
```

### Step 7: Test Deployment

```bash
# Wait for services to start
sleep 30

# Test backend health
echo "Testing backend health..."
curl -s http://$BACKEND_IP:5000/api/health

# Test patient registration
echo "Testing patient registration..."
curl -s -X POST http://$BACKEND_IP:5000/api/patient/register \
    -H "Content-Type: application/json" \
    -d '{
        "firstName": "John",
        "lastName": "Doe", 
        "email": "john@example.com",
        "phone": "123-456-7890",
        "dateOfBirth": "1990-01-01",
        "insuranceId": "INS123456",
        "insuranceProvider": "Blue Cross"
    }'

# Test frontend
echo "Testing frontend..."
curl -s -I $FRONTEND_URL

echo "✅ Deployment testing completed"
```

### Step 8: Deploy Lambda AI Services (Chat Functionality)

```bash
# Navigate to Lambda deployment directory
cd $PROJECT_DIR/agenzia-deploy

# Install Node.js dependencies for CDK
npm install

# Install Python dependencies for Lambda
pip install -r requirements.txt

# Package Lambda function and dependencies
python ./bin/package_for_lambda.py

# Bootstrap CDK environment (if not already done)
npx cdk bootstrap

# Deploy Lambda stack
npx cdk deploy --require-approval never

# Get Lambda function outputs
LAMBDA_API_URL=$(aws cloudformation describe-stacks \
    --stack-name AgentLambdaStack \
    --query 'Stacks[0].Outputs[?OutputKey==`ChatEndpoint`].OutputValue' \
    --output text \
    --region $AWS_REGION)

LAMBDA_FUNCTION_NAME=$(aws cloudformation describe-stacks \
    --stack-name AgentLambdaStack \
    --query 'Stacks[0].Outputs[?OutputKey==`FunctionName`].OutputValue' \
    --output text \
    --region $AWS_REGION)

echo "✅ Lambda AI services deployed"
echo "Lambda API URL: $LAMBDA_API_URL"
echo "Lambda Function: $LAMBDA_FUNCTION_NAME"

# Return to project root
cd $PROJECT_DIR
```

### Step 9: Configure Backend with Lambda Integration

```bash
# Update backend environment with Lambda URL
ssh -i ~/.ssh/$KEY_PAIR_NAME.pem ec2-user@$BACKEND_IP 'cd /opt/madza/backend && cat >> .env << EOF
AI_LAMBDA_URL=$LAMBDA_API_URL
LAMBDA_FUNCTION_NAME=$LAMBDA_FUNCTION_NAME
EOF'

# Restart backend service to pick up new environment variables
ssh -i ~/.ssh/$KEY_PAIR_NAME.pem ec2-user@$BACKEND_IP 'sudo systemctl restart madza-backend'

echo "✅ Backend configured with Lambda integration"
```

### Step 10: Test Lambda AI Services

```bash
# Test Lambda function directly
echo "Testing Lambda function directly..."
aws lambda invoke \
    --function-name $LAMBDA_FUNCTION_NAME \
    --region $AWS_REGION \
    --cli-binary-format raw-in-base64-out \
    --payload '{"prompt": "What is medical insurance claim processing?"}' \
    lambda-test-output.json

# Display Lambda response
echo "Lambda Response:"
jq -r '.' lambda-test-output.json

# Test Lambda via API Gateway
echo "Testing Lambda via API Gateway..."
curl -s -X POST $LAMBDA_API_URL \
    -H "Content-Type: application/json" \
    -d '{"prompt": "How do I process a healthcare claim?"}' | jq

# Test chatbot integration through backend
echo "Testing chatbot integration..."
curl -s -X POST http://$BACKEND_IP:5000/api/chatbot/query \
    -H "Content-Type: application/json" \
    -d '{"message": "How does the AI analysis work for patient registration?"}' | jq

echo "✅ Lambda AI services verified"
```

### Step 11: Verify Complete AI Services

```bash
# Test AI analysis
echo "Testing AI analysis..."
curl -s -X POST http://$BACKEND_IP:5000/api/patient/register \
    -H "Content-Type: application/json" \
    -d '{
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane@example.com", 
        "phone": "987-654-3210",
        "dateOfBirth": "1985-05-15",
        "insuranceId": "INS789012",
        "insuranceProvider": "Aetna"
    }' | jq '.aiAnalysis'

echo "✅ Complete AI services verified"
```

## 🔧 Lambda AI Services Management

### Deploy Lambda Services Only
```bash
# Navigate to Lambda deployment
cd agenzia-deploy

# Deploy Lambda stack
./deploy.sh

# Get Lambda outputs
aws cloudformation describe-stacks \
    --stack-name AgentLambdaStack \
    --query 'Stacks[0].Outputs' \
    --region $AWS_REGION
```

### Update Lambda Function
```bash
# Update Lambda code
cd agenzia-deploy
python ./bin/package_for_lambda.py
npx cdk deploy --require-approval never
```

### Test Lambda Functions
```bash
# Test research workflow
aws lambda invoke \
    --function-name AgentFunction \
    --region $AWS_REGION \
    --cli-binary-format raw-in-base64-out \
    --payload '{"prompt": "What is medical insurance claim processing?", "mode": "research"}' \
    research-test.json

# Test meta-tooling workflow
aws lambda invoke \
    --function-name AgentFunction \
    --region $AWS_REGION \
    --cli-binary-format raw-in-base64-out \
    --payload '{"prompt": "create a tool that reverses text", "mode": "meta_tooling"}' \
    meta-test.json

# Test chatbot via API Gateway
curl -X POST https://your-api-gateway-url/chat \
    -H "Content-Type: application/json" \
    -d '{"prompt": "How do I register a patient?"}'
```

### Lambda Troubleshooting
```bash
# Check Lambda function logs
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/AgentFunction"

# Get recent Lambda logs
aws logs filter-log-events \
    --log-group-name "/aws/lambda/AgentFunction" \
    --start-time $(date -d '1 hour ago' +%s)000

# Check Lambda function configuration
aws lambda get-function --function-name AgentFunction --region $AWS_REGION

# Test Lambda permissions
aws lambda invoke \
    --function-name AgentFunction \
    --region $AWS_REGION \
    --cli-binary-format raw-in-base64-out \
    --payload '{"prompt": "test"}' \
    test-output.json
```

## 🔧 Troubleshooting Commands

### Check Backend Status
```bash
# Service status
ssh -i ~/.ssh/$KEY_PAIR_NAME.pem ec2-user@$BACKEND_IP 'sudo systemctl status madza-backend'

# Service logs
ssh -i ~/.ssh/$KEY_PAIR_NAME.pem ec2-user@$BACKEND_IP 'sudo journalctl -u madza-backend -f --lines=50'

# Restart service
ssh -i ~/.ssh/$KEY_PAIR_NAME.pem ec2-user@$BACKEND_IP 'sudo systemctl restart madza-backend'
```

### Check Database
```bash
# Database file
ssh -i ~/.ssh/$KEY_PAIR_NAME.pem ec2-user@$BACKEND_IP 'ls -la /opt/madza/backend/healthcare.db'

# Database content
ssh -i ~/.ssh/$KEY_PAIR_NAME.pem ec2-user@$BACKEND_IP 'cd /opt/madza/backend && sqlite3 healthcare.db "SELECT COUNT(*) FROM patients;"'

# Environment variables
ssh -i ~/.ssh/$KEY_PAIR_NAME.pem ec2-user@$BACKEND_IP 'cat /opt/madza/backend/.env'
```

### Check AWS Permissions
```bash
# Test AWS credentials on EC2
ssh -i ~/.ssh/$KEY_PAIR_NAME.pem ec2-user@$BACKEND_IP 'aws sts get-caller-identity'

# Test Bedrock access
ssh -i ~/.ssh/$KEY_PAIR_NAME.pem ec2-user@$BACKEND_IP 'aws bedrock list-foundation-models --region us-east-1 --query "modelSummaries[0].modelId" --output text'

# Check IAM role
aws ec2 describe-instances \
    --instance-ids $INSTANCE_ID \
    --query 'Reservations[0].Instances[0].IamInstanceProfile' \
    --region $AWS_REGION
```

### Check Frontend
```bash
# S3 bucket status
aws s3api get-bucket-website \
    --bucket production-madza-frontend-$(aws sts get-caller-identity --query Account --output text) \
    --region $AWS_REGION

# Test frontend directly
curl -s $FRONTEND_URL | head -20
```

## 📊 Monitoring Commands

### System Status
```bash
# Backend service
ssh -i ~/.ssh/$KEY_PAIR_NAME.pem ec2-user@$BACKEND_IP 'sudo systemctl is-active madza-backend'

# Database size
ssh -i ~/.ssh/$KEY_PAIR_NAME.pem ec2-user@$BACKEND_IP 'ls -lh /opt/madza/backend/healthcare.db'

# Disk usage
ssh -i ~/.ssh/$KEY_PAIR_NAME.pem ec2-user@$BACKEND_IP 'df -h'

# Memory usage
ssh -i ~/.ssh/$KEY_PAIR_NAME.pem ec2-user@$BACKEND_IP 'free -h'
```

### Application Health
```bash
# Backend health check
curl -s http://$BACKEND_IP:5000/api/health | jq

# Frontend accessibility
curl -s -I $FRONTEND_URL | head -5

# API response time
time curl -s http://$BACKEND_IP:5000/api/health > /dev/null
```

## 🔄 Update Commands

### Update Backend Only
```bash
cd aws-deployment/cost-optimized-deployment/scripts
./deploy-backend-only.sh
```

### Update Frontend Only
```bash
cd aws-deployment/cost-optimized-deployment/scripts
./deploy-s3-frontend.sh
```

### Update Everything
```bash
cd aws-deployment/cost-optimized-deployment/scripts
./deploy-full-stack.sh
```

## 🧹 Cleanup Commands

### Remove Main Stack
```bash
# Delete main CloudFormation stack
aws cloudformation delete-stack \
    --stack-name $STACK_NAME \
    --region $AWS_REGION

# Wait for deletion
aws cloudformation wait stack-delete-complete \
    --stack-name $STACK_NAME \
    --region $AWS_REGION

echo "✅ Main stack deleted"
```

### Remove Lambda Stack
```bash
# Delete Lambda CloudFormation stack
aws cloudformation delete-stack \
    --stack-name AgentLambdaStack \
    --region $AWS_REGION

# Wait for deletion
aws cloudformation wait stack-delete-complete \
    --stack-name AgentLambdaStack \
    --region $AWS_REGION

echo "✅ Lambda stack deleted"
```

### Remove IAM Resources
```bash
# Remove role from instance profile
aws iam remove-role-from-instance-profile \
    --instance-profile-name MadzaBedrockInstanceProfile \
    --role-name MadzaBedrockRole \
    --region $AWS_REGION

# Delete instance profile
aws iam delete-instance-profile \
    --instance-profile-name MadzaBedrockInstanceProfile \
    --region $AWS_REGION

# Detach policy from role
aws iam detach-role-policy \
    --role-name MadzaBedrockRole \
    --policy-arn arn:aws:iam::aws:policy/AmazonBedrockFullAccess \
    --region $AWS_REGION

# Delete role
aws iam delete-role \
    --role-name MadzaBedrockRole \
    --region $AWS_REGION

echo "✅ IAM resources cleaned up"
```

### Remove Key Pair
```bash
# Delete key pair
aws ec2 delete-key-pair \
    --key-name $KEY_PAIR_NAME \
    --region $AWS_REGION

# Remove local key file
rm ~/.ssh/$KEY_PAIR_NAME.pem

echo "✅ Key pair removed"
```

## 📝 Deployment Summary

After successful deployment, you will have:

- **Frontend**: React app hosted on S3 at `$FRONTEND_URL`
- **Backend**: Flask API running on EC2 at `http://$BACKEND_IP:5000`
- **Database**: SQLite database on EC2
- **AI Services**: AWS Bedrock integration for AI analysis
- **Lambda AI**: Serverless AI functions for chat and advanced workflows
- **API Gateway**: RESTful endpoints for Lambda functions
- **Cost**: ~$8-15/month (Free Tier eligible)

## 🎯 Next Steps

1. **Custom Domain**: Configure Route 53 and CloudFront
2. **SSL Certificate**: Add HTTPS support
3. **Monitoring**: Set up CloudWatch alarms
4. **Backup**: Implement database backup strategy
5. **Scaling**: Consider ECS or Lambda for auto-scaling

---

**Deployment Complete!** 🎉

Your Madza AI Healthcare platform is now fully deployed and ready for use.
