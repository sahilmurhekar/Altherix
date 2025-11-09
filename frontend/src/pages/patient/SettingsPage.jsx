// /frontend/src/pages/patient/SettingsPage.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
export const SettingsPage = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    prescriptionReminders: true,
    reportNotifications: true
  });
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-2xl p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Settings
        </h1>
        <p className="text-zinc-400">Manage your account preferences and security</p>
      </div>

      {/* Notification Preferences */}
      <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Notification Preferences</h2>
        <div className="space-y-4">
          {[
            { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive updates via email' },
            { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive updates via text message' },
            { key: 'appointmentReminders', label: 'Appointment Reminders', description: 'Get reminders before appointments' },
            { key: 'prescriptionReminders', label: 'Prescription Reminders', description: 'Get reminders for medicines' },
            { key: 'reportNotifications', label: 'Report Notifications', description: 'Get notified when reports are ready' }
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50 hover:border-purple-500/30 transition-colors">
              <div>
                <p className="font-semibold text-white">{label}</p>
                <p className="text-xs text-zinc-400 mt-1">{description}</p>
              </div>
              <button
                onClick={() => handleToggle(key)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings[key] ? 'bg-purple-600' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings[key] ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Security</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-2">Current Password</label>
            <input
              type="password"
              placeholder="Enter current password"
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:border-indigo-500/50 outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-2">New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:border-indigo-500/50 outline-none transition-colors"
            />
          </div>
          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition-colors">
            Change Password
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
        <h2 className="text-xl font-bold text-red-400 mb-6">Danger Zone</h2>
        <div className="space-y-4">
          <button className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-500/30 font-semibold py-2 rounded-lg transition-colors">
            Delete Account
          </button>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
