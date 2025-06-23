import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const toast = useToast();
  
  // Get the dashboard route based on user role
  const getDashboardByRole = useCallback((role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return '/admin-dashboard';
      case 'doctor':
        return '/doctor-dashboard';
      case 'clerk':
        return '/clerk-dashboard';
      default:
        return '/';
    }
  }, []);
  
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  }, [toast]);

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        // Parse the saved user
        const userData = JSON.parse(savedUser);
        
        // Validate token by calling the getCurrentUser API
        try {
          const response = await authAPI.getCurrentUser();
          // If the API call is successful, update with fresh user data
          if (response.data) {
            setUser(response.data);
          } else {
            setUser(userData);
          }
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Token validation failed:', error);
          // If token is invalid, clear everything
          logout();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(email, password);
      const { accessToken, user: userData } = response.data;
      
      if (!userData || !accessToken) {
        throw new Error('Invalid response from server');
      }
      
      // Store token and user info in localStorage
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update authentication state
      setUser(userData);
      setIsAuthenticated(true);
      
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${userData.fullName || userData.email}!`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      return {
        success: true,
        user: userData,
        redirectTo: getDashboardByRole(userData.role)
      };
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Create meaningful error message
      let errorMessage;
      if (error.response) {
        errorMessage = error.response.data?.detail || `Error ${error.response.status}: Login failed`;
      } else if (error.request) {
        errorMessage = 'No response from server. Please check if the backend server is running.';
      } else {
        errorMessage = error.message || 'An unexpected error occurred';
      }
      
      toast({
        title: 'Login Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
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
