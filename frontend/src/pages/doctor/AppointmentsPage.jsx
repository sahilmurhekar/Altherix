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
  X,
  ArrowRight,
  Mail
} from 'lucide-react';

const SERVER_URL = 'http://localhost:5000';

const DoctorAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${SERVER_URL}/api/appointments/doctor-appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments');
    } finally {
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
        apt.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const isAppointmentPast = (date, time) => {
    const appointmentDateTime = new Date(`${date}T${time}`);
    return appointmentDateTime < new Date();
  };

  const handleConfirmAppointment = async (apt) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${SERVER_URL}/api/appointments/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          appointmentId: apt._id || apt.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to confirm appointment');
      }

      alert('✅ Appointment confirmed successfully');
      await fetchAppointments();
      setShowModal(false);
    } catch (err) {
      console.error('Error confirming appointment:', err);
      alert(`❌ ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${SERVER_URL}/api/appointments/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          appointmentId: selectedAppointment._id || selectedAppointment.id,
          cancellationReason: rejectionReason
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject appointment');
      }

      alert('✅ Appointment rejected');
      await fetchAppointments();
      setShowRejectModal(false);
      setShowModal(false);
      setRejectionReason('');
    } catch (err) {
      console.error('Error rejecting appointment:', err);
      alert(`❌ ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkComplete = async (apt) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${SERVER_URL}/api/appointments/mark-complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          appointmentId: apt._id || apt.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mark as complete');
      }

      alert('✅ Appointment marked as completed');
      await fetchAppointments();
      setShowModal(false);
    } catch (err) {
      console.error('Error marking complete:', err);
      alert(`❌ ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const AppointmentModal = ({ appointment, onClose }) => {
    if (!appointment) return null;

    const patient = appointment.patientId;
    const isPast = isAppointmentPast(appointment.appointmentDate, appointment.appointmentTime);
    const canMarkComplete = isPast && (appointment.status === 'confirmed' || appointment.status === 'pending');

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-zinc-700 p-6 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{patient?.name}</h2>
              <p className="text-sm text-zinc-400 mt-1">Patient Appointment</p>
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
                  {new Date(appointment.appointmentDate).toLocaleDateString()}
                </p>
              </div>
              <div className="bg-zinc-800/30 rounded-lg p-4">
                <p className="text-xs text-zinc-400 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time
                </p>
                <p className="text-white font-semibold">{appointment.appointmentTime}</p>
              </div>
              <div className="bg-zinc-800/30 rounded-lg p-4">
                <p className="text-xs text-zinc-400 mb-2">Consultation Fee</p>
                <p className="text-white font-semibold">₹{appointment.consultationFee}</p>
              </div>
              <div className="bg-zinc-800/30 rounded-lg p-4">
                <p className="text-xs text-zinc-400 mb-2">Mode</p>
                <p className="text-white font-semibold capitalize">{appointment.consultationMode}</p>
              </div>
            </div>

            {/* Patient Info */}
            <div className="bg-zinc-800/30 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-white mb-3">Patient Information</p>
              <p className="text-sm text-zinc-400 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {patient?.phone || 'N/A'}
              </p>
              <p className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {patient?.email || 'N/A'}
              </p>
            </div>

            {/* Reason */}
            {appointment.reasonForVisit && (
              <div>
                <p className="text-sm font-semibold text-zinc-300 mb-2">Reason for Visit</p>
                <p className="text-white bg-zinc-800/30 rounded-lg p-3">{appointment.reasonForVisit}</p>
              </div>
            )}

            {/* Notes */}
            {appointment.notes && (
              <div>
                <p className="text-sm font-semibold text-zinc-300 mb-2">Notes</p>
                <p className="text-white bg-zinc-800/30 rounded-lg p-3">{appointment.notes}</p>
              </div>
            )}

            {/* Cancellation Reason */}
            {appointment.status === 'cancelled' && appointment.cancellationReason && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-sm font-semibold text-red-400 mb-1">Cancellation Reason</p>
                <p className="text-sm text-white">{appointment.cancellationReason}</p>
                {appointment.cancelledBy && (
                  <p className="text-xs text-zinc-500 mt-2">
                    Cancelled by: {appointment.cancelledBy === 'doctor' ? 'You' : 'Patient'}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            {appointment.status === 'pending' && (
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-700">
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading}
                  className="bg-red-600/20 hover:bg-red-600/30 disabled:opacity-50 text-red-400 hover:text-red-300 py-2 rounded-lg font-medium transition-colors border border-red-500/30"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleConfirmAppointment(appointment)}
                  disabled={actionLoading}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Confirm
                    </>
                  )}
                </button>
              </div>
            )}

            {canMarkComplete && (
              <div className="pt-4 border-t border-zinc-700">
                <button
                  onClick={() => handleMarkComplete(appointment)}
                  disabled={actionLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Marking Complete...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Mark as Completed
                    </>
                  )}
                </button>
              </div>
            )}

            {(appointment.status === 'confirmed' && !isPast) && (
              <div className="pt-4 border-t border-zinc-700">
                <button
                  onClick={onClose}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            )}

            {(appointment.status === 'completed' || appointment.status === 'cancelled') && (
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

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-white mb-4">Reject Appointment?</h3>
              <p className="text-zinc-400 mb-4">
                Are you sure you want to reject this appointment with {patient?.name}?
              </p>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-white mb-2">
                  Reason for Rejection (Optional)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Tell the patient why you're rejecting..."
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 outline-none focus:border-purple-500/50 resize-none"
                  rows="3"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectAppointment}
                  disabled={actionLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
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
            const patient = apt.patientId;
            const isPast = isAppointmentPast(apt.appointmentDate, apt.appointmentTime);
            const canMarkComplete = isPast && (apt.status === 'confirmed' || apt.status === 'pending');

            return (
              <div
                key={apt._id}
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
                      {patient?.name || 'Unknown Patient'}
                    </h3>
                    <p className="text-sm text-zinc-400 mt-1">{apt.reasonForVisit || 'General Consultation'}</p>
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
                    {new Date(apt.appointmentDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Clock className="w-4 h-4 text-green-400" />
                    {apt.appointmentTime}
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Phone className="w-4 h-4 text-orange-400" />
                    {patient?.phone || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400 capitalize">
                    {apt.consultationMode === 'online' ? '📱' : '🏥'} {apt.consultationMode}
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-700 flex gap-2">
                  {apt.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleConfirmAppointment(apt)}
                        disabled={actionLoading}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Confirm
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAppointment(apt);
                          setShowRejectModal(true);
                        }}
                        className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {canMarkComplete && (
                    <button
                      onClick={() => handleMarkComplete(apt)}
                      disabled={actionLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark Complete
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setSelectedAppointment(apt);
                      setShowModal(true);
                    }}
                    className="text-purple-400 hover:text-purple-300 font-semibold text-sm flex items-center gap-1 transition-colors px-4"
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

      {/* Modals */}
      {showModal && selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowModal(false);
            setSelectedAppointment(null);
            setShowRejectModal(false);
            setRejectionReason('');
          }}
        />
      )}
    </div>
  );
};

export default DoctorAppointmentsPage;
