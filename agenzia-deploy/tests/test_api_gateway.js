#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Configuration - Set these environment variables or update here
const API_GATEWAY_URL = process.env.MADZA_API_URL || 'YOUR_API_GATEWAY_URL_HERE';
const API_KEY = process.env.MADZA_API_KEY || 'YOUR_API_KEY_HERE';

async function testApiGateway(message, workflow = null) {
    try {
        const payload = { 
            prompt: message,
            mode: workflow || 'research'
        };
        
        console.log('🚀 Testing API Gateway with payload:', JSON.stringify(payload, null, 2));
        console.log('🔑 Using API Key:', API_KEY.substring(0, 8) + '...');
        
        const url = new URL(`${API_GATEWAY_URL}/chat`);
        const options = {
            hostname: url.hostname,
            port: url.port || (url.protocol === 'https:' ? 443 : 80),
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': API_KEY,
                'User-Agent': 'Madza-Test-Client/1.0'
            }
        };
        
        return new Promise((resolve, reject) => {
            const req = (url.protocol === 'https:' ? https : http).request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    console.log(`\n📡 Response Status: ${res.statusCode}`);
                    console.log('📋 Response Headers:', res.headers);
                    
                    if (res.statusCode === 200) {
                        try {
                            const result = JSON.parse(data);
                            console.log('\n✅ API Gateway Response:');
                            console.log('='.repeat(50));
                            console.log(JSON.stringify(result, null, 2));
                            console.log('='.repeat(50));
                            resolve(result);
                        } catch (parseError) {
                            console.log('\n📄 Raw Response:');
                            console.log(data);
                            resolve({ raw: data });
                        }
                    } else {
                        console.error('❌ API Gateway Error:');
                        console.error('Status:', res.statusCode);
                        console.error('Response:', data);
                        reject(new Error(`API Gateway returned ${res.statusCode}: ${data}`));
                    }
                });
            });
            
            req.on('error', (error) => {
                console.error('❌ Request Error:', error.message);
                reject(error);
            });
            
            req.write(JSON.stringify(payload));
            req.end();
        });
        
    } catch (error) {
        console.error('❌ Error calling API Gateway:', error.message);
        throw error;
    }
}

// Test without API key (should fail)
async function testWithoutApiKey(message) {
    try {
        console.log('\n🔒 Testing without API key (should fail)...');
        
        const payload = { 
            prompt: message,
            mode: 'research'
        };
        
        const url = new URL(`${API_GATEWAY_URL}/chat`);
        const options = {
            hostname: url.hostname,
            port: url.port || (url.protocol === 'https:' ? 443 : 80),
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Madza-Test-Client/1.0'
                // No X-API-Key header
            }
        };
        
        return new Promise((resolve, reject) => {
            const req = (url.protocol === 'https:' ? https : http).request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    console.log(`📡 Response Status: ${res.statusCode}`);
                    if (res.statusCode === 403) {
                        console.log('✅ Correctly rejected request without API key');
                        resolve({ success: true, message: 'Correctly rejected' });
                    } else {
                        console.log('❌ Unexpected response:', data);
                        reject(new Error(`Expected 403, got ${res.statusCode}`));
                    }
                });
            });
            
            req.on('error', (error) => {
                console.error('❌ Request Error:', error.message);
                reject(error);
            });
            
            req.write(JSON.stringify(payload));
            req.end();
        });
        
    } catch (error) {
        console.error('❌ Error testing without API key:', error.message);
        throw error;
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('Usage: node test_api_gateway.js "your message" [workflow]');
        console.log('Environment Variables:');
        console.log('  MADZA_API_URL - Your API Gateway URL');
        console.log('  MADZA_API_KEY - Your API Key');
        console.log('');
        console.log('Examples:');
        console.log('  MADZA_API_URL=https://abc123.execute-api.us-east-1.amazonaws.com/prod MADZA_API_KEY=your-key node test_api_gateway.js "What are the CPT codes for MRI procedures?"');
        console.log('  node test_api_gateway.js "What are Medicare billing requirements?" research');
        process.exit(1);
    }
    
    if (API_GATEWAY_URL === 'YOUR_API_GATEWAY_URL_HERE' || API_KEY === 'YOUR_API_KEY_HERE') {
        console.error('❌ Please set MADZA_API_URL and MADZA_API_KEY environment variables');
        console.error('   Get them from: aws cloudformation describe-stacks --stack-name AgentLambdaStack --query "Stacks[0].Outputs"');
        process.exit(1);
    }
    
    const message = args[0];
    const workflow = args[1] || null;
    
    // Test with API key
    await testApiGateway(message, workflow);
    
    // Test without API key (should fail)
    await testWithoutApiKey(message);
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { testApiGateway, testWithoutApiKey };
