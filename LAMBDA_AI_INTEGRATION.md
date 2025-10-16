# Lambda AI Integration Guide

## Overview
The Madza AI Healthcare Platform now supports integration with your custom AWS Lambda AI endpoint specifically for the chatbot functionality. Other AI features (claim analysis, suggestions) continue to use AWS Bedrock.

## Configuration

### Backend Configuration
Add the following environment variable to your backend:

```bash
# AI Lambda Configuration
AI_LAMBDA_URL=https://your-lambda-url.amazonaws.com
```

### Frontend Configuration
Add the following environment variable to your frontend:

```bash
# AI Lambda Configuration
REACT_APP_AI_LAMBDA_URL=https://your-lambda-url.amazonaws.com
```

## Lambda Endpoint Requirements

Your Lambda function should accept the following payload format:

```json
{
  "prompt": "The AI prompt/query",
  "context": "Additional context information",
  "timestamp": "2025-01-12T23:10:00.000Z"
}
```

And return one of these response formats:

### Option 1: Direct Response Format
```json
{
  "response": "AI response text",
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "actionData": {
    "type": "none|patient_registration|claim_processing|system_info",
    "data": {}
  }
}
```

### Option 2: Analysis Format
```json
{
  "analysis": "AI response text or JSON string"
}
```

### Option 3: Error Format
```json
{
  "error": "Error message",
  "response": "Fallback response text"
}
```

## Features Using Lambda AI

1. **Chatbot Queries** - General healthcare platform assistance and user support

## Features Using Bedrock AI

1. **Claim Analysis** - AI-powered claim processing and analysis
2. **Claim Suggestions** - AI recommendations for claim improvements

## Testing

To test the Lambda integration:

1. Set your Lambda URL in the environment variables
2. Start the backend server
3. Open the chatbot in the frontend
4. Send a test message to verify the connection

## Fallback Behavior

If the Lambda endpoint is unavailable or returns an error, the system will:
- Display a user-friendly error message
- Provide fallback suggestions
- Continue functioning without AI features

## Security Considerations

- Ensure your Lambda endpoint is properly secured
- Consider implementing API keys or authentication
- Monitor Lambda usage and costs
- Set appropriate timeout values
