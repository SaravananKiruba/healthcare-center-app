import React, { createContext, useContext } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useToast } from '@chakra-ui/react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useToast();

  const user = session?.user || null;
  const isAuthenticated = !!session;
  const isLoading = status === 'loading';

  // Get the dashboard route based on user role
  const getDashboardByRole = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return '/admin-dashboard';
      case 'doctor':
        return '/doctor-dashboard';
      default:
        return '/login';
    }
  };

  const login = async (email, password) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: 'Login Failed',
          description: 'Invalid email or password',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        });
        return { success: false, error: result.error };
      }

      toast({
        title: 'Login Successful',
        description: `Welcome back!`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });

      return { 
        success: true, 
        redirectTo: getDashboardByRole(session?.user?.role || 'doctor')
      };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'An unexpected error occurred';
      
      toast({
        title: 'Login Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await signOut({ redirect: false });
      
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
        status: 'info',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });

      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role?.toLowerCase());
    }
    return user.role?.toLowerCase() === roles.toLowerCase();
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasRole,
    getDashboardByRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
