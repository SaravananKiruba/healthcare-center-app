import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { patientsAPI } from '../services/api';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // State for patients and related data
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Services for billing
  const [services] = useState([
    { id: '1', name: 'Consultation', price: 50 },
    { id: '2', name: 'Follow-up Visit', price: 30 },
    { id: '3', name: 'Lab Test - Basic', price: 25 },
    { id: '4', name: 'Lab Test - Comprehensive', price: 75 },
    { id: '5', name: 'X-Ray', price: 100 },
    { id: '6', name: 'Ultrasound', price: 120 },
    { id: '7', name: 'Vaccination', price: 45 },
    { id: '8', name: 'Prescription', price: 15 },
  ]);
  
  // User related data
  const [currentUser] = useState({
    id: '1',
    name: 'Dr. John Doe',
    role: 'doctor',
  });
  
  // Doctor data
  const [doctors] = useState([
    { id: '1', name: 'Dr. John Doe', specialty: 'General Medicine' },
    { id: '2', name: 'Dr. Jane Smith', specialty: 'Pediatrics' },
    { id: '3', name: 'Dr. Robert Johnson', specialty: 'Orthopedics' },
  ]);
    // Load patients data from API or localStorage
  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true);
      try {
        const response = await patientsAPI.getAllPatients();
        setPatients(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch patients:", err);
        setError(typeof err === 'object' ? (err.message || "Failed to fetch patients") : err); // Ensure error is a string
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPatients();
  }, []);
  // Add a new patient
  const addPatient = async (patientData) => {
    setIsLoading(true);
    try {
      // Make sure we're sending the right format to the API
      const response = await patientsAPI.createPatient(patientData);
      
      // Add the new patient to the state
      const newPatient = response.data;
      setPatients(prevPatients => [...prevPatients, newPatient]);
      setError(null);
      return newPatient;
    } catch (err) {
      console.error("Failed to add patient:", err);
      // Extract the error message from the response if available
      const errorMessage = err.response?.data?.detail || 
                          err.message || 
                          "Failed to add patient";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
    // Delete a patient
  const deletePatient = async (patientId) => {
    setIsLoading(true);
    try {
      await patientsAPI.deletePatient(patientId);
      
      // Remove the patient from the state
      setPatients(patients.filter(patient => patient.id !== patientId));
      setError(null);
    } catch (err) {
      console.error("Failed to delete patient:", err);
      setError(typeof err === 'object' ? (err.message || "Failed to delete patient") : err); // Ensure error is a string
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add a new invoice
  const addInvoice = (patientId, invoiceData) => {
    const updatedPatients = patients.map(patient => {
      if (patient.id === patientId) {
        const invoices = patient.invoices || [];
        return {
          ...patient,
          invoices: [...invoices, { id: uuidv4(), ...invoiceData }]
        };
      }
      return patient;
    });
    
    setPatients(updatedPatients);
    return updatedPatients.find(p => p.id === patientId)?.invoices.slice(-1)[0];
  };
  
  const value = {
    patients,
    services,
    doctors,
    currentUser,
    isLoading,
    error,
    addPatient,
    deletePatient,
    addInvoice,
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
