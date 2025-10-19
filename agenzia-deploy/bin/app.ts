#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AgentLambdaStack } from '../lib/agent-lambda-stack';

const app = new cdk.App();

new AgentLambdaStack(app, 'AgentLambdaStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  description: 'Medical Claims RAG Agent - Lambda function with Bedrock integration for medical insurance claims processing'
});