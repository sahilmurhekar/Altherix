// Test login functionality
const fetch = require('node-fetch');

const SERVER_URL = 'http://localhost:5000';
const API_URL = `${SERVER_URL}/api/auth`;

async function testLogin() {
    console.log('🧪 Testing login functionality...\n');
    
    try {
        // Test 1: Login with non-existent user
        console.log('Test 1: Login with non-existent user');
        const response1 = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'nonexistent@example.com',
                password: 'password123'
            })
        });
        
        const data1 = await response1.json();
        console.log('Status:', response1.status);
        console.log('Response:', data1);
        console.log('');

        // Test 2: Login with empty credentials
        console.log('Test 2: Login with empty credentials');
        const response2 = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: '',
                password: ''
            })
        });
        
        const data2 = await response2.json();
        console.log('Status:', response2.status);
        console.log('Response:', data2);
        console.log('');

        // Test 3: Check if server is responding
        console.log('Test 3: Check server health');
        const response3 = await fetch(`${SERVER_URL}/`, {
            method: 'GET'
        });
        console.log('Status:', response3.status);
        console.log('Server is responding');
        console.log('');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testLogin();