import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, FileText, Video, MapPin, Loader, AlertCircle, CheckCircle, Star } from 'lucide-react';

const SERVER_URL = 'http://localhost:5000';

const BookingModal = ({ doctor, onClose, onConfirm }) => {
  const [step, setStep] = useState(1);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [consultationMode, setConsultationMode] = useState('in-person');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // ========== FETCH AVAILABLE DATES ==========
  useEffect(() => {
    const fetchAvailableDates = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`${SERVER_URL}/api/appointments/available-dates?doctorId=${doctor.id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch available dates');
        }

        const data = await response.json();
        setAvailableDates(data.availableDates || []);
      } catch (err) {
        console.error('Error fetching dates:', err);
        setError('Failed to load available dates');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableDates();
  }, [doctor.id]);

  // ========== FETCH AVAILABLE SLOTS FOR SELECTED DATE ==========
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!selectedDate) {
        setAvailableSlots([]);
        return;
      }

      try {
        setLoading(true);
        setError('');
        setSelectedTime('');

        const response = await fetch(
          `${SERVER_URL}/api/appointments/available-slots?doctorId=${doctor.id}&date=${selectedDate}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch available slots');
        }

        const data = await response.json();
        setAvailableSlots(data.availableSlots || []);

        if (data.availableSlots.length === 0) {
          setError('No slots available for this date');
        }
      } catch (err) {
        console.error('Error fetching slots:', err);
        setError('Failed to load available slots');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableSlots();
  }, [selectedDate, doctor.id]);

  // ========== FORMAT DATE - FIXED ==========
  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00'); // Force local timezone
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // ========== GET DAY NAME - FIXED ==========
  const getDayName = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00'); // Force local timezone
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  // ========== HANDLE DATE SELECTION ==========
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setStep(2);
  };

  // ========== HANDLE TIME SELECTION ==========
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setStep(3);
  };

  // ========== HANDLE BOOKING CONFIRMATION ==========
  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select date and time');
      return;
    }

    try {
      setBookingLoading(true);
      setError('');

      const bookingData = {
        date: selectedDate,
        time: selectedTime,
        reason: reason || 'General Consultation',
        consultationMode: consultationMode
      };

      await onConfirm(bookingData);
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.message || 'Failed to confirm booking');
    } finally {
      setBookingLoading(false);
    }
  };

  // ========== STEP 1: SELECT DATE ==========
  const renderSelectDate = () => (
    <div>
      <h3 className="text-lg font-bold text-white mb-4">Select Appointment Date</h3>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 text-purple-400 animate-spin" />
        </div>
      ) : availableDates.length > 0 ? (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {availableDates.map((dateObj) => {
            const dayName = getDayName(dateObj.date);
            const formattedDate = formatDate(dateObj.date);

            return (
              <button
                key={dateObj.date}
                onClick={() => handleDateSelect(dateObj.date)}
                disabled={!dateObj.hasSlots}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedDate === dateObj.date
                    ? 'border-purple-500 bg-purple-500/20'
                    : dateObj.hasSlots
                    ? 'border-zinc-700 bg-zinc-800/30 hover:border-purple-500/50'
                    : 'border-zinc-800 bg-zinc-900 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-bold text-white">{dayName}</p>
                      <p className="text-sm text-zinc-400">{formattedDate}</p>
                    </div>
                  </div>
                  {dateObj.hasSlots ? (
                    <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-semibold">
                      Available
                    </span>
                  ) : (
                    <span className="text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded-full font-semibold">
                      Full
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="text-red-300 font-semibold">No available dates</p>
          <p className="text-sm text-red-400 mt-1">Doctor has not set availability yet</p>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}
    </div>
  );

  // ========== STEP 2: SELECT TIME ==========
  const renderSelectTime = () => (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setStep(1)}
          className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
        >
          ← Back
        </button>
      </div>

      <h3 className="text-lg font-bold text-white mb-2">Select Time Slot</h3>
      <p className="text-sm text-zinc-400 mb-4">
        <span className="font-semibold text-purple-400">{getDayName(selectedDate)}, {formatDate(selectedDate)}</span>
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 text-purple-400 animate-spin" />
        </div>
      ) : availableSlots.length > 0 ? (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-80 overflow-y-auto">
          {availableSlots.map((slot) => (
            <button
              key={slot}
              onClick={() => handleTimeSelect(slot)}
              className={`p-3 rounded-lg border-2 transition-all font-medium ${
                selectedTime === slot
                  ? 'border-purple-500 bg-purple-500/20 text-white'
                  : 'border-zinc-700 bg-zinc-800/30 text-zinc-300 hover:border-purple-500/50 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4 mx-auto mb-1" />
              <div className="text-xs">{slot}</div>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 text-center">
          <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
          <p className="text-red-300">No available slots for this date</p>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}
    </div>
  );

  // ========== STEP 3: CONFIRM BOOKING ==========
  const renderConfirmBooking = () => (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setStep(2)}
          className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
        >
          ← Back
        </button>
      </div>

      <h3 className="text-lg font-bold text-white mb-4">Confirm Booking</h3>

      {/* Booking Summary */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 mb-4 space-y-4">
        {/* Doctor Info */}
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">{doctor.name.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <p className="font-bold text-white">{doctor.name}</p>
            <p className="text-sm text-zinc-400">{doctor.specialization}</p>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="space-y-2 pt-3 border-t border-zinc-700">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-purple-400" />
              Date
            </span>
            <span className="font-semibold text-white text-sm">{getDayName(selectedDate)}, {formatDate(selectedDate)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-400 flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-purple-400" />
              Time
            </span>
            <span className="font-semibold text-white text-sm">{selectedTime}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm">Consultation Fee</span>
            <span className="font-bold text-green-400">₹{doctor.fee}</span>
          </div>
        </div>
      </div>

      {/* Consultation Mode Selection */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-white mb-2">Consultation Mode</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setConsultationMode('in-person')}
            className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 justify-center font-medium ${
              consultationMode === 'in-person'
                ? 'border-purple-500 bg-purple-500/20 text-white'
                : 'border-zinc-700 bg-zinc-800/30 text-zinc-300 hover:border-purple-500/50'
            }`}
          >
            <MapPin className="w-4 h-4" />
            In-Person
          </button>
          <button
            onClick={() => setConsultationMode('online')}
            className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 justify-center font-medium ${
              consultationMode === 'online'
                ? 'border-purple-500 bg-purple-500/20 text-white'
                : 'border-zinc-700 bg-zinc-800/30 text-zinc-300 hover:border-purple-500/50'
            }`}
          >
            <Video className="w-4 h-4" />
            Online
          </button>
        </div>
      </div>

      {/* Reason for Visit */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-white mb-2">Reason for Visit (Optional)</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Describe your symptoms or reason for consultation..."
          className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 outline-none focus:border-purple-500/50 resize-none"
          rows="3"
        />
      </div>

      {error && (
        <div className="mb-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Book Appointment</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && renderSelectDate()}
          {step === 2 && renderSelectTime()}
          {step === 3 && renderConfirmBooking()}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-700 px-6 py-4 flex gap-3">
          {step < 3 && (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          )}

          {step === 3 && (
            <>
              <button
                onClick={() => setStep(2)}
                className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleConfirmBooking}
                disabled={bookingLoading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                {bookingLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Confirm Booking
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
