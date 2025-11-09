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
  ArrowRight
} from 'lucide-react';

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Simulate fetching appointments
    setTimeout(() => {
      const mockAppointments = [
        {
          id: 1,
          doctor: 'Dr. Rajesh Kumar',
          specialization: 'Cardiology',
          clinic: 'Heart Care Clinic',
          address: '123 MG Road, Bangalore',
          phone: '+91 98765 43210',
          date: '2024-04-15',
          time: '10:30 AM',
          duration: '30 mins',
          status: 'confirmed',
          consultationMode: 'in-person',
          reasonForVisit: 'Regular checkup',
          notes: 'Please bring previous reports'
        },
        {
          id: 2,
          doctor: 'Dr. Priya Singh',
          specialization: 'General Medicine',
          clinic: 'Health Plus Hospital',
          address: '456 Whitefield, Bangalore',
          phone: '+91 87654 32109',
          date: '2024-04-20',
          time: '02:00 PM',
          duration: '20 mins',
          status: 'pending',
          consultationMode: 'online',
          reasonForVisit: 'Follow-up consultation',
          notes: 'Video call will be sent 15 mins before'
        },
        {
          id: 3,
          doctor: 'Dr. Arjun Patel',
          specialization: 'Orthopedics',
          clinic: 'Bone & Joint Center',
          address: '789 Koramangala, Bangalore',
          phone: '+91 76543 21098',
          date: '2024-03-10',
          time: '03:30 PM',
          duration: '30 mins',
          status: 'completed',
          consultationMode: 'in-person',
          reasonForVisit: 'Knee pain treatment',
          notes: 'Follow-up appointment scheduled',
          prescription: 'Prescribed medication and physiotherapy'
        },
        {
          id: 4,
          doctor: 'Dr. Neha Sharma',
          specialization: 'Dermatology',
          clinic: 'Skin Wellness Clinic',
          address: '321 Indiranagar, Bangalore',
          phone: '+91 65432 10987',
          date: '2024-02-28',
          time: '11:00 AM',
          duration: '20 mins',
          status: 'cancelled',
          consultationMode: 'online',
          reasonForVisit: 'Skin consultation',
          notes: 'Cancelled by patient'
        }
      ];
      setAppointments(mockAppointments);
      setLoading(false);
    }, 500);
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

  const filterAppointments = () => {
    const now = new Date();
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.date);
      if (activeTab === 'upcoming') {
        return aptDate >= now && (apt.status === 'confirmed' || apt.status === 'pending');
      } else {
        return aptDate < now || apt.status === 'cancelled';
      }
    });
  };

  const filtered = filterAppointments();

  const AppointmentModal = ({ appointment, onClose }) => {
    if (!appointment) return null;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-zinc-700 p-6 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{appointment.doctor}</h2>
              <p className="text-sm text-zinc-400 mt-1">{appointment.specialization}</p>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6">
            {/* Status Badge */}
            <div>
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(appointment.status).bg} ${getStatusColor(appointment.status).text} ${getStatusColor(appointment.status).border}`}>
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
                <p className="text-white font-semibold">{new Date(appointment.date).toLocaleDateString()}</p>
              </div>
              <div className="bg-zinc-800/30 rounded-lg p-4">
                <p className="text-xs text-zinc-400 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time
                </p>
                <p className="text-white font-semibold">{appointment.time}</p>
              </div>
              <div className="bg-zinc-800/30 rounded-lg p-4">
                <p className="text-xs text-zinc-400 mb-2">Duration</p>
                <p className="text-white font-semibold">{appointment.duration}</p>
              </div>
              <div className="bg-zinc-800/30 rounded-lg p-4">
                <p className="text-xs text-zinc-400 mb-2">Mode</p>
                <p className="text-white font-semibold capitalize">{appointment.consultationMode}</p>
              </div>
            </div>

            {/* Clinic Info */}
            <div className="bg-zinc-800/30 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-white">{appointment.clinic}</p>
              <p className="text-sm text-zinc-400 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {appointment.address}
              </p>
              <p className="text-sm text-zinc-400 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {appointment.phone}
              </p>
            </div>

            {/* Reason for Visit */}
            <div>
              <p className="text-sm font-semibold text-zinc-300 mb-2">Reason for Visit</p>
              <p className="text-white bg-zinc-800/30 rounded-lg p-3">{appointment.reasonForVisit}</p>
            </div>

            {/* Notes */}
            {appointment.notes && (
              <div>
                <p className="text-sm font-semibold text-zinc-300 mb-2">Notes</p>
                <p className="text-white bg-zinc-800/30 rounded-lg p-3">{appointment.notes}</p>
              </div>
            )}

            {/* Prescription (if completed) */}
            {appointment.prescription && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-sm font-semibold text-green-400 flex items-center gap-2 mb-2">
                  <Pill className="w-4 h-4" />
                  Prescription Available
                </p>
                <p className="text-sm text-white">{appointment.prescription}</p>
              </div>
            )}

            {/* Action Buttons */}
            {appointment.status === 'confirmed' || appointment.status === 'pending' ? (
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-700">
                <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors">
                  Reschedule
                </button>
                <button className="bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 py-2 rounded-lg font-medium transition-colors border border-red-500/30">
                  Cancel
                </button>
              </div>
            ) : null}

            {appointment.status === 'completed' ? (
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-700">
                <button className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  View Reports
                </button>
                <button className="bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg font-medium transition-colors">
                  Book Again
                </button>
              </div>
            ) : null}
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
      <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-2xl p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-2">
          My Appointments
        </h1>
        <p className="text-zinc-400">View and manage all your medical appointments</p>
      </div>

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
          Upcoming ({appointments.filter((a) => new Date(a.date) >= new Date() && (a.status === 'confirmed' || a.status === 'pending')).length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
            activeTab === 'past'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Past ({appointments.filter((a) => new Date(a.date) < new Date() || a.status === 'cancelled').length})
        </button>
      </div>

      {/* Appointments List */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((appointment) => {
            const statusColor = getStatusColor(appointment.status);
            const StatusIcon = statusColor.icon;

            return (
              <div
                key={appointment.id}
                className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group"
                onClick={() => {
                  setSelectedAppointment(appointment);
                  setShowModal(true);
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                      {appointment.doctor}
                    </h3>
                    <p className="text-sm text-zinc-400 mt-1 flex items-center gap-2">
                      <Stethoscope className="w-4 h-4" />
                      {appointment.specialization}
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}>
                    <StatusIcon className="w-4 h-4" />
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    {new Date(appointment.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Clock className="w-4 h-4 text-green-400" />
                    {appointment.time}
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <MapPin className="w-4 h-4 text-orange-400" />
                    {appointment.clinic}
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400 capitalize">
                    {appointment.consultationMode === 'online' ? '📱' : '🏥'} {appointment.consultationMode}
                  </div>
                </div>

                <div className="text-xs text-zinc-500">
                  Reason: <span className="text-zinc-300">{appointment.reasonForVisit}</span>
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-700 flex justify-end">
                  <button className="text-purple-400 hover:text-purple-300 font-semibold text-sm flex items-center gap-1 transition-colors">
                    View Details <ArrowRight className="w-3 h-3" />
                  </button>
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
          }}
        />
      )}
    </div>
  );
};

export default AppointmentsPage;
