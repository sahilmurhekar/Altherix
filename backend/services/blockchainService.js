// /backend/services/blockchainService.js

import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// ========== BLOCKCHAIN SERVICE CLASS ==========
class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.initialized = false;
  }

  // ========== INITIALIZE CONNECTION ==========
  async initialize() {
    try {
      if (this.initialized) {
        console.log('✅ Blockchain service already initialized');
        return;
      }

      // Connect to Sepolia testnet via Infura
      const infuraUrl = `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`;
      this.provider = new ethers.JsonRpcProvider(infuraUrl);

      // Create signer from private key (dummy doctor account)
      const privateKey = process.env.DOCTOR_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error('DOCTOR_PRIVATE_KEY not set in environment');
      }

      this.signer = new ethers.Wallet(privateKey, this.provider);

      console.log(`✅ Blockchain service initialized`);
      console.log(`📝 Doctor Account: ${this.signer.address}`);

      this.initialized = true;
      return true;

    } catch (err) {
      console.error('❌ Blockchain initialization error:', err.message);
      throw err;
    }
  }

  // ========== STORE MEDICAL RECORD ON BLOCKCHAIN ==========
  async storeMedicalRecord(patientAddress, recordData) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // Validate Ethereum addresses
      if (!ethers.isAddress(patientAddress)) {
        throw new Error('Invalid patient Ethereum address');
      }

      const doctorAddress = this.signer.address;

      // Create metadata object
      const metadata = {
        recordType: recordData.type, // test-analysis or doctor-analysis
        description: recordData.description,
        fileName: recordData.originalFileName,
        fileUrl: recordData.fileUrl,
        cloudinaryPublicId: recordData.cloudinaryPublicId,
        uploadedAt: new Date().toISOString()
      };

      // Convert to JSON string and hash it
      const metadataJSON = JSON.stringify(metadata);
      const metadataHash = ethers.keccak256(ethers.toUtf8Bytes(metadataJSON));

      // Create transaction data
      // We'll use a simple approach: store hash in contract or just log to blockchain via transfer
      // For this prototype, we'll use contract interaction

      const txData = {
        to: doctorAddress, // Can be a contract address later
        value: ethers.parseEther('0'), // No ETH transfer
        data: ethers.AbiCoder.defaultAbiCoder().encode(
          ['string', 'address', 'bytes32'],
          [recordData.type, patientAddress, metadataHash]
        )
      };

      // Estimate gas
      const gasEstimate = await this.provider.estimateGas(txData);
      const gasPrice = await this.provider.getGasPrice();

      console.log(`⛽ Gas estimate: ${gasEstimate.toString()}`);
      console.log(`💰 Gas price: ${ethers.formatUnits(gasPrice, 'gwei')} Gwei`);

      // Generate a proper 32-byte transaction hash (for Sepolia testnet)
      // Format: 0x + 64 hex characters
      const randomHash = '0x' + Array.from({ length: 32 }, () =>
        Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
      ).join('');

      console.log(`📤 Generated blockchain hash: ${randomHash}`);

      // For production: Actually send transaction
      // For now, we simulate it since we want to demonstrate the flow
      // Uncomment below for real blockchain interaction:
      /*
      const tx = await this.signer.sendTransaction({
        to: doctorAddress,
        value: ethers.parseEther('0'),
        data: txData.data,
        gasLimit: (gasEstimate * BigInt(120)) / BigInt(100)
      });
      const receipt = await tx.wait(1);
      */

      // Simulate successful transaction
      const blockNumber = Math.floor(Math.random() * 5000000) + 5234567;
      const gasUsed = '21000';

      console.log(`✅ Simulated transaction confirmed in block: ${blockNumber}`);

      return {
        transactionHash: randomHash,
        blockNumber: blockNumber,
        gasUsed: gasUsed,
        metadataHash: metadataHash,
        doctorAddress: doctorAddress,
        patientAddress: patientAddress,
        status: 'confirmed'
      };

    } catch (err) {
      console.error('❌ Blockchain record storage error:', err.message);
      throw err;
    }
  }

  // ========== GET TRANSACTION DETAILS ==========
   async getTransactionDetails(transactionHash) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // Simulated transaction details (for development/testing)
      const blockNumber = Math.floor(Math.random() * 5000000) + 5234567;
      const gasUsed = '21000';
      const gasPrice = 2; // Gwei
      const transactionFee = (parseInt(gasUsed) * gasPrice / 1e9).toFixed(8);

      console.log(`✅ Transaction details (simulated):`);
      console.log(`   Hash: ${transactionHash}`);
      console.log(`   Block: ${blockNumber}`);
      console.log(`   Gas: ${gasUsed}`);

      return {
        hash: transactionHash,
        from: this.signer.address,
        to: this.signer.address,
        value: '0.0',
        gasPrice: gasPrice.toString(),
        gasLimit: '21000',
        blockNumber: blockNumber,
        gasUsed: gasUsed,
        status: 'success',
        transactionFee: transactionFee,
        confirmations: Math.floor(Math.random() * 100) + 12
      };

    } catch (err) {
      console.error('❌ Get transaction details error:', err.message);
      throw err;
    }
  }

  // ========== VERIFY RECORD ON BLOCKCHAIN ==========
  async verifyRecord(metadataHash, transactionHash) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const tx = await this.provider.getTransaction(transactionHash);
      if (!tx) {
        throw new Error('Transaction not found on blockchain');
      }

      const receipt = await this.provider.getTransactionReceipt(transactionHash);
      if (!receipt) {
        throw new Error('Transaction receipt not available');
      }

      // Verify transaction was successful
      if (receipt.status !== 1) {
        return {
          verified: false,
          reason: 'Transaction failed'
        };
      }

      return {
        verified: true,
        transactionHash: transactionHash,
        blockNumber: receipt.blockNumber,
        confirmedAt: new Date().toISOString(),
        explorerLink: `https://sepolia.etherscan.io/tx/${transactionHash}`
      };

    } catch (err) {
      console.error('❌ Blockchain verification error:', err.message);
      throw err;
    }
  }

  // ========== GET DOCTOR ACCOUNT BALANCE ==========
  async getDoctorBalance() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const balance = await this.provider.getBalance(this.signer.address);
      return {
        address: this.signer.address,
        balanceETH: ethers.formatEther(balance),
        balanceWei: balance.toString()
      };

    } catch (err) {
      console.error('❌ Get balance error:', err.message);
      throw err;
    }
  }

  // ========== REQUEST TESTNET FAUCET (for development) ==========
  async requestTestnetFaucet() {
    try {
      console.log(`💧 To get testnet ETH for ${this.signer.address}:`);
      console.log('🔗 Visit: https://www.infura.io/faucet/sepolia');
      console.log('   Or: https://sepolia-faucet.pk910.de/');

      return {
        address: this.signer.address,
        faucetUrls: [
          'https://www.infura.io/faucet/sepolia',
          'https://sepolia-faucet.pk910.de/'
        ]
      };

    } catch (err) {
      console.error('❌ Faucet request error:', err.message);
      throw err;
    }
  }
}

// Create singleton instance
const blockchainService = new BlockchainService();

export default blockchainService;
