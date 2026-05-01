/**
 * @file App.jsx
 * @description Root application component that defines the client-side
 *              routing table for the OCMS single-page application.  Each
 *              route is wrapped in {@link ProtectedRoute} to enforce
 *              authentication and role-based access control.
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import StudentDashboard from './components/StudentDashboard';
import ComplaintDetail from './components/ComplaintDetail';
import ManagerDashboard from './components/ManagerDashboard';
import ManagerComplaintDetail from './components/ManagerComplaintDetail';
import AdminDashboard from './components/AdminDashboard';
import StudentProfile from './components/StudentProfile';
import ProtectedRoute from './components/ProtectedRoute';

/**
 * App component — sets up React Router with public routes (login, register)
 * and protected routes grouped by role (Student, Manager, Admin).
 *
 * @returns {JSX.Element} The root application element.
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute element={<StudentDashboard />} allowedRoles={['STUDENT']} />
        } />
        <Route path="/profile" element={
          <ProtectedRoute element={<StudentProfile />} allowedRoles={['STUDENT']} />
        } />
        {/* Complaint detail — accessible by the owning student and admins */}
        <Route path="/complaint/:id" element={
          <ProtectedRoute element={<ComplaintDetail />} allowedRoles={['STUDENT', 'ADMIN']} />
        } />

        {/* Manager routes */}
        <Route path="/manager-dashboard" element={
          <ProtectedRoute element={<ManagerDashboard />} allowedRoles={['MANAGER']} />
        } />
        <Route path="/manager/complaint/:id" element={
          <ProtectedRoute element={<ManagerComplaintDetail />} allowedRoles={['MANAGER']} />
        } />

        {/* Admin routes */}
        <Route path="/admin-dashboard" element={
          <ProtectedRoute element={<AdminDashboard />} allowedRoles={['ADMIN']} />
        } />
      </Routes>
    </Router>
  );
}

export default App;