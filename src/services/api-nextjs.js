/**
 * Next.js API Service Module
 * 
 * Enhanced API service with robust error handling, retry logic, and proper data transformation
 */

import axios from 'axios';
import { 
    snakeToCamelCase, 
    camelToSnakeCase,
    transformIfNeeded 
} from '../utils/dataTransform';
import debugLog from '../utils/debugLog';

const BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.NEXT_PUBLIC_API_URL || 'https://your-app.vercel.app'
  : 'http://localhost:3000';

// Create axios instance with enhanced configuration
const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Retry configuration
  retry: 3,
  retryDelay: 1000,
});

// Enhanced error handler
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        throw new Error(data.message || 'Invalid request data');
      case 401:
        throw new Error('Authentication required. Please log in again.');
      case 403:
        throw new Error('You do not have permission to perform this action');
      case 404:
        throw new Error('The requested resource was not found');
      case 409:
        throw new Error(data.message || 'Resource conflict');
      case 422:
        throw new Error(data.message || 'Validation error');
      case 500:
        throw new Error('Internal server error. Please try again later.');
      default:
        throw new Error(data.message || `Request failed with status ${status}`);
    }
  } else if (error.request) {
    // Network error
    throw new Error('Network error. Please check your connection and try again.');
  } else {
    // Request setup error
    throw new Error(error.message || 'An unexpected error occurred');
  }
};

// Retry logic for failed requests
const retryRequest = async (config) => {
  const { retry, retryDelay } = config;
  
  for (let i = 0; i < retry; i++) {
    try {
      return await axios(config);
    } catch (error) {
      if (i === retry - 1) throw error;
      
      // Don't retry client errors (4xx)
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
    }
  }
};

// Enhanced request interceptor
api.interceptors.request.use(
  (config) => {
    try {
      // Transform request data from camelCase to snake_case
      if (config.data && typeof config.data === 'object') {
        // Handle nested JSON objects that might be strings
        const processedData = { ...config.data };
        
        // Ensure these fields are properly serialized for the API
        ['medicalHistory', 'physicalGenerals', 'menstrualHistory', 'foodAndHabit'].forEach(field => {
          if (processedData[field] && typeof processedData[field] === 'string') {
            try {
              processedData[field] = JSON.parse(processedData[field]);
            } catch (e) {
              // If it's already a valid JSON object, this will fail, which is fine
              console.log(`Field ${field} is already parsed or not valid JSON`);
            }
          }
        });
        
        config.data = camelToSnakeCase(processedData);
      }
      
      // Transform URL parameters from camelCase to snake_case
      if (config.params && typeof config.params === 'object') {
        config.params = camelToSnakeCase(config.params);
      }
      
      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return config; // Return the original config if transformation fails
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Enhanced response interceptor
api.interceptors.response.use(
  (response) => {
    // Transform response data from snake_case to camelCase
    if (response.data) {
      response.data = snakeToCamelCase(response.data);
    }
    return response;
  },
  async (error) => {
    const config = error.config;
    
    // Transform error response data from snake_case to camelCase
    if (error.response && error.response.data) {
      error.response.data = snakeToCamelCase(error.response.data);
    }
    
    // Retry logic for network errors and 5xx errors
    if (config && config.retry && (
      !error.response || 
      (error.response.status >= 500 && error.response.status < 600)
    )) {
      config.retry--;
      await new Promise(resolve => setTimeout(resolve, config.retryDelay));
      return api(config);
    }
    
    // Handle API errors
    handleApiError(error);
  }
);

// Enhanced Patients API with validation and error handling
export const patientsAPI = {
  getAllPatients: async (params = {}) => {
    try {
      const response = await api.get('/patients', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      throw error;
    }
  },

  getPatient: async (id) => {
    if (!id) throw new Error('Patient ID is required');
    
    try {
      const response = await api.get(`/patients/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch patient ${id}:`, error);
      throw error;
    }
  },

  createPatient: async (data) => {
    if (!data || typeof data !== 'object') {
      throw new Error('Valid patient data is required');
    }
    
    // Log the input data for debugging
    debugLog('Creating Patient - Input Data', data, 'info');
    
    // Validate required fields before sending to API
    if (!data.name) throw new Error('Patient name is required');
    if (!data.address) throw new Error('Address is required');
    if (!data.age) throw new Error('Age is required');
    if (!data.sex) throw new Error('Sex is required');
    if (!data.mobileNumber) throw new Error('Mobile number is required');
    if (!data.chiefComplaints) throw new Error('Chief complaints are required');
    
    try {
      // Create default objects for JSON fields
      const defaultMedicalHistory = {
        pastHistory: {
          allergy: false, anemia: false, arthritis: false, asthma: false,
          cancer: false, diabetes: false, heartDisease: false, hypertension: false,
          thyroid: false, tuberculosis: false
        },
        familyHistory: {
          diabetes: false, hypertension: false, thyroid: false,
          tuberculosis: false, cancer: false
        }
      };
      
      const defaultPhysicalGenerals = {
        appetite: '', bowel: '', urine: '', sweating: '', 
        sleep: '', thirst: '', addictions: ''
      };
      
      const defaultFoodAndHabit = {
        foodHabit: '',
        addictions: ''
      };
      
      const defaultMenstrualHistory = data.sex === 'Female' ? {
        menses: '', menopause: 'No', leucorrhoea: '',
        gonorrhea: 'No', otherDischarges: ''
      } : null;
      
      // Ensure JSON fields are properly structured and have default values
      const sanitizedData = {
        ...data,
        medicalHistory: data.medicalHistory || defaultMedicalHistory,
        physicalGenerals: data.physicalGenerals || defaultPhysicalGenerals,
        foodAndHabit: data.foodAndHabit || defaultFoodAndHabit,
        // Only include menstrualHistory for female patients
        menstrualHistory: data.sex === 'Female' ? (data.menstrualHistory || defaultMenstrualHistory) : null
      };
      
      // Log the sanitized data for debugging
      debugLog('Creating Patient - Sanitized Data', sanitizedData, 'info');
      
      const response = await api.post('/patients', sanitizedData);
      
      // Log the success response
      debugLog('Patient Created Successfully', response.data, 'info');
      
      return response.data;
    } catch (error) {
      // Log the error with detailed information
      debugLog('Failed to create patient', error, 'error');
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create patient';
      const errorDetails = error.response?.data?.details || '';
      
      debugLog('API Error Details', {
        status: error.response?.status,
        data: error.response?.data,
        message: errorMessage,
        details: errorDetails,
        request: error.config?.data ? JSON.parse(error.config.data) : null
      }, 'error');
      
      throw new Error(`${errorMessage}${errorDetails ? ': ' + errorDetails : ''}`);
    }
  },

  updatePatient: async (id, data) => {
    if (!id) throw new Error('Patient ID is required');
    if (!data || typeof data !== 'object') {
      throw new Error('Valid patient data is required');
    }
    
    try {
      const response = await api.put(`/patients/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update patient ${id}:`, error);
      throw error;
    }
  },

  deletePatient: async (id) => {
    if (!id) throw new Error('Patient ID is required');
    
    try {
      const response = await api.delete(`/patients/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete patient ${id}:`, error);
      throw error;
    }
  },
};

// Enhanced Investigations API
export const investigationsAPI = {
  getAllInvestigations: async (patientId = null) => {
    try {
      const params = patientId ? { patientId } : {};
      const response = await api.get('/investigations', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch investigations:', error);
      throw error;
    }
  },

  getInvestigation: async (id) => {
    if (!id) throw new Error('Investigation ID is required');
    
    try {
      const response = await api.get(`/investigations/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch investigation ${id}:`, error);
      throw error;
    }
  },

  createInvestigation: async (data) => {
    if (!data || typeof data !== 'object') {
      throw new Error('Valid investigation data is required');
    }
    
    try {
      const response = await api.post('/investigations', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create investigation:', error);
      throw error;
    }
  },

  updateInvestigation: async (id, data) => {
    if (!id) throw new Error('Investigation ID is required');
    if (!data || typeof data !== 'object') {
      throw new Error('Valid investigation data is required');
    }
    
    try {
      const response = await api.put(`/investigations/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update investigation ${id}:`, error);
      throw error;
    }
  },

  deleteInvestigation: async (id) => {
    if (!id) throw new Error('Investigation ID is required');
    
    try {
      const response = await api.delete(`/investigations/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete investigation ${id}:`, error);
      throw error;
    }
  },
};

// Enhanced Auth/Users API
export const authAPI = {
  getCurrentUser: async () => {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      throw error;
    }
  },

  getUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  },
  
  // These are handled by NextAuth, but keeping for compatibility
  login: async (email, password) => {
    throw new Error('Use NextAuth signIn instead of this method');
  },
  
  logout: async () => {
    throw new Error('Use NextAuth signOut instead of this method');
  },
};

// Enhanced Health check API
export const healthAPI = {
  check: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },
};

// Utility functions for common operations
export const apiUtils = {
  // Check if API is available
  isApiHealthy: async () => {
    try {
      await healthAPI.check();
      return true;
    } catch {
      return false;
    }
  },

  // Test database connection
  testConnection: async () => {
    try {
      const health = await healthAPI.check();
      return health.database === 'connected';
    } catch {
      return false;
    }
  },

  // Get API base URL
  getBaseUrl: () => `${BASE_URL}/api`,
};

export default api;
