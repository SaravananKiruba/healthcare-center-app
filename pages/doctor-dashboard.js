import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { DoctorDashboard as Dashboard } from '@/components/dashboard/Dashboard';
import { ProtectedRoute } from '@/lib/auth';

export default function DoctorDashboard() {
  // Default stats data - in a real application, this would come from an API call
  const stats = {
    myPatientCount: 24,
    recentCases: 8,
    pendingReports: 5,
    investigationCount: 42
  };
  
  return (
    <ProtectedRoute allowedRoles={['doctor', 'admin']} redirectTo="/login">
      <MainLayout>
        <Dashboard stats={stats} />
      </MainLayout>
    </ProtectedRoute>
  );
}
