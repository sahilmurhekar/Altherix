// /frontend/src/pages/doctor/ProfilePage.jsx

import React, { useState, useEffect } from 'react';
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
  Clock,
  Loader
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
const API_URL = `${SERVER_URL}/api`;

// Map click handler component
function MapClickHandler({ setFormData }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setFormData((prevData) => ({
        ...prevData,
        clinicLatitude: lat.toFixed(6),
        clinicLongitude: lng.toFixed(6)
      }));
    },
  });
  return null;
}

// Change map view component
function ChangeMapView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center[0] !== 0 && center[1] !== 0) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

const DoctorProfilePage = () => {
  const token = localStorage.getItem('token');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    licenseNumber: '',
    experience: '',
    qualifications: '',
    clinicAddress: '',
    city: '',
    bio: '',
    address: '',
    clinicLatitude: '',
    clinicLongitude: ''
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [previewPic, setPreviewPic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setProfileLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      if (data.user) {
        const user = data.user;

        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          specialization: user.specialization || '',
          licenseNumber: user.licenseNumber || '',
          experience: user.experience || '',
          qualifications: user.qualifications || '',
          clinicAddress: user.clinicLocation?.address || user.clinicAddress || '',
          city: user.city || '',
          bio: user.bio || '',
          address: user.location?.address || '',
          clinicLatitude: user.clinicLocation?.coordinates?.[1] || '',
          clinicLongitude: user.clinicLocation?.coordinates?.[0] || ''
        });

        setProfilePicture(user.profilePicture);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setMessage({ type: 'error', text: `Failed to load profile: ${err.message}` });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewPic(URL.createObjectURL(file));
      handleUploadPicture(file);
    }
  };

  const handleUploadPicture = async (file) => {
    setUploading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('profilePicture', file);

      const res = await fetch(`${API_URL}/auth/profile/upload-picture`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend
      });

      const data = await res.json();
      if (res.ok) {
        setProfilePicture(data.profilePicture);
        setMessage({ type: 'success', text: 'Profile picture updated!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Upload failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => fetchProfile(), 1000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Update failed' });
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage({ type: 'error', text: `Failed to update profile: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  // Map position logic - similar to patient profile
  const defaultPosition = [12.9165, 79.1325]; // Vellore, India
  const mapPosition = [
    formData.clinicLatitude ? parseFloat(formData.clinicLatitude) : defaultPosition[0],
    formData.clinicLongitude ? parseFloat(formData.clinicLongitude) : defaultPosition[1]
  ];
  const markerPosition = [
    formData.clinicLatitude ? parseFloat(formData.clinicLatitude) : null,
    formData.clinicLongitude ? parseFloat(formData.clinicLongitude) : null
  ];

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

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
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 mb-4 relative group overflow-hidden">
            {profilePicture || previewPic ? (
              <img
                src={previewPic || profilePicture}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-white" />
            )}
            <label className="absolute bottom-0 right-0 p-2 bg-zinc-900 border border-cyan-500/50 rounded-full hover:bg-zinc-800 transition-colors cursor-pointer">
              {uploading ? (
                <Loader className="w-4 h-4 text-cyan-400 animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-cyan-400" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handlePictureChange}
                className="hidden"
                disabled={uploading}
              />
            </label>
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
                  disabled
                  className="w-full bg-transparent outline-none text-white opacity-60 cursor-not-allowed"
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

            {/* Personal Address */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">City</label>
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
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="e.g., 10 years"
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
                  placeholder="e.g., MBBS, MD"
                  className="w-full bg-transparent outline-none text-white"
                />
              </div>
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

        {/* Clinic Information */}
        <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Clinic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Clinic Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-zinc-300 mb-2">Clinic Address</label>
              <div className="flex items-start gap-3 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-cyan-500/50 transition-colors">
                <MapPin className="w-5 h-5 text-zinc-400 mt-0.5" />
                <textarea
                  name="clinicAddress"
                  value={formData.clinicAddress}
                  onChange={handleChange}
                  placeholder="Enter your clinic address"
                  className="w-full bg-transparent outline-none text-white resize-none h-20 placeholder-zinc-500"
                />
              </div>
            </div>

            {/* Clinic Latitude */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">Clinic Latitude</label>
              <div className="flex items-center gap-3 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-cyan-500/50 transition-colors">
                <MapPin className="w-5 h-5 text-zinc-400" />
                <input
                  type="number"
                  step="0.000001"
                  name="clinicLatitude"
                  value={formData.clinicLatitude}
                  onChange={handleChange}
                  placeholder="e.g., 12.9165"
                  className="w-full bg-transparent outline-none text-white"
                />
              </div>
            </div>

            {/* Clinic Longitude */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">Clinic Longitude</label>
              <div className="flex items-center gap-3 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-cyan-500/50 transition-colors">
                <MapPin className="w-5 h-5 text-zinc-400" />
                <input
                  type="number"
                  step="0.000001"
                  name="clinicLongitude"
                  value={formData.clinicLongitude}
                  onChange={handleChange}
                  placeholder="e.g., 79.1325"
                  className="w-full bg-transparent outline-none text-white"
                />
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="mt-6">
            <label className="block text-sm font-semibold text-zinc-300 mb-2">Pin Clinic Location on Map</label>
            <div className="h-72 w-full rounded-lg overflow-hidden border border-zinc-700 z-0">
              <MapContainer
                center={mapPosition}
                zoom={formData.clinicLatitude ? 13 : 10}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Only show marker if we have valid coordinates */}
                {markerPosition[0] && markerPosition[1] && (
                  <Marker position={markerPosition}></Marker>
                )}

                {/* Add our helper components */}
                <MapClickHandler setFormData={setFormData} />
                <ChangeMapView center={mapPosition} />
              </MapContainer>
            </div>
            <p className="text-sm text-zinc-400 mt-2">Click on the map to set your clinic's precise location.</p>
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
