import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AlertCircle, Loader, MapPin, CheckCircle, ArrowRight, Eye, EyeOff, User, Mail, Lock, Phone, Calendar, Droplet, AlertTriangle } from 'lucide-react';
import ColorBends from '../components/ColorBends';
import AOS from 'aos';
import 'aos/dist/aos.css';

const RegisterPatient = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '',
    dateOfBirth: '', bloodType: '', allergies: '',
    latitude: null, longitude: null, address: ''
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.latitude || !formData.longitude) {
      setGeoError('Location is required. Please enable location access.');
      return;
    }
    try {
      await registerPatient(formData);
      navigate('/dashboard-patient');
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

      <div className="w-full max-w-2xl relative z-10">
        <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-700 rounded-2xl p-8 md:p-10 hover:border-blue-500/50 transition-all duration-300" data-aos="fade-up">
          {/* Header */}
          <div className="text-center mb-8" data-aos="fade-up" data-aos-delay="100">
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

            {/* Location Status */}
            <div className="bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-500/30 rounded-lg p-5" data-aos="fade-up" data-aos-delay="200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-sm font-semibold text-blue-400">Your Location</p>
                    <p className="text-xs text-zinc-400">{formData.address || 'Detecting...'}</p>
                  </div>
                </div>
                {locationStatus && <CheckCircle className="w-5 h-5 text-green-400" />}
              </div>
              <button
                type="button"
                onClick={getLocation}
                className="text-xs text-blue-400 hover:text-blue-300 underline transition-colors"
              >
                Update Location
              </button>
            </div>

            {/* Form Fields */}
            <div className="grid md:grid-cols-2 gap-5">
              {/* Name */}
              <div data-aos="fade-up" data-aos-delay="250">
                <label className="block text-sm font-semibold mb-2 text-zinc-300">Full Name</label>
                <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-blue-500/50 transition-all duration-300 hover:bg-zinc-900/70">
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
              <div data-aos="fade-up" data-aos-delay="300">
                <label className="block text-sm font-semibold mb-2 text-zinc-300">Email Address</label>
                <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-blue-500/50 transition-all duration-300 hover:bg-zinc-900/70">
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
              <div data-aos="fade-up" data-aos-delay="350">
                <label className="block text-sm font-semibold mb-2 text-zinc-300">Password</label>
                <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-blue-500/50 transition-all duration-300 hover:bg-zinc-900/70">
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
                <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-blue-500/50 transition-all duration-300 hover:bg-zinc-900/70">
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
              <div data-aos="fade-up" data-aos-delay="450">
                <label className="block text-sm font-semibold mb-2 text-zinc-300">Date of Birth</label>
                <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-blue-500/50 transition-all duration-300 hover:bg-zinc-900/70">
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
              <div data-aos="fade-up" data-aos-delay="500">
                <label className="block text-sm font-semibold mb-2 text-zinc-300">Blood Type</label>
                <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-blue-500/50 transition-all duration-300 hover:bg-zinc-900/70">
                  <Droplet className="w-5 h-5 text-zinc-400" />
                  <input
                    type="text"
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleChange}
                    placeholder="A+"
                    required
                    className="w-full bg-transparent outline-none text-white placeholder-zinc-500"
                  />
                </div>
              </div>
            </div>

            {/* Allergies */}
            <div data-aos="fade-up" data-aos-delay="550">
              <label className="block text-sm font-semibold mb-2 text-zinc-300">Allergies (if any)</label>
              <div className="flex items-start gap-3 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-blue-500/50 transition-all duration-300 hover:bg-zinc-900/70">
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
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 flex items-center justify-center gap-2"
              data-aos="zoom-in"
              data-aos-delay="600"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-8" data-aos="fade-up" data-aos-delay="700">
            <p className="text-zinc-400 mb-3">
              Already have an account?
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold transition-all duration-300 group"
            >
              Login here
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Back to Selection */}
        <div className="text-center mt-6" data-aos="fade-up" data-aos-delay="800">
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

export default RegisterPatient
