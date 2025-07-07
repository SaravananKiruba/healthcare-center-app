import React from 'react';
import MainLayout from '../src/layouts/MainLayout';
import PatientList from '../src/pages/PatientView/PatientList';
import ProtectedRoute from '../src/components/Auth/ProtectedRoute';

export default function PatientsPage() {
  return (
    <ProtectedRoute roles={['doctor', 'admin']} redirectTo="/login">
      <MainLayout>
        <PatientList />
      </MainLayout>
    </ProtectedRoute>
  );
}
