// /frontend/src/pages/DashboardDoctor.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import SidebarDoctor from '../components/SidebarDoctor';

const DashboardDoctor = () => {
  return (
    <div className="flex h-screen bg-zinc-950">
      {/* Sidebar */}
      <SidebarDoctor />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardDoctor;
