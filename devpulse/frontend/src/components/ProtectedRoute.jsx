import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token'); // Auth check

  // Agar token hai to Outlet render hoga, nahi to Redirect
  return token ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;