#!/usr/bin/env node

const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');

// Initialize Lambda client
const lambdaClient = new LambdaClient({ 
    region: 'us-east-1'
    // Uses default AWS credentials from environment or ~/.aws/credentials
});

async function testLambda(message, workflow = null) {
    try {
        const payload = { message };
        if (workflow) payload.workflow = workflow;
        
        console.log('🚀 Invoking Lambda with payload:', JSON.stringify(payload, null, 2));
        
        const command = new InvokeCommand({
            FunctionName: 'AgentFunction',
            Payload: JSON.stringify(payload)
        });
        
        const response = await lambdaClient.send(command);
        const result = JSON.parse(new TextDecoder().decode(response.Payload));
        
        console.log('\n✅ Lambda Response:');
        console.log('='.repeat(50));
        console.log(result);
        console.log('='.repeat(50));
        
        return result;
        
    } catch (error) {
        console.error('❌ Error invoking Lambda:', error.message);
        throw error;
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('Usage: node test_lambda_client.js "your message" [workflow]');
        console.log('Examples:');
        console.log('  node test_lambda_client.js "What are the CPT codes for MRI procedures?"');
        console.log('  node test_lambda_client.js "create a tool that reverses text" meta_tooling');
        console.log('  node test_lambda_client.js "What are Medicare billing requirements?" research');
        process.exit(1);
    }
    
    const message = args[0];
    const workflow = args[1] || null;
    
    await testLambda(message, workflow);
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { testLambda };