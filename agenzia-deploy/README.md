# Medical Claims RAG Agent

A comprehensive AWS Lambda-based agent system specialized for medical insurance claims processing with RAG (Retrieval-Augmented Generation) integration using AWS Bedrock Knowledge Base.

## Features

- **Medical Claims Specialization**: Expert knowledge in CPT codes, ICD-10 codes, insurance policies, and billing procedures
- **RAG Integration**: Uses AWS Bedrock Knowledge Base with medical billing documents for accurate, up-to-date information
- **Dual Agent Workflows**: Research workflow for medical claims and meta-tooling workflow for dynamic tool creation
- **AWS Bedrock Integration**: Leverages AWS Bedrock models for intelligent responses
- **Scalable Architecture**: Deployed as AWS Lambda with CDK for infrastructure as code

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   User Query    │───▶│  Lambda Function │───▶│  Bedrock Knowledge  │
│                 │    │  (Agent Handler) │    │      Base (RAG)     │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
                              │                           │
                              ▼                           ▼
                       ┌──────────────────┐    ┌─────────────────────┐
                       │ Strands Agents   │    │   Medical Documents │
                       │ (Research/Meta)  │    │ (CPT, ICD-10, etc.) │
                       └──────────────────┘    └─────────────────────┘
```

## Quick Start

1. **Prerequisites Setup**
   ```bash
   # Install Node.js, Python 3.12, AWS CLI, and CDK
   npm install -g aws-cdk
   ```

2. **Clone and Setup**
   ```bash
   cd medical-claims-rag-agent
   npm install
   pip install -r requirements.txt
   ```

3. **Configure AWS**
   ```bash
   aws configure
   # Set your AWS credentials and region (us-east-1 recommended)
   ```

4. **Deploy Infrastructure**
   ```bash
   ./deploy.sh
   ```

5. **Test the System**
   ```bash
   node tests/test_lambda_client.js "What are the CPT codes for MRI procedures?"
   ```

## Project Structure

```
medical-claims-rag-agent/
├── README.md                    # This file
├── SETUP.md                     # Detailed setup instructions
├── package.json                 # Node.js dependencies
├── package-lock.json           # Locked dependencies
├── requirements.txt            # Python dependencies
├── cdk.json                    # CDK configuration
├── tsconfig.json              # TypeScript configuration
├── deploy.sh                  # Deployment script
├── .gitignore                 # Git ignore rules
├── agent_handler.py           # Main agent logic (copied to lambda/)
├── bin/
│   ├── app.ts                 # CDK app entry point
│   └── package_for_lambda.py  # Lambda packaging script
├── lib/
│   └── agent-lambda-stack.ts  # CDK stack definition
├── lambda/
│   └── agent_handler.py       # Lambda function code
├── tests/
│   └── test_lambda_client.js  # Test client
├── docs/
│   ├── RAG_INTEGRATION.md     # RAG setup guide
│   └── BEDROCK_KB_SETUP.md    # Knowledge Base setup
└── packaging/                 # Generated deployment packages
    ├── app.zip
    └── dependencies.zip
```

## Environment Variables

The Lambda function uses these environment variables:

- `BEDROCK_MODEL_ID`: Bedrock model to use (default: "anthropic.claude-3-sonnet-20240229-v1:0")
- `ENABLE_RAG`: Enable RAG integration ("true"/"false")
- `KNOWLEDGE_BASE_ID`: AWS Bedrock Knowledge Base ID
- `USE_OLLAMA`: Use local Ollama instead of Bedrock ("true"/"false")

## Usage Examples

### Medical Claims Queries
```bash
# CPT code lookup
node tests/test_lambda_client.js "What are the CPT codes for cardiac catheterization?"

# Insurance coverage
node tests/test_lambda_client.js "What are Medicare coverage requirements for MRI procedures?"

# Billing requirements
node tests/test_lambda_client.js "What documentation is needed for prior authorization?"
```

### Meta-Tooling Queries
```bash
# Create custom tools
node tests/test_lambda_client.js "create a tool that calculates insurance deductibles" meta_tooling
```

## Development

### Local Testing
```bash
# Package the Lambda function
python bin/package_for_lambda.py

# Deploy updates
npx cdk deploy

# Test specific functionality
node tests/test_lambda_client.js "your query here"
```

### Adding Medical Documents
1. Upload documents to the S3 bucket created by the Knowledge Base
2. The Knowledge Base will automatically ingest and index new documents
3. Test retrieval with medical queries

## Troubleshooting

### Common Issues

1. **Lambda timeout**: Increase timeout in `lib/agent-lambda-stack.ts`
2. **RAG not working**: Check `KNOWLEDGE_BASE_ID` environment variable
3. **Deployment fails**: Verify AWS credentials and permissions
4. **Package too large**: Remove unnecessary dependencies in `requirements.txt`

### Debug Mode
Enable debug logging by checking CloudWatch logs for the Lambda function.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test thoroughly
4. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review CloudWatch logs
3. Consult the setup documentation in `docs/`