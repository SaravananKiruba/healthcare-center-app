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

export const authAPI = {
    login: (email, password) =>
        api.post('/token', new URLSearchParams({
            'username': email,
            'password': password,
        })),
    createUser: (userData) => api.post('/users/', userData),
};

export const patientsAPI = {
    getAllPatients: () => api.get('/patients/'),
    getPatient: (id) => api.get(`/patients/${id}`),
    createPatient: (patientData) => api.post('/patients/', patientData),
    updatePatient: (id, patientData) => api.put(`/patients/${id}`, patientData),
    deletePatient: (id) => api.delete(`/patients/${id}`),
};

export const investigationsAPI = {
    createInvestigation: (data) => api.post('/investigations/', data),
    getInvestigations: (patientId) => api.get(`/investigations/?patient_id=${patientId}`),
};

export const treatmentsAPI = {
    createTreatment: (data) => api.post('/treatments/', data),
    getTreatments: (patientId) => api.get(`/treatments/?patient_id=${patientId}`),
};

export const invoicesAPI = {
    createInvoice: (data) => api.post('/invoices/', data),
    getInvoices: (patientId) => api.get(`/invoices/?patient_id=${patientId}`),
};

export default api;
