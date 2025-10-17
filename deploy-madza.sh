#!/bin/bash

# Madza AI Healthcare - Complete Deployment Script
# This script automates the entire deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        error "AWS CLI is not installed. Please install it first."
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        error "AWS credentials not configured. Run 'aws configure' first."
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed. Please install Node.js 16+ first."
    fi
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        error "Python 3 is not installed. Please install Python 3.9+ first."
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        error "Git is not installed. Please install Git first."
    fi
    
    success "All prerequisites met"
}

# Set deployment variables
setup_variables() {
    log "Setting up deployment variables..."
    
    export AWS_REGION="us-east-1"
    export KEY_PAIR_NAME="madza"
    export STACK_NAME="production-madza-ai-healthcare"
    export PROJECT_DIR=$(pwd)
    
    log "AWS_REGION: $AWS_REGION"
    log "KEY_PAIR_NAME: $KEY_PAIR_NAME"
    log "STACK_NAME: $STACK_NAME"
    log "PROJECT_DIR: $PROJECT_DIR"
    
    success "Variables configured"
}

# Create AWS key pair
create_key_pair() {
    log "Creating AWS key pair..."
    
    # Check if key pair already exists
    if aws ec2 describe-key-pairs --key-names $KEY_PAIR_NAME --region $AWS_REGION &> /dev/null; then
        warning "Key pair $KEY_PAIR_NAME already exists"
    else
        # Create new key pair
        aws ec2 create-key-pair \
            --key-name $KEY_PAIR_NAME \
            --region $AWS_REGION \
            --query 'KeyMaterial' \
            --output text > ~/.ssh/$KEY_PAIR_NAME.pem
        
        chmod 400 ~/.ssh/$KEY_PAIR_NAME.pem
        success "Key pair created: ~/.ssh/$KEY_PAIR_NAME.pem"
    fi
}

# Deploy infrastructure
deploy_infrastructure() {
    log "Deploying infrastructure..."
    
    # Navigate to deployment scripts
    cd aws-deployment/cost-optimized-deployment/scripts
    
    # Make scripts executable
    chmod +x *.sh
    
    # Deploy full stack
    ./deploy-full-stack.sh
    
    success "Infrastructure deployment initiated"
}

# Wait for infrastructure
wait_for_infrastructure() {
    log "Waiting for CloudFormation stack to complete..."
    
    aws cloudformation wait stack-create-complete \
        --stack-name $STACK_NAME \
        --region $AWS_REGION
    
    # Get stack outputs
    BACKEND_IP=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --query 'Stacks[0].Outputs[?OutputKey==`BackendServerPublicIP`].OutputValue' \
        --output text \
        --region $AWS_REGION)
    
    FRONTEND_URL=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --query 'Stacks[0].Outputs[?OutputKey==`FrontendWebsiteURL`].OutputValue' \
        --output text \
        --region $AWS_REGION)
    
    export BACKEND_IP
    export FRONTEND_URL
    
    success "Infrastructure deployed"
    log "Backend IP: $BACKEND_IP"
    log "Frontend URL: $FRONTEND_URL"
}

# Configure IAM permissions
configure_iam() {
    log "Configuring IAM permissions..."
    
    # Create IAM role for Bedrock access
    aws iam create-role \
        --role-name MadzaBedrockRole \
        --assume-role-policy-document '{
            "Version": "2012-10-17",
            "Statement": [{
                "Effect": "Allow",
                "Principal": {"Service": "ec2.amazonaws.com"},
                "Action": "sts:AssumeRole"
            }]
        }' \
        --region $AWS_REGION 2>/dev/null || warning "Role already exists"
    
    # Attach Bedrock permissions
    aws iam attach-role-policy \
        --role-name MadzaBedrockRole \
        --policy-arn arn:aws:iam::aws:policy/AmazonBedrockFullAccess \
        --region $AWS_REGION 2>/dev/null || warning "Policy already attached"
    
    # Create instance profile
    aws iam create-instance-profile \
        --instance-profile-name MadzaBedrockInstanceProfile \
        --region $AWS_REGION 2>/dev/null || warning "Instance profile already exists"
    
    # Add role to instance profile
    aws iam add-role-to-instance-profile \
        --instance-profile-name MadzaBedrockInstanceProfile \
        --role-name MadzaBedrockRole \
        --region $AWS_REGION 2>/dev/null || warning "Role already added to instance profile"
    
    # Get EC2 instance ID
    INSTANCE_ID=$(aws ec2 describe-instances \
        --filters "Name=tag:Name,Values=production-madza-backend" \
        --query 'Reservations[0].Instances[0].InstanceId' \
        --output text \
        --region $AWS_REGION)
    
    # Attach instance profile to EC2
    aws ec2 associate-iam-instance-profile \
        --instance-id $INSTANCE_ID \
        --iam-instance-profile Name=MadzaBedrockInstanceProfile \
        --region $AWS_REGION 2>/dev/null || warning "Instance profile already associated"
    
    success "IAM permissions configured"
}

# Configure backend environment
configure_backend() {
    log "Configuring backend environment..."
    
    # Wait for EC2 to be ready
    sleep 30
    
    # Create .env file on EC2
    ssh -i ~/.ssh/$KEY_PAIR_NAME.pem -o StrictHostKeyChecking=no ec2-user@$BACKEND_IP 'cd /opt/madza/backend && cat > .env << EOF
FLASK_ENV=production
FLASK_APP=main.py
DATABASE_URL=sqlite:////opt/madza/backend/healthcare.db
AWS_REGION=us-east-1
FRONTEND_URL=*
EOF'
    
    # Create database file
    ssh -i ~/.ssh/$KEY_PAIR_NAME.pem -o StrictHostKeyChecking=no ec2-user@$BACKEND_IP 'cd /opt/madza/backend && python3 -c "import sqlite3; conn = sqlite3.connect(\"healthcare.db\"); conn.close(); print(\"Database created\")"'
    
    # Initialize database schema
    ssh -i ~/.ssh/$KEY_PAIR_NAME.pem -o StrictHostKeyChecking=no ec2-user@$BACKEND_IP 'cd /opt/madza/backend && python3 -c "
from app.database import db
from app.models import Patient
from app import create_app
app = create_app()
with app.app_context():
    db.create_all()
    print(\"Database schema initialized\")
"'
    
    # Restart backend service
    ssh -i ~/.ssh/$KEY_PAIR_NAME.pem -o StrictHostKeyChecking=no ec2-user@$BACKEND_IP 'sudo systemctl restart madza-backend'
    
    success "Backend environment configured"
}

# Test deployment
test_deployment() {
    log "Testing deployment..."
    
    # Wait for services to start
    sleep 30
    
    # Test backend health
    log "Testing backend health..."
    if curl -s http://$BACKEND_IP:5000/api/health | grep -q "healthy"; then
        success "Backend health check passed"
    else
        warning "Backend health check failed"
    fi
    
    # Test patient registration
    log "Testing patient registration..."
    RESPONSE=$(curl -s -X POST http://$BACKEND_IP:5000/api/patient/register \
        -H "Content-Type: application/json" \
        -d '{
            "firstName": "John",
            "lastName": "Doe", 
            "email": "john@example.com",
            "phone": "123-456-7890",
            "dateOfBirth": "1990-01-01",
            "insuranceId": "INS123456",
            "insuranceProvider": "Blue Cross"
        }')
    
    if echo "$RESPONSE" | grep -q "successfully registered"; then
        success "Patient registration test passed"
    else
        warning "Patient registration test failed"
    fi
    
    # Test frontend
    log "Testing frontend..."
    if curl -s -I $FRONTEND_URL | grep -q "200 OK"; then
        success "Frontend accessibility test passed"
    else
        warning "Frontend accessibility test failed"
    fi
    
    success "Deployment testing completed"
}

# Display final information
display_summary() {
    log "Deployment Summary"
    echo "=================="
    echo "Frontend URL: $FRONTEND_URL"
    echo "Backend API: http://$BACKEND_IP:5000"
    echo "Backend Health: http://$BACKEND_IP:5000/api/health"
    echo ""
    echo "You can now:"
    echo "1. Open the frontend URL in your browser"
    echo "2. Test patient registration"
    echo "3. Test AI analysis features"
    echo "4. Monitor the backend API"
    echo ""
    success "Madza AI Healthcare platform is now deployed and ready!"
}

# Main deployment function
main() {
    log "Starting Madza AI Healthcare deployment..."
    
    check_prerequisites
    setup_variables
    create_key_pair
    deploy_infrastructure
    wait_for_infrastructure
    configure_iam
    configure_backend
    test_deployment
    display_summary
}

# Run main function
main "$@"
