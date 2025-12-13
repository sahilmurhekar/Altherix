import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, Loader, ArrowRight, Eye, EyeOff } from 'lucide-react';
import ColorBends from '../components/ColorBends';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      if (user.userType === 'patient') {
        navigate('/dashboard-patient');
      } else if (user.userType === 'doctor') {
        navigate('/dashboard-doctor');
      }
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent px-4 relative overflow-hidden">
      <ColorBends
        colors={["#6d1799"]}
        rotation={30}
        speed={0.3}
        mouseInfluence={0.8}
        parallax={0.6}
        noise={0.08}
      />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-700 rounded-2xl p-8 md:p-10 hover:border-blue-500/50 transition-all duration-300" data-aos="fade-up">
          {/* Header */}
          <div className="text-center mb-8" data-aos="fade-up" data-aos-delay="100">
            <h1 className="text-4xl font-black mb-3 bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-zinc-400 hover:text-zinc-200 transition-all duration-300">
              Login to your account and continue your healthcare journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm animate-in fade-in slide-in-from-top-2" data-aos="zoom-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div data-aos="fade-up" data-aos-delay="200">
              <label className="block text-sm font-semibold mb-2 text-zinc-300">Email Address</label>
              <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-blue-500/50 transition-all duration-300 hover:bg-zinc-900/70">
                <Mail className="w-5 h-5 text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-transparent outline-none text-white placeholder-zinc-500"
                />
              </div>
            </div>

            {/* Password Field */}
            <div data-aos="fade-up" data-aos-delay="300">
              <label className="block text-sm font-semibold mb-2 text-zinc-300">Password</label>
              <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-blue-500/50 transition-all duration-300 hover:bg-zinc-900/70">
                <Lock className="w-5 h-5 text-zinc-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 flex items-center justify-center gap-2"
              data-aos="zoom-in"
              data-aos-delay="400"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  Login
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8" data-aos="fade-up" data-aos-delay="500">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center" data-aos="fade-up" data-aos-delay="600">
            <p className="text-zinc-400 mb-4">
              Create your account and experience the future of healthcare
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold transition-all duration-300 group"
            >
              Register here
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6" data-aos="fade-up" data-aos-delay="700">
          <Link
            to="/"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors duration-300"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
