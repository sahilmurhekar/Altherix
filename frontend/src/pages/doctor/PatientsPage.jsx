import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  Loader,
  Search,
  Eye,
  FileText,
  TrendingUp,
  Activity,
  X,
  Download,
  Shield,
  AlertTriangle,
  Pill,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
const API_BASE_URL = `${SERVER_URL}/api`;

const DoctorPatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [patientRecords, setPatientRecords] = useState([]);
  const [patientPrescriptions, setPatientPrescriptions] = useState([]);
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState(null);
  const [activeTab, setActiveTab] = useState('history'); // 'history', 'records', or 'prescriptions'

  // Get auth token from localStorage
  const getAuthToken = () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) {
      setError('Authentication token not found. Please log in again.');
      setLoading(false);
      return null;
    }
    return token;
  };

  // Fetch patients with appointments
  const fetchPatients = async (query = '') => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      if (!token) return;

      const params = new URLSearchParams();
      if (query) {
        params.append('patientName', query);
      }

      const response = await fetch(
        `${API_BASE_URL}/medical-records/search-patients?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPatients(data.patients || []);
      setFilteredPatients(data.patients || []);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError(err.message || 'Failed to fetch patients');
      setPatients([]);
      setFilteredPatients([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch appointment history
  const fetchAppointmentHistory = async (patientId) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(
        `${API_BASE_URL}/appointments/history/${patientId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAppointmentHistory(data.appointments || []);
    } catch (err) {
      console.error('Error fetching appointment history:', err);
      setDataError(err.message || 'Failed to fetch appointment history');
      setAppointmentHistory([]);
    }
  };

  // Fetch medical records
  const fetchPatientRecords = async (patientId) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(
        `${API_BASE_URL}/medical-records/patient?patientId=${patientId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPatientRecords(data.records || []);
    } catch (err) {
      console.error('Error fetching patient records:', err);
      setDataError(err.message || 'Failed to fetch medical records');
      setPatientRecords([]);
    }
  };

  // Fetch all patient data
  const fetchAllPatientData = async (patientId) => {
    try {
      setLoadingData(true);
      setDataError(null);

      await Promise.all([
        fetchAppointmentHistory(patientId),
        fetchPatientRecords(patientId)
      ]);

      // TODO: Fetch prescriptions when endpoint is ready
      // await fetchPatientPrescriptions(patientId);
    } catch (err) {
      console.error('Error fetching patient data:', err);
      setDataError('Failed to fetch patient data');
    } finally {
      setLoadingData(false);
    }
  };

  // Initial load - fetch patients on component mount
  useEffect(() => {
    fetchPatients();
  }, []);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length > 0) {
        fetchPatients(searchTerm);
      } else {
        fetchPatients();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load all data when patient is selected
  useEffect(() => {
    if (selectedPatient && showModal) {
      fetchAllPatientData(selectedPatient._id);
      setActiveTab('history'); // Reset to history tab
    }
  }, [selectedPatient, showModal]);

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: Clock },
      confirmed: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: CheckCircle },
      completed: { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle },
      cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`px-2 py-1 text-xs rounded-full font-semibold flex items-center gap-1 ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Appointment History Tab
  const AppointmentHistoryTab = () => (
    <div>
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        Emergency Appointment History
      </h3>

      {loadingData ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 text-purple-400 animate-spin" />
        </div>
      ) : dataError ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-semibold text-sm">Error loading history</p>
            <p className="text-red-300 text-xs mt-1">{dataError}</p>
          </div>
        </div>
      ) : appointmentHistory.length > 0 ? (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {appointmentHistory.map((apt, idx) => (
            <div key={idx} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:border-zinc-600 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-white font-semibold">
                    {new Date(apt.appointmentDate).toLocaleDateString()} at {apt.appointmentTime}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Mode: <span className="capitalize text-zinc-300">{apt.consultationMode}</span>
                  </p>
                </div>
                <StatusBadge status={apt.status} />
              </div>

              {apt.reasonForVisit && (
                <p className="text-sm text-zinc-300 mb-2">
                  <span className="text-zinc-400">Reason: </span>{apt.reasonForVisit}
                </p>
              )}

              {apt.notes && (
                <p className="text-sm text-zinc-300">
                  <span className="text-zinc-400">Notes: </span>{apt.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-800/50 rounded-lg p-6 text-center">
          <Calendar className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-zinc-400 text-sm">No appointment history found</p>
        </div>
      )}
    </div>
  );

  // Medical Records Tab
  const MedicalRecordsTab = () => (
    <div>
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5" />
        Medical Records
      </h3>

      {loadingData ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 text-purple-400 animate-spin" />
        </div>
      ) : dataError ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-semibold text-sm">Error loading records</p>
            <p className="text-red-300 text-xs mt-1">{dataError}</p>
          </div>
        </div>
      ) : patientRecords.length > 0 ? (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {patientRecords.map((record) => (
            <div key={record._id} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:border-zinc-600 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-white font-semibold">{record.originalFileName}</p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Type: <span className="capitalize">{record.type?.replace('-', ' ')}</span>
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full font-semibold flex items-center gap-1 ${
                  record.blockchainStatus === 'confirmed'
                    ? 'bg-green-500/20 text-green-400'
                    : record.blockchainStatus === 'pending'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {record.blockchainStatus === 'confirmed' && <Shield className="w-3 h-3" />}
                  {record.blockchainStatus}
                </span>
              </div>
              {record.description && (
                <p className="text-sm text-zinc-400 mb-3">{record.description}</p>
              )}
              <div className="flex items-center justify-between text-xs">
                <p className="text-zinc-500">{new Date(record.createdAt).toLocaleDateString()}</p>
                <a
                  href={record.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-800/50 rounded-lg p-6 text-center">
          <FileText className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-zinc-400 text-sm">No medical records found</p>
        </div>
      )}
    </div>
  );

  // Prescriptions Tab
  const PrescriptionsTab = () => (
    <div>
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Pill className="w-5 h-5" />
        Prescriptions
      </h3>

      {loadingData ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 text-purple-400 animate-spin" />
        </div>
      ) : patientPrescriptions.length > 0 ? (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {patientPrescriptions.map((prescription) => (
            <div key={prescription._id} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:border-zinc-600 transition-colors">
              {/* Prescriptions will display here when backend is ready */}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-800/50 rounded-lg p-6 text-center">
          <Pill className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-zinc-400 text-sm">No prescriptions found</p>
        </div>
      )}
    </div>
  );

  const PatientModal = ({ patient, onClose }) => {
    if (!patient) return null;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-zinc-700 p-6 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{patient.name}</h2>
              <p className="text-sm text-zinc-400 mt-1">Patient Profile & Medical Data</p>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-zinc-800/30 rounded-lg p-4">
                  <p className="text-xs text-zinc-400 mb-1">Email</p>
                  <p className="text-white font-semibold text-sm break-all">{patient.email || 'N/A'}</p>
                </div>
                <div className="bg-zinc-800/30 rounded-lg p-4">
                  <p className="text-xs text-zinc-400 mb-1">Phone</p>
                  <a href={`tel:${patient.phone}`} className="text-blue-400 font-semibold hover:underline">
                    {patient.phone || 'N/A'}
                  </a>
                </div>
                <div className="bg-zinc-800/30 rounded-lg p-4">
                  <p className="text-xs text-zinc-400 mb-1">Blood Type</p>
                  <p className="text-white font-semibold text-lg">{patient.bloodType || 'Not specified'}</p>
                </div>
                <div className="bg-zinc-800/30 rounded-lg p-4">
                  <p className="text-xs text-zinc-400 mb-1">Allergies</p>
                  <p className="text-white font-semibold">{patient.allergies || 'None reported'}</p>
                </div>
              </div>
            </div>

            {/* Appointment Stats */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Appointment Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="text-xs text-green-400 mb-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Total Appointments
                  </p>
                  <p className="text-2xl font-bold text-white">{patient.appointmentCount || 0}</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-xs text-blue-400 mb-1 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Last Visit
                  </p>
                  <p className="text-white font-semibold">
                    {patient.lastAppointmentDate
                      ? new Date(patient.lastAppointmentDate).toLocaleDateString()
                      : 'No appointments'}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-zinc-700">
              <div className="flex gap-4 overflow-x-auto">
                {[
                  { id: 'history', label: 'Emergency History', icon: Calendar },
                  { id: 'records', label: 'Medical Records', icon: FileText },
                  { id: 'prescriptions', label: 'Prescriptions', icon: Pill }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`pb-3 px-2 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                      activeTab === id
                        ? 'text-white border-purple-500'
                        : 'text-zinc-400 border-transparent hover:text-zinc-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'history' && <AppointmentHistoryTab />}
            {activeTab === 'records' && <MedicalRecordsTab />}
            {activeTab === 'prescriptions' && <PrescriptionsTab />}

            {/* Close Button */}
            <div className="pt-4 border-t border-zinc-700">
              <button
                onClick={onClose}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
      <div className="bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/30 rounded-2xl p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent mb-2">
          Patient Management
        </h1>
        <p className="text-zinc-400">View and manage your patients</p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-semibold">Error loading patients</p>
            <p className="text-red-300 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3">
        <Search className="w-5 h-5 text-zinc-400" />
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent outline-none text-white placeholder-zinc-500"
        />
      </div>

      {/* Patients Grid */}
      {filteredPatients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPatients.map((patient) => (
            <div
              key={patient._id}
              className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                  <User className="w-6 h-6 text-purple-400" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>

              <h3 className="text-lg font-bold text-white mb-4 group-hover:text-purple-400 transition-colors">
                {patient.name}
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Phone className="w-4 h-4 text-green-400" />
                  <a href={`tel:${patient.phone}`} className="text-white font-semibold hover:text-blue-400">
                    {patient.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Mail className="w-4 h-4 text-orange-400" />
                  <span className="text-white font-semibold text-xs break-all">{patient.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Activity className="w-4 h-4 text-red-400" />
                  Last Visit:{' '}
                  <span className="text-white font-semibold">
                    {patient.lastAppointmentDate
                      ? new Date(patient.lastAppointmentDate).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6 pb-6 border-b border-zinc-700">
                <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-zinc-400">Appointments</p>
                  <p className="text-xl font-bold text-white">{patient.appointmentCount || 0}</p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-zinc-400">Blood Type</p>
                  <p className="text-lg font-bold text-white">{patient.bloodType || '—'}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedPatient(patient);
                    setShowModal(true);
                    setActiveTab('history');
                  }}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Profile
                </button>
                <button
                  onClick={() => {
                    setSelectedPatient(patient);
                    setShowModal(true);
                    setActiveTab('history');
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Emergency
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-12 text-center">
          <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
          <p className="text-lg font-semibold text-white mb-2">No patients found</p>
          <p className="text-zinc-400">
            {searchTerm ? 'Try adjusting your search criteria' : 'No patients with appointments yet'}
          </p>
        </div>
      )}

      {/* Patient Modal */}
      {showModal && selectedPatient && (
        <PatientModal
          patient={selectedPatient}
          onClose={() => {
            setShowModal(false);
            setSelectedPatient(null);
          }}
        />
      )}
    </div>
  );
};

export default DoctorPatientsPage;
