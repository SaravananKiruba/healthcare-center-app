import React from 'react';
import MainLayout from '../src/layouts/MainLayout';
import Dashboard from '../src/pages/Dashboard/Dashboard';
import ProtectedRoute from '../src/components/Auth/ProtectedRoute';

export default function AdminDashboard() {
  return (
    <ProtectedRoute roles={['admin']} redirectTo="/login">
      <MainLayout>
        <Dashboard />
      </MainLayout>
    </ProtectedRoute>
  );
}
