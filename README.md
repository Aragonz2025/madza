# 🚀 Madza AI Healthcare Platform

A cutting-edge AI-powered healthcare platform built with React and Python, featuring AWS Bedrock integration, multi-agent orchestration, and a flashy modern UI.

## ✨ Features

### 🤖 AI-Powered Capabilities
- **AWS Bedrock Integration**: Leverages Amazon Bedrock for advanced LLM capabilities
- **Multi-Agent System**: Intelligent agent orchestration for complex healthcare workflows
- **Agent-to-Agent Communication**: Seamless collaboration between AI agents
- **Real-time AI Analysis**: Live insights and recommendations

### 🏥 Healthcare Workflows
- **Patient Registration**: AI-powered patient onboarding with risk assessment
- **Claim Processing**: Multi-step intelligent claim validation and processing
- **Claim Management**: Smart approval/denial workflows with AI suggestions
- **Observability**: Comprehensive system monitoring and analytics

### 🎨 Modern UI/UX
- **Flashy AI-Generated UI**: Stunning gradient designs and animations
- **Left Navigation**: Intuitive sidebar with smooth transitions
- **Responsive Design**: Works perfectly on all device sizes
- **Real-time Updates**: Live data and status updates

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Material-UI**: Modern component library with custom theming
- **Framer Motion**: Smooth animations and transitions
- **Axios**: HTTP client for API communication
- **React Router**: Client-side routing

### Backend (Python + Flask)
- **Flask**: Lightweight web framework
- **AWS Bedrock**: LLM inference and AI capabilities
- **Boto3**: AWS SDK for Python
- **Pytest**: Comprehensive testing framework

### AI Agents
1. **Patient Registration Agent**: Validates and analyzes patient data
2. **Claim Processing Agent**: Multi-step claim validation and processing
3. **Denial Analysis Agent**: Analyzes denials and provides reprocessing suggestions
4. **Observability Agent**: Monitors system health and performance

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- AWS Account with Bedrock access

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd madza
```

2. **Run the startup script**
```bash
./start.sh
```

This will:
- Install all dependencies
- Set up Python virtual environment
- Start the backend server (port 5000)
- Start the frontend development server (port 3000)

### Manual Setup

#### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app/main.py
```

#### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
FLASK_ENV=development
FLASK_DEBUG=True
```

### AWS Setup
1. Configure AWS credentials:
```bash
aws configure
```

2. Ensure your AWS account has access to:
   - Amazon Bedrock
   - AWS Bedrock Agent (optional)
   - IAM permissions for Bedrock services

## 📊 API Documentation

### Health & Status
- `GET /api/health` - Health check
- `GET /api/observability/metrics` - System metrics
- `GET /api/agents/status` - AI agent status

### Patient Management
- `POST /api/patient/register` - Register patient with AI analysis
- `GET /api/patient/{id}` - Get patient information

### Claim Processing
- `POST /api/claims/process` - Process claim with multi-step AI
- `GET /api/claims/{id}` - Get claim details
- `POST /api/claims/{id}/approve` - Approve claim
- `POST /api/claims/{id}/deny` - Deny claim with AI suggestions

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest tests/ -v
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🎨 UI Components

### Navigation
- **LeftNavigation**: Animated sidebar with gradient effects
- **Dashboard**: Real-time metrics and activity feed
- **PatientRegistration**: AI-powered form with live analysis
- **ClaimProcessing**: Multi-step processing with progress indicators
- **ClaimManagement**: Interactive claim management interface
- **Observability**: System monitoring dashboard
- **AgentStatus**: AI agent performance monitoring

### Design Features
- **Gradient Themes**: Beautiful color gradients throughout
- **Smooth Animations**: Framer Motion powered transitions
- **Glass Effects**: Modern glassmorphism design elements
- **Responsive Layout**: Mobile-first responsive design
- **Dark Theme**: Sleek dark theme with accent colors

## 🔒 Security

- CORS enabled for frontend integration
- Input validation and sanitization
- Error handling without sensitive data exposure
- AWS IAM roles for secure service access

## 📈 Monitoring

- Real-time system metrics
- AI agent performance tracking
- Health checks and alerts
- Comprehensive logging

## 🚀 Deployment

### AWS Deployment
The application is designed for easy AWS deployment:

1. **Backend**: Deploy to AWS Lambda or ECS
2. **Frontend**: Deploy to S3 + CloudFront
3. **Database**: Use DynamoDB or RDS
4. **AI Services**: Leverage AWS Bedrock

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🎯 Roadmap

- [ ] Enhanced AI model integration
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] Multi-tenant support
- [ ] Advanced security features
- [ ] Performance optimizations

---

**Built with ❤️ using React, Python, and AWS Bedrock**