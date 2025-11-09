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
  MapPinOff,
  Phone,
  Clock
} from 'lucide-react';

const FindDoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [maxDistance, setMaxDistance] = useState(10);
  const [maxFee, setMaxFee] = useState(1000);

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

  useEffect(() => {
    // Simulate fetching doctors from backend
    setTimeout(() => {
      const mockDoctors = [
        {
          id: 1,
          name: 'Dr. Rajesh Kumar',
          specialization: 'Cardiology',
          experience: '12 years',
          rating: 4.8,
          reviews: 124,
          fee: 500,
          distance: 2.5,
          clinic: 'Heart Care Clinic',
          address: '123 MG Road, Bangalore',
          phone: '+91 98765 43210',
          available: true
        },
        {
          id: 2,
          name: 'Dr. Priya Singh',
          specialization: 'General Medicine',
          experience: '8 years',
          rating: 4.5,
          reviews: 98,
          fee: 300,
          distance: 5.2,
          clinic: 'Health Plus Hospital',
          address: '456 Whitefield, Bangalore',
          phone: '+91 87654 32109',
          available: true
        },
        {
          id: 3,
          name: 'Dr. Arjun Patel',
          specialization: 'Orthopedics',
          experience: '15 years',
          rating: 4.9,
          reviews: 156,
          fee: 600,
          distance: 3.8,
          clinic: 'Bone & Joint Center',
          address: '789 Koramangala, Bangalore',
          phone: '+91 76543 21098',
          available: true
        },
        {
          id: 4,
          name: 'Dr. Neha Sharma',
          specialization: 'Dermatology',
          experience: '10 years',
          rating: 4.6,
          reviews: 87,
          fee: 400,
          distance: 4.1,
          clinic: 'Skin Wellness Clinic',
          address: '321 Indiranagar, Bangalore',
          phone: '+91 65432 10987',
          available: true
        },
        {
          id: 5,
          name: 'Dr. Vikram Desai',
          specialization: 'Pediatrics',
          experience: '9 years',
          rating: 4.7,
          reviews: 112,
          fee: 350,
          distance: 6.2,
          clinic: 'Child Care Clinic',
          address: '654 JP Nagar, Bangalore',
          phone: '+91 54321 09876',
          available: false
        }
      ];
      setDoctors(mockDoctors);
      setFilteredDoctors(mockDoctors);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    let filtered = doctors;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.clinic.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by specialization
    if (specialization && specialization !== 'All Specializations') {
      filtered = filtered.filter((doc) => doc.specialization === specialization);
    }

    // Filter by distance
    filtered = filtered.filter((doc) => doc.distance <= maxDistance);

    // Filter by fee
    filtered = filtered.filter((doc) => doc.fee <= maxFee);

    setFilteredDoctors(filtered);
  }, [searchTerm, specialization, maxDistance, maxFee, doctors]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-2xl p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
          Find Doctors Near You
        </h1>
        <p className="text-zinc-400">Search and book appointments with qualified healthcare professionals</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6 sticky top-6 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-purple-400" />
              Filters
            </h2>

            {/* Search Input */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">Search Doctor or Clinic</label>
              <div className="flex items-center gap-2 bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 focus-within:border-purple-500/50 transition-colors">
                <Search className="w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Dr. Name or clinic..."
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
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500/50 outline-none transition-colors"
              >
                {specializations.map((spec) => (
                  <option key={spec} value={spec === 'All Specializations' ? '' : spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            {/* Distance Slider */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">
                Distance: <span className="text-purple-400">{maxDistance}km</span>
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={maxDistance}
                onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-zinc-500 mt-2">
                <span>1km</span>
                <span>50km</span>
              </div>
            </div>

            {/* Fee Slider */}
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
                className="w-full accent-purple-500 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-zinc-500 mt-2">
                <span>₹100</span>
                <span>₹2000</span>
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                setSearchTerm('');
                setSpecialization('');
                setMaxDistance(10);
                setMaxFee(1000);
              }}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Reset Filters
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
                  className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 group"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Doctor Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-white">{doctor.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Stethoscope className="w-4 h-4 text-purple-400" />
                            <p className="text-sm text-zinc-400">{doctor.specialization}</p>
                          </div>
                        </div>
                        {doctor.available ? (
                          <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full border border-green-500/30">
                            Available
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded-full border border-red-500/30">
                            Unavailable
                          </span>
                        )}
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(doctor.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-white">{doctor.rating}</span>
                        <span className="text-xs text-zinc-500">({doctor.reviews} reviews)</span>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-4">
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Clock className="w-4 h-4 text-cyan-400" />
                          <span>{doctor.experience}</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-400">
                          <DollarSign className="w-4 h-4 text-green-400" />
                          <span>₹{doctor.fee}</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-400">
                          <MapPin className="w-4 h-4 text-orange-400" />
                          <span>{doctor.distance} km away</span>
                        </div>
                      </div>

                      {/* Clinic Info */}
                      <div className="bg-zinc-800/30 rounded-lg p-3 mb-4">
                        <p className="text-sm font-semibold text-white">{doctor.clinic}</p>
                        <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
                          <MapPinOff className="w-3 h-3" />
                          {doctor.address}
                        </p>
                        <p className="text-xs text-zinc-400 mt-2 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {doctor.phone}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 md:justify-end">
                      <button
                        disabled={!doctor.available}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50"
                      >
                        Book Now
                      </button>
                      <button className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-12 text-center">
              <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
              <p className="text-lg font-semibold text-white mb-2">No doctors found</p>
              <p className="text-zinc-400">Try adjusting your filters or search criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindDoctorsPage;
