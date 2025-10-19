#!/bin/bash

# Medical Claims RAG Agent Deployment Script
# This script packages and deploys the complete system

set -e  # Exit on any error

echo "🚀 Starting Medical Claims RAG Agent Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
print_status "Checking prerequisites..."

# Check if AWS CLI is installed and configured
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if CDK is installed
if ! command -v cdk &> /dev/null; then
    print_error "AWS CDK is not installed. Please install it with: npm install -g aws-cdk"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Python is installed
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

# Install Node.js dependencies
print_status "Installing Node.js dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
    print_success "Node.js dependencies installed"
else
    print_status "Node.js dependencies already installed"
fi

# Install Python dependencies (for local development)
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
    
    # Get the function name and test endpoint
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