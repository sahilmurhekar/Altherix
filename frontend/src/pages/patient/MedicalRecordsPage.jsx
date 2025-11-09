// /frontend/src/pages/patient/MedicalRecordsPage.jsx

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Share2,
  Eye,
  Upload,
  Loader,
  AlertCircle,
  Shield,
  Calendar,
  User,
  Lock,
  BarChart3,
  Pill
} from 'lucide-react';

const MedicalRecordsPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('medical');
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      const mockRecords = {
        medical: [
          {
            id: 1,
            name: 'Blood Test Report',
            type: 'diagnostic',
            uploadedDate: '2024-03-15',
            doctor: 'Dr. Rajesh Kumar',
            description: 'Complete blood count and biochemistry report',
            blockchainHash: '0x7f...8c9a',
            verified: true,
            file: 'blood_test_15_03_2024.pdf'
          },
          {
            id: 2,
            name: 'ECG Report',
            type: 'diagnostic',
            uploadedDate: '2024-03-10',
            doctor: 'Dr. Rajesh Kumar',
            description: 'Electrocardiogram report',
            blockchainHash: '0x9d...2e5b',
            verified: true,
            file: 'ecg_report_10_03_2024.pdf'
          }
        ],
        analysis: [
          {
            id: 3,
            name: 'AI Analysis - Blood Report',
            type: 'analysis',
            uploadedDate: '2024-03-16',
            doctor: 'AI System',
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
            name: 'Prescription - Cardiology Checkup',
            type: 'prescription',
            uploadedDate: '2024-03-15',
            doctor: 'Dr. Rajesh Kumar',
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
      };
      setRecords(mockRecords);
      setLoading(false);
    }, 500);
  }, []);

  const recordTypes = {
    medical: { label: 'Medical Reports', icon: FileText, color: 'text-blue-400' },
    analysis: { label: 'AI Analysis', icon: BarChart3, color: 'text-purple-400' },
    prescriptions: { label: 'Prescriptions', icon: Pill, color: 'text-red-400' }
  };

  const currentRecords = records[activeTab] || [];

  const UploadModal = ({ onClose }) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Upload Medical Record</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-2">Document Type</label>
            <select className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm focus:border-purple-500/50 outline-none transition-colors">
              <option>Medical Report</option>
              <option>Lab Report</option>
              <option>Prescription</option>
              <option>Scan/Imaging</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-2">Description</label>
            <textarea
              placeholder="Enter description of the document..."
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm placeholder-zinc-500 focus:border-purple-500/50 outline-none transition-colors resize-none h-24"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-2">Upload File</label>
            <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center hover:border-purple-500/50 transition-colors cursor-pointer group">
              <Upload className="w-8 h-8 text-zinc-400 group-hover:text-purple-400 transition-colors mx-auto mb-2" />
              <p className="text-sm text-zinc-400">Click to upload or drag and drop</p>
              <p className="text-xs text-zinc-500 mt-1">PDF, DOC, JPG up to 5MB</p>
              <input type="file" className="hidden" />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition-colors">
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const RecordCard = ({ record }) => (
    <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">{record.name}</h3>
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
          {record.doctor}
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
      <div className="bg-gradient-to-r from-orange-500/10 to-blue-500/10 border border-orange-500/30 rounded-2xl p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent mb-2">
          Medical Records
        </h1>
        <p className="text-zinc-400">Access your blockchain-secured medical documents</p>
      </div>

      {/* Upload Button */}
      <button
        onClick={() => setShowUploadModal(true)}
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50 flex items-center gap-2"
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
            {label} ({(records[key] || []).length})
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
        <UploadModal onClose={() => setShowUploadModal(false)} />
      )}
    </div>
  );
};

export default MedicalRecordsPage;
