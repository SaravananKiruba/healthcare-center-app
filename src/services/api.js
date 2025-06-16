import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add response interceptor to handle authentication errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: (email, password) =>
        api.post('/token', new URLSearchParams({
            'username': email,
            'password': password,
        })),
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
