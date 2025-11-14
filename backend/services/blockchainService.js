// /backend/services/blockchainService.js (FIXED)

import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

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

      const infuraUrl = `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`;
      this.provider = new ethers.JsonRpcProvider(infuraUrl);

      const privateKey = process.env.DOCTOR_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error('DOCTOR_PRIVATE_KEY not set in environment');
      }

      this.signer = new ethers.Wallet(privateKey, this.provider);

      console.log(`✅ Blockchain service initialized`);
      console.log(`🔐 Doctor Account: ${this.signer.address}`);

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
        recordType: recordData.type,
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
      const txData = {
        to: doctorAddress,
        value: ethers.parseEther('0'),
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

      // ========== SEND REAL TRANSACTION ==========
      try {
        const tx = await this.signer.sendTransaction({
          to: doctorAddress,
          value: ethers.parseEther('0'),
          data: txData.data,
          gasLimit: (gasEstimate * BigInt(120)) / BigInt(100)
        });

        console.log(`📤 Transaction sent: ${tx.hash}`);
        console.log(`⏳ Waiting for confirmation...`);

        // Wait for 1 confirmation
        const receipt = await tx.wait(1);

        console.log(`✅ Transaction confirmed in block: ${receipt.blockNumber}`);

        return {
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
          metadataHash: metadataHash,
          doctorAddress: doctorAddress,
          patientAddress: patientAddress,
          status: 'confirmed'
        };

      } catch (txErr) {
        console.error('❌ Transaction failed:', txErr.message);
        throw new Error(`Blockchain transaction failed: ${txErr.message}`);
      }

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

      console.log(`🔍 Fetching transaction details for: ${transactionHash}`);

      // Validate hash format (must be 66 chars: 0x + 64 hex chars)
      if (!/^0x[a-fA-F0-9]{64}$/.test(transactionHash)) {
        throw new Error(`Invalid transaction hash format: ${transactionHash}`);
      }

      // Get transaction from blockchain
      const tx = await this.provider.getTransaction(transactionHash);
      if (!tx) {
        throw new Error('Transaction not found on blockchain');
      }

      // Get receipt with confirmation data
      const receipt = await this.provider.getTransactionReceipt(transactionHash);
      if (!receipt) {
        throw new Error('Transaction receipt not yet available');
      }

      // Calculate transaction fee
      const gasUsed = receipt.gasUsed;
      const gasPrice = tx.gasPrice;
      const transactionFee = ethers.formatEther(gasUsed * gasPrice);

      console.log(`✅ Transaction details retrieved`);

      return {
        hash: receipt.hash,
        from: tx.from,
        to: tx.to,
        value: ethers.formatEther(tx.value),
        gasPrice: ethers.formatUnits(gasPrice, 'gwei'),
        gasLimit: tx.gasLimit.toString(),
        blockNumber: receipt.blockNumber,
        gasUsed: gasUsed.toString(),
        status: receipt.status === 1 ? 'success' : 'failed',
        transactionFee: transactionFee,
        confirmations: (await this.provider.getBlockNumber()) - receipt.blockNumber
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

      console.log(`🔐 Verifying transaction: ${transactionHash}`);

      // Validate hash format
      if (!/^0x[a-fA-F0-9]{64}$/.test(transactionHash)) {
        throw new Error(`Invalid transaction hash format`);
      }

      // Get transaction
      const tx = await this.provider.getTransaction(transactionHash);
      if (!tx) {
        throw new Error('Transaction not found on blockchain');
      }

      // Get receipt
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

      console.log(`✅ Transaction verified successfully`);

      return {
        verified: true,
        transactionHash: transactionHash,
        blockNumber: receipt.blockNumber,
        confirmedAt: new Date().toISOString(),
        explorerLink: `https://sepolia.etherscan.io/tx/${transactionHash}`,
        gasUsed: receipt.gasUsed.toString()
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

  // ========== REQUEST TESTNET FAUCET ==========
  async requestTestnetFaucet() {
    try {
      console.log(`💧 To get testnet ETH for ${this.signer.address}:`);
      console.log('📱 Visit: https://www.infura.io/faucet/sepolia');
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

const blockchainService = new BlockchainService();

export default blockchainService;
