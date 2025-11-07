import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import ColorBends from "../components/ColorBends";
import Footer from "../components/Footer";
import AOS from "aos";
import "aos/dist/aos.css";

export default function Privacy() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <div className="relative w-full bg-transparent text-zinc-300">
      <ColorBends
        colors={["#6d1799"]}
        rotation={30}
        speed={0.3}
        mouseInfluence={0.8}
        parallax={0.6}
        noise={0.08}
      />

      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-24 md:py-32 space-y-16">
        <div className="text-center" data-aos="fade-up">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent mb-3">
            Privacy Policy
          </h1>
          <p className="text-zinc-500 text-sm">Last Updated: November 2025</p>
        </div>

        <section
          className="bg-zinc-900/40 border border-zinc-700 rounded-2xl p-8 backdrop-blur-md"
          data-aos="zoom-in"
        >
          <p className="text-zinc-400 leading-relaxed">
            At <span className="text-blue-400 font-semibold">Altherix</span>, we place your privacy and
            data sovereignty at the heart of our ecosystem. This policy explains how we collect, protect,
            and use your data in our AI-powered, blockchain-secured healthcare environment.
          </p>
        </section>

        <div className="space-y-12">
          <section data-aos="fade-up">
            <h2 className="text-2xl font-bold text-white mb-4">
              1. Information We Collect
            </h2>
            <ul className="list-disc ml-6 space-y-2 text-zinc-400">
              <li>Personal data such as name, email, phone, and demographic details.</li>
              <li>Medical data including reports, prescriptions, and diagnostics.</li>
              <li>Usage data and device information for system optimization.</li>
              <li>Blockchain transaction metadata for verification purposes.</li>
            </ul>
          </section>

          <section data-aos="fade-up">
            <h2 className="text-2xl font-bold text-white mb-4">
              2. How We Use Your Data
            </h2>
            <ul className="list-disc ml-6 space-y-2 text-zinc-400">
              <li>Provide and improve healthcare services.</li>
              <li>Enable AI-driven health analysis and insights.</li>
              <li>Verify and secure data integrity via blockchain.</li>
              <li>Notify you about appointments and reports.</li>
              <li>Comply with legal and clinical standards (HIPAA/GDPR).</li>
            </ul>
          </section>

          <section data-aos="fade-up">
            <h2 className="text-2xl font-bold text-white mb-4">
              3. Data Protection & Security
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-3">
              We implement enterprise-grade protection protocols, including:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-zinc-400">
              <li>AES-256 encryption for all sensitive data.</li>
              <li>End-to-end encrypted communication (TLS 1.3).</li>
              <li>Blockchain immutability and audit transparency.</li>
              <li>Two-factor authentication and access controls.</li>
              <li>Regular penetration testing and compliance audits.</li>
            </ul>
          </section>

          <section data-aos="fade-up">
            <h2 className="text-2xl font-bold text-white mb-4">
              4. Your Rights
            </h2>
            <p className="text-zinc-400 mb-4">
              You retain full control of your data and may request:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-zinc-400">
              <li>Access to or deletion of your stored medical records.</li>
              <li>Correction of inaccurate information.</li>
              <li>Restriction of data processing.</li>
              <li>Export of data in interoperable format.</li>
            </ul>
          </section>

          <section data-aos="fade-up">
            <h2 className="text-2xl font-bold text-white mb-4">
              5. Cookies & Tracking
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              We use minimal cookies for authentication and analytics only.
              No personal or medical data is shared with advertisers or external entities.
            </p>
          </section>

          <section data-aos="fade-up">
            <h2 className="text-2xl font-bold text-white mb-4">
              6. Children’s Data
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              Altherix does not intentionally collect data from individuals under 18.
              If such information is identified, it is immediately and securely erased.
            </p>
          </section>

          <section data-aos="fade-up">
            <h2 className="text-2xl font-bold text-white mb-4">
              7. Contact & Data Requests
            </h2>
            <div className="bg-zinc-900/60 border border-zinc-700 rounded-lg p-4 space-y-2">
              <p>Email: <span className="text-blue-400">support@altherix.com</span></p>
              <p>Address: Altherix HealthCare Solutions Pvt. Ltd., Vellore, Tamil Nadu, India</p>
              <p>Phone: +91 94030 78323</p>
              <p>Response: Within 30 working days for verified requests</p>
            </div>
          </section>
        </div>

        <p className="text-zinc-500 text-sm text-center mt-16">
          Your privacy defines our trust. Altherix ensures complete control, transparency,
          and security of your healthcare journey.
        </p>
      </div>

      <Footer />
    </div>
  );
}
