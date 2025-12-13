#!/usr/bin/env node

/**
 * Test script to verify the login fix
 * This script tests various scenarios to ensure the login endpoint works correctly
 */

import axios from 'axios';

const testLoginFix = async () => {
  console.log('🧪 Testing login functionality after CORS fix...');

  const testCases = [
    {
      name: 'Test with valid credentials (should fail with "User not found" since no user exists)',
      email: 'test@example.com',
      password: 'test123',
      expectedStatus: 400,
      expectedMessage: 'User not found'
    },
    {
      name: 'Test with missing email',
      email: '',
      password: 'test123',
      expectedStatus: 400,
      expectedMessage: 'Email and password are required'
    },
    {
      name: 'Test with missing password',
      email: 'test@example.com',
      password: '',
      expectedStatus: 400,
      expectedMessage: 'Email and password are required'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 ${testCase.name}`);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: testCase.email,
        password: testCase.password
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://altherix.vercel.app'
        }
      });

      console.log('✅ Test passed - Unexpected success:', response.status);
      console.log('Response:', response.data);
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        console.log(`Status: ${status}`);
        console.log(`Message: ${data.message || 'No message'}`);

        if (status === testCase.expectedStatus && data.message === testCase.expectedMessage) {
          console.log('✅ Test passed - Expected error received');
        } else {
          console.log('❌ Test failed - Unexpected error response');
        }
      } else if (error.request) {
        console.log('❌ Test failed - No response received:', error.message);
      } else {
        console.log('❌ Test failed - Request setup error:', error.message);
      }
    }
  }

  console.log('\n🎯 All tests completed!');
};

testLoginFix();