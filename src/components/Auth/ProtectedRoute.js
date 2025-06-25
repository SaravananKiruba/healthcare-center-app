import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, Alert, AlertIcon, AlertTitle, AlertDescription, Spinner, Center, Button, Text } from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';

/**
 * Enhanced ProtectedRoute component that handles:
 * 1. Authentication check
 * 2. Role-based access control
 * 3. Automatic redirection to login or appropriate dashboard
 * 4. Loading states
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The components to render if access is allowed
 * @param {string[]} props.roles - Array of allowed roles (if empty, all authenticated users allowed)
 * @param {boolean} props.showAlert - Whether to show access denied alerts (default: true)
 * @param {string} props.redirectTo - Custom redirect path for unauthorized access
 */
const ProtectedRoute = ({ 
  children, 
  roles = [], 
  showAlert = true,
  redirectTo = '/'
}) => {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();
  const location = useLocation();

  // Show loading spinner while authentication status is being checked
  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="brand.500"
          size="xl"
        />
      </Center>
    );
  }
  // Handle authentication check
  if (!isAuthenticated) {
    // If showAlert is false, redirect to login with location state to enable returning after login
    if (!showAlert) {
      return <Navigate to="/" state={{ from: location }} replace />;
    }
    
    // Otherwise show access denied message
    return (
      <Box p={4} maxW="600px" mx="auto" mt={10}>
        <Alert 
          status="warning" 
          variant="solid" 
          borderRadius="md"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          py={4}
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Authentication Required
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            You must be logged in to access this page.
            Please sign in to continue.
          </AlertDescription>
          <Button 
            mt={4} 
            colorScheme="yellow" 
            onClick={() => { 
              window.location.href = "/"; 
            }}
          >
            Go to Login
          </Button>
        </Alert>
      </Box>
    );
  }
  // Handle role-based access control
  if (roles.length > 0 && !hasRole(roles)) {
    // If showAlert is false, redirect to dashboard
    if (!showAlert) {
      return <Navigate to={redirectTo} replace />;
    }
    
    // Otherwise show insufficient permissions message
    return (
      <Box p={4} maxW="600px" mx="auto" mt={10}>
        <Alert 
          status="error" 
          variant="solid" 
          borderRadius="md"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          py={4}
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Access Restricted
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            You don't have the required permissions to access this page.
            <Box mt={2}>
              <Text fontWeight="bold">Required roles: {roles.join(', ')}</Text>
              <Text>Your role: {user?.role || 'None'}</Text>
            </Box>
          </AlertDescription>
          <Button 
            mt={4} 
            colorScheme="red" 
            onClick={() => { 
              window.location.href = redirectTo; 
            }}
          >
            Go to Dashboard
          </Button>
        </Alert>
      </Box>
    );
  }

  // User is authenticated and has required role, render children
  return children;
};

export default ProtectedRoute;
