import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, User } from 'lucide-react';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

const IncomingCallModal = ({ appointmentId, onAccept, onReject }) => {
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${SERVER_URL}/api/appointments/${appointmentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setAppointment(data.appointment);
        }
      } catch (error) {
        console.error('Error fetching appointment:', error);
      } finally {
        setLoading(false);
      }
    };

    if (appointmentId) {
      fetchAppointment();
    }
  }, [appointmentId]);

  if (loading || !appointment) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-sm w-full p-6 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Incoming Video Call</h3>
          <p className="text-zinc-400">Loading caller information...</p>
        </div>
      </div>
    );
  }

  const caller = appointment.doctorId || appointment.patientId;
  const callerRole = appointment.doctorId ? 'Doctor' : 'Patient';

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-sm w-full p-6 text-center">
        {/* Caller Avatar */}
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-white" />
        </div>

        {/* Caller Info */}
        <h3 className="text-xl font-bold text-white mb-2">Incoming Video Call</h3>
        <p className="text-zinc-400 mb-1">{caller?.name || 'Unknown Caller'}</p>
        <p className="text-sm text-zinc-500 capitalize mb-6">{callerRole}</p>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onReject}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <PhoneOff className="w-5 h-5" />
            Reject
          </button>
          <button
            onClick={() => onAccept(appointmentId)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Phone className="w-5 h-5" />
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;