// /frontend/src/pages/patient/DashboardPatientHome.jsx

import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  Calendar,
  FileText,
  Pill,
  Droplet,
  AlertCircle,
  ArrowRight,
  Clock,
  User,
  Heart,
  TrendingUp,
  Loader
} from 'lucide-react';

const DashboardPatientHome = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    medicalRecords: 0,
    activePrescriptions: 0,
    lastConsultation: null
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching dashboard stats
    setTimeout(() => {
      setStats({
        upcomingAppointments: 2,
        medicalRecords: 5,
        activePrescriptions: 1,
        lastConsultation: 'March 15, 2024'
      });
      setRecentActivity([
        { type: 'appointment', message: 'Appointment confirmed with Dr. Smith', date: 'Today' },
        { type: 'prescription', message: 'New prescription added', date: 'Yesterday' },
        { type: 'report', message: 'Medical report uploaded', date: '2 days ago' }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-purple-500/30 rounded-2xl p-6 md:p-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-zinc-400">Here's your health overview for today</p>
          </div>
          <Heart className="w-12 h-12 text-red-400 hidden md:block" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300 group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-zinc-400 text-sm mb-1">Upcoming Appointments</p>
          <h3 className="text-3xl font-bold text-white mb-2">{stats.upcomingAppointments}</h3>
          <Link
            to="/dashboard-patient/appointments"
            className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 transition-colors"
          >
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Medical Records */}
        <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6 hover:border-orange-500/50 transition-all duration-300 group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
              <FileText className="w-6 h-6 text-orange-400" />
            </div>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-zinc-400 text-sm mb-1">Medical Records</p>
          <h3 className="text-3xl font-bold text-white mb-2">{stats.medicalRecords}</h3>
          <Link
            to="/dashboard-patient/medical-records"
            className="text-orange-400 hover:text-orange-300 text-sm flex items-center gap-1 transition-colors"
          >
            View Records <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Active Prescriptions */}
        <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6 hover:border-red-500/50 transition-all duration-300 group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
              <Pill className="w-6 h-6 text-red-400" />
            </div>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-zinc-400 text-sm mb-1">Active Prescriptions</p>
          <h3 className="text-3xl font-bold text-white mb-2">{stats.activePrescriptions}</h3>
          <Link
            to="/dashboard-patient/prescriptions"
            className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1 transition-colors"
          >
            View Prescriptions <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Last Consultation */}
        <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
              <Clock className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <p className="text-zinc-400 text-sm mb-1">Last Consultation</p>
          <h3 className="text-lg font-bold text-white mb-2">{stats.lastConsultation || 'N/A'}</h3>
          <Link
            to="/dashboard-patient/find-doctors"
            className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1 transition-colors"
          >
            Book Now <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Recent Activity & Health Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50 hover:border-purple-500/30 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    {activity.type === 'appointment' && <Calendar className="w-5 h-5 text-blue-400" />}
                    {activity.type === 'prescription' && <Pill className="w-5 h-5 text-red-400" />}
                    {activity.type === 'report' && <FileText className="w-5 h-5 text-orange-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{activity.message}</p>
                    <p className="text-zinc-500 text-xs mt-1">{activity.date}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-zinc-400 text-center py-8">No recent activity</p>
            )}
          </div>
        </div>

        {/* Health Summary */}
        <div className="bg-gradient-to-b from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-400" />
            Health Summary
          </h2>
          <div className="space-y-4">
            <div className="bg-zinc-800/30 rounded-lg p-4">
              <p className="text-zinc-400 text-sm mb-1">Blood Type</p>
              <p className="text-lg font-semibold text-white">{user?.bloodType || 'Not Set'}</p>
            </div>
            <div className="bg-zinc-800/30 rounded-lg p-4">
              <p className="text-zinc-400 text-sm mb-1">Date of Birth</p>
              <p className="text-lg font-semibold text-white">{user?.dateOfBirth || 'Not Set'}</p>
            </div>
            <div className="bg-zinc-800/30 rounded-lg p-4">
              <p className="text-zinc-400 text-sm mb-1 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                Allergies
              </p>
              <p className="text-sm text-white">{user?.allergies || 'None recorded'}</p>
            </div>
            <button
              onClick={() => navigate('/dashboard-patient/profile')}
              className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/dashboard-patient/find-doctors')}
            className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg p-4 text-left transition-all group"
          >
            <Calendar className="w-6 h-6 text-blue-400 mb-2" />
            <p className="font-semibold text-white group-hover:text-blue-400 transition-colors">Book Appointment</p>
            <p className="text-xs text-zinc-400 mt-1">Find and book with doctors</p>
          </button>

          <button
            onClick={() => navigate('/dashboard-patient/medical-records')}
            className="bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 rounded-lg p-4 text-left transition-all group"
          >
            <FileText className="w-6 h-6 text-orange-400 mb-2" />
            <p className="font-semibold text-white group-hover:text-orange-400 transition-colors">View Records</p>
            <p className="text-xs text-zinc-400 mt-1">Access your medical records</p>
          </button>

          <button
            onClick={() => navigate('/dashboard-patient/profile')}
            className="bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 rounded-lg p-4 text-left transition-all group"
          >
            <User className="w-6 h-6 text-cyan-400 mb-2" />
            <p className="font-semibold text-white group-hover:text-cyan-400 transition-colors">Update Profile</p>
            <p className="text-xs text-zinc-400 mt-1">Edit your health info</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPatientHome;
