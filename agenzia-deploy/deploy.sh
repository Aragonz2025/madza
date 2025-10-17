#!/bin/bash

# Deployment script for Agent Lambda
set -e

echo "🚀 Deploying Agent Lambda to AWS..."

# Check if Node.js dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Package Python dependencies and app
echo "📦 Packaging Python code for Lambda..."
python ./bin/package_for_lambda.py

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Bootstrap CDK (if not already done)
echo "🏗️  Bootstrapping CDK environment..."
npx cdk bootstrap

# Deploy the stack
echo "🚀 Deploying to AWS..."
npx cdk deploy --require-approval never

echo "✅ Deployment complete!"
echo ""
echo "🧪 Test your function with:"
echo "aws lambda invoke --function-name AgentFunction \\"
echo "  --region us-east-1 \\"
echo "  --cli-binary-format raw-in-base64-out \\"
echo "  --payload '{\"prompt\": \"What are quantum computers?\"}' \\"
echo "  output.json"
echo ""
echo "jq -r '.' ./output.json"