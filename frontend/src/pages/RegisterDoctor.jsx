import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AlertCircle, Loader, MapPin, CheckCircle, MapPinOff, ArrowRight, Eye, EyeOff, User, Mail, Lock, Phone, Stethoscope, FileText, Calendar, DollarSign, Building } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ColorBends from '../components/ColorBends';
import AOS from 'aos';
import 'aos/dist/aos.css';

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

function MapClickHandler({ setFormData, getClinicAddressFromCoords }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const latitude = lat.toFixed(6);
      const longitude = lng.toFixed(6);

      setFormData((prevData) => ({
        ...prevData,
        clinicLatitude: latitude,
        clinicLongitude: longitude
      }));

      // Fetch address for the clicked coordinates
      getClinicAddressFromCoords(parseFloat(latitude), parseFloat(longitude));
    },
  });
  return null;
}

function ChangeMapView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center[0] !== 0 && center[1] !== 0) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

const RegisterDoctor = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '',
    specialization: '', licenseNumber: '', experience: '', consultationFee: '',
    latitude: '', longitude: '', address: '',
    clinicAddress: '', clinicLatitude: '', clinicLongitude: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [geoError, setGeoError] = useState('');
  const [autoDetectedLocation, setAutoDetectedLocation] = useState({ lat: null, lng: null, address: '' });
  const [clinicAtCurrentLocation, setClinicAtCurrentLocation] = useState(null);
  const { registerDoctor, loading, error } = useContext(AuthContext);
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
        setAutoDetectedLocation({ lat: latitude, lng: longitude, address: '' });
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
        `http://localhost:5000/api/auth/address-from-coords?latitude=${lat}&longitude=${lng}`
      );
      const data = await response.json();
      setAutoDetectedLocation(prev => ({ ...prev, address: data.address }));
      setFormData(prev => ({
        ...prev,
        address: data.address
      }));
    } catch (err) {
      console.error('Error getting address:', err);
    }
  };

  const getClinicAddressFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/auth/address-from-coords?latitude=${lat}&longitude=${lng}`
      );
      const data = await response.json();
    } catch (err) {
      console.error('Error getting clinic address:', err);
    }
  };

  const handleClinicLocationChoice = (isCurrentLocation) => {
    if (isCurrentLocation) {
      setClinicAtCurrentLocation(true);
      setFormData(prev => ({
        ...prev,
        clinicAddress: autoDetectedLocation.address,
        clinicLatitude: autoDetectedLocation.lat,
        clinicLongitude: autoDetectedLocation.lng
      }));
    } else {
      setClinicAtCurrentLocation(false);
      setFormData(prev => ({
        ...prev,
        clinicAddress: '',
        clinicLatitude: '',
        clinicLongitude: ''
      }));
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.latitude || !formData.longitude) {
      setGeoError('Personal location is required.');
      return;
    }
    if (clinicAtCurrentLocation === null) {
      setGeoError('Please confirm your clinic location.');
      return;
    }
    if (!formData.clinicLatitude || !formData.clinicLongitude) {
      setGeoError('Clinic location is required.');
      return;
    }
    try {
      await registerDoctor(formData);
      navigate('/dashboard-doctor');
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const defaultPosition = [12.9165, 79.1325];
  const clinicMapPosition = [
    formData.clinicLatitude ? parseFloat(formData.clinicLatitude) : defaultPosition[0],
    formData.clinicLongitude ? parseFloat(formData.clinicLongitude) : defaultPosition[1]
  ];
  const clinicMarkerPosition = [
    formData.clinicLatitude ? parseFloat(formData.clinicLatitude) : null,
    formData.clinicLongitude ? parseFloat(formData.clinicLongitude) : null
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

      <div className="w-full max-w-3xl relative z-10">
        <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-700 rounded-2xl p-8 md:p-10 hover:border-purple-500/50 transition-all duration-300">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black mb-3 bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">
              Doctor Registration
            </h1>
            <p className="text-zinc-400 hover:text-zinc-200 transition-all duration-300">
              Join our platform and build your medical practice
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

            {/* Personal Location Status */}
            <div className="bg-gradient-to-r from-purple-500/10 to-purple-500/5 border border-purple-500/30 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-sm font-semibold text-purple-400">Your Location (Auto-detected)</p>
                  <p className="text-xs text-zinc-400">{autoDetectedLocation.address || 'Detecting...'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={getLocation}
                className="text-xs text-purple-400 hover:text-purple-300 underline transition-colors"
              >
                Re-detect Location
              </button>
            </div>

            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-zinc-300">Full Name</label>
                <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-purple-500/50">
                  <User className="w-5 h-5 text-zinc-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Dr. John Smith"
                    required
                    className="w-full bg-transparent outline-none text-white placeholder-zinc-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-zinc-300">Email Address</label>
                <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-purple-500/50">
                  <Mail className="w-5 h-5 text-zinc-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="doctor@example.com"
                    required
                    className="w-full bg-transparent outline-none text-white placeholder-zinc-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-zinc-300">Password</label>
                <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-purple-500/50">
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
                <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-purple-500/50">
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

              {/* Specialization */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-zinc-300">Specialization</label>
                <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-purple-500/50">
                  <Stethoscope className="w-5 h-5 text-zinc-400" />
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    placeholder="Cardiology"
                    required
                    className="w-full bg-transparent outline-none text-white placeholder-zinc-500"
                  />
                </div>
              </div>

              {/* License Number */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-zinc-300">License Number</label>
                <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-purple-500/50">
                  <FileText className="w-5 h-5 text-zinc-400" />
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    placeholder="MCI-12345"
                    required
                    className="w-full bg-transparent outline-none text-white placeholder-zinc-500"
                  />
                </div>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-zinc-300">Experience (years)</label>
                <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-purple-500/50">
                  <Calendar className="w-5 h-5 text-zinc-400" />
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="10 years"
                    required
                    className="w-full bg-transparent outline-none text-white placeholder-zinc-500"
                  />
                </div>
              </div>

              {/* Consultation Fee */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-zinc-300">Consultation Fee</label>
                <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-purple-500/50">
                  <DollarSign className="w-5 h-5 text-zinc-400" />
                  <input
                    type="number"
                    name="consultationFee"
                    value={formData.consultationFee}
                    onChange={handleChange}
                    placeholder="500"
                    required
                    className="w-full bg-transparent outline-none text-white placeholder-zinc-500"
                  />
                </div>
              </div>
            </div>

            {/* Clinic Location Question */}
            {clinicAtCurrentLocation === null && autoDetectedLocation.lat && (
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-5">
                <p className="text-sm font-semibold text-purple-400 mb-4">Is your clinic at your current location?</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleClinicLocationChoice(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Yes, Same Location
                  </button>
                  <button
                    type="button"
                    onClick={() => handleClinicLocationChoice(false)}
                    className="bg-zinc-700 hover:bg-zinc-600 text-white py-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <MapPinOff className="w-4 h-4" />
                    Different Location
                  </button>
                </div>
              </div>
            )}

            {/* Clinic Location Entry */}
            {clinicAtCurrentLocation === false && (
              <div className="space-y-4 bg-gradient-to-r from-purple-500/5 to-pink-500/5 border border-purple-500/20 rounded-lg p-5">
                <label className="block text-sm font-semibold text-purple-300">
                  <Building className="w-4 h-4 inline mr-2" />
                  Clinic Location
                </label>

                {/* Clinic Address */}
                <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-purple-500/50">
                  <Building className="w-5 h-5 text-zinc-400" />
                  <input
                    type="text"
                    name="clinicAddress"
                    value={formData.clinicAddress}
                    onChange={handleChange}
                    placeholder="Enter clinic address"
                    className="w-full bg-transparent outline-none text-white placeholder-zinc-500"
                  />
                </div>

                {/* Latitude and Longitude */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-2">Clinic Latitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      name="clinicLatitude"
                      value={formData.clinicLatitude}
                      onChange={handleChange}
                      placeholder="e.g., 12.9165"
                      className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:border-purple-500/50 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-2">Clinic Longitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      name="clinicLongitude"
                      value={formData.clinicLongitude}
                      onChange={handleChange}
                      placeholder="e.g., 79.1325"
                      className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:border-purple-500/50 outline-none"
                    />
                  </div>
                </div>

                {/* Map */}
                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2">Pin Clinic Location on Map</label>
                  <div className="h-64 w-full rounded-lg overflow-hidden border border-zinc-700">
                    <MapContainer
                      center={clinicMapPosition}
                      zoom={formData.clinicLatitude ? 13 : 10}
                      scrollWheelZoom={true}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {clinicMarkerPosition[0] && clinicMarkerPosition[1] && (
                        <Marker position={clinicMarkerPosition}></Marker>
                      )}
                      <MapClickHandler setFormData={setFormData} getClinicAddressFromCoords={getClinicAddressFromCoords} />
                      <ChangeMapView center={clinicMapPosition} />
                    </MapContainer>
                  </div>
                  <p className="text-xs text-zinc-400 mt-2">Click on the map to set your clinic's location</p>
                </div>
              </div>
            )}

            {/* Clinic Location Confirmation */}
            {clinicAtCurrentLocation !== null && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-400 text-sm">Clinic Location Confirmed</p>
                    <p className="text-xs text-zinc-400">{formData.clinicAddress || autoDetectedLocation.address}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.latitude || clinicAtCurrentLocation === null || !formData.clinicLatitude}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  Create Doctor Account
                  <ArrowRight className="w-5 h-5" />
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
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-semibold"
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

export default RegisterDoctor;
