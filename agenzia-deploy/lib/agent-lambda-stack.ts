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
                'bedrock:GetFoundationModel'
              ],
              resources: ['*']
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
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
      description: 'Dependencies for Medical Claims RAG Agent (Strands, Boto3, etc.)'
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
      description: 'Medical Claims RAG Agent - Processes medical insurance queries with Bedrock integration',
      environment: {
        'BEDROCK_MODEL_ID': 'anthropic.claude-3-sonnet-20240229-v1:0',
        'ENABLE_RAG': 'false', // Set to 'true' after Knowledge Base setup
        'KNOWLEDGE_BASE_ID': '', // Set after Knowledge Base creation
        'USE_OLLAMA': 'false'
      }
    });

    // Create API Gateway with API Key authentication
    const api = new apigateway.RestApi(this, 'AgentApi', {
      restApiName: 'Medical Claims RAG Agent API',
      description: 'API for Medical Claims RAG Agent system',
      defaultCorsPreflightOptions: {
        allowOrigins: ['https://your-frontend-domain.com'], // Restrict to your domain
        allowMethods: ['POST', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key']
      }
    });

    // Create API Key
    const apiKey = new apigateway.ApiKey(this, 'AgentApiKey', {
      description: 'API Key for Medical Claims RAG Agent',
      apiKeyName: 'madza-agent-api-key'
    });

    // Create Usage Plan
    const usagePlan = new apigateway.UsagePlan(this, 'AgentUsagePlan', {
      name: 'MadzaAgentUsagePlan',
      description: 'Usage plan for Medical Claims RAG Agent',
      apiStages: [{
        api: api,
        stage: api.deploymentStage
      }],
      throttle: {
        rateLimit: 100, // 100 requests per second
        burstLimit: 200 // 200 burst capacity
      },
      quota: {
        limit: 1000, // 1000 requests per day
        period: apigateway.Period.DAY
      }
    });

    // Associate API Key with Usage Plan
    usagePlan.addApiKey(apiKey);

    // Create Lambda integration
    const lambdaIntegration = new apigateway.LambdaIntegration(agentFunction, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' }
    });

    // Add chat endpoint with API Key requirement
    const chatResource = api.root.addResource('chat');
    chatResource.addMethod('POST', lambdaIntegration, {
      apiKeyRequired: true, // Require API key for all requests
      methodResponses: [{
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Headers': true,
          'method.response.header.Access-Control-Allow-Methods': true,
          'method.response.header.Access-Control-Allow-Origin': true
        }
      }]
    });
    
    // Add OPTIONS method for CORS (no API key required)
    chatResource.addMethod('OPTIONS', new apigateway.MockIntegration({
      integrationResponses: [{
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
          'method.response.header.Access-Control-Allow-Origin': "'https://your-frontend-domain.com'",
          'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,POST'"
        }
      }],
      passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
      requestTemplates: {
        'application/json': '{"statusCode": 200}'
      }
    }), {
      methodResponses: [{
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Headers': true,
          'method.response.header.Access-Control-Allow-Methods': true,
          'method.response.header.Access-Control-Allow-Origin': true
        }
      }]
    });

    // Outputs
    new cdk.CfnOutput(this, 'FunctionName', {
      value: agentFunction.functionName,
      description: 'Lambda function name'
    });

    new cdk.CfnOutput(this, 'FunctionArn', {
      value: agentFunction.functionArn,
      description: 'Lambda function ARN'
    });

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL'
    });

    new cdk.CfnOutput(this, 'ChatEndpoint', {
      value: `${api.url}chat`,
      description: 'Chat endpoint URL'
    });

    new cdk.CfnOutput(this, 'AgentApiEndpoint', {
      value: api.url,
      description: 'API Gateway endpoint URL'
    });

    new cdk.CfnOutput(this, 'ApiKeyId', {
      value: apiKey.keyId,
      description: 'API Key ID for authentication'
    });

    new cdk.CfnOutput(this, 'ApiKeyValue', {
      value: apiKey.keyValue,
      description: 'API Key Value - KEEP THIS SECRET!'
    });
  }
}