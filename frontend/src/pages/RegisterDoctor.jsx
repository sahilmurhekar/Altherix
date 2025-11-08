import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AlertCircle, Loader, MapPin, CheckCircle, MapPinOff, ArrowRight, Eye, EyeOff, User, Mail, Lock, Phone, Stethoscope, FileText, Calendar, DollarSign, Building } from 'lucide-react';
import ColorBends from '../components/ColorBends';
import AOS from 'aos';
import 'aos/dist/aos.css';

const RegisterDoctor = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '',
    specialization: '', licenseNumber: '', experience: '', clinicAddress: '', consultationFee: '',
    latitude: null, longitude: null, address: '',
    clinicLatitude: null, clinicLongitude: null
  });

  const [showPassword, setShowPassword] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [geoError, setGeoError] = useState('');
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
        setFormData(prev => ({
          ...prev,
          latitude,
          longitude
        }));
        getAddressFromCoords(latitude, longitude);
        setLocationStatus('Location obtained ✓');
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
      setFormData(prev => ({
        ...prev,
        address: data.address
      }));
    } catch (err) {
      console.error('Error getting address:', err);
    }
  };

  const handleClinicLocationChoice = (isCurrentLocation) => {
    if (isCurrentLocation) {
      setClinicAtCurrentLocation(true);
      setFormData(prev => ({
        ...prev,
        clinicAddress: prev.address,
        clinicLatitude: prev.latitude,
        clinicLongitude: prev.longitude
      }));
    } else {
      setClinicAtCurrentLocation(false);
      setFormData(prev => ({
        ...prev,
        clinicAddress: '',
        clinicLatitude: null,
        clinicLongitude: null
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
        <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-700 rounded-2xl p-8 md:p-10 hover:border-purple-500/50 transition-all duration-300" data-aos="fade-up">
          {/* Header */}
          <div className="text-center mb-8" data-aos="fade-up" data-aos-delay="100">
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
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm animate-in fade-in slide-in-from-top-2" data-aos="zoom-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {geoError && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm animate-in fade-in slide-in-from-top-2" data-aos="zoom-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{geoError}</span>
              </div>
            )}

            {/* Personal Location Status */}
            <div className="bg-gradient-to-r from-purple-500/10 to-purple-500/5 border border-purple-500/30 rounded-lg p-5" data-aos="fade-up" data-aos-delay="200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-sm font-semibold text-purple-400">Your Location</p>
                    <p className="text-xs text-zinc-400">{formData.address || 'Detecting...'}</p>
                  </div>
                </div>
                {locationStatus && <CheckCircle className="w-5 h-5 text-green-400" />}
              </div>
              <button
                type="button"
                onClick={getLocation}
                className="text-xs text-purple-400 hover:text-purple-300 underline transition-colors"
              >
                Update Location
              </button>
            </div>

            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-5">
              {/* Name */}
              <div data-aos="fade-up" data-aos-delay="250">
                <label className="block text-sm font-semibold mb-2 text-zinc-300">Full Name</label>
                <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-purple-500/50 transition-all duration-300 hover:bg-zinc-900/70">
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
              <div data-aos="fade-up" data-aos-delay="300">
                <label className="block text-sm font-semibold mb-2 text-zinc-300">Email Address</label>
                <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-purple-500/50 transition-all duration-300 hover:bg-zinc-900/70">
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
              <div data-aos="fade-up" data-aos-delay="350">
                <label className="block text-sm font-semibold mb-2 text-zinc-300">Password</label>
                <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-purple-500/50 transition-all duration-300 hover:bg-zinc-900/70">
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
              <div data-aos="fade-up" data-aos-delay="400">
                <label className="block text-sm font-semibold mb-2 text-zinc-300">Phone Number</label>
                <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-purple-500/50 transition-all duration-300 hover:bg-zinc-900/70">
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
              <div data-aos="fade-up" data-aos-delay="450">
                <label className="block text-sm font-semibold mb-2 text-zinc-300">Specialization</label>
                <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-purple-500/50 transition-all duration-300 hover:bg-zinc-900/70">
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
              <div data-aos="fade-up" data-aos-delay="500">
                <label className="block text-sm font-semibold mb-2 text-zinc-300">License Number</label>
                <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-purple-500/50 transition-all duration-300 hover:bg-zinc-900/70">
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
              <div data-aos="fade-up" data-aos-delay="550">
                <label className="block text-sm font-semibold mb-2 text-zinc-300">Experience (years)</label>
                <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-purple-500/50 transition-all duration-300 hover:bg-zinc-900/70">
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
              <div data-aos="fade-up" data-aos-delay="600">
                <label className="block text-sm font-semibold mb-2 text-zinc-300">Consultation Fee</label>
                <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-purple-500/50 transition-all duration-300 hover:bg-zinc-900/70">
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

            {/* Clinic Location Section */}
            {clinicAtCurrentLocation === null ? (
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-5" data-aos="fade-up" data-aos-delay="650">
                <p className="text-sm font-semibold text-purple-400 mb-4">Is your clinic at your current location?</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleClinicLocationChoice(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Yes, Same Location
                  </button>
                  <button
                    type="button"
                    onClick={() => handleClinicLocationChoice(false)}
                    className="bg-zinc-700 hover:bg-zinc-600 text-white py-3 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105"
                  >
                    <MapPinOff className="w-4 h-4" />
                    Different Location
                  </button>
                </div>
              </div>
            ) : null}

            {/* Manual Clinic Location Entry */}
            {clinicAtCurrentLocation === false && (
              <div className="space-y-4" data-aos="fade-up" data-aos-delay="700">
                <label className="block text-sm font-semibold text-purple-300">
                  <Building className="w-4 h-4 inline mr-2" />
                  Clinic Location Coordinates
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-purple-500/50 transition-all duration-300">
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="Latitude"
                      value={formData.clinicLatitude || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        clinicLatitude: e.target.value ? parseFloat(e.target.value) : null
                      }))}
                      required
                      className="w-full bg-transparent outline-none text-white placeholder-zinc-500"
                    />
                  </div>
                  <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-purple-500/50 transition-all duration-300">
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="Longitude"
                      value={formData.clinicLongitude || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        clinicLongitude: e.target.value ? parseFloat(e.target.value) : null
                      }))}
                      required
                      className="w-full bg-transparent outline-none text-white placeholder-zinc-500"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-purple-500/50 transition-all duration-300">
                  <Building className="w-5 h-5 text-zinc-400" />
                  <input
                    type="text"
                    value={formData.clinicAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, clinicAddress: e.target.value }))}
                    placeholder="Clinic Address (optional)"
                    className="w-full bg-transparent outline-none text-white placeholder-zinc-500"
                  />
                </div>
                <p className="text-xs text-zinc-400">
                  💡 Tip: You can get coordinates from Google Maps by right-clicking on your clinic location
                </p>
              </div>
            )}

            {/* Clinic Location Confirmation */}
            {clinicAtCurrentLocation !== null && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4" data-aos="fade-up" data-aos-delay="750">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-400 text-sm">Clinic Location Confirmed</p>
                    <p className="text-xs text-zinc-400">{formData.clinicAddress || formData.address}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.latitude || clinicAtCurrentLocation === null}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105 flex items-center justify-center gap-2"
              data-aos="zoom-in"
              data-aos-delay="800"
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
          <div className="text-center mt-8" data-aos="fade-up" data-aos-delay="900">
            <p className="text-zinc-400 mb-3">
              Already have an account?
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-semibold transition-all duration-300 group"
            >
              Login here
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Back to Selection */}
        <div className="text-center mt-6" data-aos="fade-up" data-aos-delay="1000">
          <Link
            to="/register"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors duration-300"
          >
            ← Back to role selection
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterDoctor;
