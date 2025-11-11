// /frontend/src/pages/patient/ProfilePage.jsx

import React, { useState, useContext, useEffect } from 'react';
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
  Camera,
  Loader
} from 'lucide-react';

// --- 🗺️ NEW MAP IMPORTS ---
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS
import L from 'leaflet';

// --- FIX FOR DEFAULT MARKER ICON ---
// This fixes a common issue in React-Leaflet where the default marker icon doesn't appear.
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41], // Point of the icon which will correspond to marker's location
    popupAnchor: [1, -34], // Point from which the popup should open
    shadowSize: [41, 41]  // Size of the shadow
});

L.Marker.prototype.options.icon = DefaultIcon;
// --- END OF ICON FIX ---

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

// --- NEW HELPER COMPONENT: MapClickHandler ---
// This component listens for clicks on the map and updates the form state.
function MapClickHandler({ setFormData }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setFormData((prevData) => ({
        ...prevData,
        latitude: lat.toFixed(6), // Use toFixed for cleaner data
        longitude: lng.toFixed(6)
      }));
    },
  });
  return null;
}

// --- NEW HELPER COMPONENT: ChangeMapView ---
// This component automatically centers the map when the coordinates in the form state change.
function ChangeMapView({ center }) {
  const map = useMap();
  useEffect(() => {
    // Check if coordinates are valid before setting view
    if (center[0] !== 0 && center[1] !== 0) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export const ProfilePage = () => {
  const { user, token } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    bloodType: '',
    allergies: '',
    address: '',
    // --- ADDED LOCATION FIELDS ---
    latitude: '',
    longitude: ''
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewPic, setPreviewPic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.user) {
        setFormData({
          name: data.user.name || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          dateOfBirth: data.user.dateOfBirth || '',
          bloodType: data.user.bloodType || '',
          allergies: data.user.allergies || '',
          // --- FIX 2: READ FROM NESTED OBJECTS ---
          address: data.user.location?.address || '',
          latitude: data.user.location?.coordinates?.[1] || '',
          longitude: data.user.location?.coordinates?.[0] || ''
        });
        setProfilePicture(data.user.profilePicture);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setMessage({ type: 'error', text: 'Failed to load profile' });
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

      const res = await fetch(`${SERVER_URL}/api/auth/profile/upload-picture`, {
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
    } catch (err){
      setMessage({ type: 'error', text: 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${SERVER_URL}/api/auth/profile`, {
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
      } else {
        setMessage({ type: 'error', text: data.message || 'Update failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: Create a valid map position from state ---
  // Use a default location (e.g., Vellore, India) if no coordinates are set
  const defaultPosition = [12.9165, 79.1325];
  const mapPosition = [
    formData.latitude ? parseFloat(formData.latitude) : defaultPosition[0],
    formData.longitude ? parseFloat(formData.longitude) : defaultPosition[1]
  ];
  const markerPosition = [
    formData.latitude ? parseFloat(formData.latitude) : null,
    formData.longitude ? parseFloat(formData.longitude) : null
  ];

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

            {/* Latitude */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">Latitude</label>
              <div className="flex items-center gap-3 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-cyan-500/50 transition-colors">
                <MapPin className="w-5 h-5 text-zinc-400" />
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange} // Now this will update the map!
                  placeholder="e.g., 12.9165"
                  className="w-full bg-transparent outline-none text-white"
                />
              </div>
            </div>

            {/* Longitude */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">Longitude</label>
              <div className="flex items-center gap-3 bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-cyan-500/50 transition-colors">
                <MapPin className="w-5 h-5 text-zinc-400" />
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange} // Now this will update the map!
                  placeholder="e.g., 79.1325"
                  className="w-full bg-transparent outline-none text-white"
                />
              </div>
            </div>
          </div>

          {/* --- NEW MAP SECTION --- */}
          <div className="mt-6">
            <label className="block text-sm font-semibold text-zinc-300 mb-2">Pin Location on Map</label>
            <div className="h-72 w-full rounded-lg overflow-hidden border border-zinc-700 z-0">
              <MapContainer
                center={mapPosition}
                zoom={formData.latitude ? 13 : 10} // Zoom in if location is set
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
            <p className="text-sm text-zinc-400 mt-2">Click on the map to set your precise location.</p>
          </div>
          {/* --- END OF MAP SECTION --- */}


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
