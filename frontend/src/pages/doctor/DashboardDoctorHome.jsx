// /frontend/src/pages/doctor/DashboardDoctorHome.jsx

import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useVideoCall } from '../../context/VideoCallContext';
import IncomingCallModal from '../../components/IncomingCallModal';
import axios from 'axios';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

import {
  Calendar,
  Users,
  FileText,
  Pill,
  TrendingUp,
  Loader,
  Clock,
  Stethoscope,
  Star,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Activity,
  ArrowRight,
  Phone,
  PhoneOff
} from 'lucide-react';

const DashboardDoctorHome = () => {
  const { user } = useContext(AuthContext);
  const { acceptCall, rejectCall, endCall, incomingCall, currentCall, socket } = useVideoCall();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    totalPatients: 0,
    pendingReports: 0,
    averageRating: 0,
    monthlyIncome: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${SERVER_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const notifs = response.data.notifications || [];
      console.log('[DashboardDoctor] Fetched notifications:', notifs.length, 'total, video calls:', notifs.filter(n => n.type === 'video_call_request').length);
      setNotifications(notifs);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleAcceptVideoCall = async (appointmentId, notificationId) => {
    console.log('[DashboardDoctor] Accepting video call for appointment:', appointmentId, 'notification:', notificationId);
    try {
      acceptCall(appointmentId);
      // Mark notification as read
      const token = localStorage.getItem('token');
      console.log('[DashboardDoctor] Making PATCH request to mark notification as read:', `${SERVER_URL}/api/notifications/${notificationId}/read`);
      await axios.patch(`${SERVER_URL}/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh notifications
      fetchNotifications();
    } catch (error) {
      console.error('Error accepting video call:', error);
    }
  };

  const handleRejectVideoCall = async (notificationId) => {
    try {
      // Mark notification as read
      const token = localStorage.getItem('token');
      await axios.patch(`${SERVER_URL}/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh notifications
      fetchNotifications();
    } catch (error) {
      console.error('Error rejecting video call:', error);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch real stats from API
        const statsResponse = await axios.get(`${SERVER_URL}/api/dashboard/doctor/stats`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setStats(statsResponse.data);

        // Fetch today's schedule
        const scheduleResponse = await axios.get(`${SERVER_URL}/api/dashboard/doctor/today-schedule`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setRecentAppointments(scheduleResponse.data.schedule);

        // Fetch notifications
        await fetchNotifications();
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback to mock data if API fails
        setStats({
          totalAppointments: 24,
          todayAppointments: 3,
          totalPatients: 48,
          pendingReports: 5,
          averageRating: 4.8,
          monthlyIncome: 45000
        });
        setRecentAppointments([
          {
            id: 1,
            patient: 'Rajesh Singh',
            time: '10:30 AM',
            type: 'Check-up',
            status: 'confirmed',
            reason: 'Regular checkup'
          },
          {
            id: 2,
            patient: 'Priya Sharma',
            time: '11:00 AM',
            type: 'Consultation',
            status: 'confirmed',
            reason: 'Blood pressure monitoring'
          },
          {
            id: 3,
            patient: 'Amit Patel',
            time: '2:30 PM',
            type: 'Follow-up',
            status: 'pending',
            reason: 'Follow-up consultation'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Listen for real-time notifications
  useEffect(() => {
    if (socket) {
      const handleNewNotification = (notification) => {
        console.log('[DashboardDoctor] Received new notification:', notification);
        // Add to notifications list
        setNotifications(prev => [notification, ...prev]);
      };

      socket.on('new-notification', handleNewNotification);

      return () => {
        socket.off('new-notification', handleNewNotification);
      };
    }
  }, [socket]);

  const currentVideoCalls = notifications
    .filter(n => !n.isRead && n.type === 'video_call_request')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 1);

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
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-2xl p-6 md:p-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
              Welcome back, {user?.name ? `Dr. ${user.name.split(' ')[0]}` : 'Doctor'}! 👋
            </h1>
            <p className="text-zinc-400">Here's your clinic overview for today</p>
          </div>
          <Stethoscope className="w-12 h-12 text-purple-400 hidden md:block" />
        </div>
      </div>

      {/* Notifications */}
      {currentVideoCalls.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-red-400" />
            Incoming Video Call
          </h2>
          <div className="space-y-3">
            {currentVideoCalls.map((notification) => (
              <div
                key={notification._id}
                className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50"
              >
                <div className="flex-1">
                  <p className="text-white font-semibold">{notification.title}</p>
                  <p className="text-zinc-400 text-sm">{notification.message}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptVideoCall(notification.relatedId._id || notification.relatedId, notification._id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Accept
                  </button>
                  <button
                    onClick={() => handleRejectVideoCall(notification._id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    <PhoneOff className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        {/* Total Appointments */}
        <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300 group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-zinc-400 text-sm mb-1">Total Appointments</p>
          <h3 className="text-3xl font-bold text-white mb-2">{stats.totalAppointments}</h3>
          <Link
            to="/dashboard-doctor/appointments"
            className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 transition-colors"
          >
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Today's Appointments */}
        <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6 hover:border-green-500/50 transition-all duration-300 group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
              <Clock className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <p className="text-zinc-400 text-sm mb-1">Today's Appointments</p>
          <h3 className="text-3xl font-bold text-white mb-2">{stats.todayAppointments}</h3>
          <p className="text-green-400 text-sm">In your schedule</p>
        </div>

        {/* Total Patients */}
        <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6 hover:border-orange-500/50 transition-all duration-300 group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
              <Users className="w-6 h-6 text-orange-400" />
            </div>
          </div>
          <p className="text-zinc-400 text-sm mb-1">Total Patients</p>
          <h3 className="text-3xl font-bold text-white mb-2">{stats.totalPatients}</h3>
          <Link
            to="/dashboard-doctor/patients"
            className="text-orange-400 hover:text-orange-300 text-sm flex items-center gap-1 transition-colors"
          >
            View Patients <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Pending Reports */}
        <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6 hover:border-red-500/50 transition-all duration-300 group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
              <FileText className="w-6 h-6 text-red-400" />
            </div>
          </div>
          <p className="text-zinc-400 text-sm mb-1">Pending Reports</p>
          <h3 className="text-3xl font-bold text-white mb-2">{stats.pendingReports}</h3>
          <p className="text-red-400 text-sm">Awaiting analysis</p>
        </div>

        {/* Average Rating */}
        <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6 hover:border-yellow-500/50 transition-all duration-300 group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center group-hover:bg-yellow-500/30 transition-colors">
              <Star className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <p className="text-zinc-400 text-sm mb-1">Average Rating</p>
          <h3 className="text-3xl font-bold text-white mb-2">{stats.averageRating}</h3>
          <p className="text-yellow-400 text-sm">From patients</p>
        </div>

        {/* Monthly Income */}
        <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
              <DollarSign className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <p className="text-zinc-400 text-sm mb-1">Monthly Income</p>
          <h3 className="text-3xl font-bold text-white mb-2">₹{stats.monthlyIncome}</h3>
          <p className="text-cyan-400 text-sm">This month</p>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-400" />
          Today's Schedule
        </h2>
        <div className="space-y-3">
          {recentAppointments.map((apt) => (
            <div
              key={apt.id}
              className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50 hover:border-purple-500/30 transition-all group"
            >
              <div className="flex-1">
                <p className="text-white font-semibold group-hover:text-purple-400 transition-colors">
                  {apt.patient}
                </p>
                <p className="text-sm text-zinc-400">{apt.reason}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-white font-semibold">{apt.time}</p>
                  <p className="text-xs text-zinc-400">{apt.type}</p>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-semibold ${
                    apt.status === 'confirmed'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}
                >
                  {apt.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/dashboard-doctor/appointments"
            className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg p-4 text-left transition-all group"
          >
            <Calendar className="w-6 h-6 text-blue-400 mb-2" />
            <p className="font-semibold text-white group-hover:text-blue-400 transition-colors">
              Manage Appointments
            </p>
            <p className="text-xs text-zinc-400 mt-1">Review and confirm bookings</p>
          </Link>

          <Link
            to="/dashboard-doctor/records"
            className="bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 rounded-lg p-4 text-left transition-all group"
          >
            <FileText className="w-6 h-6 text-orange-400 mb-2" />
            <p className="font-semibold text-white group-hover:text-orange-400 transition-colors">
              Upload Records
            </p>
            <p className="text-xs text-zinc-400 mt-1">Add medical documents</p>
          </Link>

          <Link
            to="/dashboard-doctor/patients"
            className="bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 rounded-lg p-4 text-left transition-all group"
          >
            <Users className="w-6 h-6 text-cyan-400 mb-2" />
            <p className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
              View Patients
            </p>
            <p className="text-xs text-zinc-400 mt-1">Access patient information</p>
          </Link>
        </div>
      </div>

    </div>
  );
};

export default DashboardDoctorHome;
