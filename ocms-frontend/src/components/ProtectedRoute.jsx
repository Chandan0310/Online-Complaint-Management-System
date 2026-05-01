/**
 * @file ProtectedRoute.jsx
 * @description Route guard component that checks authentication state and
 *              enforces role-based access control.  Unauthenticated users
 *              are redirected to `/login`.  Authenticated users who lack
 *              the required role are redirected to their own dashboard.
 */

import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute component — wraps a page element and gates access based
 * on the presence of a JWT token and the user's role.
 *
 * @param {Object}   props
 * @param {JSX.Element} props.element      - The page component to render when access is granted.
 * @param {string[]}    props.allowedRoles - Roles permitted to view this route (e.g. ['STUDENT', 'ADMIN']).
 * @returns {JSX.Element} Either the protected page or a redirect.
 */
const ProtectedRoute = ({ element, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  /* No token → redirect to login */
  if (!token) {
    return <Navigate to="/login" />;
  }

  /* Token present but role not in the allowed list → redirect to own dashboard */
  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'ADMIN') return <Navigate to="/admin-dashboard" />;
    if (role === 'MANAGER') return <Navigate to="/manager-dashboard" />;
    return <Navigate to="/dashboard" />;
  }

  /* Access granted */
  return element;
};

export default ProtectedRoute;