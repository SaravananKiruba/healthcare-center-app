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
      default:
        return '/';
    }
  }, []);
    const logout = useCallback(async () => {
    try {
      // Call the logout API to invalidate the token on server side
      await authAPI.logout();
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if the API call fails, we should still clear local data
    } finally {
      // Clear authentication data from local storage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Update state
      setUser(null);
      setIsAuthenticated(false);
      
      // Show toast notification
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast]);
  // Helper function to check if token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;
    
    try {
      // Get the expiration time from the token payload
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      
      return currentTime >= expiryTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  };

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      const savedUser = localStorage.getItem('user');
      
      if (!token) {
        // No token available, user is not authenticated
        return;
      }
      
      // Parse the saved user
      let userData = savedUser ? JSON.parse(savedUser) : null;
      
      // Check if token is expired
      if (isTokenExpired(token)) {
        // Token is expired, try to refresh if we have a refresh token
        if (refreshToken) {
          try {
            const response = await authAPI.refreshToken(refreshToken);
            const { accessToken, refreshToken: newRefreshToken } = response.data;
            
            // Update tokens in localStorage
            localStorage.setItem('token', accessToken);
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }
          } catch (error) {
            console.error('Token refresh failed:', error);
            // If refresh fails, logout and return
            logout();
            return;
          }
        } else {
          // No refresh token available, logout and return
          logout();
          return;
        }
      }
      
      // Validate authentication by calling getCurrentUser API
      try {
        const response = await authAPI.getCurrentUser();
        // If the API call is successful, update with fresh user data
        if (response.data) {
          userData = response.data;
          // Update stored user data
          localStorage.setItem('user', JSON.stringify(userData));
        } 
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('User validation failed:', error);
        // If validation fails, logout
        logout();
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
      const { accessToken, refreshToken, user: userData } = response.data;
      
      if (!userData || !accessToken) {
        throw new Error('Invalid response from server');
      }
      
      // Store tokens and user info in localStorage
      localStorage.setItem('token', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update authentication state
      setUser(userData);
      setIsAuthenticated(true);
      
      // Determine the user's role for redirection
      const dashboardRoute = getDashboardByRole(userData.role);
      
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${userData.fullName || userData.email}!`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      
      return {
        success: true,
        user: userData,
        redirectTo: dashboardRoute
      };
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Create meaningful error message
      let errorMessage;
      if (error.response) {
        // Handle specific API error responses
        if (error.response.status === 401) {
          errorMessage = 'Invalid username or password. Please try again.';
        } else {
          errorMessage = error.response.data?.detail || `Error ${error.response.status}: Login failed`;
        }
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
        position: 'top-right'
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
