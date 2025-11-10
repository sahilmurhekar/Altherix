// /frontend/src/pages/doctor/AnalyticsPage.jsx

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Star,
  Activity,
  Loader,
  Download,
  Filter
} from 'lucide-react';

const DoctorAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    setTimeout(() => {
      setAnalytics({
        overview: {
          totalAppointments: 127,
          completedAppointments: 98,
          cancelledAppointments: 12,
          totalPatients: 68,
          newPatients: 12,
          appointmentGrowth: 15.3,
          revenueGrowth: 12.5
        },
        revenue: {
          total: 156000,
          average: 1590,
          pending: 12500,
          trend: [
            { month: 'Jan', amount: 45000 },
            { month: 'Feb', amount: 52000 },
            { month: 'Mar', amount: 59000 }
          ]
        },
        appointments: {
          total: 127,
          byType: [
            { type: 'Consultation', count: 65, percentage: 51 },
            { type: 'Follow-up', count: 35, percentage: 28 },
            { type: 'Check-up', count: 20, percentage: 16 },
            { type: 'Other', count: 7, percentage: 5 }
          ],
          byStatus: [
            { status: 'Completed', count: 98, color: 'bg-green-500' },
            { status: 'Pending', count: 17, color: 'bg-yellow-500' },
            { status: 'Cancelled', count: 12, color: 'bg-red-500' }
          ]
        },
        ratings: {
          average: 4.8,
          total: 1024,
          distribution: [
            { stars: 5, count: 850, percentage: 83 },
            { stars: 4, count: 140, percentage: 14 },
            { stars: 3, count: 20, percentage: 2 },
            { stars: 2, count: 10, percentage: 1 },
            { stars: 1, count: 4, percentage: 0 }
          ]
        },
        peakHours: [
          { hour: '09:00 AM', appointments: 8 },
          { hour: '10:00 AM', appointments: 12 },
          { hour: '11:00 AM', appointments: 10 },
          { hour: '02:00 PM', appointments: 15 },
          { hour: '03:00 PM', appointments: 14 },
          { hour: '04:00 PM', appointments: 11 }
        ]
      });
      setLoading(false);
    }, 800);
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  const StatCard = ({ icon: Icon, label, value, change, color }) => (
    <div className={`bg-zinc-900/50 border border-zinc-700 rounded-xl p-6 hover:border-${color}-500/50 transition-all group`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 bg-${color}-500/20 rounded-lg flex items-center justify-center group-hover:bg-${color}-500/30 transition-colors`}>
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
        {change && (
          <div className="text-xs font-semibold text-green-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {change}%
          </div>
        )}
      </div>
      <p className="text-zinc-400 text-sm mb-1">{label}</p>
      <h3 className="text-3xl font-bold text-white">{value}</h3>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-2xl p-6 md:p-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Analytics & Reports
          </h1>
          <p className="text-zinc-400">Monitor your clinic performance</p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm focus:border-purple-500/50 outline-none"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Calendar}
          label="Total Appointments"
          value={analytics.overview.totalAppointments}
          change={analytics.overview.appointmentGrowth}
          color="blue"
        />
        <StatCard
          icon={Users}
          label="Total Patients"
          value={analytics.overview.totalPatients}
          change={8.2}
          color="orange"
        />
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={`₹${analytics.revenue.total / 1000}K`}
          change={analytics.revenue.trend[2].amount > analytics.revenue.trend[1].amount ? 12.5 : -5}
          color="green"
        />
        <StatCard
          icon={Star}
          label="Average Rating"
          value={analytics.ratings.average}
          change={null}
          color="yellow"
        />
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Distribution */}
        <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-6">Appointment Types</h2>
          <div className="space-y-4">
            {analytics.appointments.byType.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white">{item.type}</span>
                  <span className="text-xs font-bold text-zinc-400">{item.percentage}%</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      idx === 0
                        ? 'bg-blue-500'
                        : idx === 1
                        ? 'bg-green-500'
                        : idx === 2
                        ? 'bg-orange-500'
                        : 'bg-purple-500'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Trend */}
        <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-6">Revenue Trend</h2>
          <div className="space-y-4">
            {analytics.revenue.trend.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="text-sm font-semibold text-zinc-400 w-12">{item.month}</span>
                <div className="flex-1 h-8 bg-zinc-800 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg transition-all"
                    style={{ width: `${(item.amount / 70000) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-white w-20 text-right">
                  ₹{item.amount / 1000}K
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Ratings Distribution */}
        <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-6">Patient Ratings</h2>
          <div className="space-y-3">
            {analytics.ratings.distribution.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-20">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < item.stars
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-zinc-600'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-zinc-400 w-12 text-right">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-400">
              <strong>Overall Rating:</strong> {analytics.ratings.average} / 5.0 ({analytics.ratings.total} reviews)
            </p>
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-6">Peak Hours</h2>
          <div className="space-y-3">
            {analytics.peakHours.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-sm font-semibold text-zinc-400 w-16">{item.hour}</span>
                <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${(item.appointments / 15) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-white w-8 text-right">
                  {item.appointments}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Appointment Status Summary */}
      <div className="bg-zinc-900/50 border border-zinc-700 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-6">Appointment Status Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {analytics.appointments.byStatus.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div className={`w-16 h-16 ${item.color} rounded-full opacity-20`} />
              <div>
                <p className="text-sm text-zinc-400">{item.status}</p>
                <p className="text-2xl font-bold text-white">{item.count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorAnalyticsPage;
