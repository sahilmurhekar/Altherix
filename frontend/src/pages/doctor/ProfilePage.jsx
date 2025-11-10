// /frontend/src/pages/doctor/ProfilePage.jsx

import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Award,
  Save,
  AlertCircle,
  Check,
  Camera,
  Clock
} from 'lucide-react';

const DoctorProfilePage = () => {
  const [formData, setFormData] = useState({
    name: 'Dr. Anderson Smith',
    email: 'doctor@example.com',
    phone: '9876543210',
    specialization: 'Cardiology',
    licenseNumber: 'MED123456',
    experience: '10',
    qualifications: 'MBBS, MD, DM Cardiology',
    clinicAddress: '123 Medical Plaza, Mumbai',
    city: 'Mumbai',
    bio: 'Experienced cardiologist with a passion for patient care'
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
        <p className="text-zinc-400">Manage your professional information</p>
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

            {/* City */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">City</label>
              <div className="flex items-center gap-3 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-cyan-500/50 transition-colors">
                <MapPin className="w-5 h-5 text-zinc-400" />
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Professional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Specialization */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">Specialization</label>
              <div className="flex items-center gap-3 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-cyan-500/50 transition-colors">
                <Briefcase className="w-5 h-5 text-zinc-400" />
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none text-white"
                />
              </div>
            </div>

            {/* License Number */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">Medical License Number</label>
              <div className="flex items-center gap-3 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-cyan-500/50 transition-colors">
                <Award className="w-5 h-5 text-zinc-400" />
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none text-white"
                />
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">Years of Experience</label>
              <div className="flex items-center gap-3 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-cyan-500/50 transition-colors">
                <Clock className="w-5 h-5 text-zinc-400" />
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none text-white"
                />
              </div>
            </div>

            {/* Qualifications */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">Qualifications</label>
              <div className="flex items-center gap-3 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-cyan-500/50 transition-colors">
                <Award className="w-5 h-5 text-zinc-400" />
                <input
                  type="text"
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none text-white"
                />
              </div>
            </div>
          </div>

          {/* Clinic Address */}
          <div className="mt-6">
            <label className="block text-sm font-semibold text-zinc-300 mb-2">Clinic Address</label>
            <div className="flex items-start gap-3 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-cyan-500/50 transition-colors">
              <MapPin className="w-5 h-5 text-zinc-400 mt-0.5" />
              <textarea
                name="clinicAddress"
                value={formData.clinicAddress}
                onChange={handleChange}
                className="w-full bg-transparent outline-none text-white resize-none h-20 placeholder-zinc-500"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="mt-6">
            <label className="block text-sm font-semibold text-zinc-300 mb-2">Professional Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell patients about yourself..."
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:border-cyan-500/50 outline-none transition-colors resize-none h-24"
            />
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

export default DoctorProfilePage;
