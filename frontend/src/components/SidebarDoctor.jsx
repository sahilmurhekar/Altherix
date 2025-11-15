// /frontend/src/components/SidebarDoctor.jsx

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  LogOut,
  Home,
  Calendar,
  FileText,
  Pill,
  Users,
  Settings,
  BarChart3,
  Stethoscope,
  User,
  ClockCheck
} from 'lucide-react';
import Logo from '../assets/logo.png';

const SidebarDoctor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: 'Dashboard', icon: Home, path: '/dashboard-doctor' },
    { label: 'Appointments', icon: Calendar, path: '/dashboard-doctor/appointments' },
    { label: 'Patients', icon: Users, path: '/dashboard-doctor/patients' },
    { label: 'Medical Records', icon: FileText, path: '/dashboard-doctor/records' },
    { label: 'Prescriptions', icon: Pill, path: '/dashboard-doctor/prescriptions' },
    { label: 'Manage Schedule', icon: ClockCheck, path: '/dashboard-doctor/manage' },
    { label: 'Profile', icon: User, path: '/dashboard-doctor/profile' },
    { label: 'Settings', icon: Settings, path: '/dashboard-doctor/settings' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static top-0 left-0 h-screen w-64 bg-zinc-900 border-r border-zinc-700 transition-transform duration-300 z-40 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-zinc-700">
          <div className="flex items-center gap-2 mb-2">
            <img src={Logo} className="w-6 h-6 rounded-md" />
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Altherix</h1>
          </div>
          <p className="text-xs text-zinc-400">Doctor Portal</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-zinc-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default SidebarDoctor;
