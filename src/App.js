import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import theme from './theme/theme';
import MainLayout from './layouts/MainLayout';

// Import pages - these will be created later
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

function App() {
  return (
    <ChakraProvider theme={theme}>
      <AppProvider>
        <Router>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/patient/register" element={<PatientRegistration />} />
              <Route path="/patients" element={<PatientList />} />
              <Route path="/patient/:id" element={<PatientView />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/billing/new/:patientId" element={<BillingForm />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/search" element={<Search />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainLayout>
        </Router>
      </AppProvider>
    </ChakraProvider>
  );
}
