import React from 'react';
import MainLayout from '../../src/layouts/MainLayout';
import PatientRegistration from '../../src/pages/PatientRegistration/PatientRegistration';
import ProtectedRoute from '../../src/components/Auth/ProtectedRoute';

export default function PatientRegisterPage() {
  return (
    <ProtectedRoute roles={['doctor', 'admin']} redirectTo="/login">
      <MainLayout>
        <PatientRegistration />
      </MainLayout>
    </ProtectedRoute>
  );
}
