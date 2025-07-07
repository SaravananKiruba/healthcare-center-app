import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import UserManagement from '@/components/UserManagement/UserManagement';
import { ProtectedRoute } from '@/lib/auth';

export default function UserManagementPage() {
  return (
    <ProtectedRoute roles={['admin']} redirectTo="/login">
      <MainLayout>
        <UserManagement />
      </MainLayout>
    </ProtectedRoute>
  );
}
