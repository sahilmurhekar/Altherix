// /frontend/src/pages/doctor/DoctorMedicalRecordsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  FileUp,
  Loader,
  AlertCircle,
  CheckCircle,
  XCircle,
  Download,
  Eye,
  ExternalLink,
  ChevronDown,
  User,
  Calendar,
  Stethoscope,
  Upload,
  X
} from 'lucide-react';

const DoctorMedicalRecordsPage = () => {
  // ========== STATE MANAGEMENT ==========

  // Search section
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Selected patient
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Upload section
  const [uploadData, setUploadData] = useState({
    type: 'test-analysis',
    description: '',
    file: null
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [blockchainStatus, setBlockchainStatus] = useState(null); // Track blockchain status

  // Polling for blockchain confirmation
  const [isPolling, setIsPolling] = useState(false);
  const [recordIdToCheck, setRecordIdToCheck] = useState(null);
  const [blockchainDetails, setBlockchainDetails] = useState(null);

  // ========== API BASE URL ==========
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
  const API_BASE_URL = `${SERVER_URL}/api`;
  const getToken = () => localStorage.getItem('token');

  // ========== SEARCH PATIENTS ==========
  const handleSearch = useCallback(async () => {
    if (!searchInput.trim()) {
      setSearchError('Please enter a patient name or ID');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);
    setHasSearched(true);

    try {
      const params = new URLSearchParams();

      // Check if input looks like MongoDB ID (24 hex characters)
      if (/^[a-f0-9]{24}$/i.test(searchInput)) {
        params.append('patientId', searchInput);
      } else {
        params.append('patientName', searchInput);
      }

      const response = await fetch(
        `${API_BASE_URL}/medical-records/search-patients?${params}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search patients');
      }

      const data = await response.json();
      setSearchResults(data.patients || []);

      if (data.patients.length === 0) {
        setSearchError('No patients found. Make sure you have appointments with them.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchError(err.message || 'Failed to search patients');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchInput, API_BASE_URL]);

  // Handle Enter key in search
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // ========== SELECT PATIENT ==========
  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setUploadError(null);
    setUploadSuccess(null);
  };

  // ========== DESELECT PATIENT & RESET ==========
  const handleResetSearch = () => {
    setSelectedPatient(null);
    setSearchInput('');
    setSearchResults([]);
    setHasSearched(false);
    setUploadData({ type: 'test-analysis', description: '', file: null });
    setUploadError(null);
    setUploadSuccess(null);
    setBlockchainStatus(null);
    setBlockchainDetails(null);
  };

  // ========== HANDLE FILE UPLOAD ==========
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size exceeds 5MB limit');
        return;
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg', 'image/png'];

      if (!allowedTypes.includes(file.type)) {
        setUploadError('Only PDF, DOC, DOCX, JPG, PNG files allowed');
        return;
      }

      setUploadData(prev => ({ ...prev, file }));
      setUploadError(null);
    }
  };

  // ========== UPLOAD MEDICAL RECORD ==========
  const handleUpload = async () => {
    // Validation
    if (!selectedPatient) {
      setUploadError('Please select a patient');
      return;
    }

    if (!uploadData.type) {
      setUploadError('Please select a document type');
      return;
    }

    if (!uploadData.file) {
      setUploadError('Please select a file');
      return;
    }

    if (!uploadData.description.trim()) {
      setUploadError('Please provide a description');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    setBlockchainStatus(null);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('patientId', selectedPatient._id);
      formData.append('type', uploadData.type);
      formData.append('description', uploadData.description);
      formData.append('file', uploadData.file);

      // Upload
      const response = await fetch(
        `${API_BASE_URL}/medical-records/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getToken()}`
          },
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await response.json();

      // Success!
      setUploadSuccess({
        message: data.message,
        record: data.record
      });

      // Start polling for blockchain confirmation
      setRecordIdToCheck(data.record.id);
      setBlockchainStatus('pending');

      // Reset form
      setUploadData({ type: 'test-analysis', description: '', file: null });

    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Failed to upload record');
    } finally {
      setIsUploading(false);
    }
  };

  // ========== POLL BLOCKCHAIN STATUS ==========
  useEffect(() => {
    if (!recordIdToCheck || !blockchainStatus) return;

    const pollBlockchain = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/medical-records/blockchain/status?recordId=${recordIdToCheck}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${getToken()}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) throw new Error('Failed to check status');

        const data = await response.json();

        if (data.status === 'confirmed') {
          setBlockchainStatus('confirmed');
          setBlockchainDetails(data);
          setIsPolling(false); // Stop polling
        } else if (data.status === 'failed') {
          setBlockchainStatus('failed');
          setIsPolling(false);
        }
        // If still pending, keep polling
      } catch (err) {
        console.error('Blockchain check error:', err);
      }
    };

    // Poll every 3 seconds
    if (blockchainStatus === 'pending') {
      setIsPolling(true);
      const interval = setInterval(pollBlockchain, 3000);
      return () => clearInterval(interval);
    }
  }, [recordIdToCheck, blockchainStatus, API_BASE_URL, getToken]);

  // ========== RENDER FUNCTIONS ==========

  // Render search results
  const renderSearchResults = () => {
    if (selectedPatient) return null;

    if (!hasSearched) return null;

    if (isSearching) {
      return (
        <div className="mt-6 bg-zinc-900/50 border border-zinc-700 rounded-xl p-8 text-center">
          <Loader className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-3" />
          <p className="text-zinc-400">Searching for patients...</p>
        </div>
      );
    }

    if (searchError) {
      return (
        <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-xl p-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400">{searchError}</p>
          </div>
        </div>
      );
    }

    if (searchResults.length === 0) {
      return (
        <div className="mt-6 bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-400 font-semibold">No results found</p>
              <p className="text-amber-300/80 text-sm mt-1">
                Make sure you have appointments with this patient
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-6 space-y-3">
        {searchResults.map((patient) => (
          <div
            key={patient._id}
            className="bg-zinc-900/50 border border-zinc-700 rounded-lg p-4 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                    {patient.name}
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs text-zinc-400 mt-2">
                  <div>
                    📧 {patient.email}
                  </div>
                  <div>
                    📱 {patient.phone}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Last: {patient.lastAppointmentDate || 'N/A'}
                  </div>
                  <div>
                    Total Appointments: {patient.appointmentCount}
                  </div>
                </div>
                {patient.bloodType && (
                  <div className="text-xs text-zinc-400 mt-2">
                    🩸 Blood Type: {patient.bloodType}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleSelectPatient(patient)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex-shrink-0 ml-4"
              >
                Select
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render upload section (only visible when patient selected)
  const renderUploadSection = () => {
    if (!selectedPatient) return null;

    return (
      <div className="mt-8 space-y-6">
        {/* Selected Patient Info */}
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center">
                <User className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Selected Patient</p>
                <p className="text-lg font-bold text-white">{selectedPatient.name}</p>
              </div>
            </div>
            <button
              onClick={handleResetSearch}
              className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-lg text-sm transition-colors"
            >
              Change Patient
            </button>
          </div>
        </div>

        {/* Upload Form */}
        <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-bold text-white">Upload Medical Record</h3>

          {/* Document Type */}
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-3">
              Document Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'test-analysis', label: 'Medical Test Analysis', desc: 'Lab reports, diagnostic results' },
                { value: 'doctor-analysis', label: 'Doctor Analysis', desc: 'Clinical assessment, notes' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setUploadData(prev => ({ ...prev, type: option.value }))}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    uploadData.type === option.value
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                  }`}
                >
                  <p className="font-semibold text-white">{option.label}</p>
                  <p className="text-xs text-zinc-400 mt-1">{option.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-2">
              Description
            </label>
            <textarea
              value={uploadData.description}
              onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter a brief description of this document..."
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:border-purple-500/50 outline-none transition-colors resize-none h-24"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-2">
              Select File
            </label>
            <div className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center hover:border-purple-500/50 transition-colors group cursor-pointer">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <Upload className="w-8 h-8 text-zinc-400 group-hover:text-purple-400 transition-colors mx-auto mb-2" />
                <p className="text-sm font-medium text-zinc-300">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  PDF, DOC, DOCX, JPG, PNG up to 5MB
                </p>
              </label>
            </div>
            {uploadData.file && (
              <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center justify-between">
                <span className="text-sm text-green-400">✓ {uploadData.file.name}</span>
                <button
                  onClick={() => setUploadData(prev => ({ ...prev, file: null }))}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={isUploading || !uploadData.file || !uploadData.description}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Record
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {uploadError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex gap-3">
            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{uploadError}</p>
          </div>
        )}

        {/* Success Message with Blockchain Status */}
        {uploadSuccess && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 space-y-4">
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-green-400 font-semibold">{uploadSuccess.message}</p>
                <p className="text-green-400/80 text-sm mt-1">
                  File: {uploadSuccess.record.fileName}
                </p>
              </div>
            </div>

            {/* Blockchain Status */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-400 mb-3">🔗 Blockchain Status</p>

              {blockchainStatus === 'pending' && (
                <div className="flex items-center gap-2">
                  <Loader className="w-4 h-4 text-blue-400 animate-spin" />
                  <p className="text-blue-400 text-sm">
                    Storing on Sepolia blockchain... (auto-updating)
                  </p>
                </div>
              )}

              {blockchainStatus === 'confirmed' && blockchainDetails && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <p className="text-green-400 text-sm font-semibold">
                      ✓ Successfully stored on blockchain!
                    </p>
                  </div>
                  <div className="mt-3 space-y-2 text-xs text-zinc-300">
                    <div>
                      <span className="text-zinc-400">Transaction Hash:</span>
                      <p className="font-mono text-blue-400 break-all">
                        {blockchainDetails.transaction.hash}
                      </p>
                    </div>
                    <div>
                      <span className="text-zinc-400">Block Number:</span>
                      <p className="text-white">{blockchainDetails.transaction.blockNumber}</p>
                    </div>
                    <div>
                      <span className="text-zinc-400">Gas Used:</span>
                      <p className="text-white">{blockchainDetails.transaction.gasUsed}</p>
                    </div>
                    <div>
                      <span className="text-zinc-400">Transaction Fee:</span>
                      <p className="text-white">{blockchainDetails.transaction.transactionFee} ETH</p>
                    </div>
                  </div>
                  <a
                    href={blockchainDetails.explorerLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 rounded-lg text-sm transition-colors border border-blue-500/30"
                  >
                    View on Etherscan
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {blockchainStatus === 'failed' && (
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <p className="text-red-400 text-sm">
                    Failed to store on blockchain. File is still saved locally.
                  </p>
                </div>
              )}
            </div>

            {/* Upload Another or Change Patient */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setUploadSuccess(null);
                  setBlockchainStatus(null);
                }}
                className="flex-1 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 hover:text-purple-300 rounded-lg text-sm font-medium transition-colors border border-purple-500/30"
              >
                Upload Another Record
              </button>
              <button
                onClick={handleResetSearch}
                className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Change Patient
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ========== MAIN RENDER ==========

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
          Attach Medical Records
        </h1>
        <p className="text-zinc-400">
          Upload medical documents for your patients with blockchain verification
        </p>
      </div>

      {/* Search Section */}
      <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-bold text-white">Find Patient</h2>

        <div className="flex gap-3">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            placeholder="Enter patient name or ID..."
            className="flex-1 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:border-blue-500/50 outline-none transition-colors"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Search Results */}
        {renderSearchResults()}
      </div>

      {/* Upload Section */}
      {renderUploadSection()}
    </div>
  );
};

export default DoctorMedicalRecordsPage;
