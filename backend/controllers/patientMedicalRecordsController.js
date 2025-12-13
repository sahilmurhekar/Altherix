// ============ controllers/patientMedicalRecordsController.js (NEW) ============

import MedicalRecord from '../models/MedicalRecord.js';
import BlockchainTransaction from '../models/BlockchainTransaction.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

// ========== GET ALL MEDICAL RECORDS FOR PATIENT ==========
export const getPatientMedicalRecords = async (req, res) => {
  try {
    const patientId = req.userId; // From JWT
    const { status, type, sortBy } = req.query;

    // Build filter
    const filter = { patientId };

    if (status && ['pending', 'confirmed', 'failed'].includes(status)) {
      filter.blockchainStatus = status;
    }

    if (type && ['test-analysis', 'doctor-analysis'].includes(type)) {
      filter.type = type;
    }

    // Determine sort order
    let sortOptions = { createdAt: -1 }; // Default: newest first
    if (sortBy === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sortBy === 'alphabetical') {
      sortOptions = { originalFileName: 1 };
    }

    // Get records
    const records = await MedicalRecord.find(filter)
      .populate('doctorId', 'name specialization email phone')
      .sort(sortOptions)
      .lean();

    // Enrich records with blockchain details
    const enrichedRecords = records.map(record => ({
      _id: record._id,
      fileName: record.originalFileName,
      type: record.type,
      description: record.description,
      fileSize: record.fileSize,
      fileUrl: record.fileUrl,
      doctor: {
        id: record.doctorId._id,
        name: record.doctorId.name,
        specialization: record.doctorId.specialization,
        email: record.doctorId.email,
        phone: record.doctorId.phone
      },
      createdAt: record.createdAt,
      blockchain: {
        status: record.blockchainStatus,
        hash: record.blockchainHash,
        metadataHash: record.metadataHash,
        transaction: record.blockchainTx ? {
          hash: record.blockchainTx.transactionHash,
          blockNumber: record.blockchainTx.blockNumber,
          gasUsed: record.blockchainTx.gasUsed,
          gasPrice: record.blockchainTx.gasPrice,
          transactionFee: record.blockchainTx.transactionFee,
          confirmations: record.blockchainTx.confirmations,
          confirmedAt: record.blockchainTx.confirmedAt,
          status: record.blockchainTx.status,
          explorerLink: record.blockchainTx.explorerLink
        } : null
      },
      verified: record.verified
    }));

    // Group by status for easier frontend rendering
    const grouped = {
      confirmed: enrichedRecords.filter(r => r.blockchain.status === 'confirmed'),
      pending: enrichedRecords.filter(r => r.blockchain.status === 'pending'),
      failed: enrichedRecords.filter(r => r.blockchain.status === 'failed')
    };

    res.json({
      total: records.length,
      records: enrichedRecords,
      grouped: grouped,
      summary: {
        totalConfirmed: grouped.confirmed.length,
        totalPending: grouped.pending.length,
        totalFailed: grouped.failed.length
      }
    });

  } catch (err) {
    console.error('Get patient records error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ========== GET SINGLE RECORD DETAILS ==========
export const getRecordDetails = async (req, res) => {
  try {
    const { recordId } = req.params;
    const patientId = req.userId;

    // Validate recordId
    if (!recordId || recordId.length !== 24) {
      return res.status(400).json({ message: 'Invalid recordId' });
    }

    // Get record and verify patient owns it
    const record = await MedicalRecord.findOne({
      _id: recordId,
      patientId: patientId
    })
      .populate('doctorId', 'name specialization email phone')
      .populate('appointmentId', 'appointmentDate appointmentTime reasonForVisit');

    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // Get blockchain transaction if exists
    let blockchainTx = null;
    if (record.blockchainHash) {
      blockchainTx = await BlockchainTransaction.findOne({
        recordId: recordId
      }).lean();
    }

    res.json({
      record: {
        _id: record._id,
        fileName: record.originalFileName,
        type: record.type,
        description: record.description,
        fileSize: record.fileSize,
        fileUrl: record.fileUrl,
        doctor: {
          id: record.doctorId._id,
          name: record.doctorId.name,
          specialization: record.doctorId.specialization,
          email: record.doctorId.email,
          phone: record.doctorId.phone
        },
        appointment: record.appointmentId ? {
          date: record.appointmentId.appointmentDate,
          time: record.appointmentId.appointmentTime,
          reason: record.appointmentId.reasonForVisit
        } : null,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        verified: record.verified,
        doctorNotes: record.doctorNotes,
        blockchain: {
          status: record.blockchainStatus,
          hash: record.blockchainHash,
          metadataHash: record.metadataHash,
          transaction: record.blockchainTx ? {
            hash: record.blockchainTx.transactionHash,
            blockNumber: record.blockchainTx.blockNumber,
            gasUsed: record.blockchainTx.gasUsed,
            gasPrice: record.blockchainTx.gasPrice,
            transactionFee: record.blockchainTx.transactionFee,
            confirmations: record.blockchainTx.confirmations,
            confirmedAt: record.blockchainTx.confirmedAt,
            status: record.blockchainTx.status,
            explorerLink: record.blockchainTx.explorerLink
          } : null,
          fullTransaction: blockchainTx
        }
      }
    });

  } catch (err) {
    console.error('Get record details error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ========== GET BLOCKCHAIN RECORD STATUS ==========
export const getRecordBlockchainStatus = async (req, res) => {
  try {
    const { recordId } = req.params;
    const patientId = req.userId;

    if (!recordId || recordId.length !== 24) {
      return res.status(400).json({ message: 'Invalid recordId' });
    }

    // Verify patient owns this record
    const record = await MedicalRecord.findOne({
      _id: recordId,
      patientId: patientId
    }).select('blockchainStatus blockchainHash blockchainTx');

    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // If pending, return pending status
    if (record.blockchainStatus === 'pending') {
      return res.json({
        status: 'pending',
        message: 'Record is being stored on blockchain...',
        recordId: recordId
      });
    }

    // If confirmed, return full details
    if (record.blockchainStatus === 'confirmed' && record.blockchainTx) {
      return res.json({
        status: 'confirmed',
        message: 'Record successfully stored on blockchain',
        recordId: recordId,
        transaction: {
          hash: record.blockchainTx.transactionHash,
          blockNumber: record.blockchainTx.blockNumber,
          gasUsed: record.blockchainTx.gasUsed,
          gasPrice: record.blockchainTx.gasPrice,
          transactionFee: record.blockchainTx.transactionFee,
          confirmations: record.blockchainTx.confirmations,
          confirmedAt: record.blockchainTx.confirmedAt,
          status: record.blockchainTx.status,
          explorerLink: record.blockchainTx.explorerLink
        }
      });
    }

    // If failed
    if (record.blockchainStatus === 'failed') {
      return res.json({
        status: 'failed',
        message: 'Failed to store record on blockchain',
        recordId: recordId,
        hash: record.blockchainHash
      });
    }

  } catch (err) {
    console.error('Get blockchain status error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ========== DOWNLOAD MEDICAL RECORD ==========
export const downloadMedicalRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const patientId = req.userId;

    if (!recordId || recordId.length !== 24) {
      return res.status(400).json({ message: 'Invalid recordId' });
    }

    // Verify patient owns this record
    const record = await MedicalRecord.findOne({
      _id: recordId,
      patientId: patientId
    }).select('fileUrl originalFileName');

    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // Return file URL (frontend will download directly from Cloudinary)
    res.json({
      fileName: record.originalFileName,
      fileUrl: record.fileUrl,
      downloadUrl: record.fileUrl // Cloudinary URL supports direct download
    });

  } catch (err) {
    console.error('Download record error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ========== GET BLOCKCHAIN STATISTICS FOR PATIENT ==========
export const getPatientBlockchainStats = async (req, res) => {
  try {
    const patientId = req.userId;

    // Count records by blockchain status
    const stats = await MedicalRecord.aggregate([
      { $match: { patientId: new mongoose.Types.ObjectId(patientId) } },
      {
        $group: {
          _id: '$blockchainStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const statsObject = {
      totalRecords: 0,
      confirmed: 0,
      pending: 0,
      failed: 0
    };

    stats.forEach(stat => {
      if (stat._id === 'confirmed') statsObject.confirmed = stat.count;
      if (stat._id === 'pending') statsObject.pending = stat.count;
      if (stat._id === 'failed') statsObject.failed = stat.count;
      statsObject.totalRecords += stat.count;
    });

    // Get total gas spent on blockchain transactions
    const gasStats = await BlockchainTransaction.aggregate([
      {
        $match: {
          patientId: new mongoose.Types.ObjectId(patientId),
          status: 'success'
        }
      },
      {
        $group: {
          _id: null,
          totalGasUsed: { $sum: { $toInt: '$gasUsed' } },
          totalTransactionFee: { $push: '$transactionFee' },
          count: { $sum: 1 }
        }
      }
    ]);

    const gasInfo = gasStats[0] ? {
      totalTransactions: gasStats[0].count,
      totalGasUsed: gasStats[0].totalGasUsed,
      averageGasPerTransaction: Math.round(gasStats[0].totalGasUsed / gasStats[0].count)
    } : {
      totalTransactions: 0,
      totalGasUsed: 0,
      averageGasPerTransaction: 0
    };

    res.json({
      blockchainStatus: statsObject,
      gasStatistics: gasInfo
    });

  } catch (err) {
    console.error('Get blockchain stats error:', err);
    res.status(500).json({ message: err.message });
  }
};
