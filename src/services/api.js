/**
 * API Service Module
 * 
 * This module configures Axios to automatically handle data conversion between:
 * - camelCase (used in React/JavaScript frontend)
 * - snake_case (used in Python/FastAPI backend)
 * 
 * Key features:
 * - All outgoing request data is converted to snake_case
 * - All incoming response data is converted to camelCase
 * - URL parameters are automatically converted to snake_case
 * - Error responses are also converted to camelCase
 * - Authentication token handling is built in
 * 
 * Usage:
 * - Import and use API functions directly, no manual conversion needed
 * - All data will be automatically transformed in the appropriate direction
 */

import axios from 'axios';
import { 
    snakeToCamelCase, 
    camelToSnakeCase,
    transformIfNeeded 
} from '../utils/dataTransform';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create a token refreshing mechanism
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

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

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Request interceptor: 
 * 1. Adds authentication token
 * 2. Transforms request data from camelCase to snake_case
 * 3. Transforms URL parameters for GET requests
 * 4. Checks token expiration before making request
 */
api.interceptors.request.use((config) => {
    // Skip token for authentication endpoints
    const isAuthEndpoint = 
        config.url.includes('/token') && 
        config.method === 'post';
        
    if (!isAuthEndpoint) {
        // Add token to requests if available
        const token = localStorage.getItem('token');
        if (token) {
            // Check if token is expired
            if (isTokenExpired(token) && !config._retry) {
                // Token is expired, it will be handled by response interceptor
                console.warn('Token is expired, request will likely fail');
            }
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    
    // Transform request body from camelCase to snake_case
    if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
        config.data = camelToSnakeCase(config.data);
    }
    
    // Transform URL params from camelCase to snake_case for GET requests
    if (config.params) {
        config.params = camelToSnakeCase(config.params);
    }
    
    // Transform URL query parameters if they exist in the URL
    if (config.url && config.url.includes('?')) {
        const [baseUrl, queryString] = config.url.split('?');
        const searchParams = new URLSearchParams(queryString);
        
        // Create a temporary object to transform the params
        const paramsObj = {};
        for (const [key, value] of searchParams.entries()) {
            paramsObj[key] = value;
        }
        
        // Apply snake_case transformation and rebuild query string
        const transformedParams = camelToSnakeCase(paramsObj);
        const newSearchParams = new URLSearchParams();
        
        Object.entries(transformedParams).forEach(([key, value]) => {
            newSearchParams.append(key, value);
        });
        
        // Replace the URL with transformed query string
        config.url = `${baseUrl}?${newSearchParams.toString()}`;
    }
    
    return config;
});

/**
 * Response interceptor: 
 * 1. Transforms response data from snake_case to camelCase
 * 2. Handles authentication errors
 * 3. Provides enhanced error reporting
 */
api.interceptors.response.use(
    (response) => {
        // Transform response data from snake_case to camelCase
        if (response.data) {
            response.data = snakeToCamelCase(response.data);
        }
        return response;
    },
    async (error) => {
        // Store the original request to retry
        const originalRequest = error.config;
        
        // Log the error with useful debugging information
        console.error("API Error:", {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
        });
        
        // Transform any error response data
        if (error.response?.data) {
            error.response.data = snakeToCamelCase(error.response.data);
        }
        
        // Handle authentication errors
        if (error.response?.status === 401) {
            // Check if this is a login attempt (don't retry auth endpoints)
            const isAuthEndpoint = originalRequest.url.includes('/token');
            
            if (!isAuthEndpoint && !originalRequest._retry) {
                if (isRefreshing) {
                    // If we're already refreshing the token, queue this request
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    })
                    .then(token => {
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch(err => {
                        return Promise.reject(err);
                    });
                }

                originalRequest._retry = true;
                isRefreshing = true;                try {
                    // For a refresh token flow:
                    const refreshToken = localStorage.getItem('refreshToken');
                    
                    if (refreshToken) {
                        try {
                            const refreshData = new URLSearchParams();
                            refreshData.append('refresh_token', refreshToken);
                            
                            const response = await axios.post(`${BASE_URL}/token/refresh`, refreshData, {
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                },
                            });
                            
                            const { access_token, refresh_token } = response.data;
                            
                            // Update tokens in localStorage
                            localStorage.setItem('token', access_token);
                            if (refresh_token) {
                                localStorage.setItem('refreshToken', refresh_token);
                            }
                            
                            // Update header for the original request
                            originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
                            
                            // Process the queue with the new token
                            processQueue(null, access_token);
                            
                            // Retry the original request
                            return api(originalRequest);
                        } catch (refreshError) {
                            // If refresh token is invalid, log out
                            console.error('Error refreshing token:', refreshError);
                            localStorage.removeItem('token');
                            localStorage.removeItem('refreshToken');
                            localStorage.removeItem('user');
                            
                            // Process the queue with the error
                            processQueue(refreshError, null);
                            
                            // Redirect to login
                            window.location.href = '/';
                            return Promise.reject(refreshError);
                        }
                    } else {
                        // No refresh token available, clear authentication
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        
                        // Process the queue to resolve/reject any pending requests
                        processQueue(null, null);
                        
                        // Redirect to login
                        window.location.href = '/';
                        return Promise.reject(error);
                    }
                } catch (refreshError) {
                    processQueue(refreshError, null);
                    
                    // Clear authentication and redirect
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/';
                    
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }
        }
        
        // Enhanced error message
        if (error.response?.data?.detail) {
            error.message = error.response.data.detail;
        }
        
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: (email, password) => {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);
          // Use the axios instance directly to bypass the json transformation interceptors
        return axios.post(`${BASE_URL}/token`, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }).then(response => {
            // Manually convert snake_case response to camelCase since we're bypassing the interceptor
            if (response.data) {
                response.data = snakeToCamelCase(response.data);
            }
            return response;
        });
    },
    logout: () => {
        // Clear auth data from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Optional: Call a backend logout endpoint if it exists
        // return api.post('/logout');
        
        return Promise.resolve({ success: true });
    },
    refreshToken: (refreshToken) => {
        const formData = new URLSearchParams();
        formData.append('refresh_token', refreshToken);
        
        return api.post('/token/refresh', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
    },
    createUser: (userData) => api.post('/users/', userData),
    getCurrentUser: () => api.get('/me'),
    getUsers: () => api.get('/users/'),
    updateUser: (id, userData) => api.put(`/users/${id}`, userData),
    deleteUser: (id) => api.delete(`/users/${id}`),
};

export const patientsAPI = {
    getAllPatients: () => api.get('/patients/'),
    getPatient: (id) => api.get(`/patients/${id}`),
    createPatient: (patientData) => api.post('/patients/', patientData),
    updatePatient: (id, patientData) => api.put(`/patients/${id}`, patientData),
    deletePatient: (id) => api.delete(`/patients/${id}`),
    searchPatients: (query) => api.get(`/search/patients`, { params: { q: query } }),
};

export const investigationsAPI = {
    createInvestigation: (data) => api.post('/investigations/', data),
    getInvestigations: (patientId) => 
        api.get('/investigations/', patientId ? { params: { patientId } } : {}),
};

export const statsAPI = {
    getDashboardStats: () => api.get('/stats/dashboard'),
};

/**
 * Creates a standardized set of CRUD operations for an API resource
 * @param {string} resourcePath - The base path for the resource (e.g., '/patients')
 * @returns {Object} Object with CRUD methods for the resource
 */
export function createApiResource(resourcePath) {
    const trimmedPath = resourcePath.startsWith('/') ? resourcePath : `/${resourcePath}`;
    const pluralPath = trimmedPath.endsWith('/') ? trimmedPath : `${trimmedPath}/`;
    
    return {
        getAll: (params) => api.get(pluralPath, params ? { params } : undefined),
        getById: (id) => api.get(`${pluralPath}${id}`),
        create: (data) => api.post(pluralPath, data),
        update: (id, data) => api.put(`${pluralPath}${id}`, data),
        delete: (id) => api.delete(`${pluralPath}${id}`),
        search: (query) => api.get(`/search${pluralPath}`, { params: { q: query } }),
    };
}

export default api;
