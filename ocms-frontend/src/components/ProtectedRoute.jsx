import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // 1. If they aren't logged in at all, kick to login
  if (!token) {
    return <Navigate to="/login" />;
  }

  // 2. If this route requires specific roles, and the user doesn't have it...
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Kick them back to their specific homepage!
    if (role === 'ADMIN') return <Navigate to="/admin-dashboard" />;
    if (role === 'MANAGER') return <Navigate to="/manager-dashboard" />;
    return <Navigate to="/dashboard" />;
  }

  // 3. If everything is fine, let them see the page
  return element;
};

export default ProtectedRoute;