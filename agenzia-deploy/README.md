# Agent Lambda Deployment

This project deploys Strands Agents SDK agents to AWS Lambda with dual agentic workflows:

1. **Research Workflow**: Multi-agent pipeline (Researcher → Analyst → Writer) for web research and fact-checking
2. **Meta-tooling Workflow**: Dynamic tool creation and usage capabilities

## Architecture

- **Local Development**: Uses Ollama for testing
- **AWS Deployment**: Uses AWS Bedrock (gpt-oss-20b model)
- **Automatic Detection**: Environment-based model configuration

## Prerequisites

- Node.js 18+ and npm
- Python 3.12+
- AWS CLI configured
- AWS CDK CLI installed (`npm install -g aws-cdk`)

## Quick Start

### 1. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt
```

### 2. Deploy to AWS

```bash
# One-command deployment
./deploy.sh
```

Or manually:

```bash
# Package Python code
python ./bin/package_for_lambda.py

# Bootstrap CDK (first time only)
npx cdk bootstrap

# Deploy
npx cdk deploy
```

### 3. Test the Deployment

```bash
# Run all tests
./test_lambda.sh

# Or test manually
aws lambda invoke --function-name AgentFunction \
  --region us-east-1 \
  --cli-binary-format raw-in-base64-out \
  --payload '{"prompt": "What are quantum computers?"}' \
  output.json

jq -r '.' ./output.json
```

## Local Development

For local testing with Ollama:

```bash
# Set environment variables
export USE_OLLAMA=true
export OLLAMA_BASE_URL=http://localhost:11434
export OLLAMA_MODEL_ID=llama3.2:latest

# Run local tests
python local_test_ollama.py
```

## Usage Examples

### Research Workflow

```json
{
  "prompt": "What are quantum computers?"
}
```

```json
{
  "prompt": "Fact check: The Earth is flat"
}
```

### Meta-tooling Workflow

```json
{
  "prompt": "create a tool that reverses text"
}
```

```json
{
  "prompt": "reverse hello world",
  "mode": "meta_tooling"
}
```

### Explicit Mode Selection

```json
{
  "prompt": "Tell me about AI",
  "mode": "research"
}
```

## Configuration

### Environment Variables

- `USE_OLLAMA`: Set to "true" for local Ollama usage
- `OLLAMA_BASE_URL`: Ollama server URL (default: http://localhost:11434)
- `OLLAMA_MODEL_ID`: Ollama model name (default: llama3.2:latest)
- `BEDROCK_MODEL_ID`: AWS Bedrock model ID (default: gpt-oss-20b)

### AWS Permissions

The Lambda function requires these permissions:
- `bedrock:InvokeModel`
- `bedrock:InvokeModelWithResponseStream`

## Project Structure

```
├── agent_handler.py          # Main Lambda handler
├── lambda/                   # Lambda deployment code
├── lib/AgentLambdaStack.ts   # CDK infrastructure
├── bin/                      # Scripts and CDK app
├── packaging/                # Generated deployment packages
├── deploy.sh                 # Deployment script
├── test_lambda.sh           # Testing script
└── local_test_ollama.py     # Local development testing
```

## Workflow Detection

The system automatically detects which workflow to use based on keywords:

**Research Keywords**: research, fact check, verify, what is, explain, tell me about
**Meta-tooling Keywords**: create a tool, make a tool, reverse, calculate, process

## Troubleshooting

### Common Issues

1. **Model not found**: Ensure the Bedrock model ID is correct and available in your region
2. **Timeout errors**: Increase Lambda timeout in `AgentLambdaStack.ts`
3. **Memory errors**: Increase Lambda memory size in `AgentLambdaStack.ts`

### Logs

View Lambda logs:
```bash
aws logs tail /aws/lambda/AgentFunction --follow
```

## Cost Optimization

- Uses ARM64 architecture for better price/performance
- Lambda layers separate dependencies from app code
- Configurable timeout and memory settings