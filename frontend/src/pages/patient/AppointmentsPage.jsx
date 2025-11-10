// /frontend/src/pages/patient/AppointmentsPage.jsx

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Loader,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Stethoscope,
  FileText,
  Pill,
  ArrowRight,
  X,
  Star
} from 'lucide-react';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [marking, setMarking] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [error, setError] = useState('');

  // ========== FETCH APPOINTMENTS ==========
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${SERVER_URL}/api/appointments/my-appointments`, {
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30', icon: CheckCircle };
      case 'pending':
        return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30', icon: Clock };
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

  const filterAppointments = () => {
    return appointments.filter((apt) => {
      if (apt.status === 'cancelled') {
        return activeTab === 'past';
      }

      const isPast = isAppointmentPast(apt.appointmentDate, apt.appointmentTime);

      if (activeTab === 'upcoming') {
        return !isPast && (apt.status === 'confirmed' || apt.status === 'pending');
      } else {
        return isPast || apt.status === 'cancelled';
      }
    });
  };

  const isAppointmentRated = (appointmentId) => {
    const appointment = appointments.find(apt => apt._id === appointmentId);
    return appointment?.isRated || false;
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      setCancelling(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${SERVER_URL}/api/appointments/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          appointmentId: selectedAppointment.id || selectedAppointment._id,
          cancellationReason: cancelReason
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel appointment');
      }

      alert('✅ Appointment cancelled successfully');

      // Refetch appointments to get updated data
      await fetchAppointments();

      // Close modals and reset
      setShowCancelModal(false);
      setShowModal(false);
      setSelectedAppointment(null);
      setCancelReason('');
    } catch (err) {
      console.error('Cancel error:', err);
      alert(`❌ ${err.message}`);
    } finally {
      setCancelling(false);
    }
  };

  const handleMarkAsComplete = async () => {
    if (!selectedAppointment) return;

    try {
      setMarking(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${SERVER_URL}/api/appointments/mark-complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          appointmentId: selectedAppointment._id || selectedAppointment.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mark appointment as complete');
      }

      alert('✅ Appointment marked as completed');

      // Refetch appointments to get updated data
      await fetchAppointments();

      // Close modal and reset
      setShowModal(false);
      setSelectedAppointment(null);
    } catch (err) {
      console.error('Mark complete error:', err);
      alert(`❌ ${err.message}`);
    } finally {
      setMarking(false);
    }
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    try {
      setSubmittingRating(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${SERVER_URL}/api/appointments/submit-rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId: selectedAppointment.doctorId._id || selectedAppointment.doctorId.id,
          rating: rating,
          review: review
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit rating');
      }

      alert('✅ Thank you! Your rating has been submitted');

      // Refetch appointments to get updated data (including rating status)
      await fetchAppointments();

      // Close modals and reset
      setShowRatingModal(false);
      setShowModal(false);
      setSelectedAppointment(null);
      setRating(0);
      setReview('');
    } catch (err) {
      console.error('Rating error:', err);
      alert(`❌ ${err.message}`);
    } finally {
      setSubmittingRating(false);
    }
  };

  const filtered = filterAppointments();

  const AppointmentModal = ({ appointment, onClose }) => {
    if (!appointment) return null;

    const doctor = appointment.doctorId;
    const isPast = isAppointmentPast(appointment.appointmentDate, appointment.appointmentTime);

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-zinc-700 p-6 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{doctor.name}</h2>
              <p className="text-sm text-zinc-400 mt-1">{doctor.specialization}</p>
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

            {/* Clinic Info */}
            <div className="bg-zinc-800/30 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-white">{doctor.clinicAddress}</p>
              <p className="text-sm text-zinc-400 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {doctor.phone}
              </p>
            </div>

            {/* Reason for Visit */}
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

            {/* Cancellation Reason (if cancelled) */}
            {appointment.status === 'cancelled' && appointment.cancellationReason && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-sm font-semibold text-red-400 mb-1">Cancellation Reason</p>
                <p className="text-sm text-white">{appointment.cancellationReason}</p>
              </div>
            )}

            {/* Action Buttons */}
            {!isPast && (appointment.status === 'confirmed' || appointment.status === 'pending') && (
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-700">
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 py-2 rounded-lg font-medium transition-colors border border-red-500/30"
                >
                  Cancel
                </button>
                <button
                  onClick={onClose}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            )}

            {isPast && appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-700">
                <button
                  onClick={handleMarkAsComplete}
                  disabled={marking}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {marking ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Marking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Mark Complete
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowRatingModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Star className="w-4 h-4" />
                  Rate Doctor
                </button>
              </div>
            )}

            {appointment.status === 'completed' && !appointment.isRated && (
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-700">
                <button
                  onClick={onClose}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => setShowRatingModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Star className="w-4 h-4" />
                  Rate Doctor
                </button>
              </div>
            )}

            {appointment.status === 'completed' && !appointment.isRated && (
              <div className="pt-4 border-t border-zinc-700">
                <button
                  onClick={() => setShowRatingModal(true)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Star className="w-4 h-4" />
                  Rate Doctor
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-white mb-4">Cancel Appointment?</h3>
              <p className="text-zinc-400 mb-4">
                Are you sure you want to cancel this appointment? This action cannot be undone.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-white mb-2">
                  Reason for Cancellation (Optional)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Tell us why you're cancelling..."
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 outline-none focus:border-purple-500/50 resize-none"
                  rows="3"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Keep Appointment
                </button>
                <button
                  onClick={handleCancelAppointment}
                  disabled={cancelling}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {cancelling ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      Yes, Cancel
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rating Modal */}
        {showRatingModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-white mb-2">Rate Dr. {doctor.name}</h3>
              <p className="text-sm text-zinc-400 mb-6">How was your experience?</p>

              {/* Star Rating */}
              <div className="flex gap-2 justify-center mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-zinc-600 hover:text-yellow-400'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Review Text */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-white mb-2">
                  Your Review (Optional)
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Share your feedback about the doctor and consultation..."
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 outline-none focus:border-purple-500/50 resize-none"
                  rows="4"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRatingModal(false);
                    setRating(0);
                    setReview('');
                  }}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRating}
                  disabled={submittingRating || rating === 0}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {submittingRating ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Submit Rating
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
      <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-2xl p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-2">
          My Appointments
        </h1>
        <p className="text-zinc-400">View and manage all your medical appointments</p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-zinc-700">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
            activeTab === 'upcoming'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Upcoming (
          {appointments.filter(
            (a) =>
              !isAppointmentPast(a.appointmentDate, a.appointmentTime) &&
              (a.status === 'confirmed' || a.status === 'pending')
          ).length}
          )
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
            activeTab === 'past'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Past (
          {appointments.filter(
            (a) =>
              isAppointmentPast(a.appointmentDate, a.appointmentTime) ||
              a.status === 'cancelled'
          ).length}
          )
        </button>
      </div>

      {/* Appointments List */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((appointment) => {
            const statusColor = getStatusColor(appointment.status);
            const StatusIcon = statusColor.icon;
            const doctor = appointment.doctorId;
            const isPast = isAppointmentPast(appointment.appointmentDate, appointment.appointmentTime);

            return (
              <div
                key={appointment._id}
                className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1" onClick={() => {
                    setSelectedAppointment(appointment);
                    setShowModal(true);
                  }}>
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                      {doctor.name}
                    </h3>
                    <p className="text-sm text-zinc-400 mt-1 flex items-center gap-2">
                      <Stethoscope className="w-4 h-4" />
                      {doctor.specialization}
                    </p>
                  </div>
                  <div
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${
                      statusColor.bg
                    } ${statusColor.text} ${statusColor.border}`}
                  >
                    <StatusIcon className="w-4 h-4" />
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    {new Date(appointment.appointmentDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Clock className="w-4 h-4 text-green-400" />
                    {appointment.appointmentTime}
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <MapPin className="w-4 h-4 text-orange-400" />
                    {doctor.clinicAddress?.split(',')[0] || 'Clinic'}
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400 capitalize">
                    {appointment.consultationMode === 'online' ? '📱' : '🏥'}{' '}
                    {appointment.consultationMode}
                  </div>
                </div>

                {appointment.reasonForVisit && (
                  <div className="text-xs text-zinc-500 mb-4">
                    Reason: <span className="text-zinc-300">{appointment.reasonForVisit}</span>
                  </div>
                )}

                <div className="pt-4 border-t border-zinc-700 flex justify-between items-center">
                  <button
                    onClick={() => {
                      setSelectedAppointment(appointment);
                      setShowModal(true);
                    }}
                    className="text-purple-400 hover:text-purple-300 font-semibold text-sm flex items-center gap-1 transition-colors"
                  >
                    View Details <ArrowRight className="w-3 h-3" />
                  </button>

                  {/* Quick Action Buttons */}
                  {isPast && appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                    <button
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowModal(true);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark Complete
                    </button>
                  )}

                  {(appointment.status === 'completed' || (isPast && appointment.status !== 'cancelled')) && !appointment.isRated && (
                    <button
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowModal(true);
                        setTimeout(() => setShowRatingModal(true), 100);
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      <Star className="w-4 h-4" />
                      Rate
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-12 text-center">
          <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
          <p className="text-lg font-semibold text-white mb-2">
            No {activeTab} appointments
          </p>
          <p className="text-zinc-400">
            {activeTab === 'upcoming'
              ? 'Book an appointment with a doctor to get started'
              : 'You have no past appointments yet'}
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <AppointmentModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowModal(false);
            setSelectedAppointment(null);
            setShowCancelModal(false);
            setShowRatingModal(false);
            setRating(0);
            setReview('');
          }}
        />
      )}
    </div>
  );
};

export default AppointmentsPage;
