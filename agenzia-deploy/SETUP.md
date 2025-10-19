# Medical Claims RAG Agent - Complete Setup Guide

This guide provides step-by-step instructions to deploy the Medical Claims RAG Agent system from scratch.

## Prerequisites

### 1. System Requirements
- **Node.js** 18+ and npm
- **Python** 3.12+
- **AWS CLI** v2
- **AWS CDK** v2
- **Git**

### 2. AWS Account Setup
- AWS Account with appropriate permissions
- AWS CLI configured with credentials
- Recommended region: `us-east-1`

### 3. Required AWS Permissions
Your AWS user/role needs permissions for:
- Lambda functions
- IAM roles and policies
- CloudFormation stacks
- S3 buckets
- Bedrock services
- OpenSearch Serverless

## Step-by-Step Installation

### Step 1: Install Prerequisites

#### macOS (using Homebrew)
```bash
# Install Node.js
brew install node

# Install Python 3.12
brew install python@3.12

# Install AWS CLI
brew install awscli

# Install AWS CDK
npm install -g aws-cdk

# Verify installations
node --version    # Should be 18+
python3 --version # Should be 3.12+
aws --version     # Should be 2.x
cdk --version     # Should be 2.x
```

#### Ubuntu/Debian
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python 3.12
sudo apt update
sudo apt install python3.12 python3.12-pip

# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Install AWS CDK
npm install -g aws-cdk
```

#### Windows
```powershell
# Install Node.js from https://nodejs.org/
# Install Python 3.12 from https://python.org/
# Install AWS CLI from https://aws.amazon.com/cli/

# Install AWS CDK
npm install -g aws-cdk
```

### Step 2: AWS Configuration

```bash
# Configure AWS credentials
aws configure

# Enter your:
# - AWS Access Key ID
# - AWS Secret Access Key  
# - Default region (us-east-1 recommended)
# - Default output format (json)

# Verify configuration
aws sts get-caller-identity
```

### Step 3: Project Setup

```bash
# Clone or create the project directory
mkdir medical-claims-rag-agent
cd medical-claims-rag-agent

# Copy all project files (see file structure below)
# Or clone from repository if available

# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt
```

### Step 4: CDK Bootstrap (First Time Only)

```bash
# Bootstrap CDK in your AWS account (only needed once per account/region)
cdk bootstrap

# This creates necessary CDK resources in your AWS account
```

### Step 5: Deploy the Infrastructure

```bash
# Make deploy script executable
chmod +x deploy.sh

# Run the deployment
./deploy.sh

# This will:
# 1. Package the Lambda function
# 2. Deploy the CDK stack
# 3. Create all AWS resources
```

### Step 6: Set Up Bedrock Knowledge Base (Optional but Recommended)

#### Option A: Using AWS Console
1. Go to AWS Bedrock Console
2. Navigate to Knowledge Bases
3. Create a new Knowledge Base
4. Configure with OpenSearch Serverless
5. Upload medical documents (CPT codes, insurance policies, etc.)
6. Note the Knowledge Base ID

#### Option B: Using CLI Scripts
```bash
# Use the provided setup scripts
chmod +x setup_bedrock_kb_cli.sh
./setup_bedrock_kb_cli.sh

# Follow the prompts to create Knowledge Base
```

### Step 7: Configure Environment Variables

```bash
# Update Lambda environment variables
aws lambda update-function-configuration \
  --function-name AgentFunction \
  --environment Variables='{
    "ENABLE_RAG":"true",
    "KNOWLEDGE_BASE_ID":"your-kb-id-here",
    "BEDROCK_MODEL_ID":"anthropic.claude-3-sonnet-20240229-v1:0"
  }'
```

### Step 8: Test the Deployment

```bash
# Test basic functionality
node tests/test_lambda_client.js "What are the CPT codes for MRI procedures?"

# Test RAG integration (if Knowledge Base is set up)
node tests/test_lambda_client.js "What are Medicare billing requirements for cardiac procedures?"

# Test meta-tooling workflow
node tests/test_lambda_client.js "create a tool that calculates copay amounts" meta_tooling
```

## Configuration Options

### Environment Variables

Set these in the Lambda function configuration:

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `BEDROCK_MODEL_ID` | Bedrock model to use | `anthropic.claude-3-sonnet-20240229-v1:0` | Yes |
| `ENABLE_RAG` | Enable RAG integration | `false` | No |
| `KNOWLEDGE_BASE_ID` | Bedrock Knowledge Base ID | None | If RAG enabled |
| `USE_OLLAMA` | Use local Ollama instead | `false` | No |

### Lambda Configuration

Adjust these settings in `lib/agent-lambda-stack.ts`:

```typescript
// Memory and timeout settings
memorySize: 1024,        // MB (512-10240)
timeout: Duration.minutes(5),  // Max 15 minutes
```

### Model Selection

Available Bedrock models:
- `anthropic.claude-3-sonnet-20240229-v1:0` (Recommended)
- `anthropic.claude-3-haiku-20240307-v1:0` (Faster, less capable)
- `anthropic.claude-v2` (Legacy)

## Troubleshooting

### Common Issues

#### 1. CDK Bootstrap Error
```bash
# Error: Need to perform AWS CDK bootstrap
cdk bootstrap aws://ACCOUNT-ID/REGION
```

#### 2. Lambda Package Too Large
```bash
# Remove unnecessary dependencies
pip uninstall package-name

# Or increase Lambda memory
# Edit lib/agent-lambda-stack.ts and redeploy
```

#### 3. Bedrock Access Denied
```bash
# Enable Bedrock model access in AWS Console
# Go to Bedrock > Model Access > Request Access
```

#### 4. Knowledge Base Not Found
```bash
# Verify Knowledge Base ID
aws bedrock-agent list-knowledge-bases

# Update environment variable
aws lambda update-function-configuration \
  --function-name AgentFunction \
  --environment Variables='{"KNOWLEDGE_BASE_ID":"correct-id"}'
```

#### 5. Import Errors in Lambda
```bash
# Check CloudWatch logs
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/AgentFunction"

# Common fix: ensure all dependencies in requirements.txt
```

### Debug Mode

Enable detailed logging:

```bash
# Add debug environment variable
aws lambda update-function-configuration \
  --function-name AgentFunction \
  --environment Variables='{"DEBUG":"true"}'
```

### Performance Optimization

#### 1. Cold Start Reduction
- Increase memory allocation (faster CPU)
- Use provisioned concurrency for production
- Minimize package size

#### 2. RAG Performance
- Optimize Knowledge Base document structure
- Use specific queries for better retrieval
- Monitor retrieval latency

## Production Deployment

### 1. Security Hardening
```bash
# Use least privilege IAM roles
# Enable VPC if needed
# Set up proper logging and monitoring
```

### 2. Monitoring Setup
```bash
# CloudWatch alarms for errors and latency
# X-Ray tracing for performance analysis
# Custom metrics for business logic
```

### 3. Backup and Recovery
```bash
# Version control all infrastructure code
# Backup Knowledge Base documents
# Document rollback procedures
```

## Updating the System

### 1. Code Updates
```bash
# Update agent logic
vim agent_handler.py

# Copy to lambda directory
cp agent_handler.py lambda/

# Redeploy
./deploy.sh
```

### 2. Infrastructure Updates
```bash
# Update CDK stack
vim lib/agent-lambda-stack.ts

# Deploy changes
npx cdk deploy
```

### 3. Knowledge Base Updates
```bash
# Upload new documents to S3 bucket
# Knowledge Base auto-syncs new content
# Test with updated queries
```

## Next Steps

1. **Add Medical Documents**: Upload CPT codes, ICD-10 codes, insurance policies to Knowledge Base
2. **Customize Agents**: Modify agent prompts for specific use cases
3. **Add Monitoring**: Set up CloudWatch dashboards and alarms
4. **Scale**: Configure auto-scaling and provisioned concurrency
5. **Integrate**: Connect to existing healthcare systems or APIs

## Support Resources

- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [Strands Agents Documentation](https://docs.strands.ai/)
- [Project Issues](https://github.com/your-repo/issues)

For additional help, check the `docs/` directory for specific guides on RAG integration and Bedrock setup.