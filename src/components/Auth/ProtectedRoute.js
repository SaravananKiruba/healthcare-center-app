import React from 'react';
import { Box, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, user, hasRole } = useAuth();

  if (!isAuthenticated) {
    return (
      <Box p={4}>
        <Alert status="warning">
          <AlertIcon />
          <AlertTitle>Access Denied!</AlertTitle>
          <AlertDescription>
            You must be logged in to access this page.
          </AlertDescription>
        </Alert>
      </Box>
    );
  }

  if (roles.length > 0 && !hasRole(roles)) {
    return (
      <Box p={4}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Insufficient Permissions!</AlertTitle>
          <AlertDescription>
            You don't have the required permissions to access this page.
            Required roles: {roles.join(', ')}. Your role: {user?.role || 'None'}
          </AlertDescription>
        </Alert>
      </Box>
    );
  }

  return children;
};

export default ProtectedRoute;
