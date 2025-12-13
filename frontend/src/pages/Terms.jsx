import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import ColorBends from "../components/ColorBends";
import Footer from "../components/Footer";
import AOS from "aos";
import "aos/dist/aos.css";

export default function Terms() {
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
        {/* Header */}
        <div className="text-center" data-aos="fade-up">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent mb-3">
            Terms & Conditions
          </h1>
          <p className="text-zinc-500 text-sm">Last Updated: November 2025</p>
        </div>

        {/* Intro */}
        <section
          className="bg-zinc-900/40 border border-zinc-700 rounded-2xl p-8 backdrop-blur-md"
          data-aos="zoom-in"
        >
          <p className="text-zinc-400 leading-relaxed">
            Welcome to <span className="text-blue-400 font-semibold">Altherix</span>,
            a healthcare platform that unites AI intelligence and blockchain security to redefine
            how medical data is stored, shared, and understood. By accessing or using Altherix,
            you agree to these Terms and Conditions. Please read them carefully.
          </p>
        </section>

        {/* Sections */}
        <div className="space-y-12">
          <section data-aos="fade-up">
            <h2 className="text-2xl font-bold text-white mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              By using Altherix, you accept and agree to abide by these Terms and Conditions.
              We may update them periodically; continued use after changes constitutes acceptance.
            </p>
          </section>

          <section data-aos="fade-up">
            <h2 className="text-2xl font-bold text-white mb-4">
              2. Eligibility
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              You must be at least 18 years old to create an account on Altherix.
              By registering, you confirm that you have the legal capacity to form binding agreements.
            </p>
            <ul className="list-disc ml-6 space-y-2 text-zinc-400">
              <li>You provide accurate and verifiable information.</li>
              <li>You comply with all applicable healthcare privacy laws.</li>
              <li>Your account is created for lawful healthcare use only.</li>
            </ul>
          </section>

          <section data-aos="fade-up">
            <h2 className="text-2xl font-bold text-white mb-4">
              3. Platform Description
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              Altherix provides secure blockchain-backed healthcare services, including:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-zinc-400">
              <li>AI-assisted health record analysis and predictions.</li>
              <li>Appointment booking with verified medical professionals.</li>
              <li>Blockchain-secured medical record storage and sharing.</li>
              <li>Digital prescriptions and patient-doctor communication.</li>
              <li>Health insights, medication tracking, and compliance tools.</li>
            </ul>
            <p className="text-zinc-400 mt-4">
              The Platform is not a substitute for medical diagnosis or emergency services.
            </p>
          </section>

          <section data-aos="fade-up">
            <h2 className="text-2xl font-bold text-white mb-4">
              4. User Responsibilities
            </h2>
            <ul className="list-disc ml-6 space-y-2 text-zinc-400">
              <li>Maintain confidentiality of login credentials.</li>
              <li>Ensure data accuracy in health records.</li>
              <li>Refrain from unauthorized access, misuse, or tampering.</li>
              <li>Comply with local and international data laws (HIPAA, GDPR, etc.).</li>
            </ul>
          </section>

          <section data-aos="fade-up">
            <h2 className="text-2xl font-bold text-white mb-4">
              5. Medical Disclaimer
            </h2>
            <div className="bg-red-500/10 border border-red-500/40 rounded-lg p-4 mb-3">
              <p className="text-red-400 font-semibold">
                Altherix AI insights are for informational purposes only and
                must not replace professional medical judgment. Always consult
                a qualified healthcare provider before making health decisions.
              </p>
            </div>
          </section>

          <section data-aos="fade-up">
            <h2 className="text-2xl font-bold text-white mb-4">
              6. Intellectual Property
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              All technology, visuals, and content within Altherix are protected under
              copyright and trademark law. You retain ownership of your uploaded
              data but grant Altherix limited rights to process it securely for service delivery.
            </p>
          </section>

          <section data-aos="fade-up">
            <h2 className="text-2xl font-bold text-white mb-4">
              7. Limitation of Liability
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-3">
              Altherix operates “as is.” We are not liable for indirect, incidental,
              or consequential damages arising from platform usage. Our liability, if any,
              shall not exceed the total amount paid for services within the previous 12 months.
            </p>
          </section>

          <section data-aos="fade-up">
            <h2 className="text-2xl font-bold text-white mb-4">
              8. Termination
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              We may suspend or terminate access for violations, security breaches, or fraudulent activity.
              Upon termination, records remain stored securely per regulatory requirements.
            </p>
          </section>

          <section data-aos="fade-up">
            <h2 className="text-2xl font-bold text-white mb-4">
              9. Contact
            </h2>
            <div className="bg-zinc-900/60 border border-zinc-700 rounded-lg p-4 space-y-2">
              <p>Email: <span className="text-blue-400">support@altherix.com</span></p>
              <p>Address: Altherix Healthcare Solutions Pvt. Ltd., Vellore, Tamil Nadu, India</p>
              <p>Phone: +91 94030 78323</p>
            </div>
          </section>
        </div>

        {/* Footer Acknowledgment */}
        <p className="text-zinc-500 text-sm text-center mt-16">
          By using Altherix, you acknowledge that you’ve read, understood, and agree to these Terms.
        </p>
      </div>

      <Footer />
    </div>
  );
}
