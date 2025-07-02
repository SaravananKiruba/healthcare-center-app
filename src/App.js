import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import theme from './theme/theme';
import MainLayout from './layouts/MainLayout';
import Login from './components/Auth/Login';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Import pages
import Dashboard from './pages/Dashboard/Dashboard';
import PatientRegistration from './pages/PatientRegistration/PatientRegistration';
import PatientList from './pages/PatientView/PatientList';
import PatientView from './pages/PatientView/PatientView';
import Reports from './pages/Reports/Reports';
import Search from './pages/Search/Search';
import NotFound from './pages/NotFound';
import UserManagement from './components/UserManagement/UserManagement';

// Auth route component to handle the case when user is already logged in
const AuthRoute = ({ children }) => {
  const { isAuthenticated, user, getDashboardByRole } = useAuth();

  if (isAuthenticated) {
    // If user is already logged in, redirect to their role-specific dashboard
    return <Navigate to={getDashboardByRole(user?.role)} replace />;
  }

  return children;
};

// Main content of the app with routes
const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={
            <AuthRoute>
              <Login />
            </AuthRoute>
          } />

          {/* Role-specific dashboard routes */}
          <Route path="/admin-dashboard" element={
            <ProtectedRoute roles={['admin']} redirectTo="/" showAlert={false}>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/doctor-dashboard" element={
            <ProtectedRoute roles={['doctor']} redirectTo="/" showAlert={false}>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } />

          {/* General authenticated routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute redirectTo="/" showAlert={false}>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } />

          {/* Admin-only routes */}
          <Route path="/user-management" element={
            <ProtectedRoute roles={['admin']} redirectTo="/dashboard" showAlert={false}>
              <MainLayout>
                <UserManagement />
              </MainLayout>
            </ProtectedRoute>
          } />

          {/* Routes for admin, doctor */}
          <Route path="/patient/register" element={
            <ProtectedRoute roles={['admin', 'doctor']} redirectTo="/dashboard" showAlert={false}>
              <MainLayout>
                <PatientRegistration />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/patients" element={
            <ProtectedRoute redirectTo="/" showAlert={false}>
              <MainLayout>
                <PatientList />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/patient/:id" element={
            <ProtectedRoute redirectTo="/" showAlert={false}>
              <MainLayout>
                <PatientView />
              </MainLayout>
            </ProtectedRoute>
          } />

          {/* Common routes for all authenticated users */}
          <Route path="/reports" element={
            <ProtectedRoute redirectTo="/" showAlert={false}>
              <MainLayout>
                <Reports />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/search" element={
            <ProtectedRoute redirectTo="/" showAlert={false}>
              <MainLayout>
                <Search />
              </MainLayout>
            </ProtectedRoute>
          } />

          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AppProvider>
  );
};

function App() {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
