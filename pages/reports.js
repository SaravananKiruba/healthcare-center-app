import React from 'react';
import MainLayout from '../src/layouts/MainLayout';
import Reports from '../src/pages/Reports/Reports';
import ProtectedRoute from '../src/components/Auth/ProtectedRoute';

export default function ReportsPage() {
  return (
    <ProtectedRoute roles={['doctor', 'admin']} redirectTo="/login">
      <MainLayout>
        <Reports />
      </MainLayout>
    </ProtectedRoute>
  );
}
