/**
 * API Client Module
 * 
 * Centralized API client configuration
 */

import axios from 'axios';
import { API_CONFIG } from '../../config';
import { transformJsonFields } from './transform';

// Create axios instance with enhanced configuration
const apiClient = axios.create({
  baseURL: `${API_CONFIG.baseUrl}/api`,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
  // Retry configuration
  retry: 3,
  retryDelay: 1000,
});

// Request interceptor - add auth headers, etc.
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage if in browser
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth-token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle common errors, transform data
apiClient.interceptors.response.use(
  (response) => {
    // Transform JSON string fields to objects if needed
    if (response.data) {
      if (Array.isArray(response.data)) {
        response.data = response.data.map(transformJsonFields);
      } else {
        response.data = transformJsonFields(response.data);
      }
    }
    return response;
  },
  (error) => {
    // Handle retry logic for specific errors
    const { config, response } = error;
    if (!config || !config.retry) {
      return Promise.reject(error);
    }
    
    // Retry count
    config.__retryCount = config.__retryCount || 0;
    
    // Check if we've maxed out the total retry count
    if (config.__retryCount >= config.retry) {
      return Promise.reject(error);
    }
    
    // Only retry on network errors or 5xx errors
    if (!response || (response && response.status >= 500)) {
      // Increase the retry count
      config.__retryCount += 1;
      
      // Create new promise to handle retry
      const backoff = new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, config.retryDelay || 1000);
      });
      
      // Return the promise in which recalls axios to retry the request
      return backoff.then(() => apiClient(config));
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
