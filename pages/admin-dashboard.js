import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Dashboard from '@/components/dashboard/Dashboard';
import { ProtectedRoute } from '@/lib/auth';

export default function AdminDashboard() {
  return (
    <ProtectedRoute roles={['superadmin', 'clinicadmin', 'branchadmin']} redirectTo="/login">
      <MainLayout>
        <Dashboard />
      </MainLayout>
    </ProtectedRoute>
  );
}
