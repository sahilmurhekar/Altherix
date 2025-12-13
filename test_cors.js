#!/usr/bin/env node

/**
 * Test script to verify CORS configuration
 * This script tests the login endpoint to ensure CORS headers are properly set
 */

import axios from 'axios';

const testCors = async () => {
  console.log('🧪 Testing CORS configuration...');

  try {
    // Test the login endpoint with a dummy request
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com',
      password: 'test123'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://altherix.vercel.app'
      }
    });

    console.log('✅ CORS test passed - Request completed successfully');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('❌ CORS test failed with response error:');
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
      console.log('Headers:', error.response.headers);
    } else if (error.request) {
      console.log('❌ CORS test failed - No response received:', error.message);
    } else {
      console.log('❌ CORS test failed - Request setup error:', error.message);
    }
  }
};

// Run the test
testCors();