import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import Billing from './pages/Billing/Billing';
import BillingForm from './pages/Billing/BillingForm';
import Reports from './pages/Reports/Reports';
import Search from './pages/Search/Search';
import Settings from './pages/Settings/Settings';
import NotFound from './pages/NotFound';

const AppContent = () => {
  const { isAuthenticated, isLoading, login } = useAuth();

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

  if (!isAuthenticated) {
    return <Login onLogin={login} />;
  }

  return (
    <AppProvider>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/patient/register" element={
              <ProtectedRoute roles={['admin', 'doctor', 'clerk']}>
                <PatientRegistration />
              </ProtectedRoute>
            } />
            <Route path="/patients" element={
              <ProtectedRoute>
                <PatientList />
              </ProtectedRoute>
            } />
            <Route path="/patient/:id" element={
              <ProtectedRoute>
                <PatientView />
              </ProtectedRoute>
            } />
            <Route path="/billing" element={
              <ProtectedRoute roles={['admin', 'clerk']}>
                <Billing />
              </ProtectedRoute>
            } />
            <Route path="/billing/new/:patientId" element={
              <ProtectedRoute roles={['admin', 'clerk']}>
                <BillingForm />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/search" element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute roles={['admin']}>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
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
