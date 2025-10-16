# Madza AI Healthcare Platform

A comprehensive healthcare management system powered by artificial intelligence for intelligent patient registration, insurance verification, and automated claim processing.

## 🚀 Live Application

**Frontend**: http://production-madza-frontend-439500389744.s3-website-us-east-1.amazonaws.com  
**Backend API**: http://ec2-34-226-245-222.compute-1.amazonaws.com:5001

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

### Architecture Documentation
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete system architecture overview
- **[TECHNICAL_SPECS.md](./TECHNICAL_SPECS.md)** - Detailed technical specifications
- **[architecture-diagram.md](./architecture-diagram.md)** - Visual architecture diagrams

### Deployment Documentation
- **[aws-deployment/README.md](./aws-deployment/README.md)** - AWS deployment guide
- **[aws-deployment/cost-optimized-deployment/COMPLETE_DEPLOYMENT_GUIDE.md](./aws-deployment/cost-optimized-deployment/COMPLETE_DEPLOYMENT_GUIDE.md)** - Complete deployment instructions

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

### Prerequisites
- Node.js 18+
- Python 3.9+
- AWS CLI configured
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd madza
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python run.py
   ```

3. **Frontend Setup**
   ```bash
   cd src
   npm install
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

### Production Deployment

1. **Deploy Infrastructure**
   ```bash
   cd aws-deployment/cost-optimized-deployment/scripts
   ./setup-iam-roles.sh
   ./deploy-full-stack.sh
   ```

2. **Deploy Backend**
   ```bash
   ./deploy-backend-only.sh
   ```

3. **Deploy Frontend**
   ```bash
   ./deploy-s3-frontend.sh
   ```

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
DATABASE_URL=sqlite:///healthcare.db
AI_LAMBDA_URL=https://your-lambda-url.amazonaws.com
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=openai.gpt-oss-120b-1:0
```

**Frontend (build-time)**
```bash
REACT_APP_API_URL=http://your-backend-url:5001
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
- **HIPAA Ready**: Healthcare data protection
- **Data Privacy**: Patient information security
- **Audit Trails**: Complete activity logging

## 🚀 Recent Updates

### Latest Features (v1.2.0)
- ✅ **Insurance Fields**: Added Insurance ID and Insurance Provider to patient registration
- ✅ **Enhanced AI Analysis**: Insurance verification and fraud detection
- ✅ **Improved UI**: Updated tab name to "Madza AI Healthcare Platform"
- ✅ **Database Schema**: Updated to support new insurance fields
- ✅ **API Enhancements**: Improved error handling and validation

### Previous Features (v1.1.0)
- ✅ **AI-Powered Registration**: Intelligent patient analysis
- ✅ **Claim Processing**: Automated claim validation
- ✅ **EOB Management**: Explanation of Benefits handling
- ✅ **Chatbot Integration**: Interactive AI assistant
- ✅ **Analytics Dashboard**: Comprehensive system monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- **Documentation**: Check the architecture and technical specs
- **Issues**: Create an issue in the repository
- **Email**: Contact the development team

## 🗺️ Roadmap

### Short-term (1-3 months)
- [ ] Database migration to PostgreSQL
- [ ] JWT authentication system
- [ ] CloudFront CDN integration
- [ ] HTTPS implementation

### Medium-term (3-6 months)
- [ ] Microservices architecture
- [ ] Container deployment (Docker)
- [ ] CI/CD pipeline
- [ ] Advanced monitoring

### Long-term (6+ months)
- [ ] Mobile application
- [ ] Multi-region deployment
- [ ] Custom ML models
- [ ] Blockchain integration

---

**Madza AI Healthcare Platform** - Transforming healthcare through intelligent automation.

*Built with ❤️ using React, Flask, and AWS Bedrock*