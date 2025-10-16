# Madza AI Healthcare Platform - Architecture Diagram

## System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        UI[React Frontend<br/>Material-UI + TypeScript]
        Mobile[Mobile App<br/>Future Enhancement]
    end
    
    subgraph "CDN Layer"
        CF[CloudFront CDN<br/>Global Distribution]
        S3[S3 Bucket<br/>Static Assets]
    end
    
    subgraph "API Gateway Layer"
        ALB[Application Load Balancer<br/>Future Enhancement]
        API[Flask REST API<br/>Port 5001]
    end
    
    subgraph "Business Logic Layer"
        PS[Patient Service]
        CS[Claim Service]
        ES[EOB Service]
        BS[Bedrock AI Service]
    end
    
    subgraph "Data Layer"
        DB[(SQLite Database<br/>Patients, Claims, EOBs)]
        Cache[Redis Cache<br/>Future Enhancement]
    end
    
    subgraph "AI/ML Layer"
        Bedrock[AWS Bedrock<br/>GPT-OSS-120B]
        Lambda[AWS Lambda<br/>Fallback AI]
    end
    
    subgraph "Infrastructure"
        EC2[EC2 Instance<br/>t3.micro]
        VPC[VPC<br/>us-east-1]
        IAM[IAM Roles<br/>Security]
    end
    
    UI --> CF
    CF --> S3
    UI --> API
    API --> PS
    API --> CS
    API --> ES
    PS --> DB
    CS --> DB
    ES --> DB
    PS --> BS
    CS --> BS
    ES --> BS
    BS --> Bedrock
    BS --> Lambda
    API --> EC2
    DB --> EC2
    EC2 --> VPC
    Bedrock --> IAM
    Lambda --> IAM
```

## Data Flow Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant S as Service
    participant AI as Bedrock AI
    participant D as Database
    
    Note over U,D: Patient Registration Flow
    
    U->>F: Fill registration form
    F->>F: Validate form data
    F->>A: POST /api/patient/register
    A->>A: Validate request
    A->>S: Process patient data
    S->>AI: Analyze patient data
    AI-->>S: Return AI analysis
    S->>D: Store patient + analysis
    D-->>S: Confirm storage
    S-->>A: Return patient ID + analysis
    A-->>F: Return success response
    F->>U: Display results + AI insights
    
    Note over U,D: Claim Processing Flow
    
    U->>F: Submit claim
    F->>A: POST /api/claims/process
    A->>S: Process claim
    S->>AI: Analyze claim data
    AI-->>S: Return validation + risk assessment
    S->>D: Store claim + analysis
    S->>AI: Generate EOB (if approved)
    AI-->>S: Return EOB data
    S->>D: Store EOB
    S-->>A: Return claim decision
    A-->>F: Return processing result
    F->>U: Display claim status
```

## AI Analysis Flow

```mermaid
flowchart TD
    A[Patient/Claim Data] --> B[Data Validation]
    B --> C[Prompt Construction]
    C --> D[Bedrock API Call]
    D --> E{AI Response}
    E -->|Success| F[Parse JSON Response]
    E -->|Failure| G[Fallback to Lambda]
    G --> F
    F --> H[Validate AI Analysis]
    H --> I{Valid Structure?}
    I -->|Yes| J[Store Analysis]
    I -->|No| K[Use Default Analysis]
    K --> J
    J --> L[Return to Frontend]
    
    subgraph "AI Analysis Components"
        M[Risk Assessment]
        N[Data Quality Analysis]
        O[Insurance Verification]
        P[Fraud Detection]
        Q[Recommendations]
    end
    
    F --> M
    F --> N
    F --> O
    F --> P
    F --> Q
```

## Security Architecture

```mermaid
graph TB
    subgraph "External"
        Internet[Internet]
    end
    
    subgraph "AWS VPC"
        subgraph "Public Subnet"
            EC2[EC2 Instance<br/>Flask Backend]
        end
        
        subgraph "Private Subnet"
            RDS[RDS Database<br/>Future Enhancement]
            Cache[ElastiCache<br/>Future Enhancement]
        end
        
        subgraph "Security"
            SG[Security Groups]
            NACL[Network ACLs]
            IAM[IAM Roles & Policies]
        end
    end
    
    subgraph "AWS Services"
        S3[S3 Bucket<br/>Static Files]
        Bedrock[AWS Bedrock<br/>AI Services]
        CloudWatch[CloudWatch<br/>Monitoring]
    end
    
    Internet --> SG
    SG --> EC2
    EC2 --> RDS
    EC2 --> Cache
    EC2 --> S3
    EC2 --> Bedrock
    EC2 --> CloudWatch
    SG --> NACL
    EC2 --> IAM
    Bedrock --> IAM
```

## Deployment Architecture

```mermaid
graph LR
    subgraph "Development"
        Dev[Local Development<br/>React + Flask]
    end
    
    subgraph "CI/CD Pipeline"
        Git[Git Repository]
        Build[Build Process]
        Test[Automated Testing]
        Deploy[Deployment Scripts]
    end
    
    subgraph "Production AWS"
        CF[CloudFormation<br/>Infrastructure]
        EC2[EC2 Instance<br/>Backend]
        S3[S3 Bucket<br/>Frontend]
        Bedrock[AWS Bedrock<br/>AI Services]
    end
    
    Dev --> Git
    Git --> Build
    Build --> Test
    Test --> Deploy
    Deploy --> CF
    CF --> EC2
    CF --> S3
    CF --> Bedrock
```

## Component Interaction Diagram

```mermaid
graph TB
    subgraph "Frontend Components"
        PR[PatientRegistration]
        CP[ClaimProcessing]
        PM[PatientManagement]
        EOB[EOBManagement]
        CB[Chatbot]
        DS[Dashboard]
    end
    
    subgraph "Backend Services"
        API[Flask API]
        PS[PatientService]
        CS[ClaimService]
        ES[EOBService]
        BS[BedrockService]
    end
    
    subgraph "Data Models"
        Patient[Patient Model]
        Claim[Claim Model]
        EOBModel[EOB Model]
    end
    
    subgraph "External Services"
        Bedrock[AWS Bedrock]
        Lambda[AWS Lambda]
    end
    
    PR --> API
    CP --> API
    PM --> API
    EOB --> API
    CB --> API
    DS --> API
    
    API --> PS
    API --> CS
    API --> ES
    API --> BS
    
    PS --> Patient
    CS --> Claim
    ES --> EOBModel
    
    BS --> Bedrock
    BS --> Lambda
```

## Database Schema

```mermaid
erDiagram
    PATIENTS {
        string id PK
        string first_name
        string last_name
        string email UK
        string phone
        string date_of_birth
        string insurance_id
        string insurance_provider
        text ai_analysis
        datetime created_at
        datetime updated_at
    }
    
    CLAIMS {
        string id PK
        string patient_id FK
        float claim_amount
        string claim_type
        text description
        string status
        text ai_analysis
        boolean approval_required
        datetime created_at
        datetime updated_at
        datetime approved_at
        datetime denied_at
        text denial_reason
        text ai_suggestions
    }
    
    EOBS {
        string id PK
        string claim_id FK
        string patient_id FK
        float eob_amount
        string status
        date eob_date
        string insurance_company
        string pdf_url
        text ai_analysis
        text denial_reasons
        boolean refile_required
        datetime created_at
        datetime updated_at
    }
    
    PATIENTS ||--o{ CLAIMS : "has"
    CLAIMS ||--o{ EOBS : "generates"
    PATIENTS ||--o{ EOBS : "belongs_to"
```

This comprehensive architecture documentation provides a complete overview of the Madza AI Healthcare Platform, including visual diagrams that illustrate the system's structure, data flow, and component interactions.
