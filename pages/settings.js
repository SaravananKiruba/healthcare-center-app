import React from 'react';
import MainLayout from '../src/layouts/MainLayout';
import Settings from '../src/pages/Settings/Settings';
import ProtectedRoute from '../src/components/Auth/ProtectedRoute';

export default function SettingsPage() {
  return (
    <ProtectedRoute roles={['doctor', 'admin']} redirectTo="/login">
      <MainLayout>
        <Settings />
      </MainLayout>
    </ProtectedRoute>
  );
}
