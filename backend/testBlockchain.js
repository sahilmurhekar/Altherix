import blockchainService from './services/blockchainService.js';

async function testBlockchain() {
  try {
    console.log('🔗 Testing Blockchain Connection...\n');

    // Initialize
    await blockchainService.initialize();

    // Get balance
    const balance = await blockchainService.getDoctorBalance();
    console.log('💰 Doctor Account Balance:');
    console.log(balance);

    console.log('\n✅ Blockchain connection successful!');

  } catch (err) {
    console.error('❌ Blockchain connection failed:', err.message);
  }

  process.exit(0);
}

testBlockchain();
