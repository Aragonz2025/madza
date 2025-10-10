# Madza AI Backend

A Python Flask backend for the Madza AI-powered healthcare platform, featuring AWS Bedrock integration and comprehensive AI agent orchestration.

## Features

- **AWS Bedrock Integration**: Leverages Amazon Bedrock for LLM capabilities
- **Multi-Agent System**: Implements agent-to-agent communication for complex workflows
- **Patient Registration**: AI-powered patient onboarding with risk assessment
- **Claim Processing**: Multi-step claim processing with intelligent decision making
- **Claim Management**: Approval/denial workflows with AI suggestions
- **Observability**: Real-time system monitoring and metrics
- **Comprehensive Testing**: Full test suite without mocking external services

## API Endpoints

### Health & Status
- `GET /api/health` - Health check endpoint
- `GET /api/observability/metrics` - System metrics and performance data
- `GET /api/agents/status` - AI agent status and performance

### Patient Management
- `POST /api/patient/register` - Register new patient with AI analysis
- `GET /api/patient/{patient_id}` - Get patient information

### Claim Processing
- `POST /api/claims/process` - Process insurance claim with multi-step AI
- `GET /api/claims/{claim_id}` - Get claim information
- `POST /api/claims/{claim_id}/approve` - Approve a claim
- `POST /api/claims/{claim_id}/deny` - Deny a claim with AI suggestions

## Setup

### Prerequisites
- Python 3.8+
- AWS Account with Bedrock access
- pip

### Installation

1. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Set environment variables:
```bash
export AWS_REGION=us-east-1
export BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
```

3. Run the application:
```bash
python app/main.py
```

The API will be available at `http://localhost:5000`

## Testing

Run the comprehensive test suite:

```bash
cd backend
python -m pytest tests/ -v
```

Tests cover:
- All API endpoints
- Error handling
- Data validation
- AWS Bedrock integration
- Agent orchestration

## Architecture

### Services
- **BedrockService**: Handles AWS Bedrock integration and AI model interactions
- **PatientService**: Manages patient data and registration workflows
- **ClaimService**: Handles claim processing and management

### Models
- **Patient**: Patient data model with AI analysis integration
- **Claim**: Claim data model with status tracking and AI insights

### AI Agents
1. **Patient Registration Agent**: Validates and analyzes patient data
2. **Claim Processing Agent**: Multi-step claim validation and processing
3. **Denial Analysis Agent**: Analyzes denials and provides reprocessing suggestions
4. **Observability Agent**: Monitors system health and performance

## AWS Integration

The backend integrates with several AWS services:
- **Amazon Bedrock**: LLM inference and AI capabilities
- **AWS Bedrock Agent**: Agent orchestration and tool calling
- **AWS Lambda**: Serverless compute (optional)
- **Amazon S3**: Data storage (optional)
- **Amazon API Gateway**: API management (optional)

## Security

- CORS enabled for frontend integration
- Input validation and sanitization
- Error handling without sensitive data exposure
- AWS IAM roles for secure service access

## Monitoring

The application provides comprehensive observability:
- Real-time metrics collection
- Agent performance monitoring
- System health checks
- Error tracking and alerting

## Deployment

The application is designed for easy AWS deployment:
- Container-ready with Docker
- Environment-based configuration
- CloudFormation/SAM templates available
- Cost-optimized for AWS services
