// /backend/controllers/blockchainController.js

import MedicalRecord from '../models/MedicalRecord.js';
import blockchainService from '../services/blockchainService.js';

// ========== CHECK RECORD BLOCKCHAIN STATUS ==========
export const checkRecordBlockchainStatus = async (req, res) => {
  try {
    const { recordId } = req.query;

    if (!recordId || recordId.length !== 24) {
      return res.status(400).json({ message: 'Invalid recordId' });
    }

    const record = await MedicalRecord.findById(recordId);
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // If still pending, return pending status
    if (record.blockchainStatus === 'pending' && !record.blockchainHash) {
      return res.json({
        status: 'pending',
        message: 'Record is being stored on blockchain...',
        recordId: record._id
      });
    }

    // If we have a hash, get transaction details
    if (record.blockchainHash) {
      try {
        await blockchainService.initialize();
        const txDetails = await blockchainService.getTransactionDetails(
          record.blockchainHash
        );

        return res.json({
          status: 'confirmed',
          message: 'Record successfully stored on blockchain',
          transaction: txDetails,
          recordId: record._id,
          explorerLink: `https://sepolia.etherscan.io/tx/${record.blockchainHash}`
        });

      } catch (txErr) {
        console.error('Error fetching transaction:', txErr);
        return res.json({
          status: 'failed',
          message: 'Could not verify blockchain status',
          blockchainHash: record.blockchainHash,
          recordId: record._id
        });
      }
    }

    // If status is failed
    if (record.blockchainStatus === 'failed') {
      return res.json({
        status: 'failed',
        message: 'Failed to store record on blockchain',
        recordId: record._id
      });
    }

  } catch (err) {
    console.error('Check blockchain status error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ========== GET DOCTOR'S BLOCKCHAIN ACCOUNT INFO ==========
export const getDoctorBlockchainInfo = async (req, res) => {
  try {
    const doctorId = req.userId; // From JWT

    await blockchainService.initialize();

    // Get account balance
    const balance = await blockchainService.getDoctorBalance();

    // Get count of records stored on blockchain by this doctor
    const recordCount = await MedicalRecord.countDocuments({
      doctorId: doctorId,
      blockchainStatus: 'confirmed'
    });

    res.json({
      account: {
        address: balance.address,
        balanceETH: balance.balanceETH,
        balanceWei: balance.balanceWei
      },
      records: {
        totalConfirmed: recordCount,
        explorerUrl: `https://sepolia.etherscan.io/address/${balance.address}`
      }
    });

  } catch (err) {
    console.error('Get blockchain info error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ========== VERIFY RECORD ON BLOCKCHAIN ==========
export const verifyRecordOnBlockchain = async (req, res) => {
  try {
    const { recordId } = req.body;

    if (!recordId || recordId.length !== 24) {
      return res.status(400).json({ message: 'Invalid recordId' });
    }

    const record = await MedicalRecord.findById(recordId);
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    if (!record.blockchainHash) {
      return res.status(400).json({
        message: 'Record not yet stored on blockchain'
      });
    }

    // Verify the transaction exists and is valid
    await blockchainService.initialize();
    const verificationResult = await blockchainService.verifyRecord(
      null, // metadata hash not needed for simple verification
      record.blockchainHash
    );

    res.json({
      verified: verificationResult.verified,
      recordId: record._id,
      verification: verificationResult
    });

  } catch (err) {
    console.error('Verify record error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ========== GET BLOCKCHAIN RECORDS FOR PATIENT ==========
export const getPatientBlockchainRecords = async (req, res) => {
  try {
    const { patientId } = req.query;
    const userId = req.userId; // From JWT

    if (!patientId || patientId.length !== 24) {
      return res.status(400).json({ message: 'Invalid patientId' });
    }

    // Verify access (patient or doctor with appointments)
    if (userId !== patientId) {
      const Appointment = (await import('../models/Appointment.js')).default;
      const hasAccess = await Appointment.findOne({
        doctorId: userId,
        patientId: patientId
      });

      if (!hasAccess) {
        return res.status(403).json({
          message: 'Unauthorized access'
        });
      }
    }

    // Get all blockchain-confirmed records for patient
    const records = await MedicalRecord.find({
      patientId: patientId,
      blockchainStatus: 'confirmed'
    })
      .populate('doctorId', 'name specialization')
      .sort({ createdAt: -1 });

    // Enrich with blockchain links
    const enrichedRecords = records.map(record => ({
      _id: record._id,
      type: record.type,
      description: record.description,
      fileName: record.originalFileName,
      fileUrl: record.fileUrl,
      doctor: record.doctorId,
      createdAt: record.createdAt,
      blockchain: {
        hash: record.blockchainHash,
        status: record.blockchainStatus,
        explorerLink: `https://sepolia.etherscan.io/tx/${record.blockchainHash}`
      }
    }));

    res.json({
      totalRecords: enrichedRecords.length,
      records: enrichedRecords
    });

  } catch (err) {
    console.error('Get blockchain records error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ========== REQUEST TESTNET FAUCET INFO ==========
export const getTestnetFaucetInfo = async (req, res) => {
  try {
    await blockchainService.initialize();
    const faucetInfo = await blockchainService.requestTestnetFaucet();

    res.json({
      message: 'To test blockchain functionality, you need Sepolia testnet ETH',
      doctorAddress: faucetInfo.address,
      faucets: faucetInfo.faucetUrls,
      instructions: [
        '1. Copy your doctor address above',
        '2. Visit one of the faucet URLs',
        '3. Paste your address and request test ETH',
        '4. Wait 1-2 minutes for confirmation',
        '5. Start uploading medical records!'
      ]
    });

  } catch (err) {
    console.error('Get faucet info error:', err);
    res.status(500).json({ message: err.message });
  }
};
