# Medical Insurance Claims Lambda - Deployment Package

This folder contains only the core files needed to deploy and run the medical insurance claims Lambda function.

## Quick Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Deploy to AWS:**
   ```bash
   ./deploy.sh
   ```

## Core Files

- `agent_handler.py` - Main Lambda function with medical claims specialization
- `lib/AgentLambdaStack.ts` - CDK infrastructure definition
- `requirements.txt` - Python dependencies
- `package.json` - Node.js dependencies for CDK
- `bin/package_for_lambda.py` - Lambda packaging script
- `deploy.sh` - Deployment automation script

## Prerequisites

- AWS CLI configured with appropriate permissions
- Node.js and npm installed
- Python 3.12+ installed
- CDK CLI installed (`npm install -g aws-cdk`)

## Model Configuration

The Lambda uses OpenAI GPT model via AWS Bedrock:
- Model ID: `openai.gpt-oss-20b-1:0`
- Region: `us-east-1`
- Requires Bedrock permissions

## Usage

After deployment, invoke the Lambda function with:
```json
{
  "message": "What documentation is required for a medical insurance claim?",
  "workflow": "research"
}
```

The function specializes in:
- Medical insurance claims processing
- Healthcare billing and coding (CPT, ICD-10)
- Medicare/Medicaid policies
- Prior authorization requirements
- Claims appeals and documentation