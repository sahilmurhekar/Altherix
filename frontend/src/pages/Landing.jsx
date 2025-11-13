import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import HeroImage from '../assets/hero.png'
import ColorBends from '../components/ColorBends'
import Magnet from '../components/Magnet'
import Footer from '../components/Footer'
import AOS from 'aos';
import 'aos/dist/aos.css';
import emailjs from '@emailjs/browser';
import { CheckCircle, Shield, Database, Brain, Clock, Lock, Stethoscope, TrendingUp, FileText, Pill, ChevronDown, Twitter, Linkedin, Facebook, Instagram, Mail, Phone, MapPin, ArrowRight, Zap, Eye, AlertCircle, Send, Loader } from 'lucide-react'
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

const Landing = () => {
  const [expandedFaq, setExpandedFaq] = useState(0)
  const [comparisonView, setComparisonView] = useState('all')

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    userType: 'patient'
  })
  const [contactLoading, setContactLoading] = useState(false)
  const [contactStatus, setContactStatus] = useState(null)

  const handleContactChange = (e) => {
    const { name, value } = e.target
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleContactSubmit = async (e) => {
  e.preventDefault();
  setContactLoading(true);
  setContactStatus(null);

  const templateParams = {
    name: contactForm.name,
    email: contactForm.email,
    phone: contactForm.phone,
    userType: contactForm.userType,
    subject: contactForm.subject,
    message: contactForm.message,
    time: new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    setContactStatus({
      type: 'success',
      message: "Thank you! We'll get back to you soon.",
    });
    setContactForm({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      userType: 'patient',
    });
  } catch (error) {
    console.error('EmailJS Error:', error);
    setContactStatus({
      type: 'error',
      message: 'Failed to send message. Please try again later.',
    });
  } finally {
    setContactLoading(false);
  }
};

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  emailjs.init(EMAILJS_PUBLIC_KEY);
  }, []);

  return (
    <div className="w-full bg-transparent">
      <ColorBends
        colors={["#6d1799"]}
        rotation={30}
        speed={0.3}
        mouseInfluence={0.8}
        parallax={0.6}
        noise={0.08}
      />

      {/* Wrapper with max-width constraint */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Navbar />

        {/* Hero Section */}
        <div id='hero' className="w-full mt-20 min-h-[90vh] lg:min-h-[600px] flex flex-col pt-18 lg:pt-0 lg:flex-row justify-center lg:justify-between items-center gap-6" data-aos="fade-up">
          <div className='lg:w-1/2 flex flex-col justify-center items-center lg:items-start gap-8'>
            <h1 className='text-3xl text-center lg:text-left font-black md:text-4xl lg:text-5xl inline-block bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent' data-aos="fade-left">Where AI Meets Blockchain to Redefine Your Health.</h1>
            <h3 className='text-sm md:text-md md:w-1/2 lg:w-full lg:text-lg text-center lg:text-left text-zinc-400 hover:text-zinc-200 transition-all duration-300' data-aos="fade-up" data-aos-delay="100">Experience the future of healthcare where your medical records, appointments, and AI-powered health insights are unified under one secure, blockchain-protected platform.</h3>
            <div className='flex flex-col md:flex-row gap-4' data-aos="fade-up" data-aos-delay="200">
              <a href="/login" className="border-none btn bg-blue-500 w-full md:w-auto hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300" data-aos="zoom-in">Get Started</a>
              <a href="/login" className="border-none btn bg-purple-600 hover:shadow-lg hover:shadow-purple-600/50 hover:scale-105 transition-all duration-300  w-full md:w-auto" data-aos="zoom-in" data-aos-delay="100">Book Appointment</a>
            </div>
          </div>
          <div className='lg:w-3/7 flex justify-center items-center lg:justify-end lg:items-center' data-aos="fade-right">
            <Magnet padding={10} disabled={false} magnetStrength={10}><img className='pt-6 md:pt-18 md:p-36 lg:p-24 animate-float' src={HeroImage} alt="" /></Magnet>
          </div>
        </div>

        {/* Problems Section */}
        <section id='problems' className="py-20 lg:py-28" data-aos="fade-up" data-aos-delay="100">
          <div className="mb-16 text-center" data-aos="fade-left">
            <h2 className="text-3xl md:text-4xl font-black mb-8" data-aos="fade-up">
              Healthcare Should Work <span className="bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">For You</span>
            </h2>
            <p className="text-sm md:text-lg text-zinc-400 hover:text-zinc-200 transition-all duration-300 max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="100">
              Today's healthcare is fragmented and confusing. We're here to change that.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {[
              {
                title: "Scattered Records",
                desc: "Your medical reports are fragmented across hospitals and labs. We unify them into one secure, accessible timeline.",
                icon: "📋"
              },
              {
                title: "Weak Security",
                desc: "Data breaches and lost files are common. Our blockchain infrastructure ensures encryption, immutability, and protection.",
                icon: "🔒"
              },
              {
                title: "Complex Medical Jargon",
                desc: "Medical terminology is overwhelming. Our AI translates complex data into clear, understandable language.",
                icon: "🧠"
              },
              {
                title: "Hard to Find Doctors",
                desc: "Finding the right specialist is difficult. We offer verified profiles, genuine reviews, and smart filters.",
                icon: "👨‍⚕️"
              }
            ].map((problem, idx) => (
              <div key={idx} className="bg-zinc-900/30 hover:bg-zinc-900/70 w-full md:w-5/12 border border-slate-700 rounded-lg p-8 hover:border-blue-500/50 transition-all duration-300" data-aos="zoom-in" data-aos-delay={`${idx * 100}`}>
                <div className="text-4xl mb-4 text-center" data-aos="fade-up">{problem.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-center" data-aos="fade-up" data-aos-delay="50">{problem.title}</h3>
                <p className="text-zinc-400 leading-relaxed text-center" data-aos="fade-up" data-aos-delay="100">{problem.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Solutions Section */}
        <section id='solutions' className="py-20 lg:py-28" data-aos="fade-up" data-aos-delay="200">
          <div className="mb-16 text-center" data-aos="fade-right">
            <h2 className="text-3xl md:text-4xl font-black mb-8" data-aos="fade-up">
              What <span className="bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">we do?</span>
            </h2>
            <p className="text-sm md:text-lg text-zinc-400 hover:text-zinc-200 transition-all duration-300 max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="100">
              We blend cutting-edge technology with patient-centric design to create an intuitive, efficient healthcare experience.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {[
              {
                title: "Smart Appointment Booking",
                desc: "Schedule instantly with verified doctors, choose telemedicine or in-person, and get automated reminders."
              },
              {
                title: "Blockchain-Secured Records",
                desc: "Encrypted, immutable records stored permanently on blockchain. Share securely with full control."
              },
              {
                title: "AI Health Insights",
                desc: "Upload reports and get instant analysis. Understand abnormalities, risks, and drug interactions."
              },
              {
                title: "Digital Prescriptions",
                desc: "Replace paper prescriptions with AI-assisted digital ones. Get refill alerts and conflict warnings."
              },
              {
                title: "Health Timeline Dashboard",
                desc: "Visualize your complete health history in one dynamic dashboard with smart filtering and pattern recognition."
              },
              {
                title: "Verified Doctor Reviews",
                desc: "Read genuine patient reviews and make confident healthcare choices with verified provider credibility."
              }
            ].map((solution, idx) => (
              <div key={idx} className="w-full md:w-7/16 bg-gradient-to-r from-blue-500/5 to-pink-500/5 hover:from-blue-500/15 hover:to-pink-500/15 border border-blue-500/10 rounded-lg p-8 hover:border-blue-500/60 transition-all duration-300" data-aos="zoom-in" data-aos-delay={`${idx * 100}`}>
                <div className="flex items-start gap-4" data-aos="fade-up">
                  <CheckCircle className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" data-aos="fade-left" />
                  <div>
                    <h3 className="text-lg font-bold mb-2" data-aos="fade-up">{solution.title}</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed" data-aos="fade-up" data-aos-delay="50">{solution.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* For Patients & Doctors Section */}
        <section id='pandd'  data-aos="fade-up" data-aos-delay="300">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* For Patients */}
            <div id='patients' className='py-20 lg:py-28' data-aos="fade-left">
              <div className="mb-10" data-aos="fade-up">
                <h3 className="text-3xl md:text-4xl font-black mb-6 text-center lg:text-left" data-aos="fade-up">
                  For <span className="bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">Patients</span>
                </h3>
                <p className="text-sm md:text-lg text-center lg:text-left text-zinc-400 hover:text-zinc-200 transition-all duration-300" data-aos="fade-up" data-aos-delay="100">Empower yourself with tools to understand, manage, and secure your health journey.</p>
              </div>

              <div className="space-y-6">
                {[
                  { title: "Records, Always Accessible", desc: "View and download your medical data anytime, anywhere.", icon: Database },
                  { title: "Health Insights You Understand", desc: "AI simplifies complex lab reports into clear explanations.", icon: Brain },
                  { title: "Save Time & Money", desc: "Book consultations instantly and avoid unnecessary tests.", icon: Clock },
                  { title: "Data Ownership You Deserve", desc: "Your health data is encrypted and owned exclusively by you.", icon: Lock },
                  { title: "Smart Medication Management", desc: "Automatic reminders, drug compatibility checks, and seamless refills.", icon: Pill }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 md:pl-32 lg:pl-0" data-aos="zoom-in" data-aos-delay={`${idx * 100}`}>
                    <div className="w-10 h-10 rounded-full bg-blue-500/5 border border-blue-500/50 flex items-center justify-center flex-shrink-0" data-aos="fade-up">
                      <item.icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1" data-aos="fade-up">{item.title}</h4>
                      <p className="text-sm text-zinc-400" data-aos="fade-up" data-aos-delay="50">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className='flex justify-center lg:justify-start' data-aos="fade-up" data-aos-delay="500">
                <a href='/login'><button className="border-none mt-10 btn bg-blue-500 hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 w-full md:w-auto" data-aos="zoom-in">
                  Start Managing Your Health
                </button></a>
              </div>
            </div>

            {/* For Doctors */}
            <div id='doctors' className='py-20 lg:py-28' data-aos="fade-right">
              <div className="mb-10" data-aos="fade-up">
                <h3 className="text-3xl text-center lg:text-left md:text-4xl font-black mb-6" data-aos="fade-up">
                  <span className="bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">For</span> Doctors.
                </h3>
                <p className="text-sm md:text-lg text-center lg:text-left text-zinc-400 hover:text-zinc-200 transition-all duration-300" data-aos="fade-up" data-aos-delay="100">Deliver exceptional care with a secure, efficient ecosystem for your practice.</p>
              </div>

              <div className="space-y-6">
                {[
                  { title: "Full Patient Context", desc: "Access comprehensive medical histories instantly for better diagnostics.", icon: Stethoscope },
                  { title: "Streamlined Workflows", desc: "Manage appointments, reports, and prescriptions digitally in one place.", icon: FileText },
                  { title: "Build Reputation & Trust", desc: "Verified reviews and blockchain validation enhance your credibility.", icon: TrendingUp },
                  { title: "Effortless Compliance", desc: "Blockchain-backed audit trails ensure HIPAA and GDPR compliance.", icon: Shield },
                  { title: "Focus on Healing", desc: "Automation handles scheduling and records while you focus on patients.", icon: CheckCircle }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 md:pl-32 lg:pl-0" data-aos="zoom-in" data-aos-delay={`${idx * 100}`}>
                    <div className="w-10 h-10 rounded-full bg-purple-500/5 border border-purple-500/50 flex items-center justify-center flex-shrink-0" data-aos="fade-up">
                      <item.icon className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1" data-aos="fade-up">{item.title}</h4>
                      <p className="text-sm text-zinc-400" data-aos="fade-up" data-aos-delay="50">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className='flex justify-center lg:justify-start' data-aos="fade-up" data-aos-delay="500">
               <a href='/login'> <button className="border-none mt-10 btn bg-purple-600 hover:shadow-lg hover:shadow-purple-600/50 hover:scale-105 transition-all duration-300 w-full md:w-auto" data-aos="zoom-in">
                  Join as a Healthcare Provider
                </button></a>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST & CREDIBILITY SECTION */}
        <section id='trust' className="py-20 lg:py-28" data-aos="fade-up" data-aos-delay="400">
          <div className="bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 rounded-3xl blur-3xl z-10" data-aos="zoom-in"></div>

          <div className="mb-16 flex flex-col items-center justify-center" data-aos="fade-left">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 mb-8 lg:mb-12" data-aos="fade-up">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-blue-300">SECURITY FIRST</span>
            </div>
            <h2 className="text-center lg:text-left text-3xl md:text-4xl font-black mb-8" data-aos="fade-up">
              Trusted, Compliant, and <span className="bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">Proven Secure</span>
            </h2>
            <p className="text-sm md:text-lg text-center text-zinc-400 hover:text-zinc-200 transition-all duration-300 max-w-3xl" data-aos="fade-up" data-aos-delay="100">
              Our infrastructure is designed for uncompromising security and transparency. Every byte of your data is encrypted, verified, and protected under global healthcare data standards.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Privacy Assurance through Encryption", icon: Eye, colorBg: "bg-yellow-500/10", colorBorder: "border-yellow-500/50", colorIcon: "text-yellow-400", colorHover: "hover:border-yellow-500/50" },
              { title: "CORS Secured: Zero Data Breaches", icon: Lock, colorBg: "bg-purple-500/10", colorBorder: "border-purple-500/50", colorIcon: "text-purple-400", colorHover: "hover:border-purple-500/50" },
              { title: "Blockchain-Verified Medical History", icon: Zap, colorBg: "bg-blue-500/10", colorBorder: "border-blue-500/50", colorIcon: "text-blue-400", colorHover: "hover:border-blue-500/50" },
              {title: "24/7 Customer Support Available", icon: Phone, colorBg: "bg-red-500/10", colorBorder: "border-red-500/50", colorIcon: "text-red-400", colorHover: "hover:border-red-500/50"}
            ].map((stat, idx) => (
              <div key={idx} className={`bg-zinc-900/30 group overflow-hidden rounded-xl border ${stat.colorBorder} ${stat.colorHover} transition-all duration-300 p-6 hover:bg-zinc-900/60`} data-aos="zoom-in" data-aos-delay={`${idx * 100}`}>
                <div className="relative z-10 flex items-center gap-4" data-aos="fade-up">
                  <div className={`w-10 h-10 rounded-lg ${stat.colorBg} border ${stat.colorBorder} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`} data-aos="fade-left">
                    <stat.icon className={`w-5 h-5 ${stat.colorIcon}`} />
                  </div>
                  <p className="font-semibold leading-relaxed" data-aos="fade-up" data-aos-delay="50">{stat.title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id='how' className="py-20 lg:py-28" data-aos="fade-up" data-aos-delay="500">
          <div className="mb-16 text-center" data-aos="fade-right">
            <h2 className="text-3xl md:text-4xl font-black mb-12 lg:mb-32" data-aos="fade-up">
              How it <span className="bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">Works?</span>
            </h2>
          </div>

          <div className="relative">
            {/* Connecting lines for desktop */}
            <div className="hidden lg:block absolute top-20 left-1/4 right-1/4 h-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" data-aos="fade-up"></div>

            <div className="grid md:grid-cols-3 gap-8 md:gap-6">
              {[
                {
                  step: 1,
                  title: "Create Your Secure Profile",
                  desc: "Sign up with Google or your mobile number. Verification takes less than a minute.",
                  icon: "🔐"
                },
                {
                  step: 2,
                  title: "Connect & Upload",
                  desc: "Patients can find doctors and upload reports, while doctors can start managing patient data immediately.",
                  icon: "🔗"
                },
                {
                  step: 3,
                  title: "Experience Seamless Healthcare",
                  desc: "Access insights, manage prescriptions, and enjoy full blockchain protection — all in one unified dashboard.",
                  icon: "✨"
                }
              ].map((item, idx) => (
                <div key={idx} className="relative" data-aos="zoom-in" data-aos-delay={`${idx * 150}`}>
                  <div className="text-center">
                    <div className="relative mb-6 inline-block" data-aos="fade-up">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center mx-auto" data-aos="zoom-in">
                        <span className="text-4xl">{item.icon}</span>
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-pink-400 flex items-center justify-center font-bold text-sm text-white" data-aos="fade-up">
                        {item.step}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-3" data-aos="fade-up" data-aos-delay="50">{item.title}</h3>
                    <p className="text-sm md:text-md text-zinc-400 leading-relaxed" data-aos="fade-up" data-aos-delay="100">{item.desc}</p>
                  </div>
                  {idx < 2 && <div className="hidden md:block absolute top-8 -right-4 text-2xl text-blue-500/50" data-aos="fade-up">→</div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TECHNOLOGY SECTION */}
        <section id='tech' className="py-20 lg:py-28" data-aos="fade-up" data-aos-delay="600">
          <div className="mb-16 flex flex-col items-center justify-center" data-aos="fade-left">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-2 mb-8" data-aos="fade-up">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold text-purple-300">CUTTING-EDGE TECH</span>
            </div>
            <h2 className="text-center lg:text-left text-3xl md:text-4xl font-black mb-4" data-aos="fade-up">
              Technology that <span className="bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">Builds Trust</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Blockchain Security",
                desc: "SHA-256 encryption and distributed storage ensure records can't be altered or deleted.",
                icon: "⛓️",
                gradient: "from-blue-600/20 to-blue-400/5"
              },
              {
                title: "AI-Powered Intelligence",
                desc: "Advanced AI models analyze reports, predict potential risks, and provide patient-friendly summaries.",
                icon: "🧠",
                gradient: "from-purple-600/20 to-purple-400/5"
              },
              {
                title: "Real-Time Communication",
                desc: "Receive live updates about appointments, prescriptions, and diagnostic results instantly.",
                icon: "📡",
                gradient: "from-pink-600/20 to-pink-400/5"
              },
              {
                title: "Secure Cloud Architecture",
                desc: "High-availability storage with 99.9% uptime and encrypted data backups across regions.",
                icon: "☁️",
                gradient: "from-green-600/20 to-green-400/5"
              }
            ].map((tech, idx) => (
              <div key={idx} className={`group relative bg-gradient-to-br ${tech.gradient} border border-zinc-700 hover:border-zinc-600 rounded-xl p-8 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 overflow-hidden`} data-aos="zoom-in" data-aos-delay={`${idx * 100}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-full group-hover:translate-x-0"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-center md:justify-start text-5xl mb-4 transition-transform duration-300" data-aos="fade-up">{tech.icon}</div>
                  <h3 className="text-center md:text-left text-xl font-bold mb-3" data-aos="fade-up" data-aos-delay="50">{tech.title}</h3>
                  <p className="text-center md:text-left text-zinc-400 leading-relaxed" data-aos="fade-up" data-aos-delay="100">{tech.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* COMPARISON TABLE SECTION */}
        <section id='compare' className="py-20 lg:py-28" data-aos="fade-up" data-aos-delay="700">
          <div className="mb-16 flex flex-col items-center justify-center text-center" data-aos="fade-right">
            <h2 className="text-3xl lg:w-240 md:text-4xl font-black mb-8" data-aos="fade-up">
              Why Modern Healthcare on <span className="bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">Blockchain</span>
            </h2>
            <p className="text-sm md:text-lg text-zinc-400 hover:text-zinc-200 transition-all duration-300 max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="100">
              See how we're revolutionizing healthcare delivery with next-generation technology.
            </p>
          </div>

          <div className="overflow-x-auto" data-aos="zoom-in">
            <table className="w-full border-collapse text-xs md:text-sm" data-aos="fade-up">
              <thead>
                <tr className="border-b border-zinc-700" data-aos="fade-up">
                  <th className="text-left py-3 px-2 md:py-4 md:px-4 font-bold text-white">Feature</th>
                  <th className="text-left py-3 px-2 md:py-4 md:px-4 font-bold text-zinc-400">Traditional</th>
                  <th className="text-left py-3 px-2 md:py-4 md:px-4 font-bold text-blue-400">Our Platform</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Medical Records", traditional: "❌ Scattered", ours: "✅ Unified Timeline" },
                  { feature: "Data Security", traditional: "⚠️ Vulnerable", ours: "✅ Immutable" },
                  { feature: "AI Insights", traditional: "❌ None", ours: "✅ Personalized" },
                  { feature: "Prescriptions", traditional: "⚠️ Paper-Based", ours: "✅ Digital & Smart" },
                  { feature: "Doctor Verification", traditional: "⚠️ Unclear", ours: "✅ Verified" },
                  { feature: "Data Ownership", traditional: "⚠️ Provider", ours: "✅ Patient-Owned" },
                  { feature: "Accessibility", traditional: "❌ Limited", ours: "✅ 24/7 Global" }
                ].map((row, idx) => (
                  <tr key={idx} className={`border-b border-zinc-800 hover:bg-zinc-900/40 transition-colors duration-200 ${idx % 2 === 0 ? 'bg-zinc-900/20' : 'bg-zinc-900/10'}`} data-aos="fade-up" data-aos-delay={`${idx * 50}`}>
                    <td className="py-3 px-2 md:py-4 md:px-4 font-semibold text-white">{row.feature}</td>
                    <td className="py-3 px-2 md:py-4 md:px-4 text-zinc-400">{row.traditional}</td>
                    <td className="py-3 px-2 md:py-4 md:px-4 text-green-400">{row.ours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id='faqs' className="py-20 lg:py-28" data-aos="fade-up" data-aos-delay="800">
          <div className="mb-16 text-center" data-aos="fade-left">
            <h2 className="text-3xl md:text-4xl font-black mb-8" data-aos="fade-up">
              Frequently Asked <span className="bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">Questions</span>
            </h2>
            <p className="text-sm md:text-lg text-zinc-400 hover:text-zinc-200 transition-all duration-300" data-aos="fade-up" data-aos-delay="100">Everything you need to know about our platform.</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                question: "How secure is my medical data?",
                answer: "We use AES-256 encryption, blockchain hashing, and global healthcare compliance (HIPAA/GDPR) to ensure your data is unalterable and accessible only by you. All data is encrypted end-to-end with military-grade security protocols."
              },
              {
                question: "Can I delete or share my records?",
                answer: "Yes. You have full authority to download, archive, or share your records securely. Blockchain ensures transparency and authenticity, and you control exactly who has access and for how long."
              },
              {
                question: "Is this platform HIPAA compliant?",
                answer: "Absolutely. Every process and transaction is built to meet HIPAA and GDPR requirements. We undergo regular audits and compliance checks to ensure we meet all healthcare data protection standards."
              },
              {
                question: "Can I share my reports with another doctor?",
                answer: "Yes. Generate a secure, time-limited access link to share your complete medical history safely. The link automatically expires, and you can revoke access anytime."
              },
              {
                question: "How does the AI work?",
                answer: "Our AI analyzes uploaded reports using an advanced medical knowledge base to explain results in plain language and highlight key health indicators. It learns from medical literature to provide accurate, contextual insights."
              },
              {
                question: "Do you support telemedicine?",
                answer: "Yes. You can choose between in-person and virtual consultations with equal security and ease. Our video consultation platform is HIPAA-compliant with screen recording capabilities for records."
              }
            ].map((faq, idx) => (
              <div key={idx} className="group border border-zinc-700 rounded-lg overflow-hidden hover:border-blue-500/50 transition-all duration-300" data-aos="zoom-in" data-aos-delay={`${idx * 100}`}>
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? -1 : idx)}
                  className="w-full text-left p-6 flex items-center justify-between hover:bg-zinc-900/30 transition-colors duration-200" data-aos="fade-up"
                >
                  <span className="font-semibold text-sm md:text-lg  pr-4">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-blue-400 flex-shrink-0 transition-transform duration-300 ${expandedFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {expandedFaq === idx && (
                  <div className="text-sm md:text-md px-6 py-6 border-t border-zinc-700 text-zinc-400 animate-in fade-in slide-in-from-top-2 duration-200" data-aos="fade-up">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

{/* CONTACT FORM SECTION */}
<section id='contact' className="py-20 lg:py-28" data-aos="fade-up" data-aos-delay="900">
  <div className="mb-16 text-center" data-aos="fade-right">
    <h2 className="text-3xl md:text-4xl font-black mb-8" data-aos="fade-up">
      Get in <span className="bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">Touch</span>
    </h2>
    <p className="text-sm md:text-lg text-zinc-400 max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="100">
      Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
    </p>
  </div>

  <div className="grid lg:grid-cols-3 gap-8 mb-12">
    {/* Contact Info Cards - unchanged */}
    <div className="bg-zinc-900/30 border border-blue-500/30 rounded-lg p-8 hover:border-blue-500/60 transition-all duration-300 hover:bg-zinc-900/50" data-aos="zoom-in">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/50 flex items-center justify-center">
          <Mail className="w-6 h-6 text-blue-400" />
        </div>
        <h3 className="font-bold text-lg">Email</h3>
      </div>
      <p className="text-zinc-400 text-sm mb-2">support@altherix.com</p>
      <p className="text-zinc-500 text-xs">We reply within 24 hours</p>
    </div>

    <div className="bg-zinc-900/30 border border-purple-500/30 rounded-lg p-8 hover:border-purple-500/60 transition-all duration-300 hover:bg-zinc-900/50" data-aos="zoom-in" data-aos-delay="100">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/50 flex items-center justify-center">
          <Phone className="w-6 h-6 text-purple-400" />
        </div>
        <h3 className="font-bold text-lg">Phone</h3>
      </div>
      <p className="text-zinc-400 text-sm mb-2">+91 94030 78323</p>
      <p className="text-zinc-500 text-xs">Monday to Friday, 9 AM - 6 PM IST</p>
    </div>

    <div className="bg-zinc-900/30 border border-pink-500/30 rounded-lg p-8 hover:border-pink-500/60 transition-all duration-300 hover:bg-zinc-900/50" data-aos="zoom-in" data-aos-delay="200">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-lg bg-pink-500/10 border border-pink-500/50 flex items-center justify-center">
          <MapPin className="w-6 h-6 text-pink-400" />
        </div>
        <h3 className="font-bold text-lg">Location</h3>
      </div>
      <p className="text-zinc-400 text-sm mb-2">Vellore, Tamil Nadu, India</p>
      <p className="text-zinc-500 text-xs">Headquarters</p>
    </div>
  </div>

  {/* Contact Form with EmailJS */}
  <div className="max-w-2xl mx-auto bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/20 rounded-2xl p-8 md:p-12" data-aos="zoom-in">
    <form onSubmit={handleContactSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div data-aos="fade-up" data-aos-delay="50">
          <input
            type="text"
            name="name"
            value={contactForm.name}
            onChange={handleContactChange}
            placeholder="Full name"
            required
            className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:bg-zinc-900/80 transition-all duration-300"
          />
        </div>
        <div data-aos="fade-up" data-aos-delay="100">
          <input
            type="email"
            name="email"
            value={contactForm.email}
            onChange={handleContactChange}
            placeholder="Your Email"
            required
            className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:bg-zinc-900/80 transition-all duration-300"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div data-aos="fade-up" data-aos-delay="150">
          <input
            type="tel"
            name="phone"
            value={contactForm.phone}
            onChange={handleContactChange}
            placeholder="Your Phone"
            required
            className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:bg-zinc-900/80 transition-all duration-300"
          />
        </div>
        <div data-aos="fade-up" data-aos-delay="200">
          <select
            name="userType"
            value={contactForm.userType}
            onChange={handleContactChange}
            className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:bg-zinc-900/80 transition-all duration-300"
          >
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="hospital">Hospital</option>
          </select>
        </div>
      </div>

      <div data-aos="fade-up" data-aos-delay="250">
        <input
          type="text"
          name="subject"
          value={contactForm.subject}
          onChange={handleContactChange}
          placeholder="Subject"
          required
          className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:bg-zinc-900/80 transition-all duration-300"
        />
      </div>

      <div data-aos="fade-up" data-aos-delay="300">
        <textarea
          name="message"
          value={contactForm.message}
          onChange={handleContactChange}
          placeholder="Your Message"
          rows="5"
          required
          className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:bg-zinc-900/80 transition-all duration-300 resize-none"
        />
      </div>

      {/* Status Messages */}
      {contactStatus && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          contactStatus.type === 'success'
            ? 'bg-green-500/10 border border-green-500/30 text-green-400'
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {contactStatus.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-sm">{contactStatus.message}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={contactLoading}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-2"
      >
        {contactLoading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Send Message
          </>
        )}
      </button>

      <p className="text-xs text-zinc-500 text-center">
        We respect your privacy. Your information will only be used to respond to your inquiry.
      </p>
    </form>
  </div>
</section>

        {/* FOOTER CTA SECTION */}
        <section className="mb-20 px-4 lg:px-0 py-20 lg:py-28 relative overflow-hidden rounded-2xl" data-aos="fade-up" data-aos-delay="1000">
          <div className="absolute inset-0 z-10">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-3xl" data-aos="zoom-in"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950" data-aos="fade-up"></div>
          </div>

          <div className="text-center flex flex-col items-center justify-center relative z-10" data-aos="fade-left">
            <h2 className="text-3xl md:text-4xl lg:w-180 font-black mb-6" data-aos="fade-up">
              Your Secure, Intelligent Healthcare Journey <span className="bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">Starts Here</span>
            </h2>
            <p className="text-sm md:text-lg  text-zinc-400 max-w-2xl mx-auto mb-10" data-aos="fade-up" data-aos-delay="100">
              Join thousands of patients and doctors embracing the future of healthcare — secure, intelligent, and connected.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/login" className="group border-none btn bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2" data-aos="zoom-in">
                Sign Up as Patient
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="/login" className="group border-none btn bg-gradient-to-r from-purple-600 to-purple-700 hover:shadow-lg hover:shadow-purple-600/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2" data-aos="zoom-in" data-aos-delay="100">
                Join as Doctor
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </section>
      </div>
      {/*Footer */}
      <Footer/>
    </div>
  )
}

export default Landing
