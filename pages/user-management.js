import React from 'react';
import MainLayout from '../src/layouts/MainLayout';
import UserManagement from '../src/components/UserManagement/UserManagement';
import ProtectedRoute from '../src/components/Auth/ProtectedRoute';

export default function UserManagementPage() {
  return (
    <ProtectedRoute roles={['admin']} redirectTo="/login">
      <MainLayout>
        <UserManagement />
      </MainLayout>
    </ProtectedRoute>
  );
}
