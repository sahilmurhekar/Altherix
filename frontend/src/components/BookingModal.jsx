// /frontend/src/components/BookingModal.jsx

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, FileText, Video, MapPin, Loader, AlertCircle, CheckCircle } from 'lucide-react';
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
const BookingModal = ({ doctor, onClose, onConfirm }) => {
  const [step, setStep] = useState(1); // 1: Select Date, 2: Select Time, 3: Confirm
  const [availableDates, setAvailableDates] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [consultationMode, setConsultationMode] = useState('in-person');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

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
        setSelectedTime(''); // Reset selected time

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

  // ========== FORMAT DATE FOR DISPLAY ==========
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
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
      setBookingSuccess(true);
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
          {availableDates.map((dateObj) => (
            <button
              key={dateObj.date}
              onClick={() => handleDateSelect(dateObj.date)}
              disabled={!dateObj.hasSlots}
              className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                selectedDate === dateObj.date
                  ? 'border-purple-500 bg-purple-500/20'
                  : dateObj.hasSlots
                  ? 'border-zinc-700 bg-zinc-800/30 hover:border-purple-500/50'
                  : 'border-zinc-800 bg-zinc-900 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <div>
                    <p className="font-semibold text-white">{dateObj.dayName}</p>
                    <p className="text-sm text-zinc-400">{formatDate(dateObj.date)}</p>
                  </div>
                </div>
                {dateObj.hasSlots ? (
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Available</span>
                ) : (
                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">Full</span>
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-center">
          <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
          <p className="text-red-300">No available dates in the next 30 days</p>
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
          className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
        >
          ← Back
        </button>
        <h3 className="text-lg font-bold text-white">Select Time Slot</h3>
      </div>

      <p className="text-sm text-zinc-400 mb-4">
        <span className="font-semibold">{formatDate(selectedDate)}</span> - Choose your preferred time
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 text-purple-400 animate-spin" />
        </div>
      ) : availableSlots.length > 0 ? (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
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
              <Clock className="w-3 h-3 mx-auto mb-1" />
              {slot}
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-center">
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

  // ========== STEP 4: RATING (NEW) ==========
  const renderRating = () => (
    <div>
      <h3 className="text-lg font-bold text-white mb-4">Rate Your Experience</h3>

      <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-4">
        <p className="text-sm text-zinc-400 mb-3">How was your appointment?</p>
        <div className="flex gap-3 justify-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-zinc-600 hover:text-yellow-400'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-white mb-2">Review (Optional)</label>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Share your feedback..."
          className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 text-sm outline-none focus:border-purple-500/50 resize-none"
          rows="3"
        />
      </div>

      {error && (
        <div className="mb-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}
    </div>
  );

  const handleSubmitRating = async () => {
    try {
      setBookingLoading(true);
      setError('');

      const token = localStorage.getItem('token');

      const response = await fetch(`${SERVER_URL}/api/appointments/submit-rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId: doctor.id,
          rating: rating,
          review: review
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit rating');
      }

      setError('');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Rating error:', err);
      setError(err.message || 'Failed to submit rating');
    } finally {
      setBookingLoading(false);
    }
  };
  const renderConfirmBooking = () => (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setStep(2)}
          className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
        >
          ← Back
        </button>
        <h3 className="text-lg font-bold text-white">Confirm Booking</h3>
      </div>

      {/* Booking Summary */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-4 space-y-3">
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
            <span className="text-zinc-400 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              Date
            </span>
            <span className="font-semibold text-white">{formatDate(selectedDate)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-400 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              Time
            </span>
            <span className="font-semibold text-white">{selectedTime}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Consultation Fee</span>
            <span className="font-semibold text-white">₹{doctor.fee}</span>
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-950 border border-zinc-700 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-950 border-b border-zinc-700 px-6 py-4 flex items-center justify-between">
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
          {!bookingSuccess && step === 1 && renderSelectDate()}
          {!bookingSuccess && step === 2 && renderSelectTime()}
          {!bookingSuccess && step === 3 && renderConfirmBooking()}
          {bookingSuccess && renderRating()}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-700 px-6 py-4 flex gap-3">
          {!bookingSuccess && step < 3 && (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          )}

          {!bookingSuccess && step === 3 && (
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

          {bookingSuccess && (
            <button
              onClick={handleSubmitRating}
              disabled={bookingLoading || rating === 0}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white rounded-lg font-medium flex items-center justify-center gap-2"
            >
              {bookingLoading ? (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
