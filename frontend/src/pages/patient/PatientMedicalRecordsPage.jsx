import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Download,
  Eye,
  ExternalLink,
  Loader,
  AlertCircle,
  CheckCircle,
  XCircle,
  Filter,
  ChevronDown,
  User,
  Calendar,
  Stethoscope,
  TrendingUp,
  Clock,
  RefreshCw
} from 'lucide-react';

const PatientMedicalRecordsPage = () => {
  // ========== STATE MANAGEMENT ==========
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    totalRecords: 0,
    confirmed: 0,
    pending: 0,
    failed: 0
  });

  // ========== API CONFIG ==========
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
  const API_BASE_URL = `${SERVER_URL}/api`;
  const getToken = () => localStorage.getItem('token');

  // ========== FETCH RECORDS (Manual - no auto-polling) ==========
  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getToken();

      // Build query params
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterType !== 'all') params.append('type', filterType);
      params.append('sortBy', sortBy);

      const response = await fetch(
        `${API_BASE_URL}/patient/medical-records?${params}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch records');
      }

      const data = await response.json();
      setRecords(data.records || []);
      setStats(data.summary || {
        totalRecords: 0,
        confirmed: 0,
        pending: 0,
        failed: 0
      });

      // Apply search filter locally
      const filtered = (data.records || []).filter(record =>
        record.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.doctor.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRecords(filtered);

    } catch (err) {
      console.error('Fetch records error:', err);
      setError(err.message || 'Failed to load medical records');
      setRecords([]);
      setFilteredRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, filterType, sortBy, searchQuery, API_BASE_URL]);

  // Only fetch on mount
  useEffect(() => {
    fetchRecords();
  }, []);

  // ========== DOWNLOAD RECORD ==========
  const handleDownload = async (recordId, fileName) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/patient/medical-records/${recordId}/download`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
        }
      );

      if (!response.ok) throw new Error('Download failed');

      const data = await response.json();
      window.open(data.fileUrl, '_blank');
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download file');
    }
  };

  // ========== VIEW DETAILS ==========
  const handleViewDetails = async (recordId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/patient/medical-records/${recordId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch details');

      const data = await response.json();
      setSelectedRecord(data.record);
      setShowModal(true);
    } catch (err) {
      console.error('View details error:', err);
      alert('Failed to load record details');
    }
  };

  // ========== STATUS BADGE ==========
  const StatusBadge = ({ status }) => {
    const styles = {
      confirmed: 'bg-green-500/10 border border-green-500/30 text-green-400',
      pending: 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400',
      failed: 'bg-red-500/10 border border-red-500/30 text-red-400'
    };

    const icons = {
      confirmed: <CheckCircle className="w-4 h-4" />,
      pending: <Clock className="w-4 h-4" />,
      failed: <XCircle className="w-4 h-4" />
    };

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    );
  };

  // ========== RECORD CARD ==========
  const RecordCard = ({ record }) => {
    const isConfirmed = record.blockchain.status === 'confirmed';
    const isPending = record.blockchain.status === 'pending';

    return (
      <div className="bg-zinc-900/50 border border-zinc-700 rounded-lg p-5 hover:border-purple-500/50 transition-all duration-300 group">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
              <FileText className="w-6 h-6 text-purple-400" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <h3 className="font-semibold text-white truncate group-hover:text-purple-400 transition-colors">
                  {record.fileName}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  {record.type === 'test-analysis' ? '🧪 Medical Test' : '📋 Doctor Analysis'}
                </p>
              </div>
              <StatusBadge status={record.blockchain.status} />
            </div>

            {/* Description */}
            {record.description && (
              <p className="text-sm text-zinc-400 mb-3 line-clamp-2">
                {record.description}
              </p>
            )}

            {/* Doctor & Date */}
            <div className="grid grid-cols-2 gap-3 mb-4 text-xs text-zinc-400">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{record.doctor.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(record.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Blockchain Info */}
            <div className="bg-zinc-800/50 rounded-lg p-3 mb-3 text-xs">
              {isConfirmed ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-semibold">✓ Stored on Blockchain</span>
                  </div>
                  <div className="text-zinc-400 space-y-1">
                    <div>
                      <span className="text-zinc-500">Block:</span> {record.blockchain.transaction.blockNumber}
                    </div>
                    <div>
                      <span className="text-zinc-500">Gas:</span> {record.blockchain.transaction.gasUsed}
                    </div>
                    <div>
                      <span className="text-zinc-500">Fee:</span> {record.blockchain.transaction.transactionFee} ETH
                    </div>
                  </div>
                </div>
              ) : isPending ? (
                <div className="flex items-center gap-2 text-yellow-400">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Being stored on blockchain...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-400">
                  <XCircle className="w-4 h-4" />
                  <span>Failed to store on blockchain</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleViewDetails(record._id)}
                className="flex-1 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2 border border-blue-500/30"
              >
                <Eye className="w-4 h-4" />
                View Details
              </button>
              <button
                onClick={() => handleDownload(record._id, record.fileName)}
                className="px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 hover:text-purple-300 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2 border border-purple-500/30"
              >
                <Download className="w-4 h-4" />
              </button>
              {isConfirmed && record.blockchain.transaction.explorerLink && (
                <a
                  href={record.blockchain.transaction.explorerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 hover:text-cyan-300 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2 border border-cyan-500/30"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ========== DETAIL MODAL ==========
  const DetailModal = () => {
    if (!showModal || !selectedRecord) return null;

    const tx = selectedRecord.blockchain.transaction;

    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-zinc-700 p-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">{selectedRecord.fileName}</h2>
            <button
              onClick={() => setShowModal(false)}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-300 mb-3">📋 Document Information</h3>
              <div className="bg-zinc-800/50 rounded-lg p-4 space-y-2 text-sm text-zinc-300">
                <div>
                  <span className="text-zinc-500">Type:</span> {selectedRecord.type === 'test-analysis' ? '🧪 Medical Test' : '📋 Doctor Analysis'}
                </div>
                <div>
                  <span className="text-zinc-500">File Size:</span> {(selectedRecord.fileSize / 1024).toFixed(2)} KB
                </div>
                <div>
                  <span className="text-zinc-500">Uploaded:</span> {new Date(selectedRecord.createdAt).toLocaleString()}
                </div>
                {selectedRecord.description && (
                  <div>
                    <span className="text-zinc-500">Description:</span> {selectedRecord.description}
                  </div>
                )}
              </div>
            </div>

            {/* Doctor Info */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-300 mb-3">👨‍⚕️ Doctor Information</h3>
              <div className="bg-zinc-800/50 rounded-lg p-4 space-y-2 text-sm text-zinc-300">
                <div>
                  <span className="text-zinc-500">Name:</span> {selectedRecord.doctor.name}
                </div>
                <div>
                  <span className="text-zinc-500">Specialization:</span> {selectedRecord.doctor.specialization || 'N/A'}
                </div>
                <div>
                  <span className="text-zinc-500">Email:</span> {selectedRecord.doctor.email}
                </div>
                <div>
                  <span className="text-zinc-500">Phone:</span> {selectedRecord.doctor.phone}
                </div>
              </div>
            </div>

            {/* Blockchain Info */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-300 mb-3">⛓️ Blockchain Details</h3>
              {tx ? (
                <div className="bg-zinc-800/50 rounded-lg p-4 space-y-3 text-sm text-zinc-300">
                  <div className="flex items-center gap-2 text-green-400 font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    Successfully Stored on Blockchain
                  </div>
                  <div className="border-t border-zinc-700 pt-3 space-y-2">
                    <div>
                      <span className="text-zinc-500">Transaction Hash:</span>
                      <p className="font-mono text-blue-400 break-all text-xs mt-1">{tx.hash}</p>
                    </div>
                    <div>
                      <span className="text-zinc-500">Block Number:</span> {tx.blockNumber}
                    </div>
                    <div>
                      <span className="text-zinc-500">Confirmations:</span> {tx.confirmations}
                    </div>
                    <div>
                      <span className="text-zinc-500">Gas Used:</span> {tx.gasUsed}
                    </div>
                    <div>
                      <span className="text-zinc-500">Gas Price:</span> {tx.gasPrice} Gwei
                    </div>
                    <div>
                      <span className="text-zinc-500">Transaction Fee:</span> {tx.transactionFee} ETH
                    </div>
                    <div>
                      <span className="text-zinc-500">Confirmed At:</span> {new Date(tx.confirmedAt).toLocaleString()}
                    </div>
                  </div>
                  {tx.explorerLink && (
                    <a
                      href={tx.explorerLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 rounded-lg text-xs font-medium transition-colors border border-cyan-500/30 mt-3"
                    >
                      View on Etherscan
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ) : (
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <p className="text-yellow-400 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Pending blockchain confirmation...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ========== MAIN RENDER ==========

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Medical Records
            </h1>
            <p className="text-zinc-400">
              View and download all your medical records stored on blockchain
            </p>
          </div>
          <button
            onClick={() => fetchRecords()}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-all flex items-center gap-2 flex-shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.totalRecords, color: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
          { label: 'Confirmed', value: stats.confirmed, color: 'bg-green-500/10 border-green-500/30 text-green-400' },
          { label: 'Pending', value: stats.pending, color: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' },
          { label: 'Failed', value: stats.failed, color: 'bg-red-500/10 border-red-500/30 text-red-400' }
        ].map((stat, idx) => (
          <div key={idx} className={`border rounded-lg p-4 ${stat.color}`}>
            <p className="text-xs font-semibold mb-1">{stat.label}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters & Search
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by file name or doctor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:border-purple-500/50 outline-none transition-colors"
          />

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-purple-500/50 outline-none transition-colors"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-purple-500/50 outline-none transition-colors"
          >
            <option value="all">All Types</option>
            <option value="test-analysis">Medical Test</option>
            <option value="doctor-analysis">Doctor Analysis</option>
          </select>
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-purple-500/50 outline-none transition-colors w-full md:w-48"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="alphabetical">Alphabetical</option>
        </select>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-12 text-center">
          <Loader className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-3" />
          <p className="text-zinc-400">Loading your medical records...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredRecords.length === 0 && (
        <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-12 text-center">
          <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400">No medical records found</p>
        </div>
      )}

      {/* Records List */}
      {!isLoading && !error && filteredRecords.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">
            Showing {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''}
          </h2>
          <div className="space-y-3">
            {filteredRecords.map((record) => (
              <RecordCard key={record._id} record={record} />
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <DetailModal />
    </div>
  );
};

export default PatientMedicalRecordsPage;
