import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Stethoscope, ArrowRight, CheckCircle } from 'lucide-react';
import ColorBends from '../components/ColorBends';
import AOS from 'aos';
import 'aos/dist/aos.css';

const RegisterSelection = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

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

      <div className="w-full max-w-6xl relative z-10">
        {/* Header */}
        <div className="text-center mb-16" data-aos="fade-up">
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">
            Join Our Platform
          </h1>
          <p className="text-lg text-zinc-400 hover:text-zinc-200 transition-all duration-300">
            Choose your role to get started with modern healthcare
          </p>
        </div>

        {/* Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Patient Card */}
          <Link to="/register-patient" className="group" data-aos="zoom-in" data-aos-delay="100">
            <div className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border border-blue-500/30 hover:border-blue-500/60 rounded-2xl p-8 md:p-10 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105 relative overflow-hidden">
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-full group-hover:translate-x-0"></div>

              <div className="relative z-10">
                {/* Icon */}
                <div className="flex justify-center mb-8">
                  <div className="w-20 h-20 bg-blue-500/10 border-2 border-blue-500/50 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Users className="w-10 h-10 text-blue-400" />
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-3xl font-black text-center mb-4 text-white">
                  Patient
                </h2>

                {/* Description */}
                <p className="text-zinc-400 text-center mb-6 leading-relaxed">
                  Book appointments, manage your health records, and get AI-powered insights
                </p>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {[
                    'Access your medical records anytime',
                    'AI-powered health insights',
                    'Book appointments instantly',
                    'Digital prescriptions'
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm text-zinc-400">
                      <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex items-center justify-center gap-2 text-blue-400 group-hover:gap-3 transition-all font-semibold">
                  Get Started as Patient
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>

          {/* Doctor Card */}
          <Link to="/register-doctor" className="group" data-aos="zoom-in" data-aos-delay="200">
            <div className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border border-purple-500/30 hover:border-purple-500/60 rounded-2xl p-8 md:p-10 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 hover:scale-105 relative overflow-hidden">
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-full group-hover:translate-x-0"></div>

              <div className="relative z-10">
                {/* Icon */}
                <div className="flex justify-center mb-8">
                  <div className="w-20 h-20 bg-purple-500/10 border-2 border-purple-500/50 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Stethoscope className="w-10 h-10 text-purple-400" />
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-3xl font-black text-center mb-4 text-white">
                  Doctor
                </h2>

                {/* Description */}
                <p className="text-zinc-400 text-center mb-6 leading-relaxed">
                  Manage patients, upload prescriptions, and build your reputation
                </p>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {[
                    'Manage patient appointments',
                    'Digital prescription system',
                    'Verified doctor profile',
                    'Build your reputation'
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm text-zinc-400">
                      <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex items-center justify-center gap-2 text-purple-400 group-hover:gap-3 transition-all font-semibold">
                  Get Started as Doctor
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Login Link */}
        <div className="text-center" data-aos="fade-up" data-aos-delay="300">
          <p className="text-zinc-400 mb-4">
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

        {/* Back to Home */}
        <div className="text-center mt-8" data-aos="fade-up" data-aos-delay="400">
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

export default RegisterSelection;
