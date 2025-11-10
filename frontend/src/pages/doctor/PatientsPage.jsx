// /frontend/src/pages/doctor/PatientsPage.jsx

import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  Loader,
  Search,
  Eye,
  FileText,
  TrendingUp,
  MapPin,
  Activity,
  ArrowRight,
  X
} from 'lucide-react';

const DoctorPatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setPatients([
        {
          id: 1,
          name: 'Rajesh Singh',
          age: 35,
          email: 'rajesh@example.com',
          phone: '9876543210',
          bloodType: 'O+',
          lastVisit: '2024-03-15',
          totalAppointments: 5,
          address: '123 Main St, Mumbai',
          allergies: 'Penicillin'
        },
        {
          id: 2,
          name: 'Priya Sharma',
          age: 28,
          email: 'priya@example.com',
          phone: '9876543211',
          bloodType: 'A+',
          lastVisit: '2024-03-18',
          totalAppointments: 3,
          address: '456 Oak Ave, Delhi',
          allergies: 'None'
        },
        {
          id: 3,
          name: 'Amit Patel',
          age: 45,
          email: 'amit@example.com',
          phone: '9876543212',
          bloodType: 'B+',
          lastVisit: '2024-03-19',
          totalAppointments: 8,
          address: '789 Pine Rd, Bangalore',
          allergies: 'Aspirin'
        },
        {
          id: 4,
          name: 'Neha Sharma',
          age: 32,
          email: 'neha@example.com',
          phone: '9876543213',
          bloodType: 'AB+',
          lastVisit: '2024-03-10',
          totalAppointments: 2,
          address: '321 Elm St, Hyderabad',
          allergies: 'None'
        }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    const filtered = patients.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone.includes(searchTerm)
    );
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  const PatientModal = ({ patient, onClose }) => {
    if (!patient) return null;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-zinc-700 p-6 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{patient.name}</h2>
              <p className="text-sm text-zinc-400 mt-1">Patient Profile</p>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-800/30 rounded-lg p-4">
                  <p className="text-xs text-zinc-400 mb-1">Age</p>
                  <p className="text-white font-semibold">{patient.age} years</p>
                </div>
                <div className="bg-zinc-800/30 rounded-lg p-4">
                  <p className="text-xs text-zinc-400 mb-1">Email</p>
                  <p className="text-white font-semibold text-sm break-all">{patient.email}</p>
                </div>
                <div className="bg-zinc-800/30 rounded-lg p-4">
                  <p className="text-xs text-zinc-400 mb-1">Phone</p>
                  <p className="text-white font-semibold">{patient.phone}</p>
                </div>
                <div className="bg-zinc-800/30 rounded-lg p-4">
                  <p className="text-xs text-zinc-400 mb-1">Address</p>
                  <p className="text-white font-semibold text-sm">{patient.address}</p>
                </div>
              </div>
            </div>

            {/* Health Information */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Health Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-800/30 rounded-lg p-4">
                  <p className="text-xs text-zinc-400 mb-1">Blood Type</p>
                  <p className="text-white font-semibold text-lg">{patient.bloodType}</p>
                </div>
                <div className="bg-zinc-800/30 rounded-lg p-4">
                  <p className="text-xs text-zinc-400 mb-1">Allergies</p>
                  <p className="text-white font-semibold">{patient.allergies}</p>
                </div>
              </div>
            </div>

            {/* Appointment History */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Appointment History</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="text-xs text-green-400 mb-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Total Appointments
                  </p>
                  <p className="text-2xl font-bold text-white">{patient.totalAppointments}</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-xs text-blue-400 mb-1 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Last Visit
                  </p>
                  <p className="text-white font-semibold">
                    {new Date(patient.lastVisit).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-700">
              <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                View Records
              </button>
              <button
                onClick={onClose}
                className="bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/30 rounded-2xl p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent mb-2">
          Patient Management
        </h1>
        <p className="text-zinc-400">View and manage your patients</p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3">
        <Search className="w-5 h-5 text-zinc-400" />
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent outline-none text-white placeholder-zinc-500"
        />
      </div>

      {/* Patients Grid */}
      {filteredPatients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                  <User className="w-6 h-6 text-purple-400" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>

              {/* Name */}
              <h3 className="text-lg font-bold text-white mb-4 group-hover:text-purple-400 transition-colors">
                {patient.name}
              </h3>

              {/* Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  Age: <span className="text-white font-semibold">{patient.age}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Phone className="w-4 h-4 text-green-400" />
                  <a href={`tel:${patient.phone}`} className="text-white font-semibold hover:text-blue-400">
                    {patient.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Mail className="w-4 h-4 text-orange-400" />
                  <span className="text-white font-semibold text-xs break-all">{patient.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Activity className="w-4 h-4 text-red-400" />
                  Last Visit: <span className="text-white font-semibold">{new Date(patient.lastVisit).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6 pb-6 border-b border-zinc-700">
                <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-zinc-400">Appointments</p>
                  <p className="text-xl font-bold text-white">{patient.totalAppointments}</p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-zinc-400">Blood Type</p>
                  <p className="text-lg font-bold text-white">{patient.bloodType}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedPatient(patient);
                    setShowModal(true);
                  }}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Profile
                </button>
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  Records
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-12 text-center">
          <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
          <p className="text-lg font-semibold text-white mb-2">No patients found</p>
          <p className="text-zinc-400">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Patient Modal */}
      {showModal && selectedPatient && (
        <PatientModal
          patient={selectedPatient}
          onClose={() => {
            setShowModal(false);
            setSelectedPatient(null);
          }}
        />
      )}
    </div>
  );
};

export default DoctorPatientsPage;
