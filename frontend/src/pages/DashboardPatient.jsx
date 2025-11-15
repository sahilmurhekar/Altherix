// /frontend/src/pages/DashboardPatient.jsx (Updated)

import React, { useEffect, useContext } from 'react'; // <-- MODIFIED
import { Outlet } from 'react-router-dom';
import SidebarPatient from '../components/SidebarPatient';
import { AuthContext } from '../context/AuthContext'; // <-- ADDED

const DashboardPatient = () => {
  const { token } = useContext(AuthContext); // <-- ADDED

  // ADDED: This effect runs on dashboard load to update location
  useEffect(() => {
    // Only run if we have a token
    if (!token) return;

    // Function to get a clean address string from our backend
    const getAddressFromCoords = async (lat, lng) => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/auth/address-from-coords?latitude=${lat}&longitude=${lng}`
        );
        if (!res.ok) return 'Unknown Location';
        const data = await res.json();
        return data.address || 'Unknown Location';
      } catch (err) {
        console.error('Error fetching address:', err);
        return 'Unknown Location';
      }
    };

    // Function to send the location to the new backend endpoint
    const sendLocationToBackend = async (latitude, longitude) => {
      // First, get the human-readable address
      const address = await getAddressFromCoords(latitude, longitude);

      try {
        // Now, send all data to our new PATCH endpoint
        const res = await fetch('http://localhost:5000/api/auth/update-location', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ latitude, longitude, address }),
        });

        if (res.ok) {
          console.log('Patient location updated successfully.');
        } else {
          console.error('Failed to update patient location.');
        }
      } catch (err) {
        console.error('Error in sendLocationToBackend:', err);
      }
    };

    // Try to get the user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // On success, send it to the backend
          const { latitude, longitude } = position.coords;
          sendLocationToBackend(latitude, longitude);
        },
        (error) => {
          // Handle error (e.g., user denies permission)
          // We fail silently as this is a background task.
          console.warn('Geolocation error (patient dashboard):', error.message);
        }
      );
    }
  }, [token]); // <-- Run this effect when the token becomes available

  return (
    <div className="flex h-screen bg-zinc-950">
      {/* Sidebar */}
      <SidebarPatient />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardPatient;
