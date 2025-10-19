# Complete Deployment Steps - Medical Claims RAG Agent

This document provides a complete, step-by-step guide to deploy the Medical Claims RAG Agent system from scratch.

## Overview

The Medical Claims RAG Agent is a comprehensive AWS Lambda-based system that processes medical insurance queries using:
- **Strands Agents**: Multi-agent workflows for research and meta-tooling
- **AWS Bedrock**: Large language models for intelligent responses
- **RAG Integration**: Knowledge base with medical billing documents
- **CDK Infrastructure**: Infrastructure as code for easy deployment

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] **AWS Account** with appropriate permissions
- [ ] **AWS CLI** v2 installed and configured
- [ ] **Node.js** 18+ and npm installed
- [ ] **Python** 3.12+ installed
- [ ] **AWS CDK** v2 installed globally
- [ ] **Git** installed (optional, for version control)

## Step 1: Environment Setup

### 1.1 Install Prerequisites

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
# Update package list
sudo apt update

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python 3.12
sudo apt install python3.12 python3.12-pip python3.12-venv

# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Install AWS CDK
npm install -g aws-cdk

# Verify installations
node --version
python3.12 --version
aws --version
cdk --version
```

### 1.2 Configure AWS Credentials

```bash
# Configure AWS CLI with your credentials
aws configure

# You'll be prompted for:
# - AWS Access Key ID: [Your access key]
# - AWS Secret Access Key: [Your secret key]
# - Default region name: us-east-1
# - Default output format: json

# Verify configuration
aws sts get-caller-identity
```

## Step 2: Project Setup

### 2.1 Create Project Directory

```bash
# Create the project directory structure
mkdir -p medical-claims-rag-agent/{bin,lib,lambda,tests,docs,packaging}
cd medical-claims-rag-agent
```

### 2.2 Create Core Files

Create the following files with the exact content:

#### package.json
```json
{
  "name": "medical-claims-rag-agent",
  "version": "1.0.0",
  "description": "AWS Lambda-based agent system for medical insurance claims processing with RAG integration",
  "main": "bin/app.js",
  "scripts": {
    "build": "tsc",
    "watch": "tsc -w",
    "test": "jest",
    "cdk": "cdk",
    "deploy": "./deploy.sh",
    "package": "python bin/package_for_lambda.py",
    "test-lambda": "node tests/test_lambda_client.js"
  },
  "keywords": [
    "aws", "lambda", "bedrock", "rag", "medical", "insurance", "claims", "cpt", "icd10", "healthcare"
  ],
  "author": "Your Name",
  "license": "MIT",
  "devDependencies": {
    "@types/jest": "^29.5.5",
    "@types/node": "20.6.2",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "aws-cdk": "2.100.0",
    "typescript": "~5.2.2"
  },
  "dependencies": {
    "aws-cdk-lib": "2.100.0",
    "constructs": "^10.0.0",
    "@aws-sdk/client-lambda": "^3.400.0"
  }
}
```

#### requirements.txt
```txt
strands-agents>=1.13.0
strands-agents-tools>=0.2.12
requests>=2.32.0
boto3>=1.40.0
botocore>=1.40.0
```

#### cdk.json
```json
{
  "app": "npx ts-node --prefer-ts-exts bin/app.ts",
  "watch": {
    "include": ["**"],
    "exclude": [
      "README.md", "cdk*.json", "**/*.d.ts", "**/*.js", "tsconfig.json",
      "package*.json", "yarn.lock", "node_modules", "test"
    ]
  },
  "context": {
    "@aws-cdk/aws-lambda:recognizeLayerVersion": true,
    "@aws-cdk/core:checkSecretUsage": true,
    "@aws-cdk/core:target-partitions": ["aws", "aws-cn"]
  }
}
```

#### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["es2020"],
    "declaration": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": false,
    "inlineSourceMap": true,
    "inlineSources": true,
    "experimentalDecorators": true,
    "strictPropertyInitialization": false,
    "typeRoots": ["./node_modules/@types"]
  },
  "exclude": ["node_modules", "cdk.out"]
}
```

### 2.3 Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt
```

## Step 3: Create Application Code

### 3.1 CDK Application Entry Point

Create `bin/app.ts`:
```typescript
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AgentLambdaStack } from '../lib/agent-lambda-stack';

const app = new cdk.App();

new AgentLambdaStack(app, 'AgentLambdaStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  description: 'Medical Claims RAG Agent - Lambda function with Bedrock integration'
});
```

### 3.2 CDK Stack Definition

Create `lib/agent-lambda-stack.ts`:
```typescript
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class AgentLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create IAM role for Lambda function
    const lambdaRole = new iam.Role(this, 'AgentLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'IAM role for Medical Claims RAG Agent Lambda function',
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
      inlinePolicies: {
        BedrockAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'bedrock:InvokeModel',
                'bedrock:InvokeModelWithResponseStream',
                'bedrock:ListFoundationModels',
                'bedrock:GetFoundationModel',
                'bedrock:Retrieve',
                'bedrock:RetrieveAndGenerate'
              ],
              resources: ['*']
            })
          ]
        })
      }
    });

    // Create Lambda layer for dependencies
    const dependenciesLayer = new lambda.LayerVersion(this, 'DependenciesLayer', {
      code: lambda.Code.fromAsset('packaging/dependencies.zip'),
      compatibleRuntimes: [lambda.Runtime.PYTHON_3_12],
      compatibleArchitectures: [lambda.Architecture.ARM_64],
      description: 'Dependencies for Medical Claims RAG Agent'
    });

    // Create Lambda function
    const agentFunction = new lambda.Function(this, 'AgentFunction', {
      runtime: lambda.Runtime.PYTHON_3_12,
      architecture: lambda.Architecture.ARM_64,
      handler: 'agent_handler.handler',
      code: lambda.Code.fromAsset('packaging/app.zip'),
      layers: [dependenciesLayer],
      role: lambdaRole,
      timeout: cdk.Duration.minutes(5),
      memorySize: 1024,
      description: 'Medical Claims RAG Agent',
      environment: {
        'BEDROCK_MODEL_ID': 'anthropic.claude-3-sonnet-20240229-v1:0',
        'ENABLE_RAG': 'false',
        'KNOWLEDGE_BASE_ID': '',
        'USE_OLLAMA': 'false'
      }
    });

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'AgentApi', {
      restApiName: 'Medical Claims RAG Agent API',
      description: 'API for Medical Claims RAG Agent system',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key']
      }
    });

    // Add Lambda integration
    const lambdaIntegration = new apigateway.LambdaIntegration(agentFunction);
    const chatResource = api.root.addResource('chat');
    chatResource.addMethod('POST', lambdaIntegration);

    // Outputs
    new cdk.CfnOutput(this, 'FunctionName', { value: agentFunction.functionName });
    new cdk.CfnOutput(this, 'FunctionArn', { value: agentFunction.functionArn });
    new cdk.CfnOutput(this, 'ApiUrl', { value: api.url });
    new cdk.CfnOutput(this, 'ChatEndpoint', { value: `${api.url}chat` });
  }
}
```

### 3.3 Lambda Packaging Script

Create `bin/package_for_lambda.py`:
```python
#!/usr/bin/env python3
import os
import zipfile
import shutil
from pathlib import Path

def create_lambda_package():
    current_dir = Path.cwd()
    packaging_dir = current_dir / "packaging"
    packaging_dir.mkdir(exist_ok=True)
    
    app_dir = current_dir / "lambda"
    app_deployment_zip = packaging_dir / "app.zip"
    dependencies_dir = packaging_dir / "_dependencies"
    dependencies_deployment_zip = packaging_dir / "dependencies.zip"
    
    print("Creating Lambda packages...")
    
    # Clean up existing packages
    if app_deployment_zip.exists():
        app_deployment_zip.unlink()
    if dependencies_deployment_zip.exists():
        dependencies_deployment_zip.unlink()
    if dependencies_dir.exists():
        shutil.rmtree(dependencies_dir)
    
    # Install dependencies
    print("Installing Python dependencies...")
    dependencies_dir.mkdir(exist_ok=True)
    
    os.system(f"""
        pip install -r requirements.txt \\
            --python-version 3.12 \\
            --platform manylinux2014_aarch64 \\
            --target {dependencies_dir} \\
            --only-binary=:all:
    """)
    
    # Create dependencies zip
    print("Creating dependencies.zip...")
    with zipfile.ZipFile(dependencies_deployment_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(dependencies_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = Path("python") / os.path.relpath(file_path, dependencies_dir)
                zipf.write(file_path, arcname)
    
    # Create app zip
    print("Creating app.zip...")
    with zipfile.ZipFile(app_deployment_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(app_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, app_dir)
                zipf.write(file_path, arcname)
    
    print(f"✓ Created {app_deployment_zip}")
    print(f"✓ Created {dependencies_deployment_zip}")
    print("Lambda packages ready for deployment!")

if __name__ == "__main__":
    create_lambda_package()
```

### 3.4 Agent Handler (Main Logic)

Create `agent_handler.py` with the complete agent logic (see the full file in the project structure).

### 3.5 Test Client

Create `tests/test_lambda_client.js`:
```javascript
#!/usr/bin/env node
const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');

const lambdaClient = new LambdaClient({ region: 'us-east-1' });

async function testLambda(message, workflow = null) {
    try {
        const payload = { message };
        if (workflow) payload.workflow = workflow;
        
        console.log('🚀 Invoking Lambda with payload:', JSON.stringify(payload, null, 2));
        
        const command = new InvokeCommand({
            FunctionName: 'AgentFunction',
            Payload: JSON.stringify(payload)
        });
        
        const response = await lambdaClient.send(command);
        const result = JSON.parse(new TextDecoder().decode(response.Payload));
        
        console.log('\n✅ Lambda Response:');
        console.log('='.repeat(50));
        console.log(result);
        console.log('='.repeat(50));
        
        return result;
    } catch (error) {
        console.error('❌ Error invoking Lambda:', error.message);
        throw error;
    }
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('Usage: node test_lambda_client.js "your message" [workflow]');
        console.log('Examples:');
        console.log('  node test_lambda_client.js "What are the CPT codes for MRI procedures?"');
        console.log('  node test_lambda_client.js "create a tool that reverses text" meta_tooling');
        process.exit(1);
    }
    
    const message = args[0];
    const workflow = args[1] || null;
    
    await testLambda(message, workflow);
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { testLambda };
```

## Step 4: Create Deployment Script

Create `deploy.sh`:
```bash
#!/bin/bash
set -e

echo "🚀 Starting Medical Claims RAG Agent Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check prerequisites
print_status "Checking prerequisites..."

if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    exit 1
fi

if ! command -v cdk &> /dev/null; then
    print_error "AWS CDK is not installed. Please install it with: npm install -g aws-cdk"
    exit 1
fi

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.12+ first."
    exit 1
fi

# Verify AWS credentials
print_status "Verifying AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(aws configure get region)
print_success "AWS Account: $AWS_ACCOUNT, Region: $AWS_REGION"

# Install dependencies
print_status "Installing Node.js dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
    print_success "Node.js dependencies installed"
else
    print_status "Node.js dependencies already installed"
fi

print_status "Installing Python dependencies..."
pip install -r requirements.txt
print_success "Python dependencies installed"

# Copy agent handler to lambda directory
print_status "Preparing Lambda function code..."
cp agent_handler.py lambda/agent_handler.py
print_success "Agent handler copied to lambda directory"

# Package Lambda function
print_status "Packaging Lambda function..."
python bin/package_for_lambda.py
print_success "Lambda function packaged"

# Build TypeScript
print_status "Building TypeScript code..."
npm run build
print_success "TypeScript code built"

# Bootstrap CDK (if needed)
print_status "Checking CDK bootstrap status..."
if ! aws cloudformation describe-stacks --stack-name CDKToolkit --region $AWS_REGION &> /dev/null; then
    print_warning "CDK not bootstrapped. Bootstrapping now..."
    cdk bootstrap
    print_success "CDK bootstrapped"
else
    print_status "CDK already bootstrapped"
fi

# Deploy the stack
print_status "Deploying CDK stack..."
cdk deploy --require-approval never

if [ $? -eq 0 ]; then
    print_success "Deployment completed successfully!"
    
    FUNCTION_NAME=$(aws cloudformation describe-stacks \
        --stack-name AgentLambdaStack \
        --query 'Stacks[0].Outputs[?OutputKey==`FunctionName`].OutputValue' \
        --output text 2>/dev/null || echo "AgentFunction")
    
    API_ENDPOINT=$(aws cloudformation describe-stacks \
        --stack-name AgentLambdaStack \
        --query 'Stacks[0].Outputs[?OutputKey==`ChatEndpoint`].OutputValue' \
        --output text 2>/dev/null || echo "Not available")
    
    echo ""
    echo "📋 Deployment Summary:"
    echo "====================="
    echo "Lambda Function: $FUNCTION_NAME"
    echo "API Endpoint: $API_ENDPOINT"
    echo ""
    
    # Test the deployment
    print_status "Testing the deployment..."
    if [ -f "tests/test_lambda_client.js" ]; then
        echo "Running test query..."
        node tests/test_lambda_client.js "What are the CPT codes for MRI procedures?"
        
        if [ $? -eq 0 ]; then
            print_success "Test completed successfully!"
        else
            print_warning "Test completed with warnings. Check the output above."
        fi
    else
        print_warning "Test client not found. Skipping automated test."
    fi
    
    echo ""
    echo "🎉 Medical Claims RAG Agent is now deployed and ready to use!"
    echo ""
    echo "Next steps:"
    echo "1. Set up Bedrock Knowledge Base (see docs/BEDROCK_KB_SETUP.md)"
    echo "2. Upload medical documents to enable RAG functionality"
    echo "3. Configure environment variables for RAG integration"
    echo "4. Test with medical insurance queries"
    echo ""
    echo "For detailed setup instructions, see SETUP.md"
    
else
    print_error "Deployment failed. Please check the error messages above."
    exit 1
fi
```

Make the script executable:
```bash
chmod +x deploy.sh
```

## Step 5: Deploy the System

### 5.1 Bootstrap CDK (First Time Only)

```bash
# Bootstrap CDK in your AWS account (only needed once per account/region)
cdk bootstrap
```

### 5.2 Run Deployment

```bash
# Execute the deployment script
./deploy.sh
```

The deployment script will:
1. ✅ Check all prerequisites
2. ✅ Install dependencies
3. ✅ Package the Lambda function
4. ✅ Build TypeScript code
5. ✅ Deploy the CDK stack
6. ✅ Test the deployment

### 5.3 Verify Deployment

After successful deployment, you should see:
- Lambda function created: `AgentFunction`
- API Gateway endpoint available
- Test query executed successfully

## Step 6: Set Up RAG Integration (Optional)

For full RAG functionality with medical documents:

### 6.1 Enable Bedrock Model Access

1. Go to AWS Bedrock Console
2. Navigate to "Model Access"
3. Request access to:
   - `amazon.titan-embed-text-v1`
   - `anthropic.claude-3-sonnet-20240229-v1:0`

### 6.2 Create Knowledge Base

Follow the detailed guide in `docs/BEDROCK_KB_SETUP.md` to:
1. Create S3 bucket for documents
2. Upload medical documents (CPT codes, ICD-10, etc.)
3. Create OpenSearch Serverless collection
4. Create Bedrock Knowledge Base
5. Configure data ingestion

### 6.3 Update Lambda Configuration

```bash
# After Knowledge Base creation, update Lambda with KB ID
aws lambda update-function-configuration \
  --function-name AgentFunction \
  --environment Variables='{
    "ENABLE_RAG":"true",
    "KNOWLEDGE_BASE_ID":"your-kb-id-here",
    "BEDROCK_MODEL_ID":"anthropic.claude-3-sonnet-20240229-v1:0"
  }'
```

## Step 7: Test the Complete System

### 7.1 Basic Functionality Test

```bash
# Test basic agent functionality
node tests/test_lambda_client.js "What are the CPT codes for MRI procedures?"
```

### 7.2 RAG Integration Test (if enabled)

```bash
# Test with medical insurance queries
node tests/test_lambda_client.js "What are Medicare billing requirements for cardiac procedures?"

# Test with specific medical codes
node tests/test_lambda_client.js "What documentation is needed for CPT code 70551?"
```

### 7.3 Meta-Tooling Test

```bash
# Test tool creation workflow
node tests/test_lambda_client.js "create a tool that calculates insurance deductibles" meta_tooling
```

## Troubleshooting

### Common Issues and Solutions

#### 1. CDK Bootstrap Error
```bash
# Error: Need to perform AWS CDK bootstrap
# Solution: Run bootstrap command
cdk bootstrap aws://ACCOUNT-ID/REGION
```

#### 2. Lambda Package Too Large
```bash
# Error: Deployment package size exceeds limit
# Solution: Remove unnecessary dependencies or increase memory
# Edit requirements.txt to remove unused packages
```

#### 3. Bedrock Access Denied
```bash
# Error: Access denied to Bedrock models
# Solution: Enable model access in Bedrock console
# Go to Bedrock > Model Access > Request Access
```

#### 4. Permission Errors
```bash
# Error: IAM permissions insufficient
# Solution: Ensure your AWS user has necessary permissions:
# - Lambda functions
# - IAM roles
# - CloudFormation
# - Bedrock services
```

### Debug Commands

```bash
# Check CloudWatch logs
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/AgentFunction"

# Check Lambda function configuration
aws lambda get-function-configuration --function-name AgentFunction

# Check CDK stack status
aws cloudformation describe-stacks --stack-name AgentLambdaStack
```

## Production Considerations

### Security
- [ ] Use least privilege IAM roles
- [ ] Enable VPC if needed
- [ ] Set up proper logging and monitoring
- [ ] Use AWS Secrets Manager for sensitive data

### Performance
- [ ] Monitor Lambda cold starts
- [ ] Optimize memory allocation
- [ ] Use provisioned concurrency for production
- [ ] Monitor RAG retrieval latency

### Cost Optimization
- [ ] Monitor Bedrock usage and costs
- [ ] Set up CloudWatch alarms for cost thresholds
- [ ] Use appropriate Lambda memory settings
- [ ] Optimize Knowledge Base document structure

### Monitoring
- [ ] Set up CloudWatch dashboards
- [ ] Create alarms for errors and latency
- [ ] Enable X-Ray tracing
- [ ] Monitor business metrics

## Next Steps

1. **Customize for Your Use Case**
   - Modify agent prompts for specific medical specialties
   - Add custom medical documents to Knowledge Base
   - Integrate with existing healthcare systems

2. **Scale the System**
   - Set up auto-scaling policies
   - Configure provisioned concurrency
   - Add caching layers

3. **Enhance Functionality**
   - Add more specialized agent workflows
   - Integrate with external medical APIs
   - Add user authentication and authorization

4. **Monitor and Maintain**
   - Set up regular monitoring and alerting
   - Plan for regular updates and maintenance
   - Document operational procedures

## Support and Resources

- **AWS Documentation**: [AWS Bedrock](https://docs.aws.amazon.com/bedrock/), [AWS CDK](https://docs.aws.amazon.com/cdk/)
- **Strands Documentation**: [Strands Agents](https://docs.strands.ai/)
- **Project Documentation**: See `docs/` directory for specific guides
- **Issues**: Check CloudWatch logs and AWS service health

For additional help, consult the detailed guides in the `docs/` directory or check the troubleshooting section above.