// /frontend/src/pages/doctor/ManageSchedule.jsx

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Save,
  Loader,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
  Calendar,
  LogOut,
  X,
  ChevronDown
} from 'lucide-react';
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
  const [skipSlots, setSkipSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    schedule: true,
    holidays: true,
    skipSlots: false
  });

  // Form states for holidays and skip slots
  const [newHoliday, setNewHoliday] = useState('');
  const [newSkipDate, setNewSkipDate] = useState('');
  const [newSkipTime, setNewSkipTime] = useState('');
  const [skipReason, setSkipReason] = useState('');

  useEffect(() => {
    fetchAvailability();
  }, []);

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
      showMessage('Failed to load schedule', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const toggleDayActive = (day) => {
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], isActive: !schedule[day].isActive }
    });
  };

  const handleScheduleChange = (day, field, value) => {
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], [field]: value }
    });
  };

  const handleAddHoliday = () => {
    if (!newHoliday) {
      showMessage('Please select a date', 'error');
      return;
    }

    if (holidays.includes(newHoliday)) {
      showMessage('This date is already marked as holiday', 'error');
      return;
    }

    setHolidays([...holidays, newHoliday].sort());
    setNewHoliday('');
  };

  const handleRemoveHoliday = (holiday) => {
    setHolidays(holidays.filter((h) => h !== holiday));
  };

  const handleAddSkipSlot = () => {
    if (!newSkipDate || !newSkipTime) {
      showMessage('Please select both date and time', 'error');
      return;
    }

    const exists = skipSlots.some(slot => slot.date === newSkipDate && slot.time === newSkipTime);
    if (exists) {
      showMessage('This slot is already marked as skipped', 'error');
      return;
    }

    setSkipSlots([
      ...skipSlots,
      {
        date: newSkipDate,
        time: newSkipTime,
        reason: skipReason || 'Personal break'
      }
    ].sort((a, b) => {
      if (a.date !== b.date) return new Date(a.date) - new Date(b.date);
      return a.time.localeCompare(b.time);
    }));

    setNewSkipDate('');
    setNewSkipTime('');
    setSkipReason('');
  };

  const handleRemoveSkipSlot = (index) => {
    setSkipSlots(skipSlots.filter((_, i) => i !== index));
  };

  const handleSaveSchedule = async () => {
    try {
      setSaving(true);

      const scheduleArray = Object.keys(schedule).map((day) => ({
        dayOfWeek: parseInt(day),
        startTime: schedule[day].startTime,
        endTime: schedule[day].endTime,
        isActive: schedule[day].isActive
      }));

      const token = localStorage.getItem('token');

      const response = await fetch(`${SERVER_URL}/api/appointments/availability/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          schedule: scheduleArray,
          slotDuration,
          holidays,
          skipSlots
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save schedule');
      }

      showMessage('✓ Schedule saved successfully!', 'success');
    } catch (err) {
      console.error('Error saving schedule:', err);
      showMessage(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="text-center">
          <Loader className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-zinc-300 text-lg">Loading your schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Manage Schedule
            </h1>
            <p className="text-zinc-400 mt-2">Configure your working hours and availability</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 bg-red-600/80 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 w-full md:w-auto"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`mb-6 border rounded-xl p-4 flex items-center gap-3 ${
            messageType === 'success'
              ? 'bg-green-500/15 border-green-500/50 backdrop-blur-sm'
              : 'bg-red-500/15 border-red-500/50 backdrop-blur-sm'
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

      <div className="space-y-6">
        {/* Weekly Schedule Section */}
        <div className="bg-gradient-to-br from-zinc-900/40 to-zinc-900/20 border border-zinc-800/50 rounded-2xl overflow-hidden backdrop-blur-sm">
          <button
            onClick={() => toggleSection('schedule')}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-zinc-800/20 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-bold text-white">Weekly Schedule</h2>
                <p className="text-sm text-zinc-400">Set your working hours for each day</p>
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${
                expandedSections.schedule ? 'rotate-180' : ''
              }`}
            />
          </button>

          {expandedSections.schedule && (
            <div className="border-t border-zinc-800/50 px-6 py-6 space-y-4">
              {Object.keys(schedule)
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map((day) => (
                  <div
                    key={day}
                    className={`border-2 rounded-xl p-5 transition-all duration-200 ${
                      schedule[day].isActive
                        ? 'border-purple-500/50 bg-purple-500/10'
                        : 'border-zinc-700/50 bg-zinc-800/20'
                    }`}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <input
                        type="checkbox"
                        checked={schedule[day].isActive}
                        onChange={() => toggleDayActive(day)}
                        className="w-5 h-5 rounded accent-purple-500 cursor-pointer"
                      />
                      <span className="font-bold text-white min-w-24">{schedule[day].dayName}</span>
                      <span className="text-sm text-zinc-500">
                        {schedule[day].isActive ? 'Working' : 'Day off'}
                      </span>
                    </div>

                    {schedule[day].isActive && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-9">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-400 mb-2.5">
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={schedule[day].startTime}
                            onChange={(e) =>
                              handleScheduleChange(day, 'startTime', e.target.value)
                            }
                            className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3.5 py-2.5 text-white outline-none focus:border-purple-500/70 focus:ring-2 focus:ring-purple-500/20 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-zinc-400 mb-2.5">
                            End Time
                          </label>
                          <input
                            type="time"
                            value={schedule[day].endTime}
                            onChange={(e) =>
                              handleScheduleChange(day, 'endTime', e.target.value)
                            }
                            className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3.5 py-2.5 text-white outline-none focus:border-purple-500/70 focus:ring-2 focus:ring-purple-500/20 transition-all"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

              {/* Slot Duration */}
              <div className="border-2 border-blue-500/30 bg-blue-500/10 rounded-xl p-5 mt-6">
                <label className="block text-sm font-bold text-white mb-3">Appointment Slot Duration</label>
                <select
                  value={slotDuration}
                  onChange={(e) => setSlotDuration(parseInt(e.target.value))}
                  className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value={15}>15 minutes</option>
                  <option value={20}>20 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes (1 hour)</option>
                </select>
                <p className="text-xs text-zinc-400 mt-2">
                  Each appointment slot will last {slotDuration} minutes
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Holidays Section */}
        <div className="bg-gradient-to-br from-zinc-900/40 to-zinc-900/20 border border-zinc-800/50 rounded-2xl overflow-hidden backdrop-blur-sm">
          <button
            onClick={() => toggleSection('holidays')}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-zinc-800/20 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-400" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-bold text-white">Holidays & Days Off</h2>
                <p className="text-sm text-zinc-400">Mark dates when you're not available</p>
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${
                expandedSections.holidays ? 'rotate-180' : ''
              }`}
            />
          </button>

          {expandedSections.holidays && (
            <div className="border-t border-zinc-800/50 px-6 py-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-white">Add Holiday</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={newHoliday}
                    onChange={(e) => setNewHoliday(e.target.value)}
                    className="flex-1 bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3.5 py-2.5 text-white outline-none focus:border-orange-500/70 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                  <button
                    onClick={handleAddHoliday}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add</span>
                  </button>
                </div>
              </div>

              {holidays.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    {holidays.length} holiday{holidays.length !== 1 ? 's' : ''} marked
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-2">
                    {holidays.map((holiday) => (
                      <div
                        key={holiday}
                        className="flex items-center justify-between bg-zinc-800/30 border border-zinc-700/50 rounded-lg p-3 group hover:border-orange-500/30 transition-all"
                      >
                        <span className="text-sm text-white font-medium">
                          {new Date(holiday).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        <button
                          onClick={() => handleRemoveHoliday(holiday)}
                          className="text-zinc-500 group-hover:text-red-400 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-800/20 border border-zinc-700/30 rounded-lg p-8 text-center">
                  <Calendar className="w-12 h-12 text-zinc-600 mx-auto mb-3 opacity-50" />
                  <p className="text-zinc-500">No holidays added yet</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Skip Slots Section */}
        <div className="bg-gradient-to-br from-zinc-900/40 to-zinc-900/20 border border-zinc-800/50 rounded-2xl overflow-hidden backdrop-blur-sm">
          <button
            onClick={() => toggleSection('skipSlots')}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-zinc-800/20 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-500/20 rounded-lg">
                <X className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-bold text-white">Skip Specific Slots</h2>
                <p className="text-sm text-zinc-400">Block individual time slots (e.g., lunch break)</p>
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${
                expandedSections.skipSlots ? 'rotate-180' : ''
              }`}
            />
          </button>

          {expandedSections.skipSlots && (
            <div className="border-t border-zinc-800/50 px-6 py-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Date</label>
                  <input
                    type="date"
                    value={newSkipDate}
                    onChange={(e) => setNewSkipDate(e.target.value)}
                    className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3.5 py-2.5 text-white outline-none focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Time</label>
                  <input
                    type="time"
                    value={newSkipTime}
                    onChange={(e) => setNewSkipTime(e.target.value)}
                    className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3.5 py-2.5 text-white outline-none focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Reason</label>
                  <input
                    type="text"
                    placeholder="e.g., lunch, meeting"
                    value={skipReason}
                    onChange={(e) => setSkipReason(e.target.value)}
                    maxLength={30}
                    className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3.5 py-2.5 text-white outline-none focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20 transition-all placeholder-zinc-600"
                  />
                </div>
              </div>
              <button
                onClick={handleAddSkipSlot}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Skip Slot
              </button>

              {skipSlots.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    {skipSlots.length} slot{skipSlots.length !== 1 ? 's' : ''} blocked
                  </p>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {skipSlots.map((slot, idx) => (
                      <div
                        key={idx}
                        className="bg-zinc-800/30 border border-zinc-700/50 rounded-lg p-3.5 flex items-start justify-between group hover:border-red-500/30 transition-all"
                      >
                        <div className="flex-1">
                          <p className="text-sm text-white font-medium">
                            {new Date(slot.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}{' '}
                            <span className="text-purple-400 font-bold">• {slot.time}</span>
                          </p>
                          <p className="text-xs text-zinc-500 mt-1">{slot.reason}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveSkipSlot(idx)}
                          className="text-zinc-500 group-hover:text-red-400 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-800/20 border border-zinc-700/30 rounded-lg p-8 text-center">
                  <X className="w-12 h-12 text-zinc-600 mx-auto mb-3 opacity-50" />
                  <p className="text-zinc-500">No skip slots added yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Save Button - Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-950 to-zinc-950/50 border-t border-zinc-800/50 backdrop-blur-xl p-4 md:p-6">
        <div className="max-w-6xl mx-auto flex gap-3 justify-end">
          <button
            onClick={fetchAvailability}
            className="px-6 py-3 rounded-lg font-semibold text-white border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/50 transition-all duration-200"
          >
            Reset
          </button>
          <button
            onClick={handleSaveSchedule}
            disabled={saving}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            {saving ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Schedule
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom padding for fixed footer */}
      <div className="h-24" />
    </div>
  );
};

export default ManageSchedule;
