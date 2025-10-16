# Madza AI Healthcare Platform - Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Component Details](#component-details)
5. [Data Flow](#data-flow)
6. [Security Architecture](#security-architecture)
7. [Deployment Architecture](#deployment-architecture)
8. [AI/ML Integration](#aiml-integration)
9. [API Documentation](#api-documentation)
10. [Scalability & Performance](#scalability--performance)
11. [Monitoring & Observability](#monitoring--observability)
12. [Future Enhancements](#future-enhancements)

## Overview

The Madza AI Healthcare Platform is a comprehensive healthcare management system that leverages artificial intelligence to streamline patient registration, insurance verification, and claim processing. The platform provides intelligent automation, fraud detection, and real-time analytics for healthcare operations.

### Key Features
- **AI-Powered Patient Registration** with insurance verification
- **Intelligent Claim Processing** with automated approval/denial
- **Real-time Fraud Detection** and risk assessment
- **Comprehensive Analytics** and observability
- **Interactive Chatbot** for user assistance
- **EOB (Explanation of Benefits) Management**

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  React Frontend (S3 + CloudFront)                              │
│  - Patient Registration UI                                     │
│  - Claim Processing Interface                                  │
│  - Dashboard & Analytics                                       │
│  - Interactive Chatbot                                         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTPS/API Calls
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│  Flask REST API (EC2)                                          │
│  - Authentication & Authorization                              │
│  - Request Routing & Validation                                │
│  - CORS Handling                                               │
│  - Rate Limiting                                               │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BUSINESS LOGIC LAYER                       │
├─────────────────────────────────────────────────────────────────┤
│  Core Services                                                 │
│  ├── Patient Service                                           │
│  ├── Claim Service                                             │
│  ├── EOB Service                                               │
│  └── Bedrock AI Service                                        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│  SQLite Database (EC2)                                         │
│  ├── Patients Table                                            │
│  ├── Claims Table                                              │
│  ├── EOBs Table                                                │
│  └── AI Analysis Storage                                       │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AI/ML LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  AWS Bedrock                                                   │
│  ├── GPT-OSS-120B Model                                        │
│  ├── Patient Analysis                                          │
│  ├── Claim Processing                                          │
│  └── Fraud Detection                                           │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI) v5
- **State Management**: React Hooks (useState, useEffect)
- **Animation**: Framer Motion
- **HTTP Client**: Axios
- **Build Tool**: Create React App
- **Deployment**: AWS S3 + CloudFront

### Backend
- **Framework**: Flask 3.0.0 (Python 3.9)
- **Database ORM**: SQLAlchemy 2.0
- **Database**: SQLite (production-ready for small to medium scale)
- **API Documentation**: Flask-RESTful patterns
- **Authentication**: JWT (planned)
- **CORS**: Flask-CORS
- **WSGI Server**: Gunicorn
- **Deployment**: AWS EC2

### AI/ML Services
- **Primary AI**: AWS Bedrock (GPT-OSS-120B)
- **Fallback**: AWS Lambda functions
- **Model Management**: AWS Bedrock Runtime API
- **AI Analysis Storage**: JSON in SQLite

### Infrastructure
- **Cloud Provider**: AWS
- **Compute**: EC2 (t3.micro)
- **Storage**: S3 (frontend), EBS (database)
- **Networking**: VPC with public subnets
- **CDN**: CloudFront (planned)
- **Infrastructure as Code**: CloudFormation

### DevOps & Monitoring
- **Process Management**: systemd
- **Logging**: journalctl
- **Monitoring**: Custom observability endpoints
- **Deployment**: Automated scripts
- **Version Control**: Git

## Component Details

### Frontend Components

#### Core Components
- **App.tsx**: Main application component with routing
- **Dashboard.tsx**: Main dashboard with metrics and navigation
- **PatientRegistration.tsx**: AI-powered patient registration form
- **ClaimProcessing.tsx**: Claim submission and processing interface
- **PatientManagement.tsx**: Patient list and management
- **EOBManagement.tsx**: Explanation of Benefits management

#### AI-Powered Components
- **Chatbot.tsx**: Interactive AI assistant
- **AgentStatus.tsx**: AI agent monitoring and status
- **Observability.tsx**: System metrics and analytics

#### Utility Components
- **LeftNavigation.tsx**: Side navigation menu
- **Footer.tsx**: Application footer
- **apiConfig.ts**: API endpoint configuration
- **aiAnalysisParser.ts**: AI response parsing utilities

### Backend Services

#### Core Models
```python
class Patient:
    - id: UUID (Primary Key)
    - first_name: String
    - last_name: String
    - email: String (Unique)
    - phone: String
    - date_of_birth: String
    - insurance_id: String
    - insurance_provider: String
    - ai_analysis: JSON
    - created_at: DateTime
    - updated_at: DateTime

class Claim:
    - id: UUID (Primary Key)
    - patient_id: UUID (Foreign Key)
    - claim_amount: Float
    - claim_type: String
    - description: Text
    - status: String (pending/approved/denied)
    - ai_analysis: JSON
    - approval_required: Boolean
    - created_at: DateTime
    - updated_at: DateTime

class EOB:
    - id: UUID (Primary Key)
    - claim_id: UUID (Foreign Key)
    - patient_id: UUID (Foreign Key)
    - eob_amount: Float
    - status: String
    - eob_date: Date
    - insurance_company: String
    - pdf_url: String
    - ai_analysis: JSON
    - denial_reasons: JSON
    - refile_required: Boolean
```

#### Service Layer
- **PatientService**: Patient CRUD operations
- **ClaimService**: Claim processing and management
- **BedrockService**: AI integration and analysis
- **PDFGenerator**: EOB PDF generation

### AI Integration

#### BedrockService Architecture
```python
class BedrockService:
    def process_patient_registration(patient_data):
        # AI analysis for patient registration
        # Returns: risk assessment, data quality, insurance verification
        
    def process_claim(claim_data):
        # AI analysis for claim processing
        # Returns: validation, coverage check, fraud assessment
        
    def generate_eob(claim):
        # AI-generated EOB creation
        # Returns: EOB data, analysis, recommendations
        
    def analyze_eob(eob):
        # AI analysis of EOB data
        # Returns: coverage analysis, recommendations
```

#### AI Analysis Structure
```json
{
  "riskAssessment": {
    "insuranceEligibility": "Eligible|Not Eligible|Pending Review",
    "riskLevel": "Low|Medium|High",
    "justification": "string"
  },
  "dataQualityAnalysis": {
    "completeness": "Complete|Incomplete|Partial",
    "formatConsistency": "Consistent|Inconsistent|Mixed",
    "overallQuality": "High|Medium|Low"
  },
  "insuranceVerification": {
    "providerValid": "Valid|Invalid|Pending Verification",
    "idFormat": "Valid|Invalid|Needs Review",
    "coverageStatus": "Active|Inactive|Unknown"
  },
  "verificationRecommendations": ["string"],
  "potentialFraudIndicators": ["string"]
}
```

## Data Flow

### Patient Registration Flow
```
1. User fills registration form (Frontend)
2. Form validation (Frontend)
3. API call to /api/patient/register (Backend)
4. Data validation (Backend)
5. AI analysis via Bedrock (AI Service)
6. Database storage (SQLite)
7. Response with AI analysis (Frontend)
8. Display results to user (Frontend)
```

### Claim Processing Flow
```
1. User submits claim (Frontend)
2. API call to /api/claims/process (Backend)
3. AI analysis for validation (Bedrock)
4. Risk assessment and fraud detection (AI)
5. Automatic approval/denial decision (AI)
6. Database storage (SQLite)
7. EOB generation if approved (AI)
8. Response with decision (Frontend)
```

### AI Analysis Flow
```
1. Data preparation (Backend)
2. Prompt construction (BedrockService)
3. Bedrock API call (AWS Bedrock)
4. Response parsing (Backend)
5. JSON structure validation (Backend)
6. Database storage (SQLite)
7. Frontend display (React)
```

## Security Architecture

### Authentication & Authorization
- **Current**: Basic API endpoints (development)
- **Planned**: JWT-based authentication
- **Future**: OAuth 2.0 integration

### Data Security
- **Encryption at Rest**: EBS encryption
- **Encryption in Transit**: HTTPS/TLS
- **Database Security**: SQLite file permissions
- **API Security**: CORS configuration, input validation

### Network Security
- **VPC**: Isolated network environment
- **Security Groups**: Restrictive firewall rules
- **Subnets**: Public subnets for web tier
- **NACLs**: Network-level access control

### Compliance
- **HIPAA Ready**: Architecture supports healthcare compliance
- **Data Privacy**: Patient data protection measures
- **Audit Logging**: Comprehensive activity tracking

## Deployment Architecture

### AWS Infrastructure
```
┌─────────────────────────────────────────────────────────────────┐
│                        AWS CLOUD                               │
├─────────────────────────────────────────────────────────────────┤
│  VPC (us-east-1)                                               │
│  ├── Public Subnet (10.0.1.0/24)                              │
│  │   └── EC2 Instance (t3.micro)                              │
│  │       ├── Flask Backend (Port 5001)                        │
│  │       ├── SQLite Database                                  │
│  │       └── systemd Services                                 │
│  └── S3 Bucket (Static Website)                               │
│      ├── React Frontend                                       │
│      ├── Static Assets                                        │
│      └── CloudFront Distribution (planned)                    │
└─────────────────────────────────────────────────────────────────┘
```

### Deployment Process
1. **Infrastructure**: CloudFormation stack deployment
2. **Backend**: EC2 instance setup with systemd service
3. **Frontend**: S3 static website hosting
4. **Database**: SQLite initialization and migration
5. **AI Services**: Bedrock configuration and testing

### Environment Configuration
```bash
# Backend (.env)
FLASK_ENV=production
DATABASE_URL=sqlite:///healthcare.db
AI_LAMBDA_URL=https://your-lambda-url.amazonaws.com
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=openai.gpt-oss-120b-1:0

# Frontend (build-time)
REACT_APP_API_URL=http://ec2-34-226-245-222.compute-1.amazonaws.com:5001
```

## API Documentation

### Core Endpoints

#### Patient Management
- `POST /api/patient/register` - Register new patient
- `GET /api/patient/{id}` - Get patient details
- `GET /api/patients` - List all patients

#### Claim Processing
- `POST /api/claims/process` - Process new claim
- `GET /api/claims/{id}` - Get claim details
- `GET /api/claims` - List all claims
- `POST /api/claims/{id}/approve` - Approve claim
- `POST /api/claims/{id}/deny` - Deny claim
- `PUT /api/claims/{id}` - Update claim

#### EOB Management
- `GET /api/eobs` - List all EOBs
- `POST /api/eobs/generate` - Generate EOB
- `POST /api/eobs/{id}/analyze` - Analyze EOB
- `GET /api/eobs/{id}/pdf` - Download EOB PDF

#### System & AI
- `GET /api/health` - Health check
- `GET /api/agents/status` - AI agent status
- `GET /api/observability/metrics` - System metrics
- `POST /api/chatbot/query` - Chatbot interaction

### Request/Response Examples

#### Patient Registration
```json
// Request
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "555-1234",
  "dateOfBirth": "1990-01-01",
  "insuranceId": "INS123456",
  "insuranceProvider": "HealthPlus Insurance"
}

// Response
{
  "success": true,
  "patient_id": "uuid",
  "message": "Patient registered successfully",
  "ai_analysis": {
    "riskAssessment": {...},
    "dataQualityAnalysis": {...},
    "insuranceVerification": {...}
  }
}
```

## Scalability & Performance

### Current Architecture
- **Single EC2 Instance**: t3.micro (1 vCPU, 1GB RAM)
- **SQLite Database**: File-based, suitable for small-medium scale
- **Stateless Backend**: Easy horizontal scaling
- **Static Frontend**: CDN-ready

### Scaling Strategies

#### Horizontal Scaling
1. **Load Balancer**: Application Load Balancer
2. **Auto Scaling Group**: Multiple EC2 instances
3. **Database Migration**: SQLite → RDS PostgreSQL
4. **Caching**: Redis for session management

#### Vertical Scaling
1. **Instance Upgrade**: t3.small → t3.medium → t3.large
2. **Memory Optimization**: Database query optimization
3. **Connection Pooling**: Database connection management

### Performance Optimizations
- **Frontend**: Code splitting, lazy loading
- **Backend**: Gunicorn worker optimization
- **Database**: Index optimization, query caching
- **CDN**: CloudFront for static assets

## Monitoring & Observability

### Current Monitoring
- **Health Checks**: `/api/health` endpoint
- **System Metrics**: Custom observability endpoints
- **AI Agent Status**: Real-time agent monitoring
- **Activity Logs**: Recent system activity

### Metrics Collected
```json
{
  "total_patients": 150,
  "total_claims": 75,
  "approved_claims": 60,
  "pending_claims": 10,
  "denied_claims": 5,
  "average_processing_time": "2.3 days",
  "ai_accuracy_rate": "94.2%",
  "system_uptime": "99.8%"
}
```

### Planned Enhancements
- **CloudWatch Integration**: Comprehensive AWS monitoring
- **Custom Dashboards**: Real-time system visualization
- **Alerting**: Automated issue detection
- **Log Aggregation**: Centralized logging system

## Future Enhancements

### Short-term (1-3 months)
- **Database Migration**: SQLite → RDS PostgreSQL
- **Authentication**: JWT-based auth system
- **CloudFront CDN**: Global content delivery
- **HTTPS**: SSL certificate implementation

### Medium-term (3-6 months)
- **Microservices**: Service decomposition
- **API Gateway**: AWS API Gateway integration
- **Containerization**: Docker + ECS deployment
- **CI/CD Pipeline**: Automated deployment

### Long-term (6+ months)
- **Multi-region**: Global deployment
- **Advanced AI**: Custom ML models
- **Mobile App**: React Native application
- **Blockchain**: Healthcare data integrity

### AI/ML Roadmap
- **Custom Models**: Healthcare-specific training
- **Real-time Processing**: Stream processing
- **Advanced Analytics**: Predictive modeling
- **Computer Vision**: Document processing

## Cost Optimization

### Current Costs (Estimated)
- **EC2 t3.micro**: ~$8.50/month
- **S3 Storage**: ~$1-2/month
- **Bedrock API**: Pay-per-request
- **Total**: ~$10-15/month

### Optimization Strategies
- **Reserved Instances**: 1-3 year commitments
- **Spot Instances**: Non-critical workloads
- **S3 Lifecycle**: Automated archival
- **Bedrock Optimization**: Prompt engineering

## Disaster Recovery

### Backup Strategy
- **Database**: Automated SQLite backups
- **Code**: Git repository
- **Configuration**: Infrastructure as Code
- **AI Models**: Bedrock model versioning

### Recovery Procedures
1. **Infrastructure**: CloudFormation stack recreation
2. **Application**: Automated deployment scripts
3. **Data**: Database restoration from backups
4. **DNS**: Route 53 failover configuration

## Security Considerations

### Data Protection
- **Encryption**: AES-256 for data at rest
- **Access Control**: IAM roles and policies
- **Network Security**: VPC and security groups
- **Audit Logging**: Comprehensive activity tracking

### Compliance
- **HIPAA**: Healthcare data protection
- **GDPR**: Data privacy regulations
- **SOC 2**: Security controls
- **ISO 27001**: Information security management

---

## Conclusion

The Madza AI Healthcare Platform represents a modern, scalable architecture that leverages cloud-native technologies and artificial intelligence to deliver comprehensive healthcare management capabilities. The system is designed for growth, security, and performance while maintaining cost-effectiveness and operational simplicity.

The architecture supports current requirements while providing a clear path for future enhancements and scaling. The AI integration provides intelligent automation that improves efficiency and accuracy in healthcare operations.

For technical questions or architecture discussions, please refer to the development team or create an issue in the project repository.

---

**Document Version**: 1.0  
**Last Updated**: October 16, 2025  
**Maintained By**: Madza Development Team
