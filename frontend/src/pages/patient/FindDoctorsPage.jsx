// /frontend/src/pages/patient/FindDoctorsPage.jsx

import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Star,
  DollarSign,
  Stethoscope,
  Loader,
  AlertCircle,
  Phone,
  Clock
} from 'lucide-react';
import BookingModal from '../../components/BookingModal';
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

const FindDoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [maxDistance, setMaxDistance] = useState(10000);
  const [maxFee, setMaxFee] = useState(1000);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [error, setError] = useState('');

  const specializations = [
    'All Specializations',
    'Cardiology',
    'Dermatology',
    'General Medicine',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'Neurology',
    'Dentistry'
  ];

  // ========== FETCH NEARBY DOCTORS ==========
  useEffect(() => {
    const fetchNearbyDoctors = async () => {
      try {
        setLoading(true);
        setError('');

        if (!navigator.geolocation) {
          throw new Error('Geolocation not supported');
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            try {
              const url = `${SERVER_URL}/api/auth/nearby-doctors?latitude=${latitude}&longitude=${longitude}&maxDistance=${maxDistance * 1000}`;
              const response = await fetch(url);

              if (!response.ok) {
                throw new Error('Failed to fetch doctors');
              }

              const data = await response.json();

              // Transform backend data
              const formattedDoctors = data.doctors.map((doc) => ({
                id: doc._id,
                name: doc.name,
                specialization: doc.specialization || 'General Practice',
                experience: doc.experience || 'N/A',
                fee: doc.consultationFee || 500,
                clinic: doc.clinicAddress || 'Clinic',
                phone: doc.phone || 'N/A',
                rating: doc.rating || 0, // Get from DB, default 0
                reviews: doc.reviews || 0, // Get from DB, default 0
                // Calculate distance from CLINIC location
                distance: calculateDistance(
                  latitude,
                  longitude,
                  doc.clinicLocation?.coordinates[1],
                  doc.clinicLocation?.coordinates[0]
                )
              }));

              setDoctors(formattedDoctors);
              setFilteredDoctors(formattedDoctors);
            } catch (err) {
              console.error('Error fetching doctors:', err);
              setError('Failed to fetch doctors');
            } finally {
              setLoading(false);
            }
          },
          (error) => {
            console.error('Geolocation error:', error);
            setError('Please enable location services');
            setLoading(false);
          }
        );
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchNearbyDoctors();
  }, []);

  // ========== CALCULATE DISTANCE ==========
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat2 || !lon2) return 'N/A';

    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round((R * c) * 10) / 10;
  };

  // ========== FILTER DOCTORS ==========
  useEffect(() => {
    let filtered = doctors;

    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.clinic.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (specialization) {
      filtered = filtered.filter((doc) => doc.specialization === specialization);
    }

    filtered = filtered.filter((doc) => {
      if (typeof doc.distance === 'number') {
        return doc.distance <= maxDistance;
      }
      return true;
    });

    filtered = filtered.filter((doc) => doc.fee <= maxFee);

    setFilteredDoctors(filtered);
  }, [searchTerm, specialization, maxDistance, maxFee, doctors]);

  const handleBookNow = (doctor) => {
    setSelectedDoctor(doctor);
    setShowBookingModal(true);
  };

  const handleBookingConfirm = async (bookingData) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${SERVER_URL}/api/appointments/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          appointmentDate: bookingData.date,
          appointmentTime: bookingData.time,
          reasonForVisit: bookingData.reason,
          consultationMode: bookingData.consultationMode
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Booking failed');
      }

      alert(`✅ Appointment booked!\n\nDate: ${bookingData.date}\nTime: ${bookingData.time}`);
      setShowBookingModal(false);
      setSelectedDoctor(null);
    } catch (err) {
      console.error('Booking error:', err);
      alert(`❌ Booking failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-2xl p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
          Find Doctors
        </h1>
        <p className="text-zinc-400">Book appointments near you</p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6 sticky top-6 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-purple-400" />
              Filters
            </h2>

            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">Search</label>
              <div className="flex items-center gap-2 bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Doctor name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent outline-none text-white text-sm placeholder-zinc-500"
                />
              </div>
            </div>

            {/* Specialization */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">Specialization</label>
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none"
              >
                {specializations.map((spec) => (
                  <option key={spec} value={spec === 'All Specializations' ? '' : spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            {/* Distance */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">
                Distance: <span className="text-purple-400">{maxDistance}km</span>
              </label>
              <input
                type="range"
                min="1"
                max="10000"
                value={maxDistance}
                onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>

            {/* Fee */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">
                Max Fee: <span className="text-purple-400">₹{maxFee}</span>
              </label>
              <input
                type="range"
                min="100"
                max="2000"
                step="50"
                value={maxFee}
                onChange={(e) => setMaxFee(parseInt(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>

            {/* Reset */}
            <button
              onClick={() => {
                setSearchTerm('');
                setSpecialization('');
                setMaxDistance(10000);
                setMaxFee(1000);
              }}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg text-sm font-medium"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Doctors List */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <Loader className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
          ) : filteredDoctors.length > 0 ? (
            <div className="space-y-4">
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6 hover:border-purple-500/50 transition-all"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-white">{doctor.name}</h3>
                          <p className="text-sm text-zinc-400 flex items-center gap-2 mt-1">
                            <Stethoscope className="w-4 h-4 text-purple-400" />
                            {doctor.specialization}
                          </p>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(doctor.rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-zinc-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-zinc-400">
                          {doctor.rating > 0 ? `${doctor.rating} (${doctor.reviews})` : 'New'}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Clock className="w-4 h-4 text-cyan-400" />
                          {doctor.experience}
                        </div>
                        <div className="flex items-center gap-2 text-zinc-400">
                          <DollarSign className="w-4 h-4 text-green-400" />
                          ₹{doctor.fee}
                        </div>
                        <div className="flex items-center gap-2 text-zinc-400">
                          <MapPin className="w-4 h-4 text-orange-400" />
                          {typeof doctor.distance === 'number' ? `${doctor.distance} km` : 'N/A'}
                        </div>
                      </div>

                      {/* Clinic */}
                      <div className="bg-zinc-800/30 rounded-lg p-3 text-sm">
                        <p className="font-semibold text-white text-sm">{doctor.clinic}</p>
                        <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {doctor.phone}
                        </p>
                      </div>
                    </div>

                    {/* Book Button */}
                    <div className="flex md:items-end">
                      <button
                        onClick={() => handleBookNow(doctor)}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-12 text-center">
              <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
              <p className="text-lg font-semibold text-white">No doctors found</p>
              <p className="text-zinc-400">Try adjusting filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedDoctor && (
        <BookingModal
          doctor={selectedDoctor}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedDoctor(null);
          }}
          onConfirm={handleBookingConfirm}
        />
      )}
    </div>
  );
};

export default FindDoctorsPage;
