// /frontend/src/components/SidebarPatient.jsx

import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Logo from '../assets/logo.png';
import {
  Home,
  Stethoscope,
  Calendar,
  FileText,
  Pill,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Heart
} from 'lucide-react';

const SidebarPatient = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const menuItems = [
    {
      name: 'Dashboard',
      icon: Home,
      path: '/dashboard-patient',
      color: 'text-blue-400'
    },
    {
      name: 'Find Doctors',
      icon: Stethoscope,
      path: '/dashboard-patient/find-doctors',
      color: 'text-purple-400'
    },
    {
      name: 'My Appointments',
      icon: Calendar,
      path: '/dashboard-patient/appointments',
      color: 'text-green-400'
    },
    {
      name: 'Medical Records',
      icon: FileText,
      path: '/dashboard-patient/medical-records',
      color: 'text-orange-400'
    },
    {
      name: 'Prescriptions',
      icon: Pill,
      path: '/dashboard-patient/prescriptions',
      color: 'text-red-400'
    },
    {
      name: 'Profile',
      icon: User,
      path: '/dashboard-patient/profile',
      color: 'text-cyan-400'
    },
    {
      name: 'Settings',
      icon: Settings,
      path: '/dashboard-patient/settings',
      color: 'text-indigo-400'
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-300"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 h-screen w-64 bg-gradient-to-b from-zinc-900 to-zinc-950 border-r border-zinc-700 z-40 transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-700">
          <div className="flex items-center gap-3">
            <img src={Logo} className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"/>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Altherix
              </h1>
              <p className="text-xs text-zinc-400">Patient Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-8 px-3 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
                  active
                    ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/30 border border-purple-500/50 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? item.color : 'text-zinc-500 group-hover:' + item.color}`} />
                <span className="flex-1 text-sm font-medium">{item.name}</span>
                {active && <ChevronRight className="w-4 h-4 text-purple-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-3 my-6 h-px bg-zinc-700" />

        {/* Logout Button */}
        <div className="px-3 pb-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-300 border border-red-500/30 group"
          >
            <LogOut className="w-5 h-5" />
            <span className="flex-1 text-sm font-medium text-left">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default SidebarPatient;
