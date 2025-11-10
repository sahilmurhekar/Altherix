// /frontend/src/pages/doctor/AppointmentsPage.jsx

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Phone,
  MapPin,
  Loader,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Search,
  MessageSquare,
  X,
  ArrowRight
} from 'lucide-react';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

const DoctorAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setAppointments([
          {
            id: 1,
            patient: 'Rajesh Singh',
            date: '2024-03-20',
            time: '10:30 AM',
            type: 'Consultation',
            reason: 'General checkup',
            status: 'pending',
            phone: '9876543210',
            email: 'rajesh@example.com',
            address: '123 Main St, City'
          },
          {
            id: 2,
            patient: 'Priya Sharma',
            date: '2024-03-20',
            time: '11:00 AM',
            type: 'Follow-up',
            reason: 'Blood pressure monitoring',
            status: 'confirmed',
            phone: '9876543211',
            email: 'priya@example.com',
            address: '456 Oak Ave, City'
          },
          {
            id: 3,
            patient: 'Amit Patel',
            date: '2024-03-19',
            time: '2:30 PM',
            type: 'Check-up',
            reason: 'Skin consultation',
            status: 'completed',
            phone: '9876543212',
            email: 'amit@example.com',
            address: '789 Pine Rd, City'
          },
          {
            id: 4,
            patient: 'Neha Sharma',
            date: '2024-03-18',
            time: '3:00 PM',
            type: 'Consultation',
            reason: 'Routine checkup',
            status: 'cancelled',
            phone: '9876543213',
            email: 'neha@example.com',
            address: '321 Elm St, City'
          }
        ]);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    let filtered = appointments;
    if (searchTerm) {
      filtered = filtered.filter((apt) =>
        apt.patient.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    filtered = filtered.filter((apt) => apt.status === activeTab);
    setFilteredAppointments(filtered);
  }, [searchTerm, activeTab, appointments]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30', icon: Clock };
      case 'confirmed':
        return { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30', icon: CheckCircle };
      case 'completed':
        return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', icon: CheckCircle };
      case 'cancelled':
        return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', icon: XCircle };
      default:
        return { bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/30', icon: AlertCircle };
    }
  };

  const handleConfirmClick = (apt) => {
    setSelectedAppointment(apt);
    setNotes('');
    setShowModal(true);
  };

  const handleRejectClick = (apt) => {
    setSelectedAppointment(apt);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleConfirmAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      setConfirming(true);
      const token = localStorage.getItem('token');

      // Simulate API call
      setTimeout(() => {
        setAppointments(
          appointments.map((apt) =>
            apt.id === selectedAppointment.id ? { ...apt, status: 'confirmed' } : apt
          )
        );
        setShowModal(false);
        setNotes('');
        setConfirming(false);
      }, 500);
    } catch (err) {
      console.error('Error confirming appointment:', err);
      setError('Failed to confirm appointment');
      setConfirming(false);
    }
  };

  const handleRejectAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      setConfirming(true);
      const token = localStorage.getItem('token');

      // Simulate API call
      setTimeout(() => {
        setAppointments(
          appointments.map((apt) =>
            apt.id === selectedAppointment.id ? { ...apt, status: 'cancelled' } : apt
          )
        );
        setShowRejectModal(false);
        setRejectionReason('');
        setConfirming(false);
      }, 500);
    } catch (err) {
      console.error('Error rejecting appointment:', err);
      setError('Failed to reject appointment');
      setConfirming(false);
    }
  };

  const AppointmentModal = ({ appointment, onClose }) => {
    if (!appointment) return null;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-zinc-700 p-6 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{appointment.patient}</h2>
              <p className="text-sm text-zinc-400 mt-1">{appointment.type}</p>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6">
            {/* Status Badge */}
            <div>
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border ${
                  getStatusColor(appointment.status).bg
                } ${getStatusColor(appointment.status).text} ${
                  getStatusColor(appointment.status).border
                }`}
              >
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </span>
            </div>

            {/* Appointment Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-800/30 rounded-lg p-4">
                <p className="text-xs text-zinc-400 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date
                </p>
                <p className="text-white font-semibold">
                  {new Date(appointment.date).toLocaleDateString()}
                </p>
              </div>
              <div className="bg-zinc-800/30 rounded-lg p-4">
                <p className="text-xs text-zinc-400 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time
                </p>
                <p className="text-white font-semibold">{appointment.time}</p>
              </div>
              <div className="bg-zinc-800/30 rounded-lg p-4">
                <p className="text-xs text-zinc-400 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </p>
                <p className="text-white font-semibold">{appointment.phone}</p>
              </div>
              <div className="bg-zinc-800/30 rounded-lg p-4">
                <p className="text-xs text-zinc-400 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Type
                </p>
                <p className="text-white font-semibold">{appointment.type}</p>
              </div>
            </div>

            {/* Patient Info */}
            <div className="bg-zinc-800/30 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-white">Patient Information</p>
              <p className="text-sm text-zinc-400">Email: {appointment.email}</p>
              <p className="text-sm text-zinc-400">Address: {appointment.address}</p>
            </div>

            {/* Reason */}
            {appointment.reason && (
              <div>
                <p className="text-sm font-semibold text-zinc-300 mb-2">Reason for Visit</p>
                <p className="text-white bg-zinc-800/30 rounded-lg p-3">{appointment.reason}</p>
              </div>
            )}

            {/* Action Buttons */}
            {appointment.status === 'pending' && (
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-700">
                <button
                  onClick={() => handleRejectClick(appointment)}
                  className="bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 py-2 rounded-lg font-medium transition-colors border border-red-500/30"
                >
                  Reject
                </button>
                <button
                  onClick={onClose}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            )}

            {appointment.status === 'confirmed' && (
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-700">
                <button className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Start Consultation
                </button>
                <button
                  onClick={onClose}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            )}

            {appointment.status === 'completed' && (
              <div className="pt-4 border-t border-zinc-700">
                <button
                  onClick={onClose}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            )}
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
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Appointment Management
        </h1>
        <p className="text-zinc-400">Review and manage patient appointments</p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-zinc-700 overflow-x-auto">
        {['pending', 'confirmed', 'completed', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({appointments.filter(a => a.status === tab).length})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3">
        <Search className="w-5 h-5 text-zinc-400" />
        <input
          type="text"
          placeholder="Search patient..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent outline-none text-white placeholder-zinc-500"
        />
      </div>

      {/* Appointments List */}
      {filteredAppointments.length > 0 ? (
        <div className="space-y-4">
          {filteredAppointments.map((apt) => {
            const statusColor = getStatusColor(apt.status);
            const StatusIcon = statusColor.icon;

            return (
              <div
                key={apt.id}
                className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => {
                      setSelectedAppointment(apt);
                      setShowModal(true);
                    }}
                  >
                    <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                      {apt.patient}
                    </h3>
                    <p className="text-sm text-zinc-400 mt-1">{apt.reason}</p>
                  </div>
                  <div
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${
                      statusColor.bg
                    } ${statusColor.text} ${statusColor.border}`}
                  >
                    <StatusIcon className="w-4 h-4" />
                    {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    {new Date(apt.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Clock className="w-4 h-4 text-green-400" />
                    {apt.time}
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Phone className="w-4 h-4 text-orange-400" />
                    {apt.phone}
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <User className="w-4 h-4 text-cyan-400" />
                    {apt.type}
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-700 flex gap-2">
                  {apt.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleConfirmClick(apt)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Confirm
                      </button>
                      <button
                        onClick={() => handleRejectClick(apt)}
                        className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {apt.status === 'confirmed' && (
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Start Consultation
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setSelectedAppointment(apt);
                      setShowModal(true);
                    }}
                    className="text-purple-400 hover:text-purple-300 font-semibold text-sm flex items-center gap-1 transition-colors"
                  >
                    View <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-12 text-center">
          <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
          <p className="text-lg font-semibold text-white mb-2">No appointments found</p>
          <p className="text-zinc-400">
            {activeTab === 'pending'
              ? 'No pending appointments'
              : `No ${activeTab} appointments`}
          </p>
        </div>
      )}

      {/* Confirm Modal */}
      {showModal && selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowModal(false);
            setSelectedAppointment(null);
            setNotes('');
          }}
        />
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">Reject Appointment?</h3>
            <p className="text-zinc-400 mb-4">
              Are you sure you want to reject this appointment with {selectedAppointment.patient}?
            </p>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-white mb-2">
                Reason for Rejection (Optional)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Tell the patient why you're rejecting..."
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 outline-none focus:border-purple-500/50 resize-none h-20"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg font-medium transition-colors"
              >
                Keep Appointment
              </button>
              <button
                onClick={handleRejectAppointment}
                disabled={confirming}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {confirming ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Yes, Reject
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointmentsPage;
