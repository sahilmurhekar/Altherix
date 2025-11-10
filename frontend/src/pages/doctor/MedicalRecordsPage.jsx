// /frontend/src/pages/doctor/MedicalRecordsPage.jsx

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Upload,
  Loader,
  AlertCircle,
  Shield,
  Calendar,
  User,
  Lock,
  X,
  Plus,
  BarChart3,
  Pill,
  Eye,
  Share2
} from 'lucide-react';

const DoctorMedicalRecordsPage = () => {
  const [records, setRecords] = useState({
    medical: [],
    analysis: [],
    prescriptions: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('medical');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    patient: '',
    type: 'medical',
    description: '',
    file: null
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setRecords({
        medical: [
          {
            id: 1,
            patient: 'Rajesh Singh',
            name: 'Blood Test Report',
            type: 'diagnostic',
            uploadedDate: '2024-03-15',
            description: 'Complete blood count and biochemistry report',
            blockchainHash: '0x7f...8c9a',
            verified: true,
            file: 'blood_test_15_03_2024.pdf'
          },
          {
            id: 2,
            patient: 'Priya Sharma',
            name: 'ECG Report',
            type: 'diagnostic',
            uploadedDate: '2024-03-10',
            description: 'Electrocardiogram report',
            blockchainHash: '0x9d...2e5b',
            verified: true,
            file: 'ecg_report_10_03_2024.pdf'
          }
        ],
        analysis: [
          {
            id: 3,
            patient: 'Amit Patel',
            name: 'AI Analysis - Blood Report',
            type: 'analysis',
            uploadedDate: '2024-03-16',
            description: 'Automated analysis and key findings from blood test',
            blockchainHash: '0x3c...7f4d',
            verified: true,
            findings: ['Hemoglobin slightly low', 'Glucose levels normal'],
            riskFactors: ['Anemia risk'],
            recommendations: ['Iron supplement recommended', 'Increase iron-rich food']
          }
        ],
        prescriptions: [
          {
            id: 4,
            patient: 'Neha Sharma',
            name: 'Prescription - Cardiology Checkup',
            type: 'prescription',
            uploadedDate: '2024-03-15',
            description: 'Medications and health recommendations',
            blockchainHash: '0x5b...9e1c',
            verified: true,
            medicines: [
              { name: 'Aspirin', dosage: '75mg', frequency: 'Once daily', duration: '30 days' },
              { name: 'Lisinopril', dosage: '5mg', frequency: 'Once daily', duration: '60 days' }
            ],
            expiryDate: '2024-06-15'
          }
        ]
      });
      setLoading(false);
    }, 500);
  }, []);

  const patients = ['Rajesh Singh', 'Priya Sharma', 'Amit Patel', 'Neha Sharma'];

  const recordTypes = {
    medical: { label: 'Medical Reports', icon: FileText, color: 'text-blue-400' },
    analysis: { label: 'AI Analysis', icon: BarChart3, color: 'text-purple-400' },
    prescriptions: { label: 'Prescriptions', icon: Pill, color: 'text-red-400' }
  };

  const currentRecords = records[activeTab] || [];

  const handleUpload = async () => {
    if (!uploadData.patient || !uploadData.type || !uploadData.file) {
      alert('Please fill all fields and select a file');
      return;
    }

    try {
      setUploading(true);
      // Simulate API call
      setTimeout(() => {
        const newRecord = {
          id: Math.max(...Object.values(records).flat().map(r => r.id), 0) + 1,
          patient: uploadData.patient,
          name: uploadData.file.name,
          type: uploadData.type,
          uploadedDate: new Date().toISOString().split('T')[0],
          description: uploadData.description,
          blockchainHash: '0x' + Math.random().toString(16).slice(2, 10),
          verified: false
        };

        setRecords(prev => ({
          ...prev,
          [uploadData.type]: [...prev[uploadData.type], newRecord]
        }));

        setShowUploadModal(false);
        setUploadData({ patient: '', type: 'medical', description: '', file: null });
        setUploading(false);
        alert('Record uploaded successfully!');
      }, 1000);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload record');
      setUploading(false);
    }
  };

  const RecordCard = ({ record }) => (
    <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
              {record.name}
            </h3>
          </div>
          <p className="text-sm text-zinc-400">{record.description}</p>
        </div>
        {record.verified && (
          <div className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full border border-green-500/30 flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Verified
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs mb-4">
        <div className="flex items-center gap-2 text-zinc-400">
          <Calendar className="w-4 h-4 text-cyan-400" />
          {new Date(record.uploadedDate).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-2 text-zinc-400">
          <User className="w-4 h-4 text-orange-400" />
          {record.patient}
        </div>
      </div>

      {/* AI Analysis Specific */}
      {record.type === 'analysis' && record.findings && (
        <div className="bg-zinc-800/30 rounded-lg p-3 mb-4 space-y-2">
          <p className="text-xs font-semibold text-purple-400">Key Findings:</p>
          <ul className="text-xs text-zinc-300 space-y-1">
            {record.findings.map((finding, idx) => (
              <li key={idx}>• {finding}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Prescriptions Specific */}
      {record.type === 'prescription' && record.medicines && (
        <div className="bg-zinc-800/30 rounded-lg p-3 mb-4 space-y-2">
          <p className="text-xs font-semibold text-red-400">Medicines:</p>
          <div className="space-y-1 text-xs text-zinc-300">
            {record.medicines.map((med, idx) => (
              <div key={idx} className="flex justify-between">
                <span>{med.name} - {med.dosage}</span>
                <span className="text-zinc-500">{med.frequency}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blockchain Info */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4 flex items-center gap-2">
        <Lock className="w-4 h-4 text-blue-400 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-xs text-blue-400 font-semibold">Blockchain Hash</p>
          <p className="text-xs text-zinc-400 truncate font-mono">{record.blockchainHash}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-blue-500/30">
          <Eye className="w-4 h-4" />
          View
        </button>
        <button className="flex-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 hover:text-green-300 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-green-500/30">
          <Download className="w-4 h-4" />
          Download
        </button>
        <button className="flex-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 hover:text-purple-300 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-purple-500/30">
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
          Medical Records
        </h1>
        <p className="text-zinc-400">Upload and manage patient medical documents</p>
      </div>

      {/* Upload Button */}
      <button
        onClick={() => setShowUploadModal(true)}
        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-green-500/50 flex items-center gap-2"
      >
        <Upload className="w-5 h-5" />
        Upload New Record
      </button>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-zinc-700 overflow-x-auto">
        {Object.entries(recordTypes).map(([key, { label, icon: Icon }]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-3 font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === key
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label} ({currentRecords.length})
          </button>
        ))}
      </div>

      {/* Records Grid */}
      {currentRecords.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentRecords.map((record) => (
            <RecordCard key={record.id} record={record} />
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-12 text-center">
          <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
          <p className="text-lg font-semibold text-white mb-2">No records found</p>
          <p className="text-zinc-400">Upload your first medical record to get started</p>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center justify-between">
              <span>Upload Medical Record</span>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </h2>

            <div className="space-y-4">
              {/* Patient Selection */}
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">
                  Select Patient
                </label>
                <select
                  value={uploadData.patient}
                  onChange={(e) => setUploadData({ ...uploadData, patient: e.target.value })}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm focus:border-green-500/50 outline-none transition-colors"
                >
                  <option value="">Choose patient...</option>
                  {patients.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Record Type */}
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">
                  Record Type
                </label>
                <select
                  value={uploadData.type}
                  onChange={(e) => setUploadData({ ...uploadData, type: e.target.value })}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm focus:border-green-500/50 outline-none transition-colors"
                >
                  <option value="medical">Medical Report</option>
                  <option value="analysis">Analysis Report</option>
                  <option value="prescriptions">Prescription</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">
                  Description
                </label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, description: e.target.value })
                  }
                  placeholder="Enter description..."
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:border-green-500/50 outline-none transition-colors resize-none h-20"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">
                  Upload File
                </label>
                <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center hover:border-green-500/50 transition-colors cursor-pointer group">
                  <Upload className="w-8 h-8 text-zinc-400 group-hover:text-green-400 transition-colors mx-auto mb-2" />
                  <p className="text-sm text-zinc-400">Click to upload or drag and drop</p>
                  <p className="text-xs text-zinc-500 mt-1">PDF, DOC, JPG up to 5MB</p>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) =>
                      setUploadData({ ...uploadData, file: e.target.files?.[0] || null })
                    }
                  />
                </div>
                {uploadData.file && (
                  <p className="text-xs text-green-400 mt-2">✓ {uploadData.file.name}</p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorMedicalRecordsPage;
