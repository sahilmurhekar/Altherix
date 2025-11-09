// /frontend/src/pages/patient/ProfilePage.jsx

import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Droplet,
  AlertTriangle,
  MapPin,
  Save,
  AlertCircle,
  Check,
  Camera
} from 'lucide-react';

export const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    bloodType: user?.bloodType || '',
    allergies: user?.allergies || '',
    address: user?.address || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setLoading(false);
      }, 1000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
          My Profile
        </h1>
        <p className="text-zinc-400">Manage your personal health information</p>
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
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture */}
        <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 mb-4 relative group">
            <User className="w-12 h-12 text-white" />
            <button
              type="button"
              className="absolute bottom-0 right-0 p-2 bg-zinc-900 border border-cyan-500/50 rounded-full hover:bg-zinc-800 transition-colors"
            >
              <Camera className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
          <p className="text-sm text-zinc-400">Click camera icon to change photo</p>
        </div>

        {/* Personal Information */}
        <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">Full Name</label>
              <div className="flex items-center gap-3 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-cyan-500/50 transition-colors">
                <User className="w-5 h-5 text-zinc-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none text-white"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">Email Address</label>
              <div className="flex items-center gap-3 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-cyan-500/50 transition-colors">
                <Mail className="w-5 h-5 text-zinc-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none text-white"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">Phone Number</label>
              <div className="flex items-center gap-3 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-cyan-500/50 transition-colors">
                <Phone className="w-5 h-5 text-zinc-400" />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none text-white"
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">Date of Birth</label>
              <div className="flex items-center gap-3 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-cyan-500/50 transition-colors">
                <Calendar className="w-5 h-5 text-zinc-400" />
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Health Information */}
        <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Health Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Blood Type */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">Blood Type</label>
              <div className="flex items-center gap-3 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-cyan-500/50 transition-colors">
                <Droplet className="w-5 h-5 text-zinc-400" />
                <select
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none text-white"
                >
                  <option value="">Select Blood Type</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">Address</label>
              <div className="flex items-center gap-3 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-cyan-500/50 transition-colors">
                <MapPin className="w-5 h-5 text-zinc-400" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none text-white"
                />
              </div>
            </div>
          </div>

          {/* Allergies */}
          <div className="mt-6">
            <label className="block text-sm font-semibold text-zinc-300 mb-2">Allergies</label>
            <div className="flex items-start gap-3 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-cyan-500/50 transition-colors">
              <AlertTriangle className="w-5 h-5 text-zinc-400 mt-0.5" />
              <textarea
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                placeholder="List all known allergies and medications you're allergic to"
                className="w-full bg-transparent outline-none text-white resize-none h-24 placeholder-zinc-500"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/50 flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
