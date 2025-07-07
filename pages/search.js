import React from 'react';
import MainLayout from '../src/layouts/MainLayout';
import Search from '../src/pages/Search/Search';
import ProtectedRoute from '../src/components/Auth/ProtectedRoute';

export default function SearchPage() {
  return (
    <ProtectedRoute roles={['doctor', 'admin']} redirectTo="/login">
      <MainLayout>
        <Search />
      </MainLayout>
    </ProtectedRoute>
  );
}
