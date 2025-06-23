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
 */
api.interceptors.request.use((config) => {
    // Add token to requests if available
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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
    (error) => {
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
            // Check if this is a login attempt
            const isLoginAttempt = error.config?.url?.includes('/token');
            
            if (!isLoginAttempt) {
                // For other API calls, clear auth and redirect
                console.log("Session expired or invalid. Redirecting to login.");
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                
                // Use a small delay to allow the current operation to complete
                setTimeout(() => {
                    window.location.href = '/';
                }, 100);
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
        
        return api.post('/token', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
    },
    createUser: (userData) => api.post('/users/', userData),
    getCurrentUser: () => api.get('/me'),
    getUsers: () => api.get('/users/'),
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

export const treatmentsAPI = {
    createTreatment: (data) => api.post('/treatments/', data),
    getTreatments: (patientId) => 
        api.get('/treatments/', patientId ? { params: { patientId } } : {}),
};

export const invoicesAPI = {
    createInvoice: (data) => api.post('/invoices/', data),
    getInvoices: (patientId) => 
        api.get('/invoices/', patientId ? { params: { patientId } } : {}),
    updateInvoice: (id, data) => api.put(`/invoices/${id}`, data),
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
