# Madza AI Healthcare Platform

A comprehensive healthcare management system powered by artificial intelligence for intelligent patient registration, insurance verification, and automated claim processing.

## 🚀 Quick Deployment

Deploy the complete application with a single command:

```bash
git clone https://github.com/Aragonz2025/madza.git
cd madza
chmod +x deploy-madza.sh
./deploy-madza.sh
```

## 📋 Prerequisites

- AWS CLI configured with appropriate permissions
- Node.js 16+ and npm
- Python 3.9+
- Git

## 🏗️ Architecture

- **Frontend**: React 18 + TypeScript + Material-UI (S3 Static Hosting)
- **Backend**: Flask 3.0 + SQLAlchemy + SQLite (EC2)
- **AI Services**: AWS Bedrock (GPT-OSS-120B)
- **Infrastructure**: AWS CloudFormation + IAM
- **Cost**: ~$5-10/month (Free Tier eligible)

## 📋 Features

### Core Functionality
- **AI-Powered Patient Registration** with insurance verification
- **Intelligent Claim Processing** with automated approval/denial
- **Real-time Fraud Detection** and risk assessment
- **EOB (Explanation of Benefits) Management**
- **Interactive AI Chatbot** for user assistance
- **Comprehensive Analytics** and observability dashboard

### AI Capabilities
- **Insurance Verification**: Provider validation, ID format checking, coverage status
- **Risk Assessment**: Automated eligibility and risk level determination
- **Fraud Detection**: Real-time analysis of potential fraud indicators
- **Data Quality Analysis**: Completeness and consistency validation
- **Smart Recommendations**: AI-generated verification and improvement suggestions

## 🏗️ Architecture

### System Overview
- **Frontend**: React 18 + TypeScript + Material-UI
- **Backend**: Flask 3.0 + SQLAlchemy + SQLite
- **AI Services**: AWS Bedrock (GPT-OSS-120B)
- **Infrastructure**: AWS EC2 + S3 + CloudFormation
- **Deployment**: Automated scripts with systemd services

### Key Components
- **Patient Management**: Complete patient lifecycle with AI insights
- **Claim Processing**: Automated claim validation and processing
- **Insurance Integration**: Real-time insurance verification
- **Analytics Dashboard**: System metrics and performance monitoring
- **AI Chatbot**: Intelligent user assistance and guidance

## 📚 Documentation

### Deployment Instructions
- **[DEPLOYMENT_INSTRUCTIONS.md](./DEPLOYMENT_INSTRUCTIONS.md)** - Complete step-by-step deployment guide
- **[deploy-madza.sh](./deploy-madza.sh)** - Automated deployment script
- **[aws-deployment/](./aws-deployment/)** - AWS CloudFormation templates and scripts

## 🛠️ Technology Stack

### Frontend
```json
{
  "react": "^18.2.0",
  "typescript": "^4.9.5",
  "@mui/material": "^5.14.0",
  "framer-motion": "^10.16.0",
  "axios": "^1.5.0"
}
```

### Backend
```json
{
  "flask": "3.0.0",
  "sqlalchemy": "2.0.44",
  "boto3": "1.34.0",
  "gunicorn": "23.0.0"
}
```

### AI/ML
- **AWS Bedrock**: GPT-OSS-120B model for intelligent analysis
- **Custom Prompts**: Healthcare-specific AI prompts
- **Fallback Systems**: Lambda functions for reliability

## 🚀 Quick Start

### Automated Deployment (Recommended)

```bash
# Clone and deploy everything
git clone https://github.com/Aragonz2025/madza.git
cd madza
chmod +x deploy-madza.sh
./deploy-madza.sh
```

The script will:
- Check all prerequisites
- Create AWS resources (EC2, S3, IAM)
- Deploy backend and frontend
- Configure AI services
- Run health checks
- Provide deployment URLs

### Manual Deployment

Follow the detailed instructions in [DEPLOYMENT_INSTRUCTIONS.md](./DEPLOYMENT_INSTRUCTIONS.md)

### Local Development

1. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python run.py
   ```

2. **Frontend Setup**
   ```bash
   npm install
   npm start
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📊 API Endpoints

### Patient Management
- `POST /api/patient/register` - Register new patient with AI analysis
- `GET /api/patient/{id}` - Get patient details
- `GET /api/patients` - List all patients

### Claim Processing
- `POST /api/claims/process` - Process claim with AI validation
- `GET /api/claims/{id}` - Get claim details
- `POST /api/claims/{id}/approve` - Approve claim
- `POST /api/claims/{id}/deny` - Deny claim

### System & AI
- `GET /api/health` - Health check
- `GET /api/agents/status` - AI agent status
- `POST /api/chatbot/query` - Chatbot interaction

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```bash
FLASK_ENV=production
FLASK_APP=main.py
DATABASE_URL=sqlite:////opt/madza/backend/healthcare.db
AWS_REGION=us-east-1
FRONTEND_URL=*
```

**Frontend (build-time)**
```bash
REACT_APP_API_URL=http://your-backend-url:5000
```


## 📈 Monitoring & Analytics

### System Metrics
- **Patient Registration**: Real-time registration analytics
- **Claim Processing**: Processing time and success rates
- **AI Performance**: Model accuracy and response times
- **System Health**: Resource utilization and uptime

### Observability Features
- **Real-time Dashboards**: System performance monitoring
- **AI Agent Status**: Live AI service monitoring
- **Activity Feeds**: Recent system activities
- **Alert System**: Automated issue detection

## 🔒 Security

### Security Features
- **Data Encryption**: AES-256 for data at rest
- **Secure Communication**: TLS 1.3 for data in transit
- **Access Control**: IAM roles and policies
- **Audit Logging**: Comprehensive activity tracking

### Compliance
- **Data Privacy**: Patient information security
- **Audit Trails**: Complete activity logging

## 🚀 Features

### Current Features (v1.0.0)
- ✅ **AI-Powered Registration**: Intelligent patient analysis with insurance verification
- ✅ **Enhanced AI Analysis**: Insurance verification and fraud detection
- ✅ **Claim Processing**: Automated claim validation and processing
- ✅ **EOB Management**: Explanation of Benefits handling
- ✅ **Chatbot Integration**: Interactive AI assistant
- ✅ **Analytics Dashboard**: Comprehensive system monitoring
- ✅ **Automated Deployment**: One-command deployment to AWS
- ✅ **Cost Optimization**: ~$5-10/month infrastructure costs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software owned by Madza AI Healthcare Platform. 
All rights reserved. See the [LICENSE](LICENSE) file for details.

**Licensing Information:**
- Commercial use requires a paid license
- Contact: licensing@madzahealthcare.com
- Website: https://madzahealthcare.com/licensing

## 🔧 Troubleshooting

### Common Issues

**Deployment Fails**
```bash
# Check AWS credentials
aws sts get-caller-identity

# Check prerequisites
node --version
python3 --version
aws --version
```

**Backend Not Responding**
```bash
# Check service status
ssh -i ~/.ssh/madza.pem ec2-user@$BACKEND_IP 'sudo systemctl status madza-backend'

# Check logs
ssh -i ~/.ssh/madza.pem ec2-user@$BACKEND_IP 'sudo journalctl -u madza-backend -f'
```

**Frontend Not Loading**
```bash
# Check S3 bucket
aws s3api get-bucket-website --bucket production-madza-frontend-$(aws sts get-caller-identity --query Account --output text)
```

### Getting Help

- **Documentation**: [DEPLOYMENT_INSTRUCTIONS.md](./DEPLOYMENT_INSTRUCTIONS.md)
- **Issues**: Create an issue in the repository
- **Deployment Logs**: Check the automated script output


---

**Madza AI Healthcare Platform** - Transforming healthcare through intelligent automation.

*Built with ❤️ using React, Flask, and AWS Bedrock*