# 🚀 Madza AI Healthcare - EC2 Backend + S3 Frontend Deployment

## 📋 **Architecture Overview**

- **Backend**: EC2 instance (t3.micro Free Tier) with Python Flask + Gunicorn
- **Frontend**: S3 static website hosting
- **Database**: SQLite (local file on EC2)
- **Cost**: ~$5-10/month (Free Tier eligible)

## 🚀 **Quick Deploy**

### **Prerequisites**
1. AWS CLI configured: `aws configure`
2. Key pair created: `aws ec2 create-key-pair --key-name madza --region us-east-1`

### **One-Command Deployment**
```bash
cd aws-deployment/cost-optimized-deployment/scripts
./deploy-full-stack.sh
```

### **Manual Deployment**

#### **Step 1: Deploy Infrastructure**
```bash
aws cloudformation deploy \
    --template-file cloudformation/separate-instances.yaml \
    --stack-name production-madza-ai-healthcare \
    --parameter-overrides \
        Environment=production \
        KeyPairName=madza \
    --region us-east-1 \
    --capabilities CAPABILITY_IAM
```

#### **Step 2: Deploy Frontend**
```bash
# Get backend URL first
BACKEND_URL=$(aws cloudformation describe-stacks \
    --stack-name production-madza-ai-healthcare \
    --region us-east-1 \
    --query 'Stacks[0].Outputs[?OutputKey==`BackendAPIURL`].OutputValue' \
    --output text)

# Deploy frontend
export BACKEND_API_URL=$BACKEND_URL
./deploy-s3-frontend.sh
```

## 🔧 **Key Improvements Made**

### **Backend (EC2)**
- ✅ **Optimized for t3.micro** (1GB RAM, Free Tier eligible)
- ✅ **Added Gunicorn** for production WSGI server
- ✅ **Memory-optimized configuration** (1 worker, no-cache pip install)
- ✅ **Better error handling** with `set -e`
- ✅ **Proper environment variables** for CORS
- ✅ **Production-ready service** configuration

### **Frontend (S3)**
- ✅ **Removed EC2 frontend** instance
- ✅ **Added S3 static website** hosting
- ✅ **Proper CORS configuration** for backend
- ✅ **Optimized caching** headers
- ✅ **Build process** handled locally

## 📊 **Cost Breakdown**

| Service | Configuration | Monthly Cost |
|---------|---------------|--------------|
| **EC2 t3.micro** | 1GB RAM, 1 vCPU (Free Tier) | $0-5* |
| **S3 Storage** | 1GB, website hosting | $1-2 |
| **Data Transfer** | Minimal | $1-2 |
| **Total** | | **$5-10** |

*Free for first 12 months with new AWS account

## 🔗 **Access URLs**

After deployment, you'll get:
- **Frontend**: S3 website URL (e.g., `http://production-madza-frontend-123456789.s3-website-us-east-1.amazonaws.com`)
- **Backend API**: EC2 public DNS (e.g., `http://ec2-xx-xx-xx-xx.compute-1.amazonaws.com:5001`)

## 🛠️ **Troubleshooting**

### **Backend Issues**
```bash
# Check service status
ssh -i ~/.ssh/madza.pem ec2-user@BACKEND_IP 'sudo systemctl status madza-backend'

# View logs
ssh -i ~/.ssh/madza.pem ec2-user@BACKEND_IP 'sudo journalctl -u madza-backend -f'

# Restart service
ssh -i ~/.ssh/madza.pem ec2-user@BACKEND_IP 'sudo systemctl restart madza-backend'
```

### **Frontend Issues**
```bash
# Check S3 bucket contents
aws s3 ls s3://production-madza-frontend-ACCOUNT_ID --region us-east-1

# Re-deploy frontend
./deploy-s3-frontend.sh
```

### **Database Issues**
```bash
# Check SQLite database file
ssh -i ~/.ssh/madza.pem ec2-user@BACKEND_IP 'ls -la /opt/madza/backend/healthcare.db'

# Check database permissions
ssh -i ~/.ssh/madza.pem ec2-user@BACKEND_IP 'ls -la /opt/madza/backend/'
```

## 🔄 **Updates**

### **Update Backend**
```bash
# Option 1: Use deployment script (recommended)
./scripts/deploy-backend-only.sh

# Option 2: Manual update
# 1. Make changes to Python code
# 2. SSH into EC2 instance
# 3. Copy new code to /opt/madza/backend
# 4. Restart service: sudo systemctl restart madza-backend
```

### **Update Frontend**
```bash
# Option 1: Use deployment script (recommended)
export BACKEND_API_URL=http://your-backend-url:5001
./scripts/deploy-s3-frontend.sh

# Option 2: Manual update
# 1. Make changes to React code
# 2. Run: ./deploy-s3-frontend.sh
```

## 🎯 **Why This Works Better**

1. **No EC2 build issues** - Frontend built locally, not on EC2
2. **Better resource allocation** - t3.small for backend, S3 for frontend
3. **Production-ready** - Gunicorn instead of Flask dev server
4. **Cost effective** - S3 hosting is cheaper than EC2
5. **Reliable** - S3 has 99.9% uptime
6. **Scalable** - S3 handles traffic spikes automatically

## 🆘 **Support**

If you encounter issues:
1. Check CloudFormation events in AWS Console
2. Check EC2 system logs
3. Verify security group rules
4. Check RDS connectivity
5. Review S3 bucket permissions

**Your Madza AI Healthcare Platform is now production-ready!** 🎉
