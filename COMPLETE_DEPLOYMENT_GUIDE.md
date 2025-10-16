# Complete Madza AI Healthcare Deployment Guide

This guide provides step-by-step instructions to replicate the complete deployment of the Madza AI Healthcare platform on AWS.

## 🏗️ Architecture Overview

- **Frontend**: React app deployed to S3 static website hosting
- **Backend**: Python Flask API deployed on EC2 (t3.micro)
- **Database**: SQLite (file-based, no RDS needed)
- **AI Services**: AWS Bedrock integration for AI analysis
- **Cost**: ~$5-10/month (Free Tier eligible)

## 📋 Prerequisites

### 1. Local Environment Setup
```bash
# Ensure you have the following installed:
- AWS CLI (configured with credentials)
- Node.js 16+ and npm
- Python 3.9+
- Git

# Verify AWS CLI is configured
aws sts get-caller-identity
```

### 2. AWS Account Requirements
- AWS account with appropriate permissions
- Access to EC2, S3, IAM, and Bedrock services
- Bedrock model access (request if needed)

## 🚀 Step-by-Step Deployment

### Step 1: Prepare the Codebase

```bash
# Clone or navigate to the project directory
cd /path/to/madza

# Ensure all files are present:
# - Frontend: src/ directory with React components
# - Backend: backend/ directory with Python Flask app
# - Deployment: aws-deployment/ directory with CloudFormation templates
```

### Step 2: Create AWS Key Pair

```bash
# Create a new key pair for EC2 access
aws ec2 create-key-pair --key-name madza --region us-east-1 --query 'KeyMaterial' --output text > ~/.ssh/madza.pem

# Set proper permissions
chmod 400 ~/.ssh/madza.pem

# Verify the key was created
aws ec2 describe-key-pairs --key-names madza --region us-east-1
```

### Step 3: Deploy Infrastructure

```bash
# Navigate to deployment scripts
cd aws-deployment/cost-optimized-deployment/scripts

# Deploy the full stack (EC2 + S3 + CloudFormation)
./deploy-full-stack.sh
```

This script will:
- Deploy CloudFormation stack with EC2 and S3 resources
- Deploy backend to EC2 instance
- Deploy frontend to S3 bucket
- Configure environment variables

### Step 4: Configure AWS Bedrock Access

The EC2 instance needs IAM permissions to access Bedrock. Run these commands:

```bash
# 1. Create IAM role for Bedrock access
aws iam create-role --role-name MadzaBedrockRole --assume-role-policy-document '{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "ec2.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}' --region us-east-1

# 2. Attach Bedrock permissions to the role
aws iam attach-role-policy --role-name MadzaBedrockRole --policy-arn arn:aws:iam::aws:policy/AmazonBedrockFullAccess --region us-east-1

# 3. Create instance profile
aws iam create-instance-profile --instance-profile-name MadzaBedrockInstanceProfile --region us-east-1

# 4. Add role to instance profile
aws iam add-role-to-instance-profile --instance-profile-name MadzaBedrockInstanceProfile --role-name MadzaBedrockRole --region us-east-1

# 5. Get the EC2 instance ID
INSTANCE_ID=$(aws ec2 describe-instances --filters "Name=tag:Name,Values=production-madza-backend" --query 'Reservations[0].Instances[0].InstanceId' --output text --region us-east-1)
echo "Instance ID: $INSTANCE_ID"

# 6. Attach instance profile to EC2 instance
aws ec2 associate-iam-instance-profile --instance-id $INSTANCE_ID --iam-instance-profile Name=MadzaBedrockInstanceProfile --region us-east-1

# 7. Wait for association to complete
sleep 10
```

### Step 5: Fix Database Configuration

The SQLite database path needs to be corrected on the EC2 instance:

```bash
# Get the EC2 public IP
BACKEND_IP=$(aws ec2 describe-instances --filters "Name=tag:Name,Values=production-madza-backend" --query 'Reservations[0].Instances[0].PublicIpAddress' --output text --region us-east-1)

# Fix the database URL in .env file
ssh -i ~/.ssh/madza.pem ec2-user@$BACKEND_IP 'cd /opt/madza/backend && echo "FLASK_ENV=production
FLASK_APP=main.py
DATABASE_URL=sqlite:////opt/madza/backend/healthcare.db
AWS_REGION=us-east-1
FRONTEND_URL=*" > .env'

# Create the database file
ssh -i ~/.ssh/madza.pem ec2-user@$BACKEND_IP 'cd /opt/madza/backend && python3 -c "import sqlite3; conn = sqlite3.connect(\"healthcare.db\"); conn.close(); print(\"Database created\")"'

# Restart the backend service
ssh -i ~/.ssh/madza.pem ec2-user@$BACKEND_IP 'sudo systemctl restart madza-backend'
```

### Step 6: Test the Deployment

```bash
# Run the comprehensive test suite
./test-deployment.sh
```

This will test:
- Backend health check
- Frontend accessibility
- API endpoints
- AI services integration

## 🔧 Manual Verification Steps

### 1. Test Backend API
```bash
# Get backend URL
BACKEND_URL=$(aws cloudformation describe-stacks --stack-name production-madza-ai-healthcare --query 'Stacks[0].Outputs[?OutputKey==`BackendAPIURL`].OutputValue' --output text --region us-east-1)

# Test health endpoint
curl -s $BACKEND_URL/api/health

# Test patient registration
curl -s -X POST $BACKEND_URL/api/patient/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com","phone":"123-456-7890","dateOfBirth":"1990-01-01"}'
```

### 2. Test Frontend
```bash
# Get frontend URL
FRONTEND_URL=$(aws cloudformation describe-stacks --stack-name production-madza-ai-healthcare --query 'Stacks[0].Outputs[?OutputKey==`FrontendWebsiteURL`].OutputValue' --output text --region us-east-1)

# Open in browser
echo "Frontend URL: $FRONTEND_URL"
```

### 3. Test AI Services
```bash
# Test claim processing with AI
curl -s -X POST $BACKEND_URL/api/claims/process \
  -H "Content-Type: application/json" \
  -d '{"patient_id":"<PATIENT_ID>","claim_amount":1500,"claim_type":"Medical","description":"Emergency room visit"}'

# Test AI suggestions
curl -s -X POST $BACKEND_URL/api/claims/<CLAIM_ID>/suggestions
```

## 📁 File Structure

The deployment uses these key files:

```
madza/
├── src/                                    # React frontend
│   ├── components/                         # React components
│   ├── utils/apiConfig.ts                 # API endpoint configuration
│   └── ...
├── backend/                               # Python Flask backend
│   ├── app/
│   │   ├── main.py                       # Flask API endpoints
│   │   ├── services.py                   # Bedrock AI services
│   │   ├── models.py                     # Database models
│   │   └── database.py                   # Database configuration
│   └── requirements.txt
└── aws-deployment/                        # AWS deployment files
    └── cost-optimized-deployment/
        ├── cloudformation/
        │   └── separate-instances.yaml   # CloudFormation template
        └── scripts/
            ├── deploy-full-stack.sh      # Main deployment script
            ├── deploy-backend-only.sh    # Backend-only deployment
            ├── deploy-s3-frontend.sh     # Frontend-only deployment
            └── test-deployment.sh        # Deployment testing
```

## 🔍 Troubleshooting

### Common Issues and Solutions

#### 1. Backend Health Check Fails
```bash
# Check service status
ssh -i ~/.ssh/madza.pem ec2-user@$BACKEND_IP 'sudo systemctl status madza-backend'

# Check logs
ssh -i ~/.ssh/madza.pem ec2-user@$BACKEND_IP 'sudo journalctl -u madza-backend -f'

# Restart service
ssh -i ~/.ssh/madza.pem ec2-user@$BACKEND_IP 'sudo systemctl restart madza-backend'
```

#### 2. Database Connection Issues
```bash
# Check database file exists
ssh -i ~/.ssh/madza.pem ec2-user@$BACKEND_IP 'ls -la /opt/madza/backend/healthcare.db'

# Check .env file
ssh -i ~/.ssh/madza.pem ec2-user@$BACKEND_IP 'cat /opt/madza/backend/.env'

# Fix database path if needed
ssh -i ~/.ssh/madza.pem ec2-user@$BACKEND_IP 'cd /opt/madza/backend && echo "DATABASE_URL=sqlite:////opt/madza/backend/healthcare.db" >> .env'
```

#### 3. AI Services Not Working
```bash
# Check AWS credentials on EC2
ssh -i ~/.ssh/madza.pem ec2-user@$BACKEND_IP 'aws sts get-caller-identity'

# Test Bedrock access
ssh -i ~/.ssh/madza.pem ec2-user@$BACKEND_IP 'aws bedrock list-foundation-models --region us-east-1 --query "modelSummaries[0].modelId" --output text'

# Check IAM role attachment
aws ec2 describe-instances --instance-ids $INSTANCE_ID --query 'Reservations[0].Instances[0].IamInstanceProfile' --region us-east-1
```

#### 4. Frontend Not Loading
```bash
# Check S3 bucket configuration
aws s3api get-bucket-website --bucket production-madza-frontend-<ACCOUNT_ID> --region us-east-1

# Check bucket policy
aws s3api get-bucket-policy --bucket production-madza-frontend-<ACCOUNT_ID> --region us-east-1
```

## 🧪 Testing Commands

### Full Deployment Test
```bash
cd aws-deployment/cost-optimized-deployment/scripts
./test-deployment.sh
```

### Individual Component Tests
```bash
# Test backend only
curl -s $BACKEND_URL/api/health

# Test frontend only
curl -s $FRONTEND_URL

# Test AI services
curl -s -X POST $BACKEND_URL/api/patient/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","phone":"555-0123","dateOfBirth":"1980-01-01"}'
```

## 📊 Monitoring and Maintenance

### Check System Status
```bash
# Backend service status
ssh -i ~/.ssh/madza.pem ec2-user@$BACKEND_IP 'sudo systemctl status madza-backend'

# Database size
ssh -i ~/.ssh/madza.pem ec2-user@$BACKEND_IP 'ls -lh /opt/madza/backend/healthcare.db'

# Disk usage
ssh -i ~/.ssh/madza.pem ec2-user@$BACKEND_IP 'df -h'
```

### Update Deployment
```bash
# Update backend only
./deploy-backend-only.sh

# Update frontend only
./deploy-s3-frontend.sh

# Update everything
./deploy-full-stack.sh
```

## 💰 Cost Optimization

- **EC2**: t3.micro (Free Tier eligible)
- **S3**: Static website hosting (minimal cost)
- **SQLite**: No additional database costs
- **Bedrock**: Pay-per-use for AI services
- **Total**: ~$5-10/month

## 🔒 Security Notes

- EC2 instance has IAM role with minimal required permissions
- S3 bucket is configured for public read access (frontend only)
- Backend API is accessible from anywhere (configure security groups as needed)
- Database is file-based SQLite (consider encryption for production)

## 📝 Next Steps

1. **Custom Domain**: Configure CloudFront and Route 53 for custom domain
2. **SSL Certificate**: Add HTTPS support
3. **Monitoring**: Set up CloudWatch alarms and logging
4. **Backup**: Implement database backup strategy
5. **Scaling**: Consider ECS or Lambda for auto-scaling

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review CloudFormation stack events: `aws cloudformation describe-stack-events --stack-name production-madza-ai-healthcare --region us-east-1`
3. Check EC2 instance logs: `ssh -i ~/.ssh/madza.pem ec2-user@$BACKEND_IP 'sudo journalctl -u madza-backend -f'`

---

**Deployment Complete!** 🎉

Your Madza AI Healthcare platform should now be fully deployed and accessible at the frontend URL provided by the deployment script.
