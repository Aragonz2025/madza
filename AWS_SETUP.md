# AWS Bedrock Setup for AI Suggestions

## Current Status
The AI Suggestions feature is currently using fallback logic instead of real AI processing because AWS credentials are not configured.

## Setup Instructions

### 1. AWS Credentials Configuration

You have several options to configure AWS credentials:

#### Option A: Environment Variables (Recommended for development)
```bash
export AWS_ACCESS_KEY_ID=your_access_key_here
export AWS_SECRET_ACCESS_KEY=your_secret_key_here
export AWS_REGION=us-east-1
```

#### Option B: AWS CLI Configuration
```bash
aws configure
```

#### Option C: IAM Role (for production)
If running on AWS infrastructure, use IAM roles instead of access keys.

### 2. Required AWS Permissions

Your AWS user/role needs the following permissions:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeModel"
            ],
            "Resource": "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0"
        }
    ]
}
```

### 3. Enable Bedrock Model Access

1. Go to AWS Bedrock Console
2. Navigate to "Model access" in the left sidebar
3. Request access to "Anthropic Claude 3 Sonnet"
4. Wait for approval (usually instant for most accounts)

### 4. Test Configuration

After setting up credentials, test with:
```bash
cd backend
source venv/bin/activate
python -c "
from app.services import BedrockService
service = BedrockService()
print('Bedrock service initialized successfully')
"
```

### 5. Current Fallback Behavior

Until AWS is configured, the system will:
- ✅ **Work normally** with intelligent fallback suggestions
- ✅ **Process claims** and display AI analysis
- ✅ **Generate suggestions** based on claim data patterns
- ❌ **Not use real AI** for suggestions generation

## Next Steps

1. **Configure AWS credentials** using one of the methods above
2. **Restart the backend** after configuration
3. **Test AI suggestions** - they should now use real AI processing
4. **Check backend logs** for any remaining errors

## Troubleshooting

- **"NoCredentialsError"**: AWS credentials not configured
- **"AccessDenied"**: Insufficient permissions or model access not enabled
- **"ModelNotAccessible"**: Bedrock model access not requested/approved
- **"InvalidParameter"**: Check model ID and region configuration
