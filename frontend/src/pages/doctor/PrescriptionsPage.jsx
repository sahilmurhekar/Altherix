// /frontend/src/pages/doctor/PrescriptionsPage.jsx

import React, { useState, useEffect } from 'react';
import {
  Pill,
  Calendar,
  User,
  AlertCircle,
  Loader,
  Clock,
  Download,
  Plus,
  X,
  CheckCircle,
  Trash2,
  Edit2,
  Send,
  FileText
} from 'lucide-react';

const DoctorPrescriptionsPage = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPrescription, setNewPrescription] = useState({
    patient: '',
    medicines: [{ name: '', strength: '', dosage: '', frequency: '', duration: '' }],
    notes: ''
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      const mockPrescriptions = [
        {
          id: 1,
          doctor: 'Dr. Anderson',
          patient: 'Rajesh Singh',
          issuedDate: '2024-03-15',
          expiryDate: '2024-06-15',
          status: 'active',
          additionalNotes: 'Take with food. Avoid caffeine.',
          medicines: [
            {
              name: 'Aspirin',
              strength: '75mg',
              form: 'Tablet',
              dosage: '1 tablet',
              frequency: 'Once daily',
              duration: '30 days',
              meals: 'With food'
            },
            {
              name: 'Lisinopril',
              strength: '5mg',
              form: 'Tablet',
              dosage: '1 tablet',
              frequency: 'Once daily',
              duration: '60 days',
              meals: 'Can take anytime'
            }
          ]
        },
        {
          id: 2,
          doctor: 'Dr. Anderson',
          patient: 'Priya Sharma',
          issuedDate: '2024-03-10',
          expiryDate: '2024-04-10',
          status: 'active',
          additionalNotes: 'Complete the full course. Drink plenty of water.',
          medicines: [
            {
              name: 'Amoxicillin',
              strength: '500mg',
              form: 'Capsule',
              dosage: '1 capsule',
              frequency: 'Three times daily',
              duration: '7 days',
              meals: 'With or without food'
            }
          ]
        },
        {
          id: 3,
          doctor: 'Dr. Anderson',
          patient: 'Amit Patel',
          issuedDate: '2024-02-15',
          expiryDate: '2024-02-28',
          status: 'expired',
          additionalNotes: 'Apply on affected areas only. Avoid sun exposure.',
          medicines: [
            {
              name: 'Clotrimazole',
              strength: '1%',
              form: 'Cream',
              dosage: 'Apply thin layer',
              frequency: 'Twice daily',
              duration: '14 days',
              meals: 'Topical'
            }
          ]
        }
      ];
      setPrescriptions(mockPrescriptions);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    const now = new Date();
    const filtered = prescriptions.filter((rx) => {
      if (activeTab === 'active') {
        return new Date(rx.expiryDate) >= now && rx.status === 'active';
      } else {
        return new Date(rx.expiryDate) < now || rx.status === 'expired';
      }
    });
    setFilteredPrescriptions(filtered);
  }, [activeTab, prescriptions]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'expired':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30';
    }
  };

  const handleCreatePrescription = async () => {
    if (!newPrescription.patient || newPrescription.medicines.some(m => !m.name)) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setCreating(true);
      // Simulate API call
      setTimeout(() => {
        const prescription = {
          id: prescriptions.length + 1,
          doctor: 'Dr. Anderson',
          patient: newPrescription.patient,
          issuedDate: new Date().toISOString().split('T')[0],
          expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          status: 'active',
          additionalNotes: newPrescription.notes,
          medicines: newPrescription.medicines
        };

        setPrescriptions([...prescriptions, prescription]);
        setShowCreateModal(false);
        setNewPrescription({
          patient: '',
          medicines: [{ name: '', strength: '', dosage: '', frequency: '', duration: '' }],
          notes: ''
        });
        setCreating(false);
        alert('Prescription created successfully!');
      }, 800);
    } catch (err) {
      console.error('Error creating prescription:', err);
      alert('Failed to create prescription');
      setCreating(false);
    }
  };

  const PrescriptionModal = ({ prescription, onClose }) => {
    if (!prescription) return null;

    const daysRemaining = Math.ceil(
      (new Date(prescription.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
    );

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-red-600/20 to-pink-600/20 border-b border-zinc-700 p-6 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Prescription Details</h2>
              <p className="text-sm text-zinc-400 mt-1">
                Patient: {prescription.patient} • {prescription.issuedDate}
              </p>
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
            {/* Status & Dates */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-zinc-800/30 rounded-lg p-4">
                <p className="text-xs text-zinc-400 mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Issued Date
                </p>
                <p className="text-white font-semibold">
                  {new Date(prescription.issuedDate).toLocaleDateString()}
                </p>
              </div>
              <div className="bg-zinc-800/30 rounded-lg p-4">
                <p className="text-xs text-zinc-400 mb-1 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Expiry Date
                </p>
                <p className="text-white font-semibold">
                  {new Date(prescription.expiryDate).toLocaleDateString()}
                </p>
              </div>
              <div
                className={`rounded-lg p-4 border ${getStatusColor(prescription.status)}`}
              >
                <p className="text-xs font-semibold mb-1">Status</p>
                <p className="font-semibold capitalize">
                  {prescription.status === 'active' ? `${daysRemaining} days left` : 'Expired'}
                </p>
              </div>
            </div>

            {/* Medicines Table */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Medicines</h3>
              <div className="space-y-3">
                {prescription.medicines.map((medicine, idx) => (
                  <div key={idx} className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-white font-semibold flex items-center gap-2">
                          <Pill className="w-4 h-4 text-red-400" />
                          {medicine.name}
                        </h4>
                        <p className="text-xs text-zinc-400 mt-1">
                          {medicine.strength} • {medicine.form}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-zinc-400">Dosage</p>
                        <p className="text-white font-medium">{medicine.dosage}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-400">Frequency</p>
                        <p className="text-white font-medium">{medicine.frequency}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-400">Duration</p>
                        <p className="text-white font-medium">{medicine.duration}</p>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <p className="text-xs text-zinc-400">With Meals</p>
                        <p className="text-white font-medium text-sm">{medicine.meals}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Notes */}
            {prescription.additionalNotes && (
              <div>
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  Additional Notes
                </h3>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <p className="text-yellow-400 text-sm">{prescription.additionalNotes}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-zinc-700">
              <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm">
                <Download className="w-4 h-4" />
                Download
              </button>
              <button className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm">
                <Send className="w-4 h-4" />
                Send to Patient
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm">
                <Edit2 className="w-4 h-4" />
                Edit
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
      <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/30 rounded-2xl p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent mb-2">
          Prescription Management
        </h1>
        <p className="text-zinc-400">Create and manage patient prescriptions</p>
      </div>

      {/* Create Button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Create New Prescription
      </button>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-zinc-700">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-3 font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'active'
              ? 'border-red-500 text-red-400'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Active ({prescriptions.filter((rx) => new Date(rx.expiryDate) >= new Date() && rx.status === 'active').length})
        </button>
        <button
          onClick={() => setActiveTab('expired')}
          className={`px-4 py-3 font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'expired'
              ? 'border-red-500 text-red-400'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <X className="w-4 h-4" />
          Archive ({prescriptions.filter((rx) => new Date(rx.expiryDate) < new Date() || rx.status === 'expired').length})
        </button>
      </div>

      {/* Prescriptions List */}
      {filteredPrescriptions.length > 0 ? (
        <div className="space-y-4">
          {filteredPrescriptions.map((prescription) => {
            const daysRemaining = Math.ceil(
              (new Date(prescription.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
            );

            return (
              <div
                key={prescription.id}
                className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6 hover:border-red-500/50 transition-all duration-300 cursor-pointer group"
                onClick={() => {
                  setSelectedPrescription(prescription);
                  setShowModal(true);
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Pill className="w-5 h-5 text-red-400" />
                      <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                        {prescription.patient}
                      </h3>
                    </div>
                    <p className="text-sm text-zinc-400">
                      Issued on {new Date(prescription.issuedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                      prescription.status
                    )}`}
                  >
                    {prescription.status === 'active'
                      ? `${daysRemaining} days left`
                      : 'Expired'}
                  </div>
                </div>

                {/* Medicines List */}
                <div className="mb-4 space-y-2">
                  <p className="text-xs font-semibold text-zinc-400">Medicines:</p>
                  <div className="flex flex-wrap gap-2">
                    {prescription.medicines.map((medicine, idx) => (
                      <span
                        key={idx}
                        className="inline-block bg-zinc-800/50 px-3 py-1 rounded-full text-xs text-zinc-300"
                      >
                        {medicine.name} {medicine.strength}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    Issued: {new Date(prescription.issuedDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Clock className="w-4 h-4 text-orange-400" />
                    Expires: {new Date(prescription.expiryDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-700 flex justify-between items-center">
                  <p className="text-xs text-zinc-500">{prescription.additionalNotes}</p>
                  <button className="text-red-400 hover:text-red-300 font-semibold text-sm transition-colors flex items-center gap-1">
                    View Details →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-12 text-center">
          <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
          <p className="text-lg font-semibold text-white mb-2">
            No {activeTab} prescriptions
          </p>
          <p className="text-zinc-400">
            {activeTab === 'active'
              ? 'You have no active prescriptions. Create one to get started.'
              : 'You have no archived prescriptions'}
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedPrescription && (
        <PrescriptionModal
          prescription={selectedPrescription}
          onClose={() => {
            setShowModal(false);
            setSelectedPrescription(null);
          }}
        />
      )}

      {/* Create Prescription Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-red-600/20 to-pink-600/20 border-b border-zinc-700 p-6 flex items-start justify-between">
              <h2 className="text-2xl font-bold text-white">Create Prescription</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Patient Selection */}
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">
                  Select Patient
                </label>
                <select
                  value={newPrescription.patient}
                  onChange={(e) =>
                    setNewPrescription({ ...newPrescription, patient: e.target.value })
                  }
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm focus:border-red-500/50 outline-none"
                >
                  <option value="">Choose patient...</option>
                  <option>Rajesh Singh</option>
                  <option>Priya Sharma</option>
                  <option>Amit Patel</option>
                  <option>Neha Sharma</option>
                </select>
              </div>

              {/* Medicines */}
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-3">
                  Medicines
                </label>
                <div className="space-y-4">
                  {newPrescription.medicines.map((medicine, idx) => (
                    <div key={idx} className="bg-zinc-800/30 rounded-lg p-4 border border-zinc-700 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Medicine name"
                          value={medicine.name}
                          onChange={(e) => {
                            const updated = [...newPrescription.medicines];
                            updated[idx].name = e.target.value;
                            setNewPrescription({ ...newPrescription, medicines: updated });
                          }}
                          className="bg-zinc-700/50 border border-zinc-600 rounded-lg px-3 py-2 text-white placeholder-zinc-500 text-sm outline-none focus:border-red-500/50"
                        />
                        <input
                          type="text"
                          placeholder="Strength (e.g., 500mg)"
                          value={medicine.strength}
                          onChange={(e) => {
                            const updated = [...newPrescription.medicines];
                            updated[idx].strength = e.target.value;
                            setNewPrescription({ ...newPrescription, medicines: updated });
                          }}
                          className="bg-zinc-700/50 border border-zinc-600 rounded-lg px-3 py-2 text-white placeholder-zinc-500 text-sm outline-none focus:border-red-500/50"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="Dosage"
                          value={medicine.dosage}
                          onChange={(e) => {
                            const updated = [...newPrescription.medicines];
                            updated[idx].dosage = e.target.value;
                            setNewPrescription({ ...newPrescription, medicines: updated });
                          }}
                          className="bg-zinc-700/50 border border-zinc-600 rounded-lg px-3 py-2 text-white placeholder-zinc-500 text-sm outline-none focus:border-red-500/50"
                        />
                        <input
                          type="text"
                          placeholder="Frequency"
                          value={medicine.frequency}
                          onChange={(e) => {
                            const updated = [...newPrescription.medicines];
                            updated[idx].frequency = e.target.value;
                            setNewPrescription({ ...newPrescription, medicines: updated });
                          }}
                          className="bg-zinc-700/50 border border-zinc-600 rounded-lg px-3 py-2 text-white placeholder-zinc-500 text-sm outline-none focus:border-red-500/50"
                        />
                        <input
                          type="text"
                          placeholder="Duration"
                          value={medicine.duration}
                          onChange={(e) => {
                            const updated = [...newPrescription.medicines];
                            updated[idx].duration = e.target.value;
                            setNewPrescription({ ...newPrescription, medicines: updated });
                          }}
                          className="bg-zinc-700/50 border border-zinc-600 rounded-lg px-3 py-2 text-white placeholder-zinc-500 text-sm outline-none focus:border-red-500/50"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() =>
                    setNewPrescription({
                      ...newPrescription,
                      medicines: [...newPrescription.medicines, { name: '', strength: '', dosage: '', frequency: '', duration: '' }]
                    })
                  }
                  className="mt-3 text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Medicine
                </button>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={newPrescription.notes}
                  onChange={(e) =>
                    setNewPrescription({ ...newPrescription, notes: e.target.value })
                  }
                  placeholder="Enter additional instructions..."
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 outline-none focus:border-red-500/50 resize-none h-20"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t border-zinc-700">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePrescription}
                  disabled={creating}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create Prescription
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPrescriptionsPage;
