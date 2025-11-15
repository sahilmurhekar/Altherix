import React, { useState, useEffect } from 'react';
import {
  Lock,
  AlertTriangle,
  LogOut,
  Check,
  AlertCircle,
  Loader
} from 'lucide-react';

const PatientSettingsPage = () => {
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
  const API_URL = `${SERVER_URL}/api`;

  // Fetch current user profile
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage({ type: 'error', text: 'Not authenticated' });
        return;
      }

      const res = await fetch(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch profile');

      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // Validation
    if (!passwordData.current.trim()) {
      setMessage({ type: 'error', text: 'Current password is required' });
      return;
    }

    if (!passwordData.new.trim()) {
      setMessage({ type: 'error', text: 'New password is required' });
      return;
    }

    if (passwordData.new !== passwordData.confirm) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordData.new.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Verify current password by attempting login
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, password: passwordData.current })
      });

      if (!loginRes.ok) {
        setMessage({ type: 'error', text: 'Current password is incorrect' });
        setLoading(false);
        return;
      }

      // Update password through profile endpoint
      // Note: Backend needs to handle password update with verification
      const updateRes = await fetch(`${API_URL}/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          password: passwordData.new,
          currentPassword: passwordData.current
        })
      });

      if (!updateRes.ok) {
        const error = await updateRes.json();
        throw new Error(error.message || 'Failed to update password');
      }

      setPasswordData({ current: '', new: '', confirm: '' });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure? This action cannot be undone. All your data will be deleted.')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to delete account');
      }

      setMessage({ type: 'success', text: 'Account deleted successfully' });
      setTimeout(() => {
        localStorage.removeItem('token');
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete account' });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-900 p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-2xl p-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          <p className="text-zinc-400">Manage your account preferences and security</p>
          {user && <p className="text-sm text-zinc-500 mt-2">Logged in as: {user.email}</p>}
        </div>

        {/* Messages */}
        {message.text && (
          <div
            className={`flex items-center gap-3 p-4 rounded-lg border animate-in fade-in ${
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

        {/* Security Section */}
        <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5 text-green-400" />
            Security
          </h2>
          <div className="space-y-4">
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
                disabled={loading}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:border-indigo-500/50 outline-none transition-colors disabled:opacity-50"
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
                disabled={loading}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:border-indigo-500/50 outline-none transition-colors disabled:opacity-50"
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
                disabled={loading}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:border-indigo-500/50 outline-none transition-colors disabled:opacity-50"
              />
            </div>

            <button
              onClick={handlePasswordChange}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {loading ? 'Updating...' : 'Change Password'}
            </button>
          </div>
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
            <button
              onClick={handleDeleteAccount}
              disabled={loading}
              className="w-full bg-red-600/20 hover:bg-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed text-red-400 hover:text-red-300 border border-red-500/30 font-semibold py-2 rounded-lg transition-colors"
            >
              Delete Account
            </button>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientSettingsPage;
