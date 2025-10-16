# Madza Healthcare Application - AWS Deployment

This directory contains all the necessary files for deploying the Madza Healthcare Application to AWS.

## 📁 Directory Structure

```
aws-deployment/
├── cost-optimized-deployment/          # Main deployment configuration
│   ├── cloudformation/                 # CloudFormation templates
│   │   └── separate-instances.yaml    # Infrastructure template
│   ├── iam/                           # IAM roles and policies
│   │   └── iam-roles.yaml            # IAM configuration
│   ├── scripts/                       # Deployment scripts
│   │   ├── setup-iam-roles.sh        # Setup IAM roles
│   │   ├── deploy-full-stack.sh      # Deploy infrastructure
│   │   ├── deploy-backend-only.sh    # Deploy backend
│   │   ├── deploy-s3-frontend.sh     # Deploy frontend
│   │   ├── test-deployment.sh        # Test deployment
│   │   ├── deploy-backend-fixed.sh   # Fixed backend deployment
│   │   ├── update-backend.sh         # Update backend
│   │   ├── start.sh                  # Start services
│   │   └── cleanup-project.sh        # Cleanup script
│   ├── DEPLOYMENT_GUIDE.md           # Basic deployment guide
│   ├── COMPLETE_DEPLOYMENT_GUIDE.md  # Comprehensive guide
│   └── README.md                     # Project overview
└── README.md                         # This file
```

## 🚀 Quick Start

1. **Setup IAM Roles**:
   ```bash
   cd cost-optimized-deployment/scripts
   ./setup-iam-roles.sh
   ```

2. **Deploy Full Stack**:
   ```bash
   ./deploy-full-stack.sh
   ```

3. **Deploy Backend**:
   ```bash
   ./deploy-backend-only.sh
   ```

4. **Deploy Frontend**:
   ```bash
   ./deploy-s3-frontend.sh
   ```

5. **Test Deployment**:
   ```bash
   ./test-deployment.sh
   ```

## 📋 Prerequisites

- AWS CLI configured
- Node.js (v14+)
- Python (v3.8+)
- Git

## 🔧 Configuration

All configuration is handled through the deployment scripts. Key settings:

- **Region**: us-east-1
- **Instance Type**: t3.micro
- **Backend Port**: 5001
- **Frontend**: S3 static hosting

## 📚 Documentation

- **COMPLETE_DEPLOYMENT_GUIDE.md**: Comprehensive deployment instructions
- **DEPLOYMENT_GUIDE.md**: Basic deployment steps
- **iam/iam-roles.yaml**: IAM roles and policies configuration
- **cloudformation/separate-instances.yaml**: Infrastructure template

## 🧪 Testing

Run the test script to verify deployment:
```bash
./test-deployment.sh
```

## 🔄 Updates

- **Backend Updates**: `./update-backend.sh`
- **Frontend Updates**: `./deploy-s3-frontend.sh`
- **Infrastructure Updates**: `./deploy-full-stack.sh`

## 🧹 Cleanup

To clean up the project and remove unnecessary files:
```bash
./cleanup-project.sh
```

## 💰 Cost

- **EC2**: t3.micro (free tier eligible)
- **S3**: Static hosting (minimal cost)
- **Lambda**: Pay-per-request
- **Bedrock**: Pay-per-token

## 🔒 Security

- IAM roles with least privilege
- Security groups with restrictive rules
- VPC isolation
- HTTPS ready (with CloudFront)

## 📞 Support

For issues or questions, check:
1. Deployment logs
2. AWS CloudFormation stack events
3. EC2 instance logs
4. S3 bucket permissions