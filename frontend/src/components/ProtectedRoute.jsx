// ============ src/components/ProtectedRoute.jsx ============
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { token, user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  // No token - redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Token exists but user data not loaded yet
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950">
        <p className="text-zinc-400">Loading user...</p>
      </div>
    );
  }

  // Check if specific role is required
  if (requiredRole && user.userType !== requiredRole) {
    // Doctor trying to access patient dashboard
    if (user.userType === 'doctor') {
      return <Navigate to="/dashboard-doctor" replace />;
    }
    // Patient trying to access doctor dashboard
    if (user.userType === 'patient') {
      return <Navigate to="/dashboard-patient" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
