# 🚀 Madza AI Healthcare - EC2 + S3 Deployment

Simple, cost-effective deployment using EC2 backend with SQLite and S3 frontend hosting.

## 💰 **Cost: $5-10/month (Free Tier Eligible)**

## 🚀 **Quick Deploy**

```bash
# 1. Set up AWS CLI
aws configure

# 2. Create key pair
aws ec2 create-key-pair --key-name madza --region us-east-1

# 3. Deploy everything
cd scripts
./deploy-full-stack.sh
```

## 📋 **Architecture**

- **Backend**: EC2 t3.micro (Free Tier) with Python Flask + Gunicorn
- **Frontend**: S3 static website hosting
- **Database**: SQLite (local file)
- **AI Services**: AWS Bedrock integration

## 📁 **File Structure**

```
aws-deployment/cost-optimized-deployment/
├── cloudformation/
│   └── separate-instances.yaml    # Main CloudFormation template
├── scripts/
│   ├── deploy-full-stack.sh       # Complete deployment
│   ├── deploy-backend-only.sh     # Backend only
│   ├── deploy-s3-frontend.sh      # Frontend only
│   ├── test-deployment.sh         # Test deployment
│   └── test-frontend-backend-connection.sh  # Test connection
└── DEPLOYMENT_GUIDE.md            # Detailed guide
```

## 🔧 **Deployment Options**

### **Full Stack Deployment**
```bash
./scripts/deploy-full-stack.sh
```

### **Backend Only (update Python code)**
```bash
./scripts/deploy-backend-only.sh
```

### **Frontend Only (after backend is deployed)**
```bash
export BACKEND_API_URL=http://your-backend-url:5001
./scripts/deploy-s3-frontend.sh
```

### **Test Deployment**
```bash
./scripts/test-deployment.sh
```

### **Test Frontend-Backend Connection**
```bash
./scripts/test-frontend-backend-connection.sh
```

## 📊 **Cost Breakdown**

| Service | Monthly Cost |
|---------|-------------|
| EC2 t3.micro (Free Tier) | $0-5* |
| S3 Storage | $1-2 |
| Data Transfer | $1-2 |
| **Total** | **$5-10** |

*Free for first 12 months with new AWS account

## 🎯 **Perfect For**

- Development environments
- Proof of concepts
- Small applications
- Learning projects
- Startups with budget constraints
- **Free Tier users** (first 12 months free!)

## 🆓 **Free Tier Benefits**

- **EC2 t3.micro**: 750 hours/month free (first 12 months)
- **S3**: 5GB storage free (first 12 months)
- **Data Transfer**: 1GB/month free (first 12 months)
- **Total Free Tier Cost**: $0/month for first year!

## 🔗 **After Deployment**

You'll get:
- **Frontend URL**: S3 website (e.g., `http://production-madza-frontend-123456789.s3-website-us-east-1.amazonaws.com`)
- **Backend API**: EC2 public DNS (e.g., `http://ec2-xx-xx-xx-xx.compute-1.amazonaws.com:5001`)

## 🛠️ **Troubleshooting**

### **Backend Issues**
```bash
# Check service status
ssh -i ~/.ssh/madza.pem ec2-user@BACKEND_IP 'sudo systemctl status madza-backend'

# View logs
ssh -i ~/.ssh/madza.pem ec2-user@BACKEND_IP 'sudo journalctl -u madza-backend -f'
```

### **Frontend Issues**
```bash
# Check S3 bucket
aws s3 ls s3://production-madza-frontend-ACCOUNT_ID --region us-east-1

# Re-deploy frontend
./scripts/deploy-s3-frontend.sh
```

## 📖 **Detailed Guide**

See `DEPLOYMENT_GUIDE.md` for comprehensive instructions.

---

**Ready to deploy? Let's go! 🚀**