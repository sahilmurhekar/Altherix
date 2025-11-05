import React from 'react'
import Navbar from '../components/Navbar'
import HeroImage from '../assets/hero.png'
import ColorBends from '../components/ColorBends'
import Magnet from '../components/Magnet'
import { CheckCircle, Shield, Database, Brain, Clock, Lock, Stethoscope, TrendingUp, FileText, Pill } from 'lucide-react'

const Landing = () => {
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
        <div className="w-full mt-20 min-h-[90vh] lg:min-h-[600px] flex flex-col pt-18 lg:pt-0 lg:flex-row justify-center lg:justify-between items-center gap-6">
          <div className='lg:w-1/2 flex flex-col justify-center items-center lg:items-start gap-8'>
            <h1 className='text-2xl text-center lg:text-left font-black md:text-4xl lg:text-5xl inline-block bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent'>Where AI Meets Blockchain to Redefine Your Health.</h1>
            <h3 className='text-sm md:text-md md:w-1/2 lg:w-full lg:text-lg text-center lg:text-left text-zinc-400 hover:text-zinc-200 transition-all duration-300'>Experience the future of healthcare where your medical records, appointments, and AI-powered health insights are unified under one secure, blockchain-protected platform.</h3>
            <div className='flex flex-col md:flex-row gap-4'>
              <a href="/register" className="border-none btn bg-blue-500 w-full md:w-auto hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300">Get Started</a>
              <a href="#learn-more" className="border-none btn bg-purple-600 hover:shadow-lg hover:shadow-purple-600/50 hover:scale-105 transition-all duration-300  w-full md:w-auto">Book Appointment</a>
            </div>
          </div>
          <div className='lg:w-1/2 flex justify-center items-center lg:justify-end'>
            <Magnet padding={30} disabled={false} magnetStrength={10}><img className='pt-6 md:pt-18 md:p-36 lg:p-24 animate-float' src={HeroImage} alt="" /></Magnet>
          </div>
        </div>

        {/* Problems Section */}
        <section className="py-20 lg:py-28">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4">
              Healthcare Should Work <span className="bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">For You</span>
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
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
              <div key={idx} className="bg-zinc-900/30 hover:bg-zinc-900/70 w-full md:w-5/12 border border-slate-700 rounded-lg p-8 hover:border-blue-500/50 transition-all duration-300">
                <div className="text-4xl mb-4 text-center">{problem.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-center">{problem.title}</h3>
                <p className="text-zinc-400 leading-relaxed text-center">{problem.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Solutions Section */}
        <section className="py-20 lg:py-28">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4">
              Reimagining Healthcare <span className="bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">Secure, Smart, Seamless</span>
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
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
              <div key={idx} className="w-full md:w-7/16 bg-gradient-to-r from-blue-500/5 to-pink-500/5 hover:from-blue-500/15 hover:to-pink-500/15 border border-blue-500/10 rounded-lg p-8 hover:border-blue-500/60 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold mb-2">{solution.title}</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">{solution.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* For Patients & Doctors Section */}
        <section className="py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* For Patients */}
            <div>
              <div className="mb-10">
                <h3 className="text-3xl md:text-4xl font-black mb-3 text-center md:text-left">
                  For <span className="bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">Patients</span>
                </h3>
                <p className="text-center md:text-left text-zinc-400">Empower yourself with tools to understand, manage, and secure your health journey.</p>
              </div>

              <div className="space-y-6">
                {[
                  { title: "Records, Always Accessible", desc: "View and download your medical data anytime, anywhere.", icon: Database },
                  { title: "Health Insights You Understand", desc: "AI simplifies complex lab reports into clear explanations.", icon: Brain },
                  { title: "Save Time & Money", desc: "Book consultations instantly and avoid unnecessary tests.", icon: Clock },
                  { title: "Data Ownership You Deserve", desc: "Your health data is encrypted and owned exclusively by you.", icon: Lock },
                  { title: "Smart Medication Management", desc: "Automatic reminders, drug compatibility checks, and seamless refills.", icon: Pill }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/5 border border-blue-500/50 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">{item.title}</h4>
                      <p className="text-sm text-zinc-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button className="border-none mt-10 btn bg-blue-500 hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 w-full md:w-auto">
                Start Managing Your Health
              </button>
            </div>

            {/* For Doctors */}
            <div>
              <div className="mb-10">
                <h3 className="text-3xl text-center md:text-left md:text-4xl font-black mb-3">
                  <span className="bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">For</span> Doctors.
                </h3>
                <p className="text-center md:text-left text-zinc-400">Deliver exceptional care with a secure, efficient ecosystem for your practice.</p>
              </div>

              <div className="space-y-6">
                {[
                  { title: "Full Patient Context", desc: "Access comprehensive medical histories instantly for better diagnostics.", icon: Stethoscope },
                  { title: "Streamlined Workflows", desc: "Manage appointments, reports, and prescriptions digitally in one place.", icon: FileText },
                  { title: "Build Reputation & Trust", desc: "Verified reviews and blockchain validation enhance your credibility.", icon: TrendingUp },
                  { title: "Effortless Compliance", desc: "Blockchain-backed audit trails ensure HIPAA and GDPR compliance.", icon: Shield },
                  { title: "Focus on Healing", desc: "Automation handles scheduling and records while you focus on patients.", icon: CheckCircle }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-500/5 border border-purple-500/50 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">{item.title}</h4>
                      <p className="text-sm text-zinc-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button className="border-none mt-10 btn bg-purple-600 hover:shadow-lg hover:shadow-purple-600/50 hover:scale-105 transition-all duration-300 w-full md:w-auto">
                Join as a Healthcare Provider
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Landing
