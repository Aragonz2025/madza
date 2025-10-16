# Madza AI Healthcare Platform - Technical Specifications

## System Requirements

### Minimum System Requirements
- **CPU**: 1 vCPU (ARM64 or x86_64)
- **Memory**: 1GB RAM
- **Storage**: 10GB SSD
- **Network**: 1Gbps
- **OS**: Ubuntu 20.04 LTS or Amazon Linux 2

### Recommended System Requirements
- **CPU**: 2 vCPUs
- **Memory**: 4GB RAM
- **Storage**: 50GB SSD
- **Network**: 10Gbps
- **OS**: Ubuntu 22.04 LTS

## Technology Stack Details

### Frontend Specifications
```json
{
  "react": "^18.2.0",
  "typescript": "^4.9.5",
  "@mui/material": "^5.14.0",
  "@emotion/react": "^11.11.0",
  "@emotion/styled": "^11.11.0",
  "framer-motion": "^10.16.0",
  "axios": "^1.5.0",
  "react-scripts": "5.0.1"
}
```

### Backend Specifications
```json
{
  "flask": "3.0.0",
  "flask-cors": "4.0.0",
  "flask-sqlalchemy": "3.1.1",
  "flask-migrate": "4.0.5",
  "sqlalchemy": "2.0.44",
  "boto3": "1.34.0",
  "gunicorn": "23.0.0",
  "python-dotenv": "1.0.0",
  "reportlab": "4.0.7"
}
```

### Database Schema Specifications

#### Patients Table
```sql
CREATE TABLE patients (
    id VARCHAR(36) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    date_of_birth VARCHAR(10) NOT NULL,
    insurance_id VARCHAR(100) NOT NULL,
    insurance_provider VARCHAR(100) NOT NULL,
    ai_analysis TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Claims Table
```sql
CREATE TABLE claims (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    claim_amount FLOAT NOT NULL,
    claim_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    ai_analysis TEXT,
    approval_required BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME,
    denied_at DATETIME,
    denial_reason TEXT,
    ai_suggestions TEXT,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);
```

#### EOBs Table
```sql
CREATE TABLE eobs (
    id VARCHAR(36) PRIMARY KEY,
    claim_id VARCHAR(36) NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    eob_amount FLOAT NOT NULL,
    status VARCHAR(20) NOT NULL,
    eob_date DATE NOT NULL,
    insurance_company VARCHAR(100) NOT NULL,
    pdf_url VARCHAR(500),
    ai_analysis TEXT,
    denial_reasons TEXT,
    refile_required BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (claim_id) REFERENCES claims(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);
```

## API Specifications

### Authentication
- **Type**: JWT (planned)
- **Algorithm**: HS256
- **Expiration**: 24 hours
- **Refresh Token**: 7 days

### Rate Limiting
- **Requests per minute**: 100
- **Burst limit**: 200
- **Per IP limit**: 50/minute

### CORS Configuration
```python
CORS_ORIGINS = [
    "http://localhost:3000",
    "https://production-madza-frontend-*.s3-website-us-east-1.amazonaws.com"
]
CORS_METHODS = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
CORS_HEADERS = ["Content-Type", "Authorization"]
```

## AI/ML Specifications

### Bedrock Configuration
```python
BEDROCK_CONFIG = {
    "model_id": "openai.gpt-oss-120b-1:0",
    "region": "us-east-1",
    "max_tokens": 4000,
    "temperature": 0.7,
    "top_p": 0.9
}
```

### AI Analysis Schema
```json
{
  "riskAssessment": {
    "insuranceEligibility": {
      "type": "string",
      "enum": ["Eligible", "Not Eligible", "Pending Review"]
    },
    "riskLevel": {
      "type": "string", 
      "enum": ["Low", "Medium", "High"]
    },
    "justification": {
      "type": "string",
      "maxLength": 500
    }
  },
  "dataQualityAnalysis": {
    "completeness": {
      "type": "string",
      "enum": ["Complete", "Incomplete", "Partial"]
    },
    "formatConsistency": {
      "type": "string",
      "enum": ["Consistent", "Inconsistent", "Mixed"]
    },
    "overallQuality": {
      "type": "string",
      "enum": ["High", "Medium", "Low"]
    }
  },
  "insuranceVerification": {
    "providerValid": {
      "type": "string",
      "enum": ["Valid", "Invalid", "Pending Verification"]
    },
    "idFormat": {
      "type": "string",
      "enum": ["Valid", "Invalid", "Needs Review"]
    },
    "coverageStatus": {
      "type": "string",
      "enum": ["Active", "Inactive", "Unknown"]
    }
  },
  "verificationRecommendations": {
    "type": "array",
    "items": {"type": "string"},
    "minItems": 1,
    "maxItems": 5
  },
  "potentialFraudIndicators": {
    "type": "array",
    "items": {"type": "string"},
    "minItems": 1,
    "maxItems": 3
  }
}
```

## Performance Specifications

### Response Time Targets
- **API Health Check**: < 100ms
- **Patient Registration**: < 5s
- **Claim Processing**: < 10s
- **AI Analysis**: < 15s
- **Database Queries**: < 500ms

### Throughput Targets
- **Concurrent Users**: 100
- **Requests per Second**: 50
- **Database Connections**: 20
- **AI API Calls**: 10/minute

### Scalability Metrics
- **Horizontal Scaling**: 10x current capacity
- **Database Scaling**: 1M records
- **Storage Scaling**: 1TB
- **Memory Scaling**: 16GB

## Security Specifications

### Encryption Standards
- **Data at Rest**: AES-256
- **Data in Transit**: TLS 1.3
- **Database**: SQLite encryption (planned)
- **API Keys**: Encrypted storage

### Access Control
```yaml
IAM_POLICIES:
  BackendRole:
    - bedrock:InvokeModel
    - s3:GetObject
    - s3:PutObject
    - logs:CreateLogGroup
    - logs:CreateLogStream
    - logs:PutLogEvents
  
  LambdaRole:
    - bedrock:InvokeModel
    - s3:GetObject
    - s3:PutObject
    - dynamodb:Query
    - dynamodb:Scan
```

### Network Security
```yaml
SECURITY_GROUPS:
  WebServer:
    - Port: 80 (HTTP)
    - Port: 443 (HTTPS)
    - Port: 22 (SSH)
    - Source: 0.0.0.0/0
  
  Database:
    - Port: 5432 (PostgreSQL)
    - Source: WebServer Security Group
```

## Monitoring Specifications

### Metrics Collection
```python
METRICS = {
    "system": [
        "cpu_utilization",
        "memory_utilization", 
        "disk_usage",
        "network_io"
    ],
    "application": [
        "request_count",
        "response_time",
        "error_rate",
        "active_users"
    ],
    "database": [
        "connection_count",
        "query_time",
        "transaction_rate",
        "lock_wait_time"
    ],
    "ai_services": [
        "api_calls",
        "response_time",
        "success_rate",
        "token_usage"
    ]
}
```

### Alerting Rules
```yaml
ALERTS:
  HighCPU:
    condition: "cpu_utilization > 80%"
    duration: "5 minutes"
    severity: "warning"
  
  HighMemory:
    condition: "memory_utilization > 90%"
    duration: "2 minutes"
    severity: "critical"
  
  HighErrorRate:
    condition: "error_rate > 5%"
    duration: "1 minute"
    severity: "critical"
  
  DatabaseSlow:
    condition: "avg_query_time > 1s"
    duration: "3 minutes"
    severity: "warning"
```

## Deployment Specifications

### Infrastructure as Code
```yaml
CloudFormation:
  Template: separate-instances.yaml
  Parameters:
    Environment: production
    KeyPairName: madza
    InstanceType: t3.micro
    VpcCidr: 10.0.0.0/16
    PublicSubnetCidr: 10.0.1.0/24
```

### Environment Variables
```bash
# Backend Environment
FLASK_ENV=production
DATABASE_URL=sqlite:///healthcare.db
AI_LAMBDA_URL=https://your-lambda-url.amazonaws.com
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=openai.gpt-oss-120b-1:0
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret

# Frontend Environment
REACT_APP_API_URL=http://ec2-34-226-245-222.compute-1.amazonaws.com:5001
REACT_APP_AI_LAMBDA_URL=https://your-lambda-url.amazonaws.com
GENERATE_SOURCEMAP=false
```

### Systemd Service Configuration
```ini
[Unit]
Description=Madza AI Healthcare Backend
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/madza/backend
Environment=PATH=/usr/local/bin:/usr/bin:/bin
EnvironmentFile=/opt/madza/backend/.env
ExecStart=/usr/local/bin/gunicorn --bind 0.0.0.0:5001 --workers 1 --timeout 120 --max-requests 1000 --max-requests-jitter 100 app.main:app
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

## Testing Specifications

### Unit Testing
```python
# Test Coverage Requirements
COVERAGE_TARGETS = {
    "backend": 80,
    "frontend": 70,
    "ai_services": 60
}

# Test Frameworks
TEST_FRAMEWORKS = {
    "backend": "pytest",
    "frontend": "jest",
    "integration": "pytest-flask"
}
```

### Integration Testing
```yaml
INTEGRATION_TESTS:
  API_TESTS:
    - Patient registration flow
    - Claim processing flow
    - EOB generation flow
    - Error handling scenarios
  
  AI_TESTS:
    - Bedrock API integration
    - Response parsing
    - Fallback mechanisms
    - Performance testing
```

### Load Testing
```yaml
LOAD_TEST_SCENARIOS:
  Normal_Load:
    users: 50
    duration: "10 minutes"
    ramp_up: "2 minutes"
  
  Peak_Load:
    users: 100
    duration: "5 minutes"
    ramp_up: "1 minute"
  
  Stress_Test:
    users: 200
    duration: "3 minutes"
    ramp_up: "30 seconds"
```

## Compliance Specifications

### HIPAA Compliance
```yaml
HIPAA_REQUIREMENTS:
  Administrative_Safeguards:
    - Security officer designation
    - Workforce training
    - Access management
    - Audit controls
  
  Physical_Safeguards:
    - Facility access controls
    - Workstation use restrictions
    - Device and media controls
  
  Technical_Safeguards:
    - Access control
    - Audit controls
    - Integrity controls
    - Transmission security
```

### Data Privacy
```yaml
DATA_PRIVACY:
  Data_Classification:
    - PII: Patient personal information
    - PHI: Protected health information
    - AI_Data: Analysis and insights
  
  Data_Retention:
    - Patient_Data: 7 years
    - Claim_Data: 7 years
    - AI_Analysis: 3 years
    - Log_Data: 1 year
  
  Data_Anonymization:
    - Remove direct identifiers
    - Pseudonymize data
    - Aggregate statistics
```

## Backup and Recovery

### Backup Strategy
```yaml
BACKUP_CONFIGURATION:
  Database:
    frequency: "daily"
    retention: "30 days"
    location: "S3"
    encryption: "AES-256"
  
  Application_Code:
    frequency: "on_change"
    retention: "unlimited"
    location: "Git repository"
  
  Configuration:
    frequency: "on_change"
    retention: "1 year"
    location: "S3 + Git"
```

### Recovery Procedures
```yaml
RECOVERY_RTO_RPO:
  Database_Recovery:
    RTO: "1 hour"
    RPO: "24 hours"
  
  Application_Recovery:
    RTO: "30 minutes"
    RPO: "1 hour"
  
  Full_System_Recovery:
    RTO: "2 hours"
    RPO: "24 hours"
```

## Cost Specifications

### Current AWS Costs (Monthly)
```yaml
COST_BREAKDOWN:
  EC2_t3_micro:
    instance: "$8.50"
    storage: "$2.00"
    data_transfer: "$1.00"
  
  S3_Storage:
    storage: "$1.00"
    requests: "$0.50"
  
  Bedrock_API:
    api_calls: "$5.00"
  
  Total_Estimated: "$18.00"
```

### Scaling Cost Projections
```yaml
SCALING_COSTS:
  t3_small:
    monthly: "$16.00"
    capacity: "2x"
  
  t3_medium:
    monthly: "$32.00"
    capacity: "4x"
  
  RDS_PostgreSQL:
    monthly: "$25.00"
    capacity: "10x"
  
  Load_Balancer:
    monthly: "$18.00"
    capacity: "unlimited"
```

---

**Document Version**: 1.0  
**Last Updated**: October 16, 2025  
**Maintained By**: Madza Development Team
