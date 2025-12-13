import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AlertCircle, Loader, MapPin, CheckCircle, MapPinOff, ArrowRight, Eye, EyeOff, User, Mail, Lock, Phone, Calendar, Droplet, AlertTriangle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ColorBends from '../components/ColorBends';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper component: MapClickHandler
function MapClickHandler({ setFormData, getAddressFromCoords }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const latitude = lat.toFixed(6);
      const longitude = lng.toFixed(6);

      setFormData((prevData) => ({
        ...prevData,
        latitude,
        longitude
      }));

      // Fetch address for the clicked coordinates
      getAddressFromCoords(parseFloat(latitude), parseFloat(longitude));
    },
  });
  return null;
}

// Helper component: ChangeMapView
function ChangeMapView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center[0] !== 0 && center[1] !== 0) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

const RegisterPatient = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '',
    dateOfBirth: '', bloodType: '', allergies: '',
    latitude: '', longitude: '', address: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [geoError, setGeoError] = useState('');
  const { registerPatient, loading, error } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
    getLocation();
  }, []);

  const getLocation = () => {
    setLocationStatus('Getting your location...');
    setGeoError('');

    if (!navigator.geolocation) {
      setGeoError('Geolocation not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          latitude,
          longitude
        }));
        getAddressFromCoords(latitude, longitude);
        setLocationStatus('Location detected ✓');
      },
      (error) => {
        setGeoError(`Error: ${error.message}. Please enable location access.`);
        setLocationStatus('');
      }
    );
  };

  const getAddressFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(
        `${SERVER_URL}/api/auth/address-from-coords?latitude=${lat}&longitude=${lng}`
      );
      const data = await response.json();

      // Update form data with the fetched address
      setFormData(prev => ({
        ...prev,
        address: data.address
      }));
    } catch (err) {
      console.error('Error getting address:', err);
    }
  };

  const handleLocationChoice = (isCurrentLocation) => {
    if (isCurrentLocation) {
      setAtCurrentLocation(true);
      setFormData(prev => ({
        ...prev,
        latitude: autoDetectedLocation.lat,
        longitude: autoDetectedLocation.lng,
        address: autoDetectedLocation.address
      }));
    } else {
      setAtCurrentLocation(false);
      setFormData(prev => ({
        ...prev,
        latitude: '',
        longitude: '',
        address: ''
      }));
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.latitude || !formData.longitude) {
      setGeoError('Location is required. Please allow location access.');
      return;
    }
    try {
      await registerPatient(formData);
      navigate('/dashboard-patient');
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

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
    <div className="min-h-screen flex items-center justify-center bg-transparent px-4 py-12 relative overflow-hidden">
      <ColorBends
        colors={["#6d1799"]}
        rotation={30}
        speed={0.3}
        mouseInfluence={0.8}
        parallax={0.6}
        noise={0.08}
      />

      <div className="w-full max-w-2xl relative z-10">
        <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-700 rounded-2xl p-8 md:p-10 hover:border-blue-500/50 transition-all duration-300">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black mb-3 bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">
              Patient Registration
            </h1>
            <p className="text-zinc-400 hover:text-zinc-200 transition-all duration-300">
              Create your account and start your healthcare journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Messages */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {geoError && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{geoError}</span>
              </div>
            )}

            {/* Auto-detected Location Status */}
            <div className="bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-500/30 rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-sm font-semibold text-blue-400">Your Location</p>
                    <p className="text-xs text-zinc-400">{formData.address || 'Detecting...'}</p>
                  </div>
                </div>
                {formData.latitude && formData.longitude && <CheckCircle className="w-5 h-5 text-green-400" />}
              </div>
              <button
                type="button"
                onClick={getLocation}
                className="text-xs text-blue-400 hover:text-blue-300 underline transition-colors"
              >
                Re-detect Location
              </button>
            </div>

            {/* Form Fields Grid */}
            <div className="grid md:grid-cols-2 gap-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-zinc-300">Full Name</label>
                <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-blue-500/50">
                  <User className="w-5 h-5 text-zinc-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="w-full bg-transparent outline-none text-white placeholder-zinc-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-zinc-300">Email Address</label>
                <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-blue-500/50">
                  <Mail className="w-5 h-5 text-zinc-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-transparent outline-none text-white placeholder-zinc-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-zinc-300">Password</label>
                <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-blue-500/50">
                  <Lock className="w-5 h-5 text-zinc-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full bg-transparent outline-none text-white placeholder-zinc-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-zinc-300">Phone Number</label>
                <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-blue-500/50">
                  <Phone className="w-5 h-5 text-zinc-400" />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    required
                    className="w-full bg-transparent outline-none text-white placeholder-zinc-500"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-zinc-300">Date of Birth</label>
                <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-blue-500/50">
                  <Calendar className="w-5 h-5 text-zinc-400" />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                    className="w-full bg-transparent outline-none text-white placeholder-zinc-500"
                  />
                </div>
              </div>

              {/* Blood Type */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-zinc-300">Blood Type</label>
                <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-blue-500/50">
                  <Droplet className="w-5 h-5 text-zinc-400" />
                  <select
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleChange}
                    required
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
            </div>

            {/* Allergies */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-zinc-300">Allergies (if any)</label>
              <div className="flex items-start gap-3 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-blue-500/50">
                <AlertTriangle className="w-5 h-5 text-zinc-400 mt-0.5" />
                <input
                  type="text"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  placeholder="Penicillin, Peanuts, etc."
                  required
                  className="w-full bg-transparent outline-none text-white placeholder-zinc-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.latitude}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin inline mr-2" />
                  Registering...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5 inline ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-8">
            <p className="text-zinc-400 mb-3">
              Already have an account?
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold"
            >
              Login here
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Back to Selection */}
        <div className="text-center mt-6">
          <Link
            to="/register"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            ← Back to role selection
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPatient;
