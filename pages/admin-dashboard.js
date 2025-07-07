import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Dashboard from '../src/pages/Dashboard/Dashboard';
import { ProtectedRoute } from '@/lib/auth';

export default function AdminDashboard() {
  return (
    <ProtectedRoute roles={['admin']} redirectTo="/login">
      <MainLayout>
        <Dashboard />
      </MainLayout>
    </ProtectedRoute>
  );
}
