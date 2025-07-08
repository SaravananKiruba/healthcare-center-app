/**
 * Protected Route Component
 * 
 * Wrapper component to protect routes based on authentication status and user roles
 */

import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Flex, Spinner, Text } from '@chakra-ui/react';

const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/login' 
}) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  
  // Loading state
  if (isLoading) {
    return (
      <Flex justifyContent="center" alignItems="center" minHeight="100vh" direction="column">
        <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
        <Text mt={4}>Loading...</Text>
      </Flex>
    );
  }

  // Not authenticated
  if (!session) {
    useEffect(() => {
      router.replace({
        pathname: redirectTo,
        query: { callbackUrl: router.asPath }
      });
    }, [router]);
    
    return null;
  }

  // Check role restrictions
  const userHasRequiredRole = allowedRoles.length === 0 || 
    allowedRoles.includes(session.user.role);

  // User doesn't have the required role
  if (!userHasRequiredRole) {
    useEffect(() => {
      // Get the appropriate dashboard based on role
      let dashboardPath;
      
      // Map the role to the appropriate dashboard
      switch (session.user.role) {
        case 'superadmin':
        case 'clinicadmin':
        case 'branchadmin':
          dashboardPath = '/admin-dashboard';
          break;
        case 'doctor':
          dashboardPath = '/doctor-dashboard';
          break;
        default:
          dashboardPath = '/login';
      }
        
      router.replace(dashboardPath);
    }, [router, session.user.role]);
    
    return null;
  }

  // User is authenticated and authorized
  return <>{children}</>;
};

export default ProtectedRoute;
