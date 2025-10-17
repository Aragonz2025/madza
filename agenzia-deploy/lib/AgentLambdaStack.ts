import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import * as path from 'path';

export class AgentLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const packagingDirectory = path.join(__dirname, "../packaging");
    const zipDependencies = path.join(packagingDirectory, "dependencies.zip");
    const zipApp = path.join(packagingDirectory, "app.zip");

    // Create a lambda layer with dependencies
    const dependenciesLayer = new lambda.LayerVersion(this, "DependenciesLayer", {
      code: lambda.Code.fromAsset(zipDependencies),
      compatibleRuntimes: [lambda.Runtime.PYTHON_3_12],
      description: "Dependencies needed for agent-based lambda",
    });

    // Define the Lambda function
    const agentFunction = new lambda.Function(this, "AgentLambda", {
      runtime: lambda.Runtime.PYTHON_3_12,
      functionName: "AgentFunction",
      handler: "agent_handler.handler",
      code: lambda.Code.fromAsset(zipApp),
      timeout: cdk.Duration.seconds(300), // 5 minutes for complex workflows
      memorySize: 1024, // Increased memory for AI workloads
      layers: [dependenciesLayer],
      architecture: lambda.Architecture.ARM_64,
      environment: {
        BEDROCK_MODEL_ID: "openai.gpt-oss-20b-1:0", // OpenAI GPT model via Bedrock
        USE_OLLAMA: "false" // Disable Ollama for Lambda deployment
      }
    });

    // Add permissions for Bedrock APIs
    agentFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["bedrock:InvokeModel", "bedrock:InvokeModelWithResponseStream"],
        resources: ["*"],
      }),
    );

    // Create simple API Gateway
    const api = new apigateway.RestApi(this, "AgentApi", {
      restApiName: "Agent Chat API",
      description: "Simple API for Agent Lambda",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ["POST", "OPTIONS"],
        allowHeaders: ["Content-Type"],
      },
    });

    // Create Lambda integration
    const agentIntegration = new apigateway.LambdaIntegration(agentFunction);

    // Add /chat endpoint
    api.root.addResource("chat").addMethod("POST", agentIntegration);

    // Output the function name for testing
    new cdk.CfnOutput(this, 'FunctionName', {
      value: agentFunction.functionName,
      description: 'Lambda function name for testing'
    });

    // Output the function ARN
    new cdk.CfnOutput(this, 'FunctionArn', {
      value: agentFunction.functionArn,
      description: 'Lambda function ARN'
    });

    // Output the API Gateway URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway base URL'
    });

    // Output the chat endpoint
    new cdk.CfnOutput(this, 'ChatEndpoint', {
      value: `${api.url}chat`,
      description: 'POST endpoint for chat messages'
    });


  }
}