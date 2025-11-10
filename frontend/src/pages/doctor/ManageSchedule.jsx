// /frontend/src/pages/doctor/ManageSchedule.jsx

import React, { useState, useEffect } from 'react';
import { Clock, Save, Loader, AlertCircle, CheckCircle, Plus, Trash2, Calendar, LogOut, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

const ManageSchedule = () => {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState({
    0: { dayName: 'Sunday', startTime: '10:00', endTime: '14:00', isActive: false },
    1: { dayName: 'Monday', startTime: '09:00', endTime: '17:00', isActive: true },
    2: { dayName: 'Tuesday', startTime: '09:00', endTime: '17:00', isActive: true },
    3: { dayName: 'Wednesday', startTime: '09:00', endTime: '17:00', isActive: true },
    4: { dayName: 'Thursday', startTime: '09:00', endTime: '17:00', isActive: true },
    5: { dayName: 'Friday', startTime: '09:00', endTime: '17:00', isActive: true },
    6: { dayName: 'Saturday', startTime: '10:00', endTime: '14:00', isActive: false }
  });

  const [slotDuration, setSlotDuration] = useState(30);
  const [holidays, setHolidays] = useState([]);
  const [newHoliday, setNewHoliday] = useState('');
  const [skipSlots, setSkipSlots] = useState([]);
  const [newSkipDate, setNewSkipDate] = useState('');
  const [newSkipTime, setNewSkipTime] = useState('');
  const [skipReason, setSkipReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // ========== FETCH EXISTING AVAILABILITY ==========
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const response = await fetch(`${SERVER_URL}/api/appointments/availability/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          const availability = data.availability;

          const scheduleMap = { ...schedule };
          availability.schedule.forEach((item) => {
            scheduleMap[item.dayOfWeek].startTime = item.startTime;
            scheduleMap[item.dayOfWeek].endTime = item.endTime;
            scheduleMap[item.dayOfWeek].isActive = item.isActive;
          });

          setSchedule(scheduleMap);
          setSlotDuration(availability.slotDuration || 30);
          setHolidays(availability.holidays || []);
          setSkipSlots(availability.skipSlots || []);
        }
      } catch (err) {
        console.error('Error fetching availability:', err);
        setMessage('Failed to load existing schedule');
        setMessageType('error');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, []);

  const handleScheduleChange = (day, field, value) => {
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], [field]: value }
    });
  };

  const handleAddHoliday = () => {
    if (!newHoliday) return;

    if (holidays.includes(newHoliday)) {
      setMessage('This date is already in holidays');
      setMessageType('error');
      return;
    }

    setHolidays([...holidays, newHoliday].sort());
    setNewHoliday('');
    setMessage('');
  };

  const handleRemoveHoliday = (holiday) => {
    setHolidays(holidays.filter((h) => h !== holiday));
  };

  const handleAddSkipSlot = () => {
    if (!newSkipDate || !newSkipTime) {
      setMessage('Please select both date and time');
      setMessageType('error');
      return;
    }

    // Check if slot already exists
    const exists = skipSlots.some(slot => slot.date === newSkipDate && slot.time === newSkipTime);
    if (exists) {
      setMessage('This slot is already skipped');
      setMessageType('error');
      return;
    }

    const newSkip = {
      date: newSkipDate,
      time: newSkipTime,
      reason: skipReason || 'Personal break'
    };

    setSkipSlots([...skipSlots, newSkip].sort((a, b) => {
      if (a.date !== b.date) return new Date(a.date) - new Date(b.date);
      return a.time.localeCompare(b.time);
    }));

    setNewSkipDate('');
    setNewSkipTime('');
    setSkipReason('');
    setMessage('');
  };

  const handleRemoveSkipSlot = (index) => {
    setSkipSlots(skipSlots.filter((_, i) => i !== index));
  };

  const handleSaveSchedule = async () => {
    try {
      setSaving(true);
      setMessage('');

      const token = localStorage.getItem('token');

      const scheduleArray = Object.keys(schedule).map((day) => ({
        dayOfWeek: parseInt(day),
        startTime: schedule[day].startTime,
        endTime: schedule[day].endTime,
        isActive: schedule[day].isActive
      }));

      const response = await fetch(`${SERVER_URL}/api/appointments/availability/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          schedule: scheduleArray,
          slotDuration: slotDuration,
          holidays: holidays,
          skipSlots: skipSlots
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save schedule');
      }

      setMessage('✅ Schedule saved successfully!');
      setMessageType('success');
    } catch (err) {
      console.error('Error saving schedule:', err);
      setMessage(`❌ ${err.message}`);
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const toggleDayActive = (day) => {
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], isActive: !schedule[day].isActive }
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-3" />
          <p className="text-zinc-400">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-2xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Manage Your Schedule
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
        <p className="text-zinc-400">Set your working hours and availability</p>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`border rounded-xl p-4 flex items-center gap-3 ${
            messageType === 'success'
              ? 'bg-green-500/20 border-green-500/50'
              : 'bg-red-500/20 border-red-500/50'
          }`}
        >
          {messageType === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          )}
          <p className={messageType === 'success' ? 'text-green-300' : 'text-red-300'}>{message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Schedule */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              Weekly Schedule
            </h2>

            <div className="space-y-3">
              {Object.keys(schedule)
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map((day) => (
                  <div
                    key={day}
                    className={`border-2 rounded-lg p-4 transition-all ${
                      schedule[day].isActive
                        ? 'border-purple-500/50 bg-purple-500/5'
                        : 'border-zinc-700 bg-zinc-800/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={schedule[day].isActive}
                          onChange={() => toggleDayActive(day)}
                          className="w-5 h-5 accent-purple-500 cursor-pointer"
                        />
                        <label className="font-semibold text-white cursor-pointer">
                          {schedule[day].dayName}
                        </label>
                      </div>
                    </div>

                    {schedule[day].isActive && (
                      <div className="grid grid-cols-2 gap-3 ml-8">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-400 mb-2">
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={schedule[day].startTime}
                            onChange={(e) =>
                              handleScheduleChange(day, 'startTime', e.target.value)
                            }
                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500/50"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-zinc-400 mb-2">
                            End Time
                          </label>
                          <input
                            type="time"
                            value={schedule[day].endTime}
                            onChange={(e) =>
                              handleScheduleChange(day, 'endTime', e.target.value)
                            }
                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500/50"
                          />
                        </div>
                      </div>
                    )}

                    {!schedule[day].isActive && (
                      <p className="text-sm text-zinc-500 ml-8">Day off</p>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Slot Duration */}
          <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6">
            <h3 className="font-bold text-white mb-3">Slot Duration</h3>
            <div className="flex items-center gap-3">
              <select
                value={slotDuration}
                onChange={(e) => setSlotDuration(parseInt(e.target.value))}
                className="flex-1 bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500/50"
              >
                <option value={15}>15 minutes</option>
                <option value={20}>20 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
              </select>
            </div>
          </div>
        </div>

        {/* Holidays & Skip Slots Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Holidays */}
          <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6 sticky top-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              Holidays
            </h2>

            <div className="mb-4 space-y-2">
              <input
                type="date"
                value={newHoliday}
                onChange={(e) => setNewHoliday(e.target.value)}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500/50"
              />
              <button
                onClick={handleAddHoliday}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {holidays.length > 0 ? (
                holidays.map((holiday) => (
                  <div
                    key={holiday}
                    className="flex items-center justify-between bg-zinc-800/30 border border-zinc-700 rounded-lg p-3"
                  >
                    <span className="text-sm text-white">
                      {new Date(holiday).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <button
                      onClick={() => handleRemoveHoliday(holiday)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-500 text-center py-4">None</p>
              )}
            </div>
          </div>

          {/* Skip Slots */}
          <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <X className="w-5 h-5 text-orange-400" />
              Skip Slots
            </h2>

            <div className="mb-4 space-y-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Date</label>
                <input
                  type="date"
                  value={newSkipDate}
                  onChange={(e) => setNewSkipDate(e.target.value)}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500/50 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Time</label>
                <input
                  type="time"
                  value={newSkipTime}
                  onChange={(e) => setNewSkipTime(e.target.value)}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500/50 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Reason</label>
                <input
                  type="text"
                  placeholder="e.g., lunch break, meeting"
                  value={skipReason}
                  onChange={(e) => setSkipReason(e.target.value)}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500/50 text-sm placeholder-zinc-600"
                />
              </div>
              <button
                onClick={handleAddSkipSlot}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Skip
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {skipSlots.length > 0 ? (
                skipSlots.map((slot, idx) => (
                  <div
                    key={idx}
                    className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p className="text-sm text-white font-medium">
                          {new Date(slot.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}{' '}
                          at {slot.time}
                        </p>
                        <p className="text-xs text-zinc-500">{slot.reason}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveSkipSlot(idx)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-500 text-center py-4">None</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-3 justify-end sticky bottom-0 bg-zinc-950 border-t border-zinc-700 -mx-4 -mb-4 px-4 py-4 md:relative md:bg-transparent md:border-0 md:mx-0 md:mb-0 md:px-0 md:py-0">
        <button
          onClick={handleSaveSchedule}
          disabled={saving}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ManageSchedule;
