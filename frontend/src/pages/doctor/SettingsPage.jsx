// /frontend/src/pages/doctor/SettingsPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Bell,
  Lock,
  AlertTriangle,
  LogOut,
  Check,
  AlertCircle
} from 'lucide-react';

const DoctorSettingsPage = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    reportNotifications: true,
    weeklyDigest: true,
    allowOfflineConsultation: true,
    showOnlineStatus: true,
    autoAcceptAppointments: false
  });

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.new !== passwordData.confirm) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (passwordData.new.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }

    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setPasswordData({ current: '', new: '', confirm: '' });
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setLoading(false);
      }, 1000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to change password' });
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const SettingToggle = ({ label, description, value, onChange }) => (
    <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50 hover:border-purple-500/30 transition-colors group">
      <div>
        <p className="font-semibold text-white text-sm">{label}</p>
        <p className="text-xs text-zinc-400 mt-1">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`w-12 h-6 rounded-full transition-colors ${value ? 'bg-purple-600' : 'bg-zinc-700'}`}
      >
        <div
          className={`w-5 h-5 rounded-full bg-white transition-transform ${
            value ? 'translate-x-6' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-2xl p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Settings
        </h1>
        <p className="text-zinc-400">Manage your account preferences and security</p>
      </div>

      {/* Messages */}
      {message.text && (
        <div
          className={`flex items-center gap-3 p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Notification Preferences */}
      <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5 text-purple-400" />
          Notification Preferences
        </h2>
        <div className="space-y-4">
          <SettingToggle
            label="Email Notifications"
            description="Receive updates via email"
            value={settings.emailNotifications}
            onChange={() => handleToggle('emailNotifications')}
          />
          <SettingToggle
            label="SMS Notifications"
            description="Receive updates via text message"
            value={settings.smsNotifications}
            onChange={() => handleToggle('smsNotifications')}
          />
          <SettingToggle
            label="Appointment Reminders"
            description="Get reminders before appointments"
            value={settings.appointmentReminders}
            onChange={() => handleToggle('appointmentReminders')}
          />
          <SettingToggle
            label="Report Notifications"
            description="Get notified when reports are ready"
            value={settings.reportNotifications}
            onChange={() => handleToggle('reportNotifications')}
          />
          <SettingToggle
            label="Weekly Digest"
            description="Get a weekly summary of your activities"
            value={settings.weeklyDigest}
            onChange={() => handleToggle('weeklyDigest')}
          />
        </div>
      </div>

      {/* Consultation Settings */}
      <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" />
          Consultation Settings
        </h2>
        <div className="space-y-4">
          <SettingToggle
            label="Allow Offline Consultation"
            description="Allow patients to book offline appointments"
            value={settings.allowOfflineConsultation}
            onChange={() => handleToggle('allowOfflineConsultation')}
          />
          <SettingToggle
            label="Show Online Status"
            description="Let patients see when you're available online"
            value={settings.showOnlineStatus}
            onChange={() => handleToggle('showOnlineStatus')}
          />
          <SettingToggle
            label="Auto-Accept Appointments"
            description="Automatically confirm appointment requests"
            value={settings.autoAcceptAppointments}
            onChange={() => handleToggle('autoAcceptAppointments')}
          />
        </div>
      </div>

      {/* Security */}
      <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5 text-green-400" />
          Security
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={passwordData.current}
              onChange={(e) =>
                setPasswordData({ ...passwordData, current: e.target.value })
              }
              placeholder="Enter current password"
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:border-indigo-500/50 outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={passwordData.new}
              onChange={(e) =>
                setPasswordData({ ...passwordData, new: e.target.value })
              }
              placeholder="Enter new password"
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:border-indigo-500/50 outline-none transition-colors"
            />
            <p className="text-xs text-zinc-400 mt-1">
              Password must be at least 8 characters long
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={passwordData.confirm}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirm: e.target.value })
              }
              placeholder="Confirm new password"
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:border-indigo-500/50 outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            {loading ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
        <h2 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Danger Zone
        </h2>
        <div className="space-y-3">
          <p className="text-sm text-zinc-400">
            These actions are irreversible. Please proceed with caution.
          </p>
          <button className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-500/30 font-semibold py-2 rounded-lg transition-colors">
            Delete Account
          </button>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorSettingsPage;
