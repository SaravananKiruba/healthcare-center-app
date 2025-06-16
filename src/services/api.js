import axios from 'axios';
import { snakeToCamelCase, camelToSnakeCase } from '../utils/dataTransform';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// NOTE: Token handling moved to the combined interceptor below

// Request interceptor to convert camelCase to snake_case for backend
api.interceptors.request.use((config) => {
    // Add token to requests if available
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Transform request data from camelCase to snake_case
    if (config.data && typeof config.data === 'object' && config.method !== 'get') {
        config.data = camelToSnakeCase(config.data);
    }
    
    return config;
});

// Response interceptor to convert snake_case to camelCase for frontend
api.interceptors.response.use(
    (response) => {
        // Transform response data from snake_case to camelCase
        if (response.data) {
            response.data = snakeToCamelCase(response.data);
        }
        return response;
    },
    (error) => {
        console.error("API Error:", error.response?.data || error.message);
        
        // Handle authentication errors
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
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
    searchPatients: (query) => api.get(`/search/patients?q=${encodeURIComponent(query)}`),
};

export const investigationsAPI = {
    createInvestigation: (data) => api.post('/investigations/', data),
    getInvestigations: (patientId) => 
        patientId ? api.get(`/investigations/?patient_id=${patientId}`) : api.get('/investigations/'),
};

export const treatmentsAPI = {
    createTreatment: (data) => api.post('/treatments/', data),
    getTreatments: (patientId) => 
        patientId ? api.get(`/treatments/?patient_id=${patientId}`) : api.get('/treatments/'),
};

export const invoicesAPI = {
    createInvoice: (data) => api.post('/invoices/', data),
    getInvoices: (patientId) => 
        patientId ? api.get(`/invoices/?patient_id=${patientId}`) : api.get('/invoices/'),
    updateInvoice: (id, data) => api.put(`/invoices/${id}`, data),
};

export const statsAPI = {
    getDashboardStats: () => api.get('/stats/dashboard'),
};

export default api;
