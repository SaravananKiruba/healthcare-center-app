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

// Helper function to transform JSON string fields to objects
const transformJsonFields = (item) => {
  if (!item || typeof item !== 'object') return item;
  
  const result = { ...item };
  
  // These fields should be objects, not JSON strings
  ['medicalHistory', 'physicalGenerals', 'menstrualHistory', 'foodAndHabit'].forEach(field => {
    if (result[field] && typeof result[field] === 'string') {
      try {
        result[field] = JSON.parse(result[field]);
      } catch (e) {
        console.log(`Could not parse ${field} as JSON:`, e);
      }
    }
  });
  
  return result;
};

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
    
    // For debugging validation errors
    if (status === 400 && data.details) {
      console.error('Validation error details:', data.details);
    }
    
    switch (status) {
      case 400:
        // Create a more detailed error for validation failures
        const errorMsg = data.details 
          ? `${data.message}: ${data.details}`
          : (data.message || 'Invalid request data');
        throw new Error(errorMsg);
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
        
        // Log for debugging
        console.log('Request payload before processing:', processedData);
        
        // Ensure required fields are present and properly formatted
        if (config.url?.includes('/patients') && (config.method === 'post' || config.method === 'put')) {
          // Check required fields
          if (!processedData.mobileNumber) {
            console.warn('Mobile number missing in request payload');
            // Set a default to prevent undefined errors
            processedData.mobileNumber = processedData.mobileNumber || '';
          }
          if (!processedData.chiefComplaints) {
            console.warn('Chief complaints missing in request payload');
            // Set a default to prevent undefined errors
            processedData.chiefComplaints = processedData.chiefComplaints || '';
          }
        }
        
        // Ensure these fields are properly handled for the API
        ['medicalHistory', 'physicalGenerals', 'menstrualHistory', 'foodAndHabit'].forEach(field => {
          if (processedData[field]) {
            // If it's already an object, stringify it for storage
            if (typeof processedData[field] === 'object') {
              processedData[field] = JSON.stringify(processedData[field]);
            } else if (typeof processedData[field] === 'string') {
              // Check if it's already valid JSON string
              try {
                JSON.parse(processedData[field]);
                // It's already a valid JSON string, leave it as is
              } catch (e) {
                // It's a string but not valid JSON, convert to JSON string
                processedData[field] = JSON.stringify(processedData[field]);
              }
            }
          }
        });
        
        // Skip camelToSnakeCase transformation for this specific API to prevent field name issues
        // The backend uses camelCase field names already
        config.data = processedData;
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
    // Skip transformation since we're already using camelCase consistently
    // Parse any JSON strings that should be objects in the response
    if (response.data) {
      if (Array.isArray(response.data)) {
        // Handle array responses
        response.data = response.data.map(item => {
          return transformJsonFields(item);
        });
      } else {
        // Handle single object responses
        response.data = transformJsonFields(response.data);
      }
    }
    return response;
  },
  async (error) => {
    const config = error.config;
    
    // Skip transformation for error responses too
    if (error.response && error.response.data) {
      error.response.data = error.response.data;
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
    
    // Make a copy of data to avoid modifying the original
    const processedData = {...data};
    
    // Ensure these fields have non-empty values
    processedData.mobileNumber = processedData.mobileNumber?.toString().trim() || '';
    processedData.chiefComplaints = processedData.chiefComplaints?.toString().trim() || '';
    
    // Log the input data for debugging
    debugLog('Creating Patient - Input Data', processedData, 'info');
    
    // Validate required fields before sending to API
    if (!processedData.name) throw new Error('Patient name is required');
    if (!processedData.address) throw new Error('Address is required');
    if (processedData.age === undefined || processedData.age === null || isNaN(parseInt(processedData.age)))
      throw new Error('Valid age is required');
    if (!processedData.sex) throw new Error('Sex is required');
    if (!processedData.mobileNumber) throw new Error('Mobile number is required');
    if (!processedData.chiefComplaints) throw new Error('Chief complaints are required');
    
    // Extra debug for these critical fields
    console.log('Critical fields check before API call:', {
      mobileNumber: processedData.mobileNumber,
      chiefComplaints: processedData.chiefComplaints
    });
    
    try {
      // Fetch the current user's information first to get their ID
      let currentUser = null;
      try {
        // Get current user from the API (to get the ID for association)
        const userResponse = await axios.get(`${BASE_URL}/api/users/me`);
        currentUser = userResponse.data;
        debugLog('Current user fetched for patient creation', { userId: currentUser.id }, 'info');
      } catch (userError) {
        console.error('Failed to fetch current user for patient creation:', userError);
        throw new Error('Unable to create patient: Authentication required');
      }
      
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
      
      const defaultMenstrualHistory = processedData.sex === 'Female' ? {
        menses: '', menopause: 'No', leucorrhoea: '',
        gonorrhea: 'No', otherDischarges: ''
      } : null;
      
      // Ensure JSON fields are properly structured and have default values
      const sanitizedData = {
        // Base data
        name: processedData.name.trim(),
        guardianName: processedData.guardianName?.trim() || null,
        address: processedData.address.trim(),
        age: parseInt(processedData.age),
        sex: processedData.sex,
        occupation: processedData.occupation?.trim() || '',
        // These fields are critical and often failing
        mobileNumber: processedData.mobileNumber.trim(),
        chiefComplaints: processedData.chiefComplaints.trim(),
        // Add the user ID from current user - critical for the relation
        userId: currentUser.id,
        // Ensure JSON fields are properly structured - already objects, will be stringified in interceptor
        medicalHistory: processedData.medicalHistory || defaultMedicalHistory,
        physicalGenerals: processedData.physicalGenerals || defaultPhysicalGenerals,
        foodAndHabit: processedData.foodAndHabit || defaultFoodAndHabit,
        // Only include menstrualHistory for female patients
        menstrualHistory: processedData.sex === 'Female' ? (processedData.menstrualHistory || defaultMenstrualHistory) : null
      };
      
      // Log the sanitized data for debugging
      debugLog('Creating Patient - Sanitized Data', sanitizedData, 'info');
      
      // Use direct axios call to bypass interceptors for this critical operation
      const response = await axios.post(`${BASE_URL}/api/patients`, sanitizedData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Log the success response
      debugLog('Patient Created Successfully', response.data, 'info');
      
      return response.data;
    } catch (error) {
      // Log the error with detailed information
      debugLog('Failed to create patient', error, 'error');
      
      // Enhanced error handling
      let errorMessage = 'Failed to create patient';
      let errorDetails = '';
      
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
        errorDetails = error.response.data?.details || '';
        
        // Log full error details
        debugLog('API Error Response', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        }, 'error');
      } else if (error.request) {
        errorMessage = 'Network error - no response received';
        debugLog('API Request Error', error.request, 'error');
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      debugLog('API Error Details', {
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
      console.log('API call: getAllInvestigations, patientId:', patientId);
      const params = patientId ? { patientId } : {};
      
      // Use direct axios call to ensure we have full control over the request
      const response = await axios.get(`${BASE_URL}/api/investigations`, { 
        params,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API response for investigations:', response.status, response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch investigations:', error);
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      }
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
    
    // Validate required fields before sending
    if (!data.patientId) throw new Error('Patient ID is required');
    if (!data.type) throw new Error('Investigation type is required');
    if (!data.details) throw new Error('Details are required');
    if (!data.date) throw new Error('Date is required');
    
    try {
      // Use direct axios for critical operations
      const sanitizedData = {
        patientId: data.patientId,
        type: data.type,
        details: data.details,
        // Ensure date is in the correct format
        date: data.date instanceof Date 
              ? data.date.toISOString() 
              : new Date(data.date).toISOString(),
        fileUrl: data.fileUrl || null
      };
      
      console.log('Creating investigation with data:', sanitizedData);
      
      // Use direct axios call to bypass interceptors for this critical operation
      const response = await axios.post(`${BASE_URL}/api/investigations`, sanitizedData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Investigation created:', response.status, response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to create investigation:', error);
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      }
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
