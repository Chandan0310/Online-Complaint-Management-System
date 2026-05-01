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
import ProtectedRoute from './components/ProtectedRoute'; // <-- IMPORT THE BOUNCER!

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* --- STUDENT ROUTES --- */}
        <Route path="/dashboard" element={
          <ProtectedRoute element={<StudentDashboard />} allowedRoles={['STUDENT']} />
        } />
        <Route path="/profile" element={
          <ProtectedRoute element={<StudentProfile />} allowedRoles={['STUDENT']} />
        } />
        {/* We let Admins view student complaints too, so they are in the allowed list! */}
        <Route path="/complaint/:id" element={
          <ProtectedRoute element={<ComplaintDetail />} allowedRoles={['STUDENT', 'ADMIN']} />
        } />
        
        {/* --- MANAGER ROUTES --- */}
        <Route path="/manager-dashboard" element={
          <ProtectedRoute element={<ManagerDashboard />} allowedRoles={['MANAGER']} />
        } />
        <Route path="/manager/complaint/:id" element={
          <ProtectedRoute element={<ManagerComplaintDetail />} allowedRoles={['MANAGER']} />
        } />

        {/* --- ADMIN ROUTES --- */}
        <Route path="/admin-dashboard" element={
          <ProtectedRoute element={<AdminDashboard />} allowedRoles={['ADMIN']} />
        } />

      </Routes>
    </Router>
  );
}

export default App;